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

        const c = corsair.withTenant(corsairTenantId);

        console.log(`🤖 Webhook triggered fetch for tenant: ${safeTenantId}...`);
        
        // Fetch the single most recent unread email reliably
        const listRes = await (c as any).gmail.api.messages.list({
          userId: 'me',
          q: "is:unread",
          maxResults: 1
        });

        const messages = listRes?.messages || [];

        if (messages.length === 0) {
          console.log(`🤖 No new unread messages found for tenant ${safeTenantId}.`);
          return;
        }

        const msg = messages[0];
        
        const { processAndStoreEmail } = await import("../../../lib/triage");
        
        // Fetch full message details
        const msgRes = await (c as any).gmail.api.messages.get({
          userId: 'me',
          id: msg.id,
          format: 'full'
        });

        if (msgRes) {
          const headers = msgRes.payload?.headers || [];
          const subject = headers.find((h: any) => h.name.toLowerCase() === 'subject')?.value || "No Subject";
          const from = headers.find((h: any) => h.name.toLowerCase() === 'from')?.value || "Unknown Sender";
          const to = headers.find((h: any) => h.name.toLowerCase() === 'to')?.value || "Unknown";
          const dateStr = headers.find((h: any) => h.name.toLowerCase() === 'date')?.value || new Date().toISOString();

          const labels = msgRes.labelIds || [];
          const bodyText = msgRes.snippet || "";

          // Pass to our deterministic triage logic (which uses OpenAI safely for categorization)
          await processAndStoreEmail(safeTenantId, msg.id, from, to, subject, bodyText, dateStr, labels);
        }
        
        console.log(`🤖 Background triage complete!`);
        
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