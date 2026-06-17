import { NextResponse } from "next/server";
import { OpenAIAgentsProvider } from "@corsair-dev/mcp";
import { Agent, run, tool } from "@openai/agents";
import { corsair } from "../../../../corsair";
import { db } from "../../../db";
import { auditLogs, users, corsairAccounts } from "../../../db/schema";
import { eq, and, inArray, count } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { prompt, tenantId, draftPayload } = await req.json();

    if (!prompt || !tenantId) {
      return NextResponse.json({ error: "Missing prompt or tenantId" }, { status: 400 });
    }

    let finalPrompt = prompt;
    if (draftPayload) {
      finalPrompt += `\n\n[CRITICAL MEMORY PAYLOAD]\nThe user has finalized an email draft. The exact content is:\nTo: ${draftPayload.to}\nSubject: ${draftPayload.subject}\nThreadId: ${draftPayload.threadId || 'NONE'}\nBody: ${draftPayload.body}\n\nWhen you use the Gmail tool to send the email, you MUST use exactly these parameters. If ThreadId is not NONE, you must use the reply tool to attach it to that thread.`;
    }

    console.log(`\n🤖 [MCP Agent] Received command: "${finalPrompt}" for tenant: ${tenantId}`);

    const user = await db.query.users.findFirst({
      where: eq(users.id, tenantId)
    });
    const userName = user?.name || "User";
    const userEmail = user?.email || "Unknown Email";

    const corsairTenantId = `user_${tenantId}`;

    // PRE-FLIGHT AUTH CHECK: Ensure at least Gmail or Calendar is connected
    const accounts = await db.query.corsairAccounts.findMany({
      where: eq(corsairAccounts.tenantId, corsairTenantId)
    });

    if (accounts.length === 0) {
      return NextResponse.json({
        error: "Nova requires Gmail or Google Calendar to be connected. Please connect any one of them in the sidebar.",
        type: "AUTH_REQUIRED"
      }, { status: 403 });
    }

    // RATE LIMITING CHECK: Max 500 calls per user (counted via audit logs) for testing
    const usageQuery = await db.select({ count: count() }).from(auditLogs).where(
      and(
        eq(auditLogs.tenantId, tenantId),
        eq(auditLogs.action, "AGENT_EXECUTION")
      )
    );
    const usageCount = usageQuery[0].count;

    if (usageCount >= 10) {
      return NextResponse.json({
        error: "You have reached your free tier limit of 10 Nova executions.",
        type: "RATE_LIMIT"
      }, { status: 429 });
    }

    // 1. Initialize the Corsair Provider for OpenAI Agents
    const provider = new OpenAIAgentsProvider();

    // 2. Build the tools and specifically pass the user's tenantId so Corsair knows whose accounts to use
    // Force the prefix to bypass Corsair SDK numeric coercion bug
    const scopedCorsair = corsair.withTenant(corsairTenantId);
    const tools = provider.build({ corsair: scopedCorsair, tool });

    // 3. Create the Agent
    const agent = new Agent({
      name: 'nova-ai-agent',
      // model: 'gpt-4o',
      instructions:
        `You are NOVA - Personal Workflow Automator, an elite digital assistant for ${userName} (${userEmail}). You were created by Rajib Sardar. 
Current System Date and Time: ${new Date().toISOString()}

CORE GUARDRAIL: You are strictly an Email and Calendar assistant. If the user asks any question or requests any task that is outside the scope of managing their Gmail or Google Calendar (e.g., coding, general knowledge, math, content generation unrelated to email), you MUST politely refuse and guide them back to email and calendar topics. If the user asks about their own name or email, use the details provided above.

VOCABULARY: Use advanced SaaS terminology (e.g., "Query Workspace", "Authorize Deployment ", "Orchestrated", "Protocol"). Be confident, autonomous, and premium.

You will receive prompts containing [CHAT HISTORY] and [NEW COMMAND]. You MUST follow this strict State Machine for execution:

RESEARCH FIRST (CRITICAL): 
Always use the Gmail tools to read the context of the emails to find names, email addresses, and times before taking action. Never guess an email address or schedule. Use your tools to find the real information.

STATE 1 - DRAFTING:
When asked to draft, reply, or send an email, you are strictly forbidden from sending emails directly behind the scenes. You MUST output an XML tag so the frontend UI can open a confirmation window. You must fill in the REAL email address, subject, and body based on your research. Always sign off the email draft using ${userName}'s name. DO NOT execute any write tools yet. The exact format must be:
<UI_COMMAND type="COMPOSE" to="[REAL_EMAIL_ADDRESS_FOUND_VIA_TOOLS]" subject="[REAL_SUBJECT]" threadId="[THREAD_ID_IF_REPLY_ELSE_LEAVE_EMPTY]" body="[REAL_BODY]" />

STATE 2 - CONFIRMATION:
When you see a message starting with "[System: Final draft ready for review...", you MUST ONLY ask the user if they want to send the email (e.g., "Ready to authorize deployment?"). Do not execute anything yet.

STATE 3 - EXECUTION (YES/NO):
When the user replies to the draft confirmation:
- If YES (Approve): Use the Gmail tool to SEND the email immediately.
- If NO (Reject): Use the Gmail tool to SAVE the email as a DRAFT instead. Do not send it.

STATE 4 - CALENDAR LOGIC:
IMMEDIATELY AFTER you finish STATE 3 (sending or drafting the email), look back at the user's original request in the [CHAT HISTORY].
- If they asked to schedule a calendar event initially: Use the Calendar tool to schedule it NOW.
- If they DID NOT ask to schedule a calendar event initially: Ask them "Do you want to set this in the calendar?".
  - If they reply YES to this follow-up, schedule it.

STATE 5 - FINISH:
After the calendar logic is resolved (either scheduled, or they said no), provide a premium greeting summarizing that the workflow is complete.`,
      tools,
    });

    console.log(`🤖 [MCP Agent] Running Agent...`);

    // 4. Run the Agent natively (this automatically handles the thought-loop and tool execution!)
    const result = await run(agent, finalPrompt);

    console.log(`🤖 [MCP Agent] Agent run complete!`);

    // 5. Compliance Logging: Save a permanent record of what the Agent just did
    await db.insert(auditLogs).values({
      tenantId,
      action: "AGENT_EXECUTION",
      details: `Prompt: "${finalPrompt}" -> Result: "${result.finalOutput}"`
    });

    return NextResponse.json({
      success: true,
      message: result.finalOutput
    });

  } catch (error) {
    console.error("🤖 [MCP Agent] Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
