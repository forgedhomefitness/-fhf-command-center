import { NextResponse } from "next/server";

// ââ Upstash Redis helpers ââââââââââââââââââââââââââââââââââââââ
const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

async function redisGet(key) {
  if (!REDIS_URL || !REDIS_TOKEN) return null;
  try {
    const res = await fetch(`${REDIS_URL}/get/${key}`, {
      headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
    });
    if (!res.ok) {
      console.error(`[Redis GET] Failed: ${res.status}`);
      return null;
    }
    const data = await res.json();
    return data.result;
  } catch (err) {
    console.error(`[Redis GET] Error: ${err.message}`);
    return null;
  }
}

async function redisSet(key, value) {
  if (!REDIS_URL || !REDIS_TOKEN) {
    throw new Error("Redis not configured â cannot save token");
  }
  // Use POST body format (reliable for long values like tokens)
  const res = await fetch(`${REDIS_URL}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${REDIS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(["SET", key, value]),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Redis SET failed: ${res.status} ${errText}`);
  }
  // Verify the write actually stuck
  const verify = await redisGet(key);
  if (!verify) {
    throw new Error(`Redis SET verification failed â wrote key "${key}" but read back null`);
  }
  return true;
}

async function redisDel(key) {
  if (!REDIS_URL || !REDIS_TOKEN) return;
  try {
    await fetch(`${REDIS_URL}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${REDIS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(["DEL", key]),
    });
    console.log(`[Redis DEL] Deleted stale key: ${key}`);
  } catch (err) {
    console.error(`[Redis DEL] Error: ${err.message}`);
  }
}

// ââ Token management âââââââââââââââââââââââââââââââââââââââââââ
async function attemptRefresh(refreshToken, source) {
  const clientId = process.env.QB_CLIENT_ID;
  const clientSecret = process.env.QB_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("Missing QB_CLIENT_ID or QB_CLIENT_SECRET");
  }

  console.log(`[QB] Attempting token refresh (source: ${source})...`);

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

  return await res.json();
}

async function refreshTokens() {
  // Step 1: Try Redis token first
  const redisToken = await redisGet("qb_refresh_token");
  if (redisToken) {
    try {
      const tokens = await attemptRefresh(redisToken, "redis");
      console.log("[QB] Redis token worked. Saving new tokens...");
      await redisSet("qb_access_token", tokens.access_token);
      await redisSet("qb_refresh_token", tokens.refresh_token);
      console.log("[QB] New tokens saved and verified in Redis.");
      return tokens.access_token;
    } catch (err) {
      // If invalid_grant, the Redis token is stale â fall through to env var
      if (err.message.includes("invalid_grant")) {
        console.warn("[QB] Redis token is STALE (invalid_grant). Clearing and falling back to env var...");
        await redisDel("qb_refresh_token");
        await redisDel("qb_access_token");
      } else {
        throw err; // Non-grant errors should still fail loudly
      }
    }
  }

  // Step 2: Fall back to env var
  const envToken = process.env.QB_REFRESH_TOKEN;
  if (!envToken) {
    throw new Error("No refresh token available â Redis was stale/empty and QB_REFRESH_TOKEN env var is not set");
  }

  console.log("[QB] Using refresh token from env var (fallback)...");
  const tokens = await attemptRefresh(envToken, "env");
  console.log("[QB] Env var token worked! Saving new tokens to Redis...");
  await redisSet("qb_access_token", tokens.access_token);
  await redisSet("qb_refresh_token", tokens.refresh_token);
  console.log("[QB] New tokens saved and verified in Redis. Self-healed.");
  return tokens.access_token;
}

// ââ Keepalive route ââââââââââââââââââââââââââââââââââââââââââââ
// Runs daily via Vercel Cron to keep QB OAuth tokens alive.
// Intuit revokes refresh tokens after 100 days of non-use.
// By refreshing daily, we ensure tokens never expire.
//
// SELF-HEALING: If Redis has a stale token (invalid_grant),
// automatically falls back to env var, refreshes, and saves
// the new tokens back to Redis. No manual intervention needed.
//
// FAILS LOUDLY: If both Redis and env var fail, returns 500.
// ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
export async function GET(request) {
  const realmId = process.env.QB_REALM_ID;
  if (!realmId) {
    return NextResponse.json(
      { error: "QB_REALM_ID not configured", keepalive: false },
      { status: 503 }
    );
  }

  try {
    console.log("[QB Keepalive] Starting daily token refresh...");
    const newAccessToken = await refreshTokens();
    console.log("[QB Keepalive] Token refresh + Redis save successful.");

    // Verify tokens work with a lightweight API call
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
      message: "QuickBooks tokens refreshed, saved to Redis, and verified",
      company: companyName,
      tokenSource: "redis",
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
