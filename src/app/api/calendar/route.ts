import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { db } from "../../../db";
import { calendarEvents, corsairAccounts, corsairIntegrations } from "../../../db/schema";
import { eq, desc, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = session.user.id;
    console.log(`\n📅 Fetching Calendar Events for tenant: ${tenantId}`);

    const connectedAccount = await db
      .select()
      .from(corsairAccounts)
      .innerJoin(corsairIntegrations, eq(corsairAccounts.integrationId, corsairIntegrations.id))
      .where(
        and(
          eq(corsairAccounts.tenantId, `user_${tenantId}`),
          eq(corsairIntegrations.name, "googlecalendar")
        )
      )
      .limit(1);

    const isConnected = connectedAccount.length > 0;

    // Fetch events from our local Drizzle DB
    const events = await db.query.calendarEvents.findMany({
      where: eq(calendarEvents.userId, tenantId),
      orderBy: [desc(calendarEvents.startTime)],
      limit: 100,
    });

    return NextResponse.json({ events, isConnected });

  } catch (error) {
    console.error("Calendar fetch error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
