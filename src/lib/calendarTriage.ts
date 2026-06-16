import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { db } from "../db";
import { calendarEvents, users } from "../db/schema";
import { eq } from "drizzle-orm";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function processAndStoreCalendarEvents(
  tenantId: string,
  events: any[]
) {
  try {
    console.log(`[Calendar Sync] Starting sync for ${events.length} events...`);

    // Ensure the User exists before proceeding
    const userExists = await db.query.users.findFirst({
      where: eq(users.id, tenantId),
    });

    if (!userExists) {
      throw new Error(`CRITICAL: Attempted to sync events for unknown user: ${tenantId}`);
    }

    for (const event of events) {
      if (!event.id || event.status === "cancelled") continue;

      // Ensure we have a start time
      const startTime = event.start?.dateTime || event.start?.date;
      const endTime = event.end?.dateTime || event.end?.date;
      
      if (!startTime || !endTime) continue;

      await db.insert(calendarEvents).values({
        id: event.id,
        userId: tenantId,
        summary: event.summary || "Busy",
        description: event.description || "",
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        location: event.location || "",
        attendees: event.attendees || [],
        htmlLink: event.htmlLink || "",
      }).onConflictDoUpdate({
        target: calendarEvents.id,
        set: {
          summary: event.summary || "Busy",
          description: event.description || "",
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          location: event.location || "",
          attendees: event.attendees || [],
          htmlLink: event.htmlLink || "",
        }
      });
    }

    console.log(`[Calendar Sync] Successfully synced events to Postgres!`);

  } catch (error) {
    console.error("[Calendar Sync] Error syncing events:", error);
  }
}
