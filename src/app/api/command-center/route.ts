import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { db } from "@/db";
import { emails, calendarEvents } from "@/db/schema";
import { eq, and, desc, sql, gte } from "drizzle-orm";
import { subDays, subWeeks, startOfWeek, endOfWeek, isWithinInterval, format } from "date-fns";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch High Priority Action Items (Emails)
    const actionItems = await db.query.emails.findMany({
      where: and(eq(emails.userId, userId), eq(emails.priority, "Important")),
      orderBy: [desc(emails.date)],
      limit: 10,
    });

    // Fetch Total Emails Triaged
    const totalEmailsResult = await db.select({ count: sql<number>`count(*)` }).from(emails).where(eq(emails.userId, userId));
    const totalEmails = totalEmailsResult[0].count;

    // Fetch Upcoming Calendar Events (Next 10)
    const upcomingEvents = await db.query.calendarEvents.findMany({
      where: eq(calendarEvents.userId, userId),
      orderBy: [desc(calendarEvents.startTime)],
      limit: 10,
    });

    // Fetch Events for the last 8 weeks to build the Comparison Chart
    const eightWeeksAgo = subWeeks(new Date(), 8);
    const recentEvents = await db.query.calendarEvents.findMany({
      where: and(
        eq(calendarEvents.userId, userId),
        gte(calendarEvents.startTime, eightWeeksAgo)
      )
    });

    // Generate Chart Data: Group into 4 weeks
    const chartData = [];
    for (let i = 3; i >= 0; i--) {
      const currentWeekStart = startOfWeek(subWeeks(new Date(), i));
      const currentWeekEnd = endOfWeek(currentWeekStart);
      
      const previousWeekStart = startOfWeek(subWeeks(new Date(), i + 4));
      const previousWeekEnd = endOfWeek(previousWeekStart);

      const currentCount = recentEvents.filter(e => e.startTime && isWithinInterval(new Date(e.startTime), { start: currentWeekStart, end: currentWeekEnd })).length;
      const previousCount = recentEvents.filter(e => e.startTime && isWithinInterval(new Date(e.startTime), { start: previousWeekStart, end: previousWeekEnd })).length;

      chartData.push({
        name: `Week ${4 - i}`,
        current: currentCount,
        previous: previousCount,
      });
    }

    // Fetch Priority Emails for the last 8 weeks for the Email Chart
    const recentImportantEmails = await db.query.emails.findMany({
      where: and(
        eq(emails.userId, userId),
        eq(emails.priority, "Important"),
        gte(emails.date, eightWeeksAgo)
      )
    });

    const emailChartData = [];
    for (let i = 3; i >= 0; i--) {
      const currentWeekStart = startOfWeek(subWeeks(new Date(), i));
      const currentWeekEnd = endOfWeek(currentWeekStart);
      
      const previousWeekStart = startOfWeek(subWeeks(new Date(), i + 4));
      const previousWeekEnd = endOfWeek(previousWeekStart);

      const currentCount = recentImportantEmails.filter(e => e.date && isWithinInterval(new Date(e.date), { start: currentWeekStart, end: currentWeekEnd })).length;
      const previousCount = recentImportantEmails.filter(e => e.date && isWithinInterval(new Date(e.date), { start: previousWeekStart, end: previousWeekEnd })).length;

      emailChartData.push({
        name: `Week ${4 - i}`,
        current: currentCount,
        previous: previousCount,
      });
    }

    // Total Meetings (All time)
    const totalMeetingsResult = await db.select({ count: sql<number>`count(*)` }).from(calendarEvents).where(eq(calendarEvents.userId, userId));
    const totalMeetings = totalMeetingsResult[0].count;

    // Time Saved calculation (fake metric: 2 mins per email triaged)
    const minutesSaved = totalEmails * 2;
    const hoursSaved = Math.floor(minutesSaved / 60);
    const timeSavedString = hoursSaved > 0 ? `${hoursSaved}h ${minutesSaved % 60}m` : `${minutesSaved}m`;

    // Generate AI Observation
    let aiObservation = "Unable to generate AI observation at this time.";
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an intelligent executive assistant analyzing a user's productivity. Provide a highly professional, concise observation (maximum 2-3 sentences). Highlight trends or give a brief insight."
          },
          {
            role: "user",
            content: `Metrics this week:\nTotal Emails Triaged: ${totalEmails}\nImportant Emails Actioned: ${actionItems.length}\nMeetings Scheduled: ${totalMeetings}\nTime Saved by AI: ${timeSavedString}. Provide a 2 sentence observation on their workload or progress.`
          }
        ],
        max_tokens: 100,
        temperature: 0.7,
      });
      aiObservation = completion.choices[0]?.message?.content || aiObservation;
    } catch (aiErr) {
      console.error("OpenAI Observation failed:", aiErr);
    }

    return NextResponse.json({
      success: true,
      metrics: {
        totalEmailsTriaged: totalEmails,
        timeSaved: timeSavedString,
        meetingsScheduled: totalMeetings,
      },
      actionItems: actionItems,
      upcomingMeetings: upcomingEvents,
      chartData: chartData,
      emailChartData: emailChartData,
      aiObservation: aiObservation,
    });

  } catch (error) {
    console.error("Command Center fetch error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
