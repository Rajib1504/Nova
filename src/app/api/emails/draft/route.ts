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

    const { to, subject, body, threadId } = await req.json();
    if (!to || !body) {
      return NextResponse.json({ error: "Missing 'to' or 'body'" }, { status: 400 });
    }

    const c = corsair.withTenant(`user_${session.user.id}`);
    const rawMessage = [
      `To: ${to}`,
      `Subject: ${subject || "No Subject"}`,
      "Content-Type: text/plain; charset=utf-8",
      "MIME-Version: 1.0",
      "",
      body,
    ].join("\n");
    const encodedMessage = Buffer.from(rawMessage)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const res = await (c as any).gmail.api.users.drafts.create({
      userId: "me",
      requestBody: {
        message: {
          raw: encodedMessage,
          ...(threadId ? { threadId } : {}),
        },
      },
    });

    return NextResponse.json({ success: true, draftId: res.data.id });
  } catch (error) {
    console.error("Failed to save email draft:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
