import { NextResponse } from "next/server";

// Consolidated Cron Dispatcher - replaces 9 separate EST/EDT crons with 1
// Vercel cron fires this ONCE daily at 10:30 UTC (6:30 AM EDT / 5:30 AM EST)
// Dispatches to appropriate routes based on current Eastern Time day/date

const CRON_SECRET = process.env.CRON_SECRET;

function getEasternDateTime() {
  const now = new Date();
  const easternString = now.toLocaleString("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const [datePart, timePart] = easternString.split(", ");
  const [month, day, year] = datePart.split("/");
  const [hour, minute, second] = timePart.split(":");
  return {
    year: parseInt(year),
    month: parseInt(month),
    day: parseInt(day),
    dayOfWeek: new Date(year + "-" + month + "-" + day).getDay(),
    hour: parseInt(hour),
    minute: parseInt(minute),
  };
}

async function callInternalRoute(pathname, queryParams = {}) {
  const origin = process.env.VERCEL_URL
    ? "https://" + process.env.VERCEL_URL
    : "http://localhost:3000";
  const url = new URL(pathname, origin);
  Object.entries(queryParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, value);
    }
  });
  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: "Bearer " + CRON_SECRET,
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    return { success: response.ok, status: response.status, pathname, data };
  } catch (err) {
    return { success: false, status: null, pathname, error: err.message };
  }
}

export async function GET(request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== "Bearer " + CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const eastern = getEasternDateTime();
  const pad = (n) => String(n).padStart(2, "0");
  const dateString = eastern.year + "-" + pad(eastern.month) + "-" + pad(eastern.day);
  const dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const dayName = dayNames[eastern.dayOfWeek];

  console.log("[Cron Dispatcher] " + dateString + " " + dayName + " " + pad(eastern.hour) + ":" + pad(eastern.minute) + " ET");

  const results = [];

  // EVERY DAY: QuickBooks token keepalive.
  //
  // This is the ONLY reason this dispatcher exists now, and it is not
  // optional. Intuit expires a refresh token that goes ~100 days unused. This
  // route lost its cron slot on 2026-06-06 when vercel.json was created with
  // two other crons (Hobby allows two). Exactly 100 days later the QuickBooks
  // token died with invalid_grant and the dashboard went dark on QBO. If you
  // take this cron away again, that WILL happen again.
  results.push(await callInternalRoute("/api/quickbooks/keepalive"));

  // The newsletter dispatches that used to live here were removed 2026-09-15.
  // The Tuesday one called /api/newsletter?mode=send, which BCCs the route's
  // hardcoded CLIENT_EMAILS - a list that has drifted out of sync with the
  // list Matt actually sends to. Matt composes and sends the weekly himself.
  // Do not re-add an automatic client send here without reconciling that list.

  return NextResponse.json({
    success: true,
    dispatcher: "consolidated-cron",
    firedAt: dateString,
    dayOfWeek: dayName,
    easternTime: pad(eastern.hour) + ":" + pad(eastern.minute) + " ET",
    tasksExecuted: results.length,
    results,
  });
}
