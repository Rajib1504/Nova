import { NextRequest, NextResponse } from "next/server";
import { corsair } from "../../../../corsair";
import { processWebhook } from "corsair"
export async function POST(request: NextRequest) {
  const url = new URL(request.url)
  const header: Record<string, string> = {}
  request.headers.forEach((value, key) => {
    header[key] = value
  })

  const contenttype = request.headers.get("content-type")
  let body: string | Record<string, unknown>


  if (contenttype?.includes("application/json")) {
    body = await request.json();
  } else {
    const text = await request.text();
    body = text && text.trim() ? text : {};
  }

  const tenantId = "radhanath"
  // url.searchParams.get("tenantId") ||
  // url.searchParams.get("tenant_id") ||
  // undefined;

  const result = await processWebhook(corsair, header, body, { tenantId });

  console.info("Plugin Processed:", result.plugin, result.action);

  const responseHeaders = result.responseHeaders;
  const nextHeaders = new Headers();
  if (responseHeaders) {
    for (const [key, value] of Object.entries(responseHeaders)) {
      nextHeaders.set(key, value as string);
    }
  }

  if (!result.response) {
    return NextResponse.json(
      { success: false, message: "No matching webhook handler found" },
      { status: 404 }
    );
  }

  return NextResponse.json(result.response, { headers: nextHeaders });
}

export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      message: "Nova Webhook endpoint is running...",
      timestamp: new Date().toISOString()
    }, { status: 200 })

}