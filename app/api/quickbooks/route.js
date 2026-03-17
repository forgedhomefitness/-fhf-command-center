import { NextResponse } from "next/server";

// ── Upstash Redis helpers (REST API, no SDK needed) ──────────────
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
  } catch {
    // silent fail
  }
}

// ── Token management ─────────────────────────────────────────────
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

// ── QuickBooks API call ────────────────────────────────────────── 
async function callQBApi(url, accessToken) {
  return fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });
}

// ── Main route ─────────────────────────────────────────────────── 
export async function GET() {
  const realmId = process.env.QB_REALM_ID;
  if (!realmId) {
    return NextResponse.json(
      { error: "QuickBooks credentials not configured", connected: false },
      { status: 503 }
    );
  }

  try {
    const now = new Date();
    // YTD: start from January 1 of current year
    const startDate = `${now.getFullYear()}-01-01`;
    const endDate = now.toISOString().split("T")[0];

    const url = `https://quickbooks.api.intuit.com/v3/company/${realmId}/reports/ProfitAndLoss?start_date=${startDate}&end_date=${endDate}&minorversion=65`;

    let accessToken = await getAccessToken();
    let res = await callQBApi(url, accessToken);

    // Auto-refresh on 401
    if (res.status === 401) {
      console.log("QB token expired, auto-refreshing...");
      accessToken = await refreshTokens();
      res = await callQBApi(url, accessToken);
    }

    if (!res.ok) {
      const status = res.status;
      const text = await res.text();
      console.error("QuickBooks API error:", status, text);
      return NextResponse.json(
        { error: `QuickBooks API error: ${status}`, connected: false },
        { status }
      );
    }

    const data = await res.json();
    const rows = data?.Rows?.Row || [];
    let totalIncome = 0;
    let totalExpenses = 0;

    for (const row of rows) {
      if (row.Summary) {
        const cols = row.Summary.ColData || [];
        if (row.group === "Income" && cols[1]) {
          totalIncome = parseFloat(cols[1].value) || 0;
        }
        if (row.group === "Expenses" && cols[1]) {
          totalExpenses = parseFloat(cols[1].value) || 0;
        }
      }
    }

    return NextResponse.json({
      connected: true,
      totalIncome,
      totalExpenses,
      netIncome: totalIncome - totalExpenses,
      period: `${startDate} to ${endDate}`,
    });
  } catch (err) {
    console.error("QuickBooks route error:", err.message);
    return NextResponse.json(
      { error: err.message, connected: false },
      { status: 500 }
    );
  }
}
