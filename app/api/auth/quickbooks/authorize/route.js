import { NextResponse } from "next/server";

// ── QuickBooks OAuth2 Authorization Redirect ───────────────────
// Redirects user to Intuit's OAuth consent page.
// After user approves, Intuit redirects back to /api/auth/quickbooks/callback
// ────────────────────────────────────────────────────────────────

export async function GET(request) {
  const clientId = process.env.QB_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: "QB_CLIENT_ID not configured" },
      { status: 503 }
    );
  }

  // Build the redirect URI from the request URL
  const url = new URL(request.url);
  const redirectUri = `${url.protocol}//${url.host}/api/auth/quickbooks/callback`;

  // Intuit OAuth2 authorization URL
  const authUrl = new URL(
    "https://appcenter.intuit.com/connect/oauth2"
  );
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "com.intuit.quickbooks.accounting");
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("state", "fhf-reconnect");

  return NextResponse.redirect(authUrl.toString());
}
