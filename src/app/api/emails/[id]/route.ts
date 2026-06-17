import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { db } from "../../../../db";
import { emails } from "../../../../db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = session.user.id;
    const { id: emailId } = await params;

    // Fetch the specific email, this time INCLUDING the body
    const email = await db.query.emails.findFirst({
      where: and(eq(emails.userId, tenantId), eq(emails.id, emailId)),
      columns: {
        id: true,
        threadId: true,
        subject: true,
        fromAddress: true,
        toAddress: true,
        snippet: true,
        body: true, // WE WANT THE BODY HERE
        date: true,
        isRead: true,
        labels: true,
        priority: true,
        // CRITICAL: We STILL omit 'embedding' because the UI never needs the raw vector
      }
    });

    if (!email) {
      return NextResponse.json({ error: "Email not found" }, { status: 404 });
    }

    return NextResponse.json({ email });

  } catch (error) {
    console.error("Single email fetch error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
