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
  // console.log(header)

  const contenttype = request.headers.get("content-type");
  let body: Record<string, unknown> = {};

  if (contenttype?.includes("application/json")) {
    try {
      const text = await request.text();
      body = text ? JSON.parse(text) : {};
    } catch (e) {
      body = {};
    }
  } else {
    try {
      const text = await request.text();
      body = text ? JSON.parse(text) : {};
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

  // Force it to be a non-numeric string to bypass the Corsair SDK coercion bug
  const corsairTenantId = dynamicTenantId ? `user_${dynamicTenantId}` : undefined;

  // Let Corsair handle the webhook. It will automatically resolve the tenantId 
  // from the Google Calendar X-Goog-Channel-ID header if it's missing from the URL.
  let result: any = null;
  let isGoogleCalendarWebhook = false;

  // Check headers manually in case processWebhook throws an error
  if (header["x-goog-resource-state"]) {
    isGoogleCalendarWebhook = true;
  }

  try {
    result = await processWebhook(corsair, header, body, corsairTenantId ? {
      tenantId: corsairTenantId,
    } : undefined);
  } catch (err: any) {
    console.error("Corsair processWebhook threw an error:", err.message);
  }

  // If Corsair successfully processed it, it will return the tenantId it found.
  let resolvedTenantId = dynamicTenantId || result?.tenantId?.replace("user_", "");

  // HACKATHON FALLBACK: If Corsair fails to map the Channel-ID to a tenant, 
  // we can manually look up the active Google Calendar account from our DB.
  if (!resolvedTenantId && (result?.plugin === "googlecalendar" || isGoogleCalendarWebhook)) {
    try {
      // Find any account connected to googlecalendar
      const activeCalendarAccount = await db.query.corsairAccounts.findFirst({
        where: (accounts, { eq }) => eq(accounts.integrationId, "googlecalendar")
      });
      if (activeCalendarAccount) {
        resolvedTenantId = activeCalendarAccount.tenantId.replace("user_", "");
        console.log("Fallback resolved Calendar tenantId:", resolvedTenantId);
      }
    } catch (e) {
      console.error("Failed fallback tenant resolution:", e);
    }

    // Dynamic Hackathon Fallback: Find the active user dynamically
    if (!resolvedTenantId) {
      try {
        const firstUser = await db.query.users.findFirst();
        if (firstUser) {
          resolvedTenantId = firstUser.id;
        }
      } catch (e) {
        console.error("Failed dynamic fallback", e);
      }
    }

    // Polyfill the result object so our sync injection runs
    if (!result) {
      result = { plugin: "googlecalendar", action: "onEventChanged" };
    }
  }

  console.info("Plugin Processed:", result?.plugin, result?.action, "Tenant:", resolvedTenantId);

  if (!result) {
    return NextResponse.json({ success: true, message: "Ignored webhook or no matching handler" }, { status: 200 });
  }

  // --- SUPERHUMAN AI TRIAGE INJECTION (PRODUCTION READY) ---
  if (result.plugin === "gmail" && result.action === "messageChanged") {

    const safeTenantId = resolvedTenantId as string;

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

        // Fetch the 5 most recent emails reliably (captures drafts, sent, trash, etc.)
        const listRes = await (c as any).gmail.api.messages.list({
          userId: 'me',
          maxResults: 5
        });

        const messages = listRes?.messages || [];

        if (messages.length === 0) {
          console.log(`🤖 No new messages found for tenant ${safeTenantId}.`);
          return;
        }

        const { processAndStoreEmail } = await import("../../../lib/triage");

        // Process all 5 recent messages to ensure we catch the one that changed
        for (const msg of messages) {
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
        }

        console.log(`🤖 Background triage complete!`);

      } catch (e) {
        console.error("Failed to process background webhook triage", e);
      }
    });
  }

  // --- CALENDAR SYNC INJECTION ---
  if (result.plugin === "googlecalendar" && result.action === "onEventChanged") {
    const safeTenantId = resolvedTenantId as string;

    if (!safeTenantId) {
      console.error("Calendar Webhook Aborted: No valid tenantId found by Corsair. Returning 200 to stop retries.");
      return NextResponse.json({ error: "No valid tenantId found" }, { status: 200 });
    }

    console.log(`Calendar update detected for tenant: ${safeTenantId}`);

    // Asynchronously fetch and process using Next.js 'after'
    after(async () => {
      try {
        const corsairTenantId = `user_${safeTenantId}`;
        const account = await db.query.corsairAccounts.findFirst({
          where: eq(corsairAccounts.tenantId, corsairTenantId),
        });

        if (!account) {
          console.log(`⚠️ No Corsair account found for tenant ${corsairTenantId}. Skipping calendar sync.`);
          return;
        }

        const c = corsair.withTenant(corsairTenantId);

        console.log(`🤖 Calendar Webhook triggered fetch for tenant: ${safeTenantId}...`);

        // Fetch upcoming 50 events
        const timeMin = new Date();
        timeMin.setDate(timeMin.getDate() - 7); // include recently past events for context

        const listRes = await (c as any).googlecalendar.api.events.getMany({
          calendarId: 'primary',
          timeMin: timeMin.toISOString(),
          maxResults: 50,
          singleEvents: true,
          orderBy: 'startTime',
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        });

        const events = listRes?.items || [];

        if (events.length === 0) {
          console.log(`🤖 No calendar events found for tenant ${safeTenantId}.`);
          return;
        }

        const { processAndStoreCalendarEvents } = await import("../../../lib/calendarTriage");

        // Pass to our sync logic
        await processAndStoreCalendarEvents(safeTenantId, events);

        console.log(`🤖 Background calendar sync complete!`);

      } catch (e) {
        console.error("Failed to process background calendar sync", e);
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