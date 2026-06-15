import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { corsair } from "../../../../../corsair";
import { db } from "../../../../db";
import { emails } from "../../../../db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { threadId, action } = await req.json();
    if (!threadId || !action) {
      return NextResponse.json({ error: "Missing threadId or action" }, { status: 400 });
    }

    const tenantId = session.user.id;
    const corsairTenantId = `user_${tenantId}`;
    
    const c = corsair.withTenant(corsairTenantId);

    let addLabelIds: string[] = [];
    let removeLabelIds: string[] = [];

    switch (action) {
      case "archive":
        removeLabelIds = ["INBOX"];
        break;
      case "trash":
        addLabelIds = ["TRASH"];
        removeLabelIds = ["INBOX"];
        break;
      case "unread":
        addLabelIds = ["UNREAD"];
        break;
      case "read":
        removeLabelIds = ["UNREAD"];
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Call Google API to modify the thread via Corsair SDK
    await (c as any).gmail.api.threads.modify({
      userId: "me",
      id: threadId,
      addLabelIds,
      removeLabelIds,
    });

    // Update local database to reflect changes immediately
    const threadEmails = await db.select().from(emails).where(eq(emails.threadId, threadId));
    
    for (const email of threadEmails) {
      let currentLabels = (email.labels as string[]) || [];
      
      // Add labels
      for (const label of addLabelIds) {
        if (!currentLabels.includes(label)) {
          currentLabels.push(label);
        }
      }
      
      // Remove labels
      currentLabels = currentLabels.filter((l) => !removeLabelIds.includes(l));

      await db.update(emails)
        .set({ labels: currentLabels, isRead: !currentLabels.includes("UNREAD") })
        .where(eq(emails.id, email.id));
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Modify Email Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
