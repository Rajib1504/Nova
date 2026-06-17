import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { db } from "../../../db";
import { emails, corsairAccounts, corsairIntegrations } from "../../../db/schema";
import { eq, desc, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = session.user.id;
    console.log(`\n📧 Fetching database emails for user: ${tenantId}`);

    const connectedAccount = await db
      .select()
      .from(corsairAccounts)
      .innerJoin(corsairIntegrations, eq(corsairAccounts.integrationId, corsairIntegrations.id))
      .where(
        and(
          eq(corsairAccounts.tenantId, `user_${tenantId}`),
          eq(corsairIntegrations.name, "gmail")
        )
      )
      .limit(1);

    const isConnected = connectedAccount.length > 0;

    // Fetch emails from the database, ordered by newest first
    const userEmails = await db.query.emails.findMany({
      where: eq(emails.userId, tenantId),
      orderBy: [desc(emails.date)],
      limit: 50,
      columns: {
        id: true,
        threadId: true,
        subject: true,
        fromAddress: true,
        snippet: true,
        date: true,
        isRead: true,
        priority: true,
        labels: true, // needed for inbox/archive tabs
        // CRITICAL: Exclude body and embedding to prevent massive egress
      }
    });

    return NextResponse.json({ emails: userEmails, isConnected });

  } catch (error) {
    console.error("Emails fetch error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
