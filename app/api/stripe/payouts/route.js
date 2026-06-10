import { NextResponse } from "next/server";

// Stripe payouts endpoint -- day-to-day "money in, and from which sessions"
// Fetches real payout records + the charges inside each payout (reconciliation).
// No Redis dependency. Lives at /api/stripe/payouts
// Created 2026-06-10

export const dynamic = "force-dynamic";

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

export async function GET(request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Stripe API key not configured", connected: false },
      { status: 503 }
    );
  }

  try {
    // ?limit= controls how many recent payouts to break down (default 12, max 30)
    const { searchParams } = new URL(request.url);
    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") || "12", 10), 1),
      30
    );

    // 1. Most recent payouts (all statuses: paid, in_transit, pending, failed)
    const payoutsResp = await stripeGet(`/payouts?limit=${limit}`);

    // 2. For each payout, pull the balance transactions inside it so we can map
    //    the payout back to the individual session charges (and their dates).
    const payouts = await Promise.all(
      payoutsResp.data.map(async (p) => {
        let charges = [];
        let chargeTotal = 0;
        let feeTotal = 0;
        try {
          const txns = await stripeGet(
            `/balance_transactions?payout=${p.id}&limit=100&expand[]=data.source`
          );
          charges = txns.data
            .filter((t) => t.type === "charge" || t.type === "payment")
            .map((t) => {
              const src = t.source || {};
              chargeTotal += t.amount;
              feeTotal += t.fee;
              return {
                description: src.description || "Payment",
                gross: t.amount / 100, // what client paid
                fee: t.fee / 100, // Stripe fee
                net: t.net / 100, // what Matt keeps
                // charge date = when the session was actually billed
                chargeDate: new Date(
                  (src.created || t.created) * 1000
                ).toISOString(),
              };
            })
            .sort((a, b) => new Date(a.chargeDate) - new Date(b.chargeDate));
        } catch (e) {
          // balance-transaction lookup failed for this payout -- keep the payout,
          // just without the per-charge breakdown
          charges = [];
        }

        return {
          id: p.id,
          // arrivalDate = the day the money actually lands in Rockland Trust
          arrivalDate: new Date(p.arrival_date * 1000)
            .toISOString()
            .slice(0, 10),
          createdDate: new Date(p.created * 1000).toISOString().slice(0, 10),
          amount: p.amount / 100, // net deposit (after Stripe fees)
          status: p.status, // paid | in_transit | pending | failed | canceled
          method: p.method, // standard | instant
          chargeCount: charges.length,
          grossInPayout:
            chargeTotal !== 0 ? Math.round(chargeTotal) / 100 : null,
          feesInPayout: feeTotal !== 0 ? Math.round(feeTotal) / 100 : null,
          sessions: charges,
        };
      })
    );

    // 3. Read the account's payout schedule (so we know the current settlement
    //    speed: next-day vs 2-business-day rolling, etc.)
    let payoutSchedule = null;
    try {
      const acct = await stripeGet(`/account`);
      const s = acct.settings?.payouts?.schedule;
      if (s) {
        payoutSchedule = {
          interval: s.interval, // daily | weekly | monthly | manual
          delayDays: s.delay_days, // 1 = next-day settlement
        };
      }
    } catch (e) {
      payoutSchedule = null;
    }

    return NextResponse.json({
      payoutSchedule,
      payoutCount: payouts.length,
      payouts,
      lastFetched: new Date().toISOString(),
      connected: true,
    });
  } catch (error) {
    console.error("Stripe payouts API error:", error.message);
    return NextResponse.json(
      { error: error.message, connected: false },
      { status: 500 }
    );
  }
}
