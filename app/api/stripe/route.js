import { NextResponse } from "next/server";

// Live Stripe fetch â no Redis cache dependency
// Replaces the cached version that went stale 2026-04-18

const STRIPE_BASE = "https://api.stripe.com/v1";

async function stripeGet(endpoint) {
  const res = await fetch(`${STRIPE_BASE}${endpoint}`, {
    headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` },
    cache: "no-store",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Stripe API error: ${res.status}`);
  }
  return res.json();
}

function getWeekBounds() {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 6 : day - 1; // Monday = start of week
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - diff);
  weekStart.setHours(0, 0, 0, 0);
  return {
    weekStartTs: Math.floor(weekStart.getTime() / 1000),
    lastWeekStartTs: Math.floor((weekStart.getTime() - 7 * 86400000) / 1000),
    lastWeekEndTs: Math.floor(weekStart.getTime() / 1000),
  };
}

export async function GET() {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Stripe API key not configured", connected: false },
      { status: 503 }
    );
  }

  try {
    const now = new Date();
    const monthStart = Math.floor(
      new Date(now.getFullYear(), now.getMonth(), 1).getTime() / 1000
    );
    const yearStart = Math.floor(
      new Date(now.getFullYear(), 0, 1).getTime() / 1000
    );
    const { weekStartTs, lastWeekStartTs, lastWeekEndTs } = getWeekBounds();

    // Fetch all data in parallel â week, last week, month, year, customers
    const [weekCharges, lastWeekCharges, monthCharges, yearCharges, customers] =
      await Promise.all([
        stripeGet(`/charges?created[gte]=${weekStartTs}&limit=100`),
        stripeGet(
          `/charges?created[gte]=${lastWeekStartTs}&created[lt]=${lastWeekEndTs}&limit=100`
        ),
        stripeGet(`/charges?created[gte]=${monthStart}&limit=100`),
        stripeGet(`/charges?created[gte]=${yearStart}&limit=100`),
        stripeGet(`/customers?limit=100`),
      ]);

    const sumSucceeded = (charges) =>
      charges.data
        .filter((c) => c.status === "succeeded")
        .reduce((sum, c) => sum + c.amount, 0) / 100;

    const countSucceeded = (charges) =>
      charges.data.filter((c) => c.status === "succeeded").length;

    const calcFees = (revenue, count) =>
      Math.round((revenue * 0.029 + count * 0.3) * 100) / 100;

    // Week
    const weekRevenue = sumSucceeded(weekCharges);
    const weekChargeCount = countSucceeded(weekCharges);
    const weekStripeFees = calcFees(weekRevenue, weekChargeCount);
    const weekNetRevenue = Math.round((weekRevenue - weekStripeFees) * 100) / 100;

    // Last week
    const lastWeekRevenue = sumSucceeded(lastWeekCharges);
    const lastWeekSessions = countSucceeded(lastWeekCharges);

    // Month
    const monthRevenue = sumSucceeded(monthCharges);
    const monthChargeCount = countSucceeded(monthCharges);
    const monthStripeFees = calcFees(monthRevenue, monthChargeCount);
    const monthNetRevenue = Math.round((monthRevenue - monthStripeFees) * 100) / 100;

    // Year
    const yearRevenue = sumSucceeded(yearCharges);
    const yearChargeCount = countSucceeded(yearCharges);
    const yearStripeFees = calcFees(yearRevenue, yearChargeCount);
    const yearNetRevenue = Math.round((yearRevenue - yearStripeFees) * 100) / 100;

    // Recent charges
    const recentCharges = monthCharges.data
      .filter((c) => c.status === "succeeded")
      .slice(0, 10)
      .map((c) => ({
        id: c.id,
        amount: c.amount / 100,
        description: c.description || "Payment",
        date: new Date(c.created * 1000).toISOString(),
        status: c.status,
      }));

    // Monthly breakdown for year
    const monthBuckets = {};
    yearCharges.data
      .filter((c) => c.status === "succeeded")
      .forEach((c) => {
        const d = new Date(c.created * 1000);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (!monthBuckets[key]) monthBuckets[key] = { revenue: 0, count: 0 };
        monthBuckets[key].revenue += c.amount / 100;
        monthBuckets[key].count++;
      });

    const months = Object.entries(monthBuckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, data]) => ({
        key,
        label: new Date(key + "-01").toLocaleString("en-US", {
          month: "short",
          year: "numeric",
        }),
        revenue: data.revenue,
        chargeCount: data.count,
        stripeFees: calcFees(data.revenue, data.count),
        netRevenue:
          Math.round((data.revenue - calcFees(data.revenue, data.count)) * 100) /
          100,
      }));

    return NextResponse.json(
      {
        weekRevenue,
        weekNetRevenue,
        weekStripeFees,
        weekChargeCount,
        lastWeekRevenue,
        lastWeekSessions,
        monthRevenue,
        yearRevenue,
        monthNetRevenue,
        yearNetRevenue,
        monthStripeFees,
        yearStripeFees,
        monthChargeCount,
        yearChargeCount,
        customerCount: customers.data.length,
        recentCharges,
        months,
        lastFetched: new Date().toISOString(),
        connected: true,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("Stripe API error:", error.message);
    return NextResponse.json(
      { error: error.message, connected: false },
      { status: 500 }
    );
  }
}
