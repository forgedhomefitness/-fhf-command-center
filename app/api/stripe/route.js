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

    // Fetch month charges, year charges, and customers in parallel
    const [monthCharges, yearCharges, customers] = await Promise.all([
      stripeGet(`/charges?created[gte]=${monthStart}&limit=100`),
      stripeGet(`/charges?created[gte]=${yearStart}&limit=100`),
      stripeGet(`/customers?limit=100`),
    ]);

    const sumSucceeded = (charges) =>
      charges.data
        .filter((c) => c.status === "succeeded")
        .reduce((sum, c) => sum + c.amount, 0) / 100;

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
      monthRevenue: sumSucceeded(monthCharges),
      yearRevenue: sumSucceeded(yearCharges),
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
