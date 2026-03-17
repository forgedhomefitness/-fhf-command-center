import { NextResponse } from "next/server";

const STRIPE_BASE = "https://api.stripe.com/v1";

async function stripeGet(endpoint) {
  const res = await fetch(`${STRIPE_BASE}${endpoint}`, {
    headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Stripe API error: ${res.status}`);
  }
  return res.json();
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

    // Week start = Monday 00:00:00
    const weekStartDate = new Date(now);
    const day = weekStartDate.getDay(); // 0=Sun, 1=Mon
    const diff = day === 0 ? 6 : day - 1;
    weekStartDate.setDate(weekStartDate.getDate() - diff);
    weekStartDate.setHours(0, 0, 0, 0);
    const weekStart = Math.floor(weekStartDate.getTime() / 1000);

    // Fetch week, month, year charges, and customers in parallel
    const [weekCharges, monthCharges, yearCharges, customers] =
      await Promise.all([
        stripeGet(`/charges?created[gte]=${weekStart}&limit=100`),
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

    // Weekly
    const weekRevenue = sumSucceeded(weekCharges);
    const weekChargeCount = countSucceeded(weekCharges);
    const weekStripeFees =
      Math.round((weekRevenue * 0.029 + weekChargeCount * 0.3) * 100) / 100;
    const weekNetRevenue =
      Math.round((weekRevenue - weekStripeFees) * 100) / 100;

    // Monthly
    const monthRevenue = sumSucceeded(monthCharges);
    const monthChargeCount = countSucceeded(monthCharges);
    const monthStripeFees =
      Math.round((monthRevenue * 0.029 + monthChargeCount * 0.3) * 100) / 100;
    const monthNetRevenue =
      Math.round((monthRevenue - monthStripeFees) * 100) / 100;

    // Yearly
    const yearRevenue = sumSucceeded(yearCharges);
    const yearChargeCount = countSucceeded(yearCharges);
    const yearStripeFees =
      Math.round((yearRevenue * 0.029 + yearChargeCount * 0.3) * 100) / 100;
    const yearNetRevenue =
      Math.round((yearRevenue - yearStripeFees) * 100) / 100;

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

    return NextResponse.json({
      weekRevenue,
      weekNetRevenue,
      weekStripeFees,
      weekChargeCount,
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
      lastFetched: new Date().toISOString(),
      connected: true,
    });
  } catch (error) {
    console.error("Stripe API error:", error.message);
    return NextResponse.json(
      { error: error.message, connected: false },
      { status: 500 }
    );
  }
}
