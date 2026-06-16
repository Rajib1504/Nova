import { NextRequest, NextResponse } from "next/server";
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

    console.log(`\n🔄 Triggering calendar sync for user: ${tenantId}`);

    try {
      console.log(`🤖 Sync process starting fetch for tenant: ${tenantId}...`);

      const c = corsair.withTenant(corsairTenantId);

      const timeMin = new Date();
      timeMin.setDate(timeMin.getDate() - 7); // include recently past events for context

      const listRes = await (c as any).googlecalendar.api.events.getMany({
        timeMin: timeMin.toISOString()
      });

      const events = listRes?.data || listRes?.items || [];

      if (events.length === 0) {
        console.log(`🤖 No calendar events found for tenant ${tenantId}.`);
        return NextResponse.json({ success: true, message: "No events found" });
      }

      const { processAndStoreCalendarEvents } = await import("../../../../../src/lib/calendarTriage");

      await processAndStoreCalendarEvents(tenantId, events);

      console.log(`🤖 Calendar Sync fetch complete!`);

    } catch (e) {
      console.error("Failed to process calendar sync", e);
      return NextResponse.json({ error: String(e) }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Sync complete" });

  } catch (error) {
    console.error("Calendar sync fetch error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
