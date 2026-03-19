import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

async function redisGet(key) {
  try {
    const res = await fetch(`${REDIS_URL}/get/${key}`, {
      headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
    });
    const data = await res.json();
    return data.result ? JSON.parse(data.result) : null;
  } catch {
    return null;
  }
}

async function redisSet(key, value) {
  try {
    const jsonValue = JSON.stringify(value);
    const res = await fetch(`${REDIS_URL}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${REDIS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(["SET", key, jsonValue]),
    });
    const result = await res.json();
    if (result.error) console.error("Redis SET error:", result.error);
    return result;
  } catch (err) {
    console.error("Redis set error:", err);
    return null;
  }
}

async function verifyAuth(request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) return true;
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

const IRS_MILEAGE_RATE = 0.725;

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
    return NextResponse.json({ connected: true, irsRate: IRS_MILEAGE_RATE, ...mileageData });
  } catch (err) {
    console.error("Mileage route error:", err.message);
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
    const allTrips = body.trips.map((t) => ({ ...t, date: new Date(t.date) }));
    const weekTrips = allTrips.filter((t) => t.date >= weekStart && t.date <= weekEnd);
    const monthTrips = allTrips.filter((t) => t.date >= monthStart && t.date <= monthEnd);
    const ytdTrips = allTrips.filter((t) => t.date >= ytdStart);
    const sumMiles = (trips) => Math.round(trips.reduce((s, t) => s + (t.miles || 0), 0) * 100) / 100;
    const weekMiles = sumMiles(weekTrips);
    const monthMiles = sumMiles(monthTrips);
    const ytdMiles = sumMiles(ytdTrips);
    const fmt = (d) => `${d.getMonth()+1}/${d.getDate()}/${d.getFullYear()}`;
    const mileageData = {
      lastUpdated: now.toISOString(),
      week: { trips: weekTrips.length, miles: weekMiles, deduction: Math.round(weekMiles * IRS_MILEAGE_RATE * 100) / 100, dateRange: `${fmt(weekStart)} - ${fmt(weekEnd)}` },
      month: { trips: monthTrips.length, miles: monthMiles, deduction: Math.round(monthMiles * IRS_MILEAGE_RATE * 100) / 100, dateRange: `${fmt(monthStart)} - ${fmt(monthEnd)}` },
      ytd: { trips: ytdTrips.length, miles: ytdMiles, deduction: Math.round(ytdMiles * IRS_MILEAGE_RATE * 100) / 100, dateRange: `${fmt(ytdStart)} - ${fmt(now)}` },
      trips: body.trips,
    };
    const redisResult = await redisSet("fhf_mileage_data", mileageData);
    return NextResponse.json({
      success: true,
      redisResult,
      summary: { week: mileageData.week, month: mileageData.month, ytd: mileageData.ytd },
    });
  } catch (err) {
    console.error("Mileage POST error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
