import { NextResponse } from "next/server";
import { OpenAIAgentsProvider } from "@corsair-dev/mcp";
import { Agent, run, tool } from "@openai/agents";
import { corsair } from "../../../../corsair";
import { db } from "../../../db";
import { auditLogs } from "../../../db/schema";

export async function POST(req: Request) {
  try {
    const { prompt, tenantId } = await req.json();

    if (!prompt || !tenantId) {
      return NextResponse.json({ error: "Missing prompt or tenantId" }, { status: 400 });
    }

    console.log(`\n🤖 [MCP Agent] Received command: "${prompt}" for tenant: ${tenantId}`);

    // 1. Initialize the Corsair Provider for OpenAI Agents
    const provider = new OpenAIAgentsProvider();

    // 2. Build the tools and specifically pass the user's tenantId so Corsair knows whose accounts to use
    // The provider automatically wraps the Corsair plugins into the official OpenAI tool format
    const tools = provider.build({ corsair, tool, tenantId });

    // 3. Create the Agent
    const agent = new Agent({
      name: 'nova-ai-agent',
      model: 'gpt-4o',
      instructions:
        'You are a Superhuman-style elite personal assistant. You have access to Corsair tools. Manage the user\'s email and calendar with extreme efficiency. When referencing resources (like emails or events), use their IDs if needed. \n 1:Research First: Always use the Gmail tools to read the context of the emails to find names, email addresses, and times before taking action. \n 2:Multi-Step Execution: If a user asks to "Schedule a meeting and reply", you must first use the Calendar tool to book the event, and then immediately use the Gmail tool to send the confirmation email to the person mentioned. \n 3:Safety First (Human-in-the-loop): You are allowed to autonomously use "read" tools (like searching emails). However, before you execute ANY "write" tool (like sending an email or creating an event), you MUST stop and ask the user for explicit permission (e.g. "I am about to send this email. Do you approve?"). You are strictly forbidden from calling a write tool until the user replies "Approve".',
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
