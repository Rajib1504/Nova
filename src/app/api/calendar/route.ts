import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { db } from "../../../db";
import { calendarEvents } from "../../../db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = session.user.id;
    console.log(`\n📅 Fetching Calendar Events for tenant: ${tenantId}`);

    // Fetch events from our local Drizzle DB
    const events = await db.query.calendarEvents.findMany({
      where: eq(calendarEvents.userId, tenantId),
      orderBy: [desc(calendarEvents.startTime)],
      limit: 100,
    });

    return NextResponse.json({ events });

  } catch (error) {
    console.error("Calendar fetch error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
