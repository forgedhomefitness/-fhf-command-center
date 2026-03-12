import { NextResponse } from "next/server";

const ACUITY_BASE = "https://acuityscheduling.com/api/v1";

const PRICE_MAP = {
  "Private Session": 130,
  "Back to Back Private Session": 205,
  "Group Training": 205,
  "Student Athlete Session": 105,
  "Senior 30min": 70,
  "Senior 60min": 130,
};

function getPriceForAppointment(appt) {
  for (const [key, price] of Object.entries(PRICE_MAP)) {
    if (appt.type && appt.type.toLowerCase().includes(key.toLowerCase())) {
      return price;
    }
  }
  return 130;
}

async function acuityGet(endpoint) {
  const credentials = Buffer.from(
    `${process.env.ACUITY_USER_ID}:${process.env.ACUITY_API_KEY}`
  ).toString("base64");

  const res = await fetch(`${ACUITY_BASE}${endpoint}`, {
    headers: { Authorization: `Basic ${credentials}` },
    cache: "no-store",
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
    const now = new Date();

    const day = now.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    monthEnd.setHours(23, 59, 59, 999);

    const today = now.toISOString().split("T")[0];
    const weekStart = monday.toISOString().split("T")[0];
    const weekEnd = sunday.toISOString().split("T")[0];
    const monthStartStr = monthStart.toISOString().split("T")[0];
    const monthEndStr = monthEnd.toISOString().split("T")[0];

    const [weekAppts, upcoming, monthAppts] = await Promise.all([
      acuityGet(`/appointments?minDate=${weekStart}&maxDate=${weekEnd}&max=100`),
      acuityGet(`/appointments?minDate=${today}&max=20&direction=ASC`),
      acuityGet(`/appointments?minDate=${monthStartStr}&maxDate=${monthEndStr}&max=200`),
    ]);

    const weekSessions = weekAppts.filter((a) => !a.canceled).length;
    const monthScheduledAppts = monthAppts.filter((a) => !a.canceled);

    const monthProjectedRevenue = monthScheduledAppts.reduce((sum, appt) => {
      return sum + getPriceForAppointment(appt);
    }, 0);

    const nowMs = now.getTime();

    const monthEarnedRevenue = monthScheduledAppts
      .filter((a) => new Date(a.datetime).getTime() < nowMs)
      .reduce((sum, appt) => sum + getPriceForAppointment(appt), 0);

    const monthRemainingRevenue = monthScheduledAppts
      .filter((a) => new Date(a.datetime).getTime() >= nowMs)
      .reduce((sum, appt) => sum + getPriceForAppointment(appt), 0);

    const upcomingFormatted = upcoming
      .filter((a) => !a.canceled)
      .slice(0, 10)
      .map((a) => ({
        id: a.id,
        clientName: `${a.firstName} ${a.lastName}`,
        type: a.type,
        datetime: a.datetime,
        price: getPriceForAppointment(a),
        duration: a.duration,
        location: a.location || "In-Home",
      }));

    const clientRevenueMap = {};
    for (const appt of monthScheduledAppts) {
      const name = `${appt.firstName} ${appt.lastName}`;
      if (!clientRevenueMap[name]) {
        clientRevenueMap[name] = { sessions: 0, revenue: 0 };
      }
      clientRevenueMap[name].sessions += 1;
      clientRevenueMap[name].revenue += getPriceForAppointment(appt);
    }

    return NextResponse.json({
      connected: true,
      weekSessions,
      weekTarget: 18,
      upcoming: upcomingFormatted,
      monthProjectedRevenue,
      monthEarnedRevenue,
      monthRemainingRevenue,
      monthSessionCount: monthScheduledAppts.length,
      clientRevenueBreakdown: clientRevenueMap,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err.message, connected: false },
      { status: 500 }
    );
  }
}
