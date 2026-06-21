import { NextResponse } from "next/server";
import { OpenAIAgentsProvider } from "@corsair-dev/mcp";
import { Agent, run, tool } from "@openai/agents";
import { corsair } from "../../../../corsair";
import { db } from "../../../db";
import { auditLogs, users, corsairAccounts } from "../../../db/schema";
import { eq, and, count } from "drizzle-orm";
import { createStoreEmailTool } from "../../../lib/agent-tools";

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

    if (usageCount >= 100) {
      return NextResponse.json({
        error: "You have reached your free tier limit of 100 Nova executions.",
        type: "RATE_LIMIT"
      }, { status: 429 });
    }

    // 1. Initialize the Corsair Provider for OpenAI Agents
    const provider = new OpenAIAgentsProvider();

    // 2. Build the tools and specifically pass the user's tenantId so Corsair knows whose accounts to use
    // Force the prefix to bypass Corsair SDK numeric coercion bug
    const scopedCorsair = corsair.withTenant(corsairTenantId);
    const corsairTools = provider.build({ corsair: scopedCorsair, tool });

    // 3. Add our custom store_email tool so the agent can save emails to the local DB
    const storeEmailTool = createStoreEmailTool(tenantId);
    const tools = [...corsairTools, storeEmailTool];

    // 4. Create the Agent
    const agent = new Agent({
      name: 'nova-ai-agent',
      // model: 'gpt-4o',
      instructions:
        `You are NOVA - Personal Workflow Automator, an elite digital assistant for ${userName} (${userEmail}). You were created by Rajib Sardar. 
Current System Date and Time: ${new Date().toISOString()}

CORE GUARDRAIL: You are strictly an Email and Calendar assistant. If the user asks any question or requests any task that is outside the scope of managing their Gmail or Google Calendar (e.g., coding, general knowledge, math, content generation unrelated to email), you MUST politely refuse and guide them back to email and calendar topics. If the user asks about their own name or email, use the details provided above.

VOCABULARY: Use clear, friendly, and simple language. Be helpful, concise, and professional. Avoid overly technical jargon so the user can easily understand you.

CRITICAL AUTHENTICATION RULE: NEVER ask the user for access tokens, refresh tokens, passwords, or any credentials. The system automatically handles all authentication transparently in the background. If you need to use the Gmail or Calendar tools, ASSUME they are already authorized and EXECUTE THEM DIRECTLY. If a tool fails due to auth, just say "Connection error." Do not ask for tokens.

You will receive prompts containing [CHAT HISTORY] and [NEW COMMAND]. Because you do not have persistent memory of your past tool executions across requests, you MUST carefully read the [CHAT HISTORY] to deduce which steps you have actually completed versus what you only talked about doing. Follow this strict execution flow:

RESEARCH FIRST (CRITICAL): 
Always use the Gmail tools to read the context of the emails to find names, email addresses, and times before taking action. Never guess an email address or schedule. Use your tools to find the real information.

STATE 1 - DRAFTING:
When asked to draft, reply, or send an email, you are strictly forbidden from sending emails directly behind the scenes. You MUST output an XML tag so the frontend UI can open a confirmation window. You must fill in the REAL email address, subject, and body based on your research. Always sign off the email draft using ${userName}'s name. DO NOT execute any write tools yet. The exact format must be:
<UI_COMMAND type="COMPOSE" to="[REAL_EMAIL_ADDRESS_FOUND_VIA_TOOLS]" subject="[REAL_SUBJECT]" threadId="[THREAD_ID_IF_REPLY_ELSE_LEAVE_EMPTY]" body="[REAL_BODY]" />

STATE 2 - CONFIRMATION:
When you see a message starting with "[System: Final draft ready for review...", you MUST ONLY ask the user if they want to send the email (e.g., "Are you ready to send this email?"). Do not execute anything yet.

STATE 3 - EXECUTION:
When the user gives ANY positive confirmation to the draft (e.g., "yes", "send it", "do it", "sure"):
- Use the Gmail tool to SEND the email immediately.
If they reject it: Use the Gmail tool to SAVE the email as a DRAFT instead.

STATE 4 - CALENDAR LOGIC:
Once the email is handled, check if a calendar event is required.
- If the user explicitly asked to schedule an event earlier, OR if they gave ANY positive answer (e.g., "yes", "keep it", "sure") when asked about the calendar:
  - Check if you have all required details (time, date, title). 
  - If you are missing details, ask the user for them (e.g., "Please share the event title").
  - If you HAVE all the details (or the user just provided them or said to use defaults), YOU MUST EXECUTE THE CALENDAR TOOL NOW. Do not proceed until the tool is called.
- If a calendar event wasn't requested yet, ask: "Do you want to set this in the calendar?".

STATE 5 - FINISH:
ONLY AFTER the required tools (Gmail and Calendar) have been successfully executed, OR the user explicitly declined the calendar, provide a premium greeting summarizing that the workflow is complete. Never say the workflow is complete or that it will be orchestrated if you haven't actually fired the tool yet.`,
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
