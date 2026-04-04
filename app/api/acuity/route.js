import { NextResponse } from "next/server";

const ACUITY_BASE = "https://acuityscheduling.com/api/v1";

// Fallback PRICE_MAP -- only used when Acuity does not have a price on the appointment
// ORDER MATTERS -- more specific keys must come before generic ones
const PRICE_MAP = {
  "Back to Back Private Session": 205,
  "Group Training": 205,
  "Student Athlete Session": 105,
  "Senior 60min": 130,
  "Senior 30min": 70,
  "Private Session": 130,
};

function getPriceForAppointment(appt) {
  // PRIMARY: Use the actual price from Acuity (what was actually charged)
  if (appt.price !== undefined && appt.price !== null && appt.price !== "") {
    const actualPrice = parseFloat(appt.price);
    if (!isNaN(actualPrice)) {
      return actualPrice;
    }
  }

  // FALLBACK: If Acuity has no price field, use type-based lookup
  if (!appt.type) return 130;
  const type = appt.type.toLowerCase();

  if (
    type.includes("free") ||
    type.includes("complimentary") ||
    type.includes("evaluation")
  )
    return 0;

  for (const [key, price] of Object.entries(PRICE_MAP)) {
    if (type.includes(key.toLowerCase())) return price;
  }
  return 130;
}

// Returns true for paid sessions only (excludes free evals from counts)
function isPaidSession(appt) {
  return getPriceForAppointment(appt) > 0;
}

async function acuityGet(endpoint) {
  const credentials = Buffer.from(
    `${process.env.ACUITY_USER_ID}:${process.env.ACUITY_API_KEY}`
  ).toString("base64");

  const res = await fetch(`${ACUITY_BASE}${endpoint}`, {
    headers: { Authorization: `Basic ${credentials}` },
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`Acuity API error: ${res.status}`);
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

    const lastMonday = new Date(monday);
    lastMonday.setDate(monday.getDate() - 7);
    const lastSunday = new Date(sunday);
    lastSunday.setDate(sunday.getDate() - 7);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    monthEnd.setHours(23, 59, 59, 999);

    const today = now.toISOString().split("T")[0];
    const weekStart = monday.toISOString().split("T")[0];
    const weekEnd = sunday.toISOString().split("T")[0];
    const lastWeekStart = lastMonday.toISOString().split("T")[0];
    const lastWeekEnd = lastSunday.toISOString().split("T")[0];
    const monthStartStr = monthStart.toISOString().split("T")[0];
    const monthEndStr = monthEnd.toISOString().split("T")[0];

    const [weekAppts, lastWeekAppts, upcoming, monthAppts] =
      await Promise.all([
        acuityGet(
          `/appointments?minDate=${weekStart}&maxDate=${weekEnd}&max=100`
        ),
        acuityGet(
          `/appointments?minDate=${lastWeekStart}&maxDate=${lastWeekEnd}&max=100`
        ),
        acuityGet(`/appointments?minDate=${today}&max=20&direction=ASC`),
        acuityGet(
          `/appointments?minDate=${monthStartStr}&maxDate=${monthEndStr}&max=200`
        ),
      ]);

    const activeWeekAppts = weekAppts.filter((a) => !a.canceled);
    // FIX: Only count paid sessions (excludes free evals)
    const weekSessions = activeWeekAppts.filter(isPaidSession).length;
    const weekEvals = activeWeekAppts.length - weekSessions;
    const weekRevenue = activeWeekAppts.reduce(
      (sum, appt) => sum + getPriceForAppointment(appt),
      0
    );

    const activeLastWeekAppts = lastWeekAppts.filter((a) => !a.canceled);
    // FIX: Only count paid sessions
    const lastWeekSessions = activeLastWeekAppts.filter(isPaidSession).length;
    const lastWeekRevenue = activeLastWeekAppts.reduce(
      (sum, appt) => sum + getPriceForAppointment(appt),
      0
    );

    const monthScheduledAppts = monthAppts.filter((a) => !a.canceled);

    const nowMs = now.getTime();
    const completedAppts = monthScheduledAppts.filter(
      (a) => new Date(a.datetime).getTime() < nowMs
    );
    const scheduledAppts = monthScheduledAppts.filter(
      (a) => new Date(a.datetime).getTime() >= nowMs
    );

    const monthEarnedRevenue = completedAppts.reduce(
      (sum, appt) => sum + getPriceForAppointment(appt),
      0
    );

    const monthRemainingRevenue = scheduledAppts.reduce(
      (sum, appt) => sum + getPriceForAppointment(appt),
      0
    );

    const monthProjectedRevenue = monthEarnedRevenue + monthRemainingRevenue;

    const monthSessionDetails = monthScheduledAppts.map((a) => ({
      id: a.id,
      client: `${a.firstName} ${a.lastName}`,
      date: a.datetime,
      type: a.type,
      price: getPriceForAppointment(a),
      acuityPrice: a.price,
      status:
        new Date(a.datetime).getTime() < nowMs ? "completed" : "scheduled",
    }));

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
      const price = getPriceForAppointment(appt);
      const isCompleted = new Date(appt.datetime).getTime() < nowMs;
      const isPaid = price > 0;

      if (!clientRevenueMap[name]) {
        clientRevenueMap[name] = {
          sessions: 0,
          revenue: 0,
          completedRevenue: 0,
          scheduledRevenue: 0,
          completed: 0,
          scheduled: 0,
          evals: 0,
        };
      }

      // FIX: Only count paid sessions in the sessions/completed/scheduled counts
      if (isPaid) {
        clientRevenueMap[name].sessions += 1;
        clientRevenueMap[name].revenue += price;
        if (isCompleted) {
          clientRevenueMap[name].completed += 1;
          clientRevenueMap[name].completedRevenue += price;
        } else {
          clientRevenueMap[name].scheduled += 1;
          clientRevenueMap[name].scheduledRevenue += price;
        }
      } else {
        clientRevenueMap[name].evals += 1;
      }
    }

    // FIX: All session counts exclude free evals; eval counts tracked separately
    const paidMonthTotal = monthScheduledAppts.filter(isPaidSession).length;
    const paidCompletedCount = completedAppts.filter(isPaidSession).length;
    const paidScheduledCount = scheduledAppts.filter(isPaidSession).length;
    const monthEvalCount = monthScheduledAppts.length - paidMonthTotal;

    return NextResponse.json({
      connected: true,
      weekSessions,
      weekEvals,
      weekRevenue,
      lastWeekSessions,
      lastWeekRevenue,
      weekTarget: 18,
      upcoming: upcomingFormatted,
      monthProjectedRevenue,
      monthEarnedRevenue,
      monthRemainingRevenue,
      monthSessionCount: paidMonthTotal,
      monthCompletedCount: paidCompletedCount,
      monthScheduledCount: paidScheduledCount,
      monthEvalCount,
      clientRevenueBreakdown: clientRevenueMap,
      monthSessionDetails,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err.message, connected: false },
      { status: 500 }
    );
  }
}
