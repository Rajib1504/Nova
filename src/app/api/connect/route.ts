import { generateOAuthUrl } from "corsair/oauth";
import { NextRequest, NextResponse } from "next/server";
import { corsair } from "../../../../corsair";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

const REDIRECT_URI = `${process.env.APP_URL}/api/auth/corsair/callback`;

export async function GET(request: NextRequest) {
  // 1. Get the securely authenticated user
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenantId = String(session.user.id); // Real dynamic user ID!
  // Force it to be a non-numeric string to bypass the Corsair SDK coercion bug
  const corsairTenantId = `user_${tenantId}`;

  const plugin = new URL(request.url).searchParams.get("plugin");

  if (!plugin) {
    return NextResponse.json({ error: "Missing plugin parameter" }, { status: 400 });
  }

  // 2. Tell Corsair to start the connection for this specific user
  const scopedCorsair = corsair.withTenant(corsairTenantId);
  const { url, state } = await generateOAuthUrl(scopedCorsair, plugin, {
    tenantId: corsairTenantId,
    redirectUri: REDIRECT_URI,
  });

  const response = NextResponse.redirect(url);
  response.cookies.set("oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 10,
  });

  return response;
}