import { NextResponse } from "next/server";

const ACUITY_BASE = "https://acuityscheduling.com/api/v1";

async function acuityGet(endpoint) {
  const credentials = Buffer.from(
    `${process.env.ACUITY_USER_ID}:${process.env.ACUITY_API_KEY}`
  ).toString("base64");

  const res = await fetch(`${ACUITY_BASE}${endpoint}`, {
    headers: { Authorization: `Basic ${credentials}` },
  });
  if (!res.ok) {
    throw new Error(`Acuity API error: ${res.status}`);
  }
  return res.json();
}

export async function GET() {
  if (!process.env.ACUITY_USER_ID || !process.env.ACUITY_API_KEY) {
    return NextResponse.json(
      { error: "Acuity credentials not configured", connected: false },
      { status: 503 }
    );
  }

  try {
    // Calculate week boundaries (Monday–Sunday)
    const now = new Date();
    const day = now.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const weekStart = monday.toISOString().split("T")[0];
    const weekEnd = sunday.toISOString().split("T")[0];
    const today = now.toISOString().split("T")[0];

    // Fetch this week's sessions and upcoming in parallel
    const [weekAppts, upcoming] = await Promise.all([
      acuityGet(`/appointments?minDate=${weekStart}&maxDate=${weekEnd}&max=100`),
      acuityGet(`/appointments?minDate=${today}&max=10`),
    ]);

    const weekSessions = weekAppts.filter((a) => !a.canceled).length;

    const upcomingList = upcoming
      .filter((a) => !a.canceled)
      .slice(0, 10)
      .map((a) => ({
        id: a.id,
        client: `${a.firstName} ${a.lastName}`,
        type: a.type,
        date: a.date,
        time: a.time,
      }));

    return NextResponse.json({
      weekSessions,
      upcoming: upcomingList,
      lastFetched: new Date().toISOString(),
      connected: true,
    });
  } catch (error) {
    console.error("Acuity API error:", error.message);
    return NextResponse.json(
      { error: error.message, connected: false },
      { status: 500 }
    );
  }
}
