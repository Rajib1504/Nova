import { NextResponse } from "next/server";
import { OpenAIAgentsProvider } from "@corsair-dev/mcp";
import { Agent, run, tool } from "@openai/agents";
import { corsair } from "../../../../corsair";
import { db } from "../../../db";
import { auditLogs, users, corsairAccounts } from "../../../db/schema";
import { eq, and, inArray, count } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { prompt, tenantId } = await req.json();

    if (!prompt || !tenantId) {
      return NextResponse.json({ error: "Missing prompt or tenantId" }, { status: 400 });
    }

    console.log(`\n🤖 [MCP Agent] Received command: "${prompt}" for tenant: ${tenantId}`);

    const user = await db.query.users.findFirst({
      where: eq(users.id, tenantId)
    });
    const userName = user?.name || "User";
    const userEmail = user?.email || "Unknown Email";

    const corsairTenantId = `user_${tenantId}`;

    // PRE-FLIGHT AUTH CHECK: Ensure both Gmail and Calendar are connected
    const accounts = await db.query.corsairAccounts.findMany({
      where: and(
        eq(corsairAccounts.tenantId, corsairTenantId),
        inArray(corsairAccounts.integrationId, ["gmail", "googlecalendar"])
      )
    });
    
    const connectedIntegrations = new Set(accounts.map(a => a.integrationId));
    if (!connectedIntegrations.has("gmail") || !connectedIntegrations.has("googlecalendar")) {
      return NextResponse.json({ 
        error: "Nova requires both Gmail and Google Calendar to be connected. Please connect them in the sidebar.",
        type: "AUTH_REQUIRED"
      }, { status: 403 });
    }

    // RATE LIMITING CHECK: Max 10 calls per user (counted via audit logs)
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
    const tools = provider.build({ corsair, tool, tenantId: corsairTenantId });

    // 3. Create the Agent
    const agent = new Agent({
      name: 'nova-ai-agent',
      model: 'gpt-4o',
      instructions:
        `You are NOVA - Personal Workflow Automator, an elite digital assistant for ${userName} (${userEmail}). You were created by Rajib Sardar. 
Current System Date and Time: ${new Date().toISOString()}

CORE GUARDRAIL: You are strictly an Email and Calendar assistant. If the user asks any question or requests any task that is outside the scope of managing their Gmail or Google Calendar (e.g., coding, general knowledge, math, content generation unrelated to email), you MUST politely refuse and guide them back to email and calendar topics. If the user asks about their own name or email, use the details provided above.

You have access to Corsair tools. Manage the user's email and calendar with extreme efficiency. When referencing resources (like emails or events), use their IDs if needed. 
1: Research First: Always use the Gmail tools to read the context of the emails to find names, email addresses, and times before taking action. 
2: Multi-Step Execution: If a user asks to "Schedule a meeting and reply", you must first use the Calendar tool to book the event, and then immediately use the Gmail tool to send the confirmation email to the person mentioned. 
3: Safety First (Human-in-the-loop): You are allowed to autonomously use "read" tools (like searching emails). However, before you execute ANY "write" tool (like sending an email or creating an event), you MUST stop and ask the user for explicit permission (e.g. "I am about to send this email. Do you approve?"). You are strictly forbidden from calling a write tool until the user replies "Approve".`,
      tools,
    });

    console.log(`🤖 [MCP Agent] Running Agent...`);

    // 4. Run the Agent natively (this automatically handles the thought-loop and tool execution!)
    const result = await run(agent, prompt);

    console.log(`🤖 [MCP Agent] Agent run complete!`);

    // 5. Compliance Logging: Save a permanent record of what the Agent just did
    await db.insert(auditLogs).values({
      tenantId,
      action: "AGENT_EXECUTION",
      details: `Prompt: "${prompt}" -> Result: "${result.finalOutput}"`
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
