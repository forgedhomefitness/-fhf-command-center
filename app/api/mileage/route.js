import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const REDIS_URL = (process.env.UPSTASH_REDIS_REST_URL || "").replace(/["']/g, "").replace(/\/$/, "");
const REDIS_TOKEN = (process.env.UPSTASH_REDIS_REST_TOKEN || "").replace(/["']/g, "");

async function redisGet(key) {
  try {
    const res = await fetch(REDIS_URL + "/get/" + key, {
      headers: { Authorization: "Bearer " + REDIS_TOKEN },
    });
    const data = await res.json();
    return data.result ? JSON.parse(data.result) : null;
  } catch {
    return null;
  }
}

async function redisSet(key, value) {
  const jsonValue = JSON.stringify(value);
  const url = REDIS_URL + "/set/" + key + "/" + encodeURIComponent(jsonValue);
  const res = await fetch(url, {
    headers: { Authorization: "Bearer " + REDIS_TOKEN },
  });
  const result = await res.json();
  return result;
}

async function verifyAuth(request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader === "Bearer " + cronSecret) return true;
  const token = request.cookies.get("fhf-auth")?.value;
  if (token && process.env.AUTH_SECRET) {
    try {
      const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
      await jwtVerify(token, secret);
      return true;
    } catch { return false; }
  }
  if (!cronSecret && !process.env.AUTH_SECRET) return true;
  return false;
}

// IRS standard mileage SPLITS MID-YEAR in 2026: $0.725 Jan 1 - Jun 30,
// $0.76 Jul 1 - Dec 31. A single rate for the whole year under-claims H2 by 4.8%.
const IRS_MILEAGE_RATE_H1 = 0.725;
const IRS_MILEAGE_RATE_H2 = 0.76;
function irsMileageRate(d = new Date()) {
  return new Date(d) >= new Date("2026-07-01T00:00:00") ? IRS_MILEAGE_RATE_H2 : IRS_MILEAGE_RATE_H1;
}
const IRS_MILEAGE_RATE = irsMileageRate();

// Stored mileage is a snapshot written by the weekly audit. If nothing has
// written to it for a while, it is NOT "this week" - it is a stale snapshot,
// and presenting it as current is how an April figure gets read as today's.
const STALE_AFTER_DAYS = 10;
function stalenessOf(lastUpdated) {
  if (!lastUpdated) return { stale: true, ageDays: null, warning: "No mileage snapshot has ever been written." };
  const ageDays = Math.floor((Date.now() - new Date(lastUpdated).getTime()) / 86400000);
  if (ageDays <= STALE_AFTER_DAYS) return { stale: false, ageDays };
  return {
    stale: true,
    ageDays,
    warning: `STALE: this mileage snapshot is ${ageDays} days old (last written ${String(lastUpdated).slice(0,10)}). The week/month/ytd figures below describe that date, NOT today. Do not read them as current and do not file them.`,
  };
}

export async function GET() {
  try {
    const mileageData = await redisGet("fhf_mileage_data");
    if (!mileageData) {
      return NextResponse.json({
        connected: true, irsRate: IRS_MILEAGE_RATE, lastUpdated: null,
        week: { trips: 0, miles: 0, deduction: 0, dateRange: "" },
        month: { trips: 0, miles: 0, deduction: 0, dateRange: "" },
        ytd: { trips: 0, miles: 0, deduction: 0, dateRange: "" },
        trips: [],
        note: "No mileage data yet. Data updates every Saturday during the weekly audit.",
      });
    }
    const freshness = stalenessOf(mileageData.lastUpdated);
    return NextResponse.json({ connected: true, irsRate: IRS_MILEAGE_RATE, ...freshness, ...mileageData });
  } catch (err) {
    return NextResponse.json({ error: err.message, connected: false }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authorized = await verifyAuth(request);
    if (!authorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await request.json();
    if (!body.trips || !Array.isArray(body.trips)) {
      return NextResponse.json({ error: "Missing or invalid trips array" }, { status: 400 });
    }
    const now = new Date();
    const currentYear = now.getFullYear();
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() + mondayOffset);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    const monthStart = new Date(currentYear, now.getMonth(), 1);
    const monthEnd = new Date(currentYear, now.getMonth() + 1, 0);
    const ytdStart = new Date(currentYear, 0, 1);
    const allTrips = body.trips.map(function(t) { return Object.assign({}, t, { date: new Date(t.date) }); });
    const weekTrips = allTrips.filter(function(t) { return t.date >= weekStart && t.date <= weekEnd; });
    const monthTrips = allTrips.filter(function(t) { return t.date >= monthStart && t.date <= monthEnd; });
    const ytdTrips = allTrips.filter(function(t) { return t.date >= ytdStart; });
    var sumMiles = function(trips) { return Math.round(trips.reduce(function(s, t) { return s + (t.miles || 0); }, 0) * 100) / 100; };
    const weekMiles = sumMiles(weekTrips);
    const monthMiles = sumMiles(monthTrips);
    const ytdMiles = sumMiles(ytdTrips);
    var fmt = function(d) { return (d.getMonth()+1) + "/" + d.getDate() + "/" + d.getFullYear(); };
    const mileageData = {
      lastUpdated: now.toISOString(),
      week: { trips: weekTrips.length, miles: weekMiles, deduction: Math.round(weekMiles * IRS_MILEAGE_RATE * 100) / 100, dateRange: fmt(weekStart) + " - " + fmt(weekEnd) },
      month: { trips: monthTrips.length, miles: monthMiles, deduction: Math.round(monthMiles * IRS_MILEAGE_RATE * 100) / 100, dateRange: fmt(monthStart) + " - " + fmt(monthEnd) },
      ytd: { trips: ytdTrips.length, miles: ytdMiles, deduction: Math.round(ytdMiles * IRS_MILEAGE_RATE * 100) / 100, dateRange: fmt(ytdStart) + " - " + fmt(now) },
      trips: body.trips,
    };
    const redisResult = await redisSet("fhf_mileage_data", mileageData);
    return NextResponse.json({
      success: true, redisResult: redisResult,
      summary: { week: mileageData.week, month: mileageData.month, ytd: mileageData.ytd },
    });
  } catch (err) {
    return NextResponse.json({ error: err.message, stack: err.stack }, { status: 500 });
  }
}
