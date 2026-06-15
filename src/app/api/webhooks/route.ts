import { NextRequest, NextResponse, after } from "next/server";
import { corsair } from "../../../../corsair";
import { processWebhook } from "corsair";
import { db } from "@/db";
import { users, corsairAccounts } from "@/db/schema";
import { eq, ilike } from "drizzle-orm";

export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  const header: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    header[key] = value;
  });

  const contenttype = request.headers.get("content-type");
  let body: Record<string, unknown> = {};

  if (contenttype?.includes("application/json")) {
    body = await request.json();
  } else {
    const text = await request.text();
    try {
      body = JSON.parse(text);
    } catch {
      body = {};
    }
  }

  let dynamicTenantId = url.searchParams.get("tenantId") || url.searchParams.get("tenant_id") || url.searchParams.get("id");

  // Attempt to extract tenantId from Gmail Pub/Sub payload if not in URL
  if (!dynamicTenantId && body?.message && (body.message as any).data) {
    try {
      const decodedData = Buffer.from((body.message as any).data as string, 'base64').toString('utf-8');
      const parsedData = JSON.parse(decodedData);
      const emailAddress = parsedData.emailAddress;

      if (emailAddress) {
        const user = await db.query.users.findFirst({
          where: ilike(users.email, emailAddress),
        });
        if (user) {
          dynamicTenantId = user.id;
        }
      }
    } catch (e) {
      console.error("Failed to extract tenantId from webhook payload:", e);
    }
  }

  // CRITICAL: Stop the process if we don't have a user ID
  if (!dynamicTenantId) {
    console.error("Webhook failed: No tenantId found in URL parameters or payload.");
    return NextResponse.json({ error: "Missing tenantId" }, { status: 400 });
  }

  // Force it to be a non-numeric string to bypass the Corsair SDK coercion bug
  const corsairTenantId = dynamicTenantId ? `user_${dynamicTenantId}` : undefined;

  const result = await processWebhook(corsair, header, body, {
    tenantId: corsairTenantId,
  });

  console.info("Plugin Processed:", result?.plugin, result?.action);

  // --- SUPERHUMAN AI TRIAGE INJECTION (PRODUCTION READY) ---
  if (result.plugin === "gmail" && result.action === "messageChanged") {

    const safeTenantId = dynamicTenantId as string;

    if (!safeTenantId) {
      console.error("Webhook Triage Aborted: No valid tenantId found.");
      return NextResponse.json({ error: "No valid tenantId found" }, { status: 400 });
    }

    console.log(`Gmail update detected for tenant: ${safeTenantId}`);
    // Asynchronously fetch and process using Next.js 'after' so we don't block the 200 OK webhook response
    after(async () => {
      try {
        const corsairTenantId = `user_${safeTenantId}`;
        const account = await db.query.corsairAccounts.findFirst({
          where: eq(corsairAccounts.tenantId, corsairTenantId),
        });

        if (!account) {
          console.log(`⚠️ No Corsair account found for tenant ${corsairTenantId}. Skipping triage.`);
          return;
        }

        const { OpenAIAgentsProvider } = await import("@corsair-dev/mcp");
        const { Agent, run, tool } = await import("@openai/agents");
        const { createStoreEmailTool } = await import("../../../lib/agent-tools");

        const provider = new OpenAIAgentsProvider();
        const tools = provider.build({ corsair, tool, tenantId: corsairTenantId });
        
        // Inject our custom storage/logging tool
        tools.push(createStoreEmailTool(safeTenantId));

        const agent = new Agent({
          name: 'nova-email-triage',
          model: 'gpt-4o-mini',
          instructions: `You are Nova's background email triage agent. 
          1. Use the Gmail tool to search for the most recent unread email.
          2. Read its contents.
          3. Determine if it is 'high', 'urgent', or 'normal' priority.
          4. USE THE store_email TOOL to save the email data into the database! This is strictly required. Do not skip this step.`,
          tools,
        });

        console.log(`🤖 Agent starting background triage for tenant: ${safeTenantId}...`);
        await run(agent, "Fetch the latest email from my inbox, summarize it, and store it.");
        console.log(`🤖 Agent background triage complete!`);
        
      } catch (e) {
        console.error("Failed to process background webhook triage", e);
      }
    });
  }
  // ---------------------------------------------------------

  const responseHeaders = result.responseHeaders;
  const nextHeaders = new Headers();
  if (responseHeaders) {
    for (const [key, value] of Object.entries(responseHeaders)) {
      nextHeaders.set(key, value as string);
    }
  }

  if (!result.response) {
    return NextResponse.json(
      { success: false, message: "No matching webhook handler found" },
      { status: 404 }
    );
  }

  return NextResponse.json(result.response, { headers: nextHeaders });
}

export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      message: "Nova Webhook endpoint is running...",
      timestamp: new Date().toISOString()
    }, { status: 200 })

}