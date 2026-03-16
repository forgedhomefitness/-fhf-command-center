import { NextResponse } from "next/server";

// Google Analytics 4 Data API
// Requires: GA4_PROPERTY_ID, GA4_CLIENT_EMAIL, GA4_PRIVATE_KEY in env vars
// These come from a Google Cloud service account with GA4 read access

const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID;
const GA4_CLIENT_EMAIL = process.env.GA4_CLIENT_EMAIL;
const GA4_PRIVATE_KEY = process.env.GA4_PRIVATE_KEY?.replace(/\\n/g, "\n");

async function getAccessToken() {
  const header = { alg: "RS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: GA4_CLIENT_EMAIL,
    scope: "https://www.googleapis.com/auth/analytics.readonly",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const { SignJWT, importPKCS8 } = await import("jose");
  const privateKey = await importPKCS8(GA4_PRIVATE_KEY, "RS256");
  const jwt = await new SignJWT(payload)
    .setProtectedHeader(header)
    .sign(privateKey);

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  const tokenData = await tokenRes.json();
  return tokenData.access_token;
}

async function runReport(accessToken, dateRanges) {
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY_ID}:runReport`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        dateRanges,
        metrics: [{ name: "sessions" }],
      }),
    }
  );
  return res.json();
}

function getDateStr(date) {
  return date.toISOString().split("T")[0];
}

function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function startOfQuarter(date) {
  const q = Math.floor(date.getMonth() / 3) * 3;
  return new Date(date.getFullYear(), q, 1);
}

export async function GET() {
  if (!GA4_PROPERTY_ID || !GA4_CLIENT_EMAIL || !GA4_PRIVATE_KEY) {
    return NextResponse.json({ connected: false });
  }

  try {
    const accessToken = await getAccessToken();
    const now = new Date();
    const today = getDateStr(now);
    const yearStart = `${now.getFullYear()}-01-01`;

    const weekStart = getDateStr(startOfWeek(now));
    const monthStart = getDateStr(startOfMonth(now));
    const quarterStart = getDateStr(startOfQuarter(now));

    const lastWeekEnd = new Date(startOfWeek(now));
    lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);
    const lastWeekStart = getDateStr(startOfWeek(lastWeekEnd));
    const lastWeekEndStr = getDateStr(lastWeekEnd);

    const lastMonthEnd = new Date(startOfMonth(now));
    lastMonthEnd.setDate(lastMonthEnd.getDate() - 1);
    const lastMonthStart = getDateStr(startOfMonth(lastMonthEnd));
    const lastMonthEndStr = getDateStr(lastMonthEnd);

    const lastQuarterEnd = new Date(startOfQuarter(now));
    lastQuarterEnd.setDate(lastQuarterEnd.getDate() - 1);
    const lastQuarterStart = getDateStr(startOfQuarter(lastQuarterEnd));
    const lastQuarterEndStr = getDateStr(lastQuarterEnd);

    const [todayReport, weekReport, monthReport, quarterReport, yearReport, lastWeekReport, lastMonthReport, lastQuarterReport] =
      await Promise.all([
        runReport(accessToken, [{ startDate: today, endDate: today }]),
        runReport(accessToken, [{ startDate: weekStart, endDate: today }]),
        runReport(accessToken, [{ startDate: monthStart, endDate: today }]),
        runReport(accessToken, [{ startDate: quarterStart, endDate: today }]),
        runReport(accessToken, [{ startDate: yearStart, endDate: today }]),
        runReport(accessToken, [{ startDate: lastWeekStart, endDate: lastWeekEndStr }]),
        runReport(accessToken, [{ startDate: lastMonthStart, endDate: lastMonthEndStr }]),
        runReport(accessToken, [{ startDate: lastQuarterStart, endDate: lastQuarterEndStr }]),
      ]);

    function extractCount(report) {
      return parseInt(report?.rows?.[0]?.metricValues?.[0]?.value || "0", 10);
    }

    return NextResponse.json({
      connected: true,
      today: extractCount(todayReport),
      week: extractCount(weekReport),
      month: extractCount(monthReport),
      quarter: extractCount(quarterReport),
      year: extractCount(yearReport),
      lastWeek: extractCount(lastWeekReport),
      lastMonth: extractCount(lastMonthReport),
      lastQuarter: extractCount(lastQuarterReport),
    });
  } catch (err) {
    console.error("GA4 API error:", err);
    return NextResponse.json({ connected: false, error: err.message });
  }
}
