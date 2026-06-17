import { NextRequest, NextResponse, after } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { corsair } from "../../../../../corsair";
import { db } from "../../../../../src/db";
import { corsairAccounts } from "../../../../../src/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = session.user.id;
    const corsairTenantId = `user_${tenantId}`;

    const account = await db.query.corsairAccounts.findFirst({
      where: eq(corsairAccounts.tenantId, corsairTenantId),
    });

    if (!account) {
      return NextResponse.json({ error: "No Corsair account found. Please connect first." }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const offset = body.offset || 0;
    const limit = 10;
    const query = offset > 0
      ? `Fetch ${limit} emails from my inbox skipping the first ${offset} most recent ones. For each email, read its contents, determine if it is 'high', 'urgent', or 'normal' priority, and use the store_email tool to save it into the database. You must process all ${limit} emails one by one.`
      : `Fetch the ${limit} most recent emails from my inbox. For each email, read its contents, determine if it is 'high', 'urgent', or 'normal' priority, and use the store_email tool to save it into the database. You must process all ${limit} emails one by one.`;

    console.log(`\n🔄 Triggering sync for user: ${tenantId}`);

    try {
      console.log(`🤖 Sync process starting fetch for tenant: ${tenantId}...`);

        const c = corsair.withTenant(corsairTenantId);

        const syncConfigs = [
          { q: "in:inbox", maxResults: 15 },
          { q: "in:sent", maxResults: 10 },
          { q: "in:draft", maxResults: 5 },
          { q: "in:scheduled", maxResults: 2 },
          { q: "is:important", maxResults: 2 },
          { q: "in:snoozed", maxResults: 2 },
          { q: "in:trash", maxResults: 2 }
        ];

        const allMessages = new Map();

        for (const config of syncConfigs) {
          try {
            const listRes = await (c as any).gmail.api.messages.list({ 
              userId: 'me', 
              q: config.q,
              maxResults: config.maxResults 
            });
            const messages = listRes?.messages || [];
            for (const m of messages) {
              allMessages.set(m.id, m);
            }
          } catch (e) {
            console.error(`Failed to fetch ${config.q}`, e);
          }
        }

        const uniqueMessages = Array.from(allMessages.values());
        console.log(`📧 Found ${uniqueMessages.length} unique messages across categories. Fetching details...`);

        const { processAndStoreEmail } = await import("../../../../../src/lib/triage");

        const batchSize = 10;
        for (let i = 0; i < uniqueMessages.length; i += batchSize) {
          const batch = uniqueMessages.slice(i, i + batchSize);
          
          await Promise.all(
            batch.map(async (msg) => {
              try {
                const msgRes = await (c as any).gmail.api.messages.get({
                  userId: 'me',
                  id: msg.id,
                  format: 'full'
                });

                const emailData = msgRes;
                if (!emailData) return;

                const headers = emailData.payload?.headers || [];
                const subject = headers.find((h: any) => h.name.toLowerCase() === 'subject')?.value || "No Subject";
                const from = headers.find((h: any) => h.name.toLowerCase() === 'from')?.value || "Unknown Sender";
                const to = headers.find((h: any) => h.name.toLowerCase() === 'to')?.value || "Unknown";
                const dateStr = headers.find((h: any) => h.name.toLowerCase() === 'date')?.value || new Date().toISOString();

                const labels = emailData.labelIds || [];
                const bodyText = emailData.snippet || "";

                await processAndStoreEmail(tenantId, msg.id, from, to, subject, bodyText, dateStr, labels);
              } catch (err) {
                console.error(`Error processing message ${msg.id}:`, err);
              }
            })
          );
        }

        console.log(`🤖 Sync fetch complete!`);

    } catch (e) {
      console.error("Failed to process email sync", e);
      return NextResponse.json({ error: String(e) }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Sync complete" });

  } catch (error) {
    console.error("Sync fetch error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
