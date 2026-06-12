import { NextResponse } from "next/server";
import { processAndStoreEmail } from "@/lib/triage";

export async function GET() {
  console.log("⚡ Dev Trigger: Fetching latest email for AI Triage...");

  const tenantId = "radhanath";

  // In full production, we use googleapis here with the decrypted Corsair OAuth token.
  // For safety and to prevent crashes if the token is heavily encrypted by CORSAIR_KEK, 
  // we simulate the Google API payload extraction here so you can test the OpenAI pipeline endlessly.
  
  const mockFetchedMessage = {
    id: `msg-${Date.now()}`,
    from: "ycombinator-partners@ycombinator.com",
    subject: "Hackathon Interview Request",
    body: "Hi Rajib, we loved your Superhuman clone using Corsair. Can we schedule an interview for tomorrow? Please let us know what time works best for you.",
  };

  try {
    // Run the AI Triage
    await processAndStoreEmail(
      tenantId,
      mockFetchedMessage.id,
      mockFetchedMessage.from,
      tenantId, // sent to
      mockFetchedMessage.subject,
      mockFetchedMessage.body
    );

    return NextResponse.json({
      success: true,
      message: "Fetched latest email and successfully ran AI triage!",
      email: mockFetchedMessage
    }, { status: 200 });

  } catch (error) {
    console.error("Error running dev trigger:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
