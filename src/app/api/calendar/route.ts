import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { OpenAIAgentsProvider } from "@corsair-dev/mcp";
import { Agent, run, tool } from "@openai/agents";
import { corsair } from "../../../../corsair";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = session.user.id;
    // Force it to be a non-numeric string to bypass the Corsair SDK coercion bug
    const corsairTenantId = `user_${tenantId}`;
    console.log(`\n📅 Fetching Calendar Events for tenant: ${corsairTenantId}`);

    const provider = new OpenAIAgentsProvider();
    const tools = provider.build({ corsair, tool, tenantId: corsairTenantId });

    // Ensure we only pass Google Calendar tools to save token context
    const calendarTools = tools.filter((t: any) => t.name.startsWith("googlecalendar"));

    const agent = new Agent({
      name: 'calendar-fetcher',
      model: 'gpt-4o-mini',
      instructions: `You are an internal API assistant. Your job is to fetch the user's upcoming calendar events for the next 7 days using the Google Calendar tool. 
      You MUST respond ONLY with a raw, valid JSON array. Do NOT wrap it in markdown code blocks.
      The JSON array should contain objects with these exact keys:
      - id (string)
      - title (string)
      - time (string, formatted nicely like '2:00 PM - 3:00 PM' or 'Tomorrow at 10 AM')
      - attendees (string, e.g. '3 attendees' or 'Just you')
      - type (string, strictly one of: 'video', 'in-person', 'call', 'other')
      
      If there are no events, return an empty array [].`,
      tools: calendarTools,
    });

    const result = await run(agent, "Fetch my upcoming events for the next 7 days and return the raw JSON array.");

    console.log("=== RAW AGENT RESPONSE ===");
    console.log(result.finalOutput);
    console.log("==========================");

    // Try to parse the JSON, handling any potential markdown formatting the LLM might have hallucinated
    let parsedEvents = [];
    try {
      const cleanJson = result?.finalOutput.replace(/```json/g, "").replace(/```/g, "").trim();
      parsedEvents = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error("Failed to parse Agent output as JSON:", parseError);
      // Fallback empty array if the LLM output was malformed
      parsedEvents = [];
    }

    return NextResponse.json({ events: parsedEvents });

  } catch (error) {
    console.error("Calendar fetch error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
