import { processOAuthCallback } from "corsair/oauth";
import type { NextRequest } from "next/server";
import { NextResponse, after } from "next/server";
import { corsair } from "../../../../../../corsair";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../[...nextauth]/route";

const REDIRECT_URI = `${process.env.APP_URL}/api/auth/corsair/callback`;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code || !state) {
    const response = new NextResponse("Missing code or state.", { status: 400 });
    response.cookies.delete("oauth_state");
    return response;
  }

  const storedState = request.cookies.get("oauth_state")?.value;
  if (!storedState || storedState !== state) {
    const response = new NextResponse("Invalid state.", { status: 400 });
    response.cookies.delete("oauth_state");
    return response;
  }

  try {
    console.log("Processing Callback. State provided:", state);
    const result = await processOAuthCallback(corsair, { code, state, redirectUri: REDIRECT_URI });
    
    // Auto-sync if Gmail connected
    if (result.plugin === "gmail") {
      const session = await getServerSession(authOptions);
      if (session?.user?.id) {
        const tenantId = session.user.id;
        const cookieHeader = request.headers.get("cookie");
        // Trigger the background sync without blocking
        after(async () => {
          try {
            console.log(`[Callback] Triggering initial Gmail sync for ${tenantId}`);
            await fetch(`${process.env.APP_URL}/api/emails/sync`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(cookieHeader ? { "Cookie": cookieHeader } : {})
              },
              body: JSON.stringify({ offset: 0 })
            });
          } catch (err) {
            console.error("Failed to trigger initial sync:", err);
          }
        });
      }
    }

    const response = NextResponse.redirect(new URL("/dashboard?connected=" + result.plugin, process.env.APP_URL));
    response.cookies.delete("oauth_state");
    return response;
  } catch (e) {
    console.error("OAuth callback error:", e);
    const response = new NextResponse("OAuth failed.", { status: 500 });
    response.cookies.delete("oauth_state");
    return response;
  }
}