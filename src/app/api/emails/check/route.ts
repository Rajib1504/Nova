import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { db } from "../../../../db";
import { emails } from "../../../../db/schema";
import { eq, count } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = session.user.id;

    // Extremely lightweight query: just counts the rows, no data transfer
    const result = await db
      .select({ value: count() })
      .from(emails)
      .where(eq(emails.userId, tenantId));

    const totalEmails = result[0]?.value || 0;

    return NextResponse.json({ count: totalEmails });

  } catch (error) {
    console.error("Emails check error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
