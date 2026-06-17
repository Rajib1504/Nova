import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { corsair } from "../../../../../corsair";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { to, subject, body } = await req.json();
    if (!to || !body) {
      return NextResponse.json({ error: "Missing 'to' or 'body'" }, { status: 400 });
    }

    const tenantId = session.user.id;
    const corsairTenantId = `user_${tenantId}`;

    // Setup Corsair proxy
    const c = corsair.withTenant(corsairTenantId);

    // Format email correctly in RFC 2822 standard
    const rawMessage = [
      `To: ${to}`,
      `Subject: ${subject || "No Subject"}`,
      "Content-Type: text/plain; charset=utf-8",
      "MIME-Version: 1.0",
      "",
      body
    ].join('\n');

    // Encode to base64url format as required by Gmail API
    const encodedMessage = Buffer.from(rawMessage)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Send the email directly using the user's connected account
    const res = await (c as any).gmail.api.messages.send({
      userId: 'me',
      raw: encodedMessage,
    });

    return NextResponse.json({ success: true, messageId: res.data.id });

  } catch (error) {
    console.error("Failed to send email:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
