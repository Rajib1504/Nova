import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { db } from "../../../../db";
import { corsairAccounts, corsairIntegrations } from "../../../../db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = session.user.id;
    const corsairTenantId = `user_${tenantId}`;

    const connectedAccounts = await db
      .select({
        integrationName: corsairIntegrations.name,
        updatedAt: corsairAccounts.updatedAt,
      })
      .from(corsairAccounts)
      .innerJoin(corsairIntegrations, eq(corsairAccounts.integrationId, corsairIntegrations.id))
      .where(eq(corsairAccounts.tenantId, corsairTenantId));

    const connections = {
      gmail: { isConnected: false, updatedAt: null as Date | null },
      googlecalendar: { isConnected: false, updatedAt: null as Date | null },
    };

    for (const account of connectedAccounts) {
      if (account.integrationName === "gmail" || account.integrationName === "googlecalendar") {
        connections[account.integrationName] = {
          isConnected: true,
          updatedAt: account.updatedAt,
        };
      }
    }

    return NextResponse.json(connections);

  } catch (error) {
    console.error("Connections fetch error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
