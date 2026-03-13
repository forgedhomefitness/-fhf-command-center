import { NextResponse } from "next/server";

const ACUITY_BASE = "https://acuityscheduling.com/api/v1";

// Same PRICE_MAP as main acuity route
const PRICE_MAP = {
  "Back to Back Private Session": 205,
  "Group Training": 205,
  "Student Athlete Session": 105,
  "Senior 60min": 130,
  "Senior 30min": 70,
  "Private Session": 130,
};

function getPriceForAppointment(appt) {
  if (!appt.type) return 130;
  const type = appt.type.toLowerCase();

  if (
    type.includes("free") ||
    type.includes("complimentary") ||
    type.includes("evaluation")
  )
    return 0;

  for (const [key, price] of Object.entries(PRICE_MAP)) {
    if (type.includes(key.toLowerCase())) {
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
    const yearStart = `${now.getFullYear()}-01-01`;
    const today = now.toISOString().split("T")[0];

    // Fetch all YTD appointments (paginate with max=500)
    const appts = await acuityGet(
      `/appointments?minDate=${yearStart}&maxDate=${today}&max=500`
    );

    const active = appts.filter((a) => !a.canceled);

    // Group by month
    const monthMap = {};
    for (const appt of active) {
      const date = new Date(appt.datetime);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const monthLabel = date.toLocaleString("en-US", {
        month: "short",
        year: "numeric",
      });

      if (!monthMap[monthKey]) {
        monthMap[monthKey] = {
          key: monthKey,
          label: monthLabel,
          sessions: 0,
          revenue: 0,
        };
      }

      const price = getPriceForAppointment(appt);
      monthMap[monthKey].sessions += 1;
      monthMap[monthKey].revenue += price;
    }

    // Sort by month key
    const months = Object.values(monthMap).sort((a, b) =>
      a.key.localeCompare(b.key)
    );

    const totalRevenue = months.reduce((s, m) => s + m.revenue, 0);
    const totalSessions = months.reduce((s, m) => s + m.sessions, 0);

    const TAX_RATE = 0.3;

    return NextResponse.json({
      connected: true,
      period: `${yearStart} to ${today}`,
      months,
      totalRevenue,
      totalSessions,
      taxReserve: {
        amount: Math.round(totalRevenue * TAX_RATE * 100) / 100,
        rate: TAX_RATE,
      },
    });
  } catch (err) {
    console.error("Acuity YTD error:", err.message);
    return NextResponse.json(
      { error: err.message, connected: false },
      { status: 500 }
    );
  }
}
