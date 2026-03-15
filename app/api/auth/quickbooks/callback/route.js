import { NextResponse } from "next/server";

// ── Upstash Redis helpers ──────────────────────────────────────
const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

async function redisSet(key, value) {
  try {
    await fetch(`${REDIS_URL}/set/${key}/${encodeURIComponent(value)}`, {
      headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
    });
  } catch {}
}

// ── QuickBooks OAuth2 Callback ─────────────────────────────────
// Intuit redirects here after user approves the connection.
// Exchanges the authorization code for access + refresh tokens,
// saves them to Redis, and redirects back to the settings page.
// ────────────────────────────────────────────────────────────────

export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const realmId = url.searchParams.get("realmId");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  // Handle user denial or errors
  if (error) {
    console.error("[QB OAuth] User denied or error:", error);
    return NextResponse.redirect(
      `${url.protocol}//${url.host}/settings?qb=error&reason=${encodeURIComponent(error)}`
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${url.protocol}//${url.host}/settings?qb=error&reason=no_code`
    );
  }

  const clientId = process.env.QB_CLIENT_ID;
  const clientSecret = process.env.QB_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      `${url.protocol}//${url.host}/settings?qb=error&reason=missing_credentials`
    );
  }

  // Build redirect URI (must match what was used in /authorize)
  const redirectUri = `${url.protocol}//${url.host}/api/auth/quickbooks/callback`;

  try {
    // Exchange authorization code for tokens
    const tokenRes = await fetch(
      "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
          Accept: "application/json",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
        }),
      }
    );

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error("[QB OAuth] Token exchange failed:", tokenRes.status, errText);
      return NextResponse.redirect(
        `${url.protocol}//${url.host}/settings?qb=error&reason=token_exchange_failed`
      );
    }

    const tokens = await tokenRes.json();
    const { access_token, refresh_token } = tokens;

    if (!access_token || !refresh_token) {
      console.error("[QB OAuth] Missing tokens in response:", JSON.stringify(tokens));
      return NextResponse.redirect(
        `${url.protocol}//${url.host}/settings?qb=error&reason=missing_tokens`
      );
    }

    // Save both tokens to Redis
    await Promise.all([
      redisSet("qb_access_token", access_token),
      redisSet("qb_refresh_token", refresh_token),
    ]);

    // Optionally update realmId if it changed
    if (realmId) {
      await redisSet("qb_realm_id", realmId);
    }

    console.log("[QB OAuth] Successfully connected! Tokens saved to Redis.");

    // Redirect back to settings with success
    return NextResponse.redirect(
      `${url.protocol}//${url.host}/settings?qb=connected`
    );
  } catch (err) {
    console.error("[QB OAuth] Callback error:", err.message);
    return NextResponse.redirect(
      `${url.protocol}//${url.host}/settings?qb=error&reason=${encodeURIComponent(err.message)}`
    );
  }
}
