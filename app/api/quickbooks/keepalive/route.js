import { NextResponse } from "next/server";

// ââ Upstash Redis helpers ââââââââââââââââââââââââââââââââââââââ
const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

async function redisGet(key) {
  try {
    const res = await fetch(`${REDIS_URL}/get/${key}`, {
      headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
    });
    const data = await res.json();
    return data.result;
  } catch {
    return null;
  }
}

async function redisSet(key, value) {
  try {
    await fetch(`${REDIS_URL}/set/${key}/${encodeURIComponent(value)}`, {
      headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
    });
  } catch {}
}

// ââ Token management âââââââââââââââââââââââââââââââââââââââââââ
async function getAccessToken() {
  const token = await redisGet("qb_access_token");
  return token || process.env.QB_ACCESS_TOKEN;
}

async function getRefreshToken() {
  const token = await redisGet("qb_refresh_token");
  return token || process.env.QB_REFRESH_TOKEN;
}

async function refreshTokens() {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token available");

  const clientId = process.env.QB_CLIENT_ID;
  const clientSecret = process.env.QB_CLIENT_SECRET;
  if (!clientId || !clientSecret)
    throw new Error("Missing QB_CLIENT_ID or QB_CLIENT_SECRET");

  const res = await fetch(
    "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token refresh failed: ${res.status} ${err}`);
  }

  const tokens = await res.json();
  await Promise.all([
    redisSet("qb_access_token", tokens.access_token),
    redisSet("qb_refresh_token", tokens.refresh_token),
  ]);
  return tokens.access_token;
}

// ââ Keepalive route ââââââââââââââââââââââââââââââââââââââââââââ
// This route runs daily via Vercel Cron to keep QB OAuth tokens
// alive. Intuit revokes refresh tokens after 100 days of non-use.
// By refreshing daily, we ensure tokens never expire.
//
// Cron schedule: Every day at 6:00 AM ET (see vercel.json)
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

export async function GET(request) {
  const realmId = process.env.QB_REALM_ID;
  if (!realmId) {
    return NextResponse.json(
      { error: "QB_REALM_ID not configured", keepalive: false },
      { status: 503 }
    );
  }

  try {
    // Step 1: Force a token refresh to get new access + refresh tokens
    console.log("[QB Keepalive] Starting daily token refresh...");
    const newAccessToken = await refreshTokens();
    console.log("[QB Keepalive] Token refresh successful.");

    // Step 2: Make a lightweight API call to verify the tokens work
    const companyUrl = `https://quickbooks.api.intuit.com/v3/company/${realmId}/companyinfo/${realmId}?minorversion=65`;
    const verifyRes = await fetch(companyUrl, {
      headers: {
        Authorization: `Bearer ${newAccessToken}`,
        Accept: "application/json",
      },
    });

    if (!verifyRes.ok) {
      const errText = await verifyRes.text();
      throw new Error(
        `QB API verification failed: ${verifyRes.status} ${errText}`
      );
    }

    const companyData = await verifyRes.json();
    const companyName =
      companyData?.CompanyInfo?.CompanyName || "Unknown";

    console.log(
      `[QB Keepalive] Verified â connected to "${companyName}". Tokens are fresh.`
    );

    return NextResponse.json({
      keepalive: true,
      message: "QuickBooks tokens refreshed and verified",
      company: companyName,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[QB Keepalive] FAILED:", err.message);
    return NextResponse.json(
      {
        keepalive: false,
        error: err.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
