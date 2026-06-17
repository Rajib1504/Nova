import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { corsair } from "../../../../../corsair";
import { db } from "../../../../db";
import { calendarEvents } from "../../../../db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, id, summary, description, startTime, endTime } = body;

    if (!action) {
      return NextResponse.json({ error: "Missing action" }, { status: 400 });
    }

    const tenantId = session.user.id;
    const corsairTenantId = `user_${tenantId}`;
    const c = corsair.withTenant(corsairTenantId);

    if (action === "create") {
      const res = await (c as any).googlecalendar.api.events.create({
        calendarId: "primary",
        event: {
          summary: summary || "New Event",
          description: description || "",
          start: {
            dateTime: new Date(startTime).toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
          },
          end: {
            dateTime: new Date(endTime).toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
          },
        }
      });

      const event = res.data || res;

      await db.insert(calendarEvents).values({
        id: event.id,
        userId: tenantId,
        summary: event.summary || summary,
        description: event.description || "",
        startTime: new Date(event.start?.dateTime || startTime),
        endTime: new Date(event.end?.dateTime || endTime),
        location: event.location || "",
        attendees: event.attendees || [],
        htmlLink: event.htmlLink || "",
      });

      return NextResponse.json({ success: true, event });
    }
    else if (action === "update") {
      if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

      const res = await (c as any).googlecalendar.api.events.update({
        calendarId: "primary",
        id: id,
        event: {
          summary,
          description: description || "",
          start: {
            dateTime: new Date(startTime).toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
          },
          end: {
            dateTime: new Date(endTime).toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
          },
        }
      });

      const event = res.data || res;

      await db.update(calendarEvents)
        .set({
          summary: event.summary || summary,
          description: event.description || description,
          startTime: new Date(event.start?.dateTime || startTime),
          endTime: new Date(event.end?.dateTime || endTime),
        })
        .where(eq(calendarEvents.id, id));

      return NextResponse.json({ success: true, event });
    }
    else if (action === "delete") {
      if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

      await (c as any).googlecalendar.api.events.delete({
        calendarId: "primary",
        id: id,
      });

      await db.delete(calendarEvents).where(eq(calendarEvents.id, id));

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (error: any) {
    console.error("Modify Calendar Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
