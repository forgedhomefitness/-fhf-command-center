"use client";

import { useState, useEffect, useCallback } from "react";

const TAX_RATE = 0.3;

function formatCurrency(val) {
  if (val == null) return "$0";
  return "$" + Math.round(val).toLocaleString();
}

function TaxReserveCard({ title, subtitle, grossAmount, taxAmount, color }) {
  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-dark-300 uppercase tracking-wide font-heading">
        {title}
      </h3>
      <p className="text-xs text-dark-500 mb-4">{subtitle}</p>
      <div className="flex items-end gap-2 mb-1">
        <span className="text-4xl font-bold text-white font-heading">
          {formatCurrency(taxAmount)}
        </span>
      </div>
      <p className="text-xs text-dark-400 mb-4">
        30% of {formatCurrency(grossAmount)}
      </p>
      <div className="w-full bg-dark-700 rounded-full h-3 mb-2">
        <div
          className={`${color} h-3 rounded-full transition-all`}
          style={{ width: grossAmount > 0 ? "30%" : "0%" }}
        />
      </div>
      <div className="flex justify-between text-xs text-dark-500">
        <span>You keep: {formatCurrency(grossAmount - taxAmount)}</span>
        <span>Reserve: {formatCurrency(taxAmount)}</span>
      </div>
    </div>
  );
}

function parseQbMonthKey(label) {
  const monthNames = {
    Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
    Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12",
  };
  for (const [name, num] of Object.entries(monthNames)) {
    if (label.startsWith(name)) {
      const yearMatch = label.match(/(\d{4})/);
      if (yearMatch) return `${yearMatch[1]}-${num}`;
    }
  }
  return null;
}

function MonthlyBreakdownTable({ qbMonths, stripeData }) {
  const stripeMonths = stripeData?.months || [];

  if (stripeMonths.length === 0) {
    return (
      <div className="card">
        <p className="text-dark-500 text-sm">
          No monthly data available yet.
        </p>
      </div>
    );
  }

  const qbExpenseMap = {};
  if (qbMonths) {
    for (const m of qbMonths) {
      const key = parseQbMonthKey(m.label);
      if (key) {
        qbExpenseMap[key] = (qbExpenseMap[key] || 0) + (m.expenses || 0);
      }
    }
  }

  let totalGross = 0;
  let totalFees = 0;
  let totalNet = 0;
  let totalSessions = 0;
  let totalExpenses = 0;
  let totalTax = 0;

  const rows = stripeMonths.map((sm) => {
    const qbExp = qbExpenseMap[sm.key] || 0;
    const monthTax = Math.round(sm.netRevenue * TAX_RATE * 100) / 100;

    totalGross += sm.revenue;
    totalFees += sm.stripeFees;
    totalNet += sm.netRevenue;
    totalSessions += sm.chargeCount;
    totalExpenses += qbExp;
    totalTax += monthTax;

    return { ...sm, qbExpenses: qbExp, tax: monthTax };
  });

  return (
    <div className="card overflow-x-auto">
      <h3 className="text-sm font-semibold text-dark-300 uppercase tracking-wide font-heading mb-4">
        Monthly Breakdown &middot; YTD
      </h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-dark-700">
            <th className="text-left py-2 text-xs text-dark-400 font-heading uppercase">Month</th>
            <th className="text-right py-2 text-xs text-dark-400 font-heading uppercase">Gross Rev</th>
            <th className="text-right py-2 text-xs text-dark-400 font-heading uppercase">Stripe Fees</th>
            <th className="text-right py-2 text-xs text-dark-400 font-heading uppercase">Net Revenue</th>
            <th className="text-right py-2 text-xs text-dark-400 font-heading uppercase">Sessions</th>
            <th className="text-right py-2 text-xs text-dark-400 font-heading uppercase">QB Expenses</th>
            <th className="text-right py-2 text-xs text-dark-400 font-heading uppercase">Tax (30% Net)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} className="border-b border-dark-800">
              <td className="py-2 text-white font-medium">{row.label}</td>
              <td className="py-2 text-right text-green-400">
                {formatCurrency(row.revenue)}
              </td>
              <td className="py-2 text-right text-red-400">
                {row.stripeFees > 0 ? `-${formatCurrency(row.stripeFees)}` : "\u2014"}
              </td>
              <td className="py-2 text-right text-green-300 font-medium">
                {row.netRevenue > 0 ? formatCurrency(row.netRevenue) : "\u2014"}
              </td>
              <td className="py-2 text-right text-dark-300">
                {row.chargeCount || "\u2014"}
              </td>
              <td className="py-2 text-right text-red-400">
                {row.qbExpenses > 0 ? formatCurrency(row.qbExpenses) : "\u2014"}
              </td>
              <td className="py-2 text-right text-brand-400">
                {row.netRevenue > 0 ? formatCurrency(row.tax) : "\u2014"}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-dark-600">
            <td className="py-2 text-white font-bold">YTD Total</td>
            <td className="py-2 text-right text-green-400 font-bold">{formatCurrency(totalGross)}</td>
            <td className="py-2 text-right text-red-400 font-bold">{totalFees > 0 ? `-${formatCurrency(totalFees)}` : "\u2014"}</td>
            <td className="py-2 text-right text-green-300 font-bold">{formatCurrency(totalNet)}</td>
            <td className="py-2 text-right text-dark-300 font-bold">{totalSessions}</td>
            <td className="py-2 text-right text-red-400 font-bold">{totalExpenses > 0 ? formatCurrency(totalExpenses) : "\u2014"}</td>
            <td className="py-2 text-right text-brand-400 font-bold">{formatCurrency(totalTax)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function YTDSummaryBar({ label, value, target, color }) {
  const pct = target > 0 ? Math.min(100, Math.round((value / target) * 100)) : 0;
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-dark-400">{label}</span>
        <span className="text-white font-medium">
          {formatCurrency(value)} / {formatCurrency(target)}
        </span>
      </div>
      <div className="w-full bg-dark-700 rounded-full h-2">
        <div
          className={`${color} h-2 rounded-full transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function FinancesPage() {
  const [qbPnl, setQbPnl] = useState(null);
  const [stripeData, setStripeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [qbRes, stripeRes] = await Promise.allSettled([
      fetch("/api/quickbooks/pnl").then((r) => r.json()),
      fetch("/api/stripe").then((r) => r.json()),
    ]);

    if (qbRes.status === "fulfilled") setQbPnl(qbRes.value);
    if (stripeRes.status === "fulfilled") setStripeData(stripeRes.value);

    setLastRefresh(new Date().toISOString());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const grossRevenue = stripeData?.yearRevenue || 0;
  const totalSessions = stripeData?.yearChargeCount || 0;
  const qbExpenses = qbPnl?.totalExpenses || 0;

  const yearStripeFees = stripeData?.yearStripeFees || 0;
  const netRevenue = stripeData?.yearNetRevenue || Math.round((grossRevenue - yearStripeFees) * 100) / 100;

  const netRevTax = Math.round(netRevenue * TAX_RATE * 100) / 100;
  const grossTax = Math.round(grossRevenue * TAX_RATE * 100) / 100;

  const annualTarget = 108000;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white font-heading">
            FINANCES & TAX RESERVE
          </h1>
          <p className="text-sm text-dark-400">
            YTD P&L &middot; 30% Tax Reserve &middot; Turner & Costa PC Ready
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="text-xs font-medium px-4 py-2 rounded-lg border border-dark-600 text-dark-300 hover:text-white hover:border-dark-500 disabled:opacity-50 transition-colors"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <TaxReserveCard
          title="Tax Reserve &mdash; Net Revenue"
          subtitle="30% of revenue after Stripe fees (recommended)"
          grossAmount={netRevenue}
          taxAmount={netRevTax}
          color="bg-brand-500"
        />
        <TaxReserveCard
          title="Tax Reserve &mdash; Gross Revenue"
          subtitle="30% of total session revenue (conservative / max safe)"
          grossAmount={grossRevenue}
          taxAmount={grossTax}
          color="bg-green-500"
        />
      </div>

      <div className="card mb-6">
        <h3 className="text-sm font-semibold text-dark-300 uppercase tracking-wide font-heading mb-4">
          Year-to-Date Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-6">
          <div>
            <p className="text-xs text-dark-400">Gross Revenue</p>
            <p className="text-2xl font-bold text-green-400 font-heading">{formatCurrency(grossRevenue)}</p>
            <p className="text-xs text-dark-500">{totalSessions} paid sessions</p>
          </div>
          <div>
            <p className="text-xs text-dark-400">Stripe Fees</p>
            <p className="text-2xl font-bold text-red-400 font-heading">-{formatCurrency(yearStripeFees)}</p>
            <p className="text-xs text-dark-500">2.9% + $0.30/txn</p>
          </div>
          <div>
            <p className="text-xs text-dark-400">Net Revenue</p>
            <p className="text-2xl font-bold text-green-300 font-heading">{formatCurrency(netRevenue)}</p>
            <p className="text-xs text-dark-500">After Stripe fees</p>
          </div>
          <div>
            <p className="text-xs text-dark-400">Expenses</p>
            <p className="text-2xl font-bold text-red-400 font-heading">{formatCurrency(qbExpenses)}</p>
            <p className="text-xs text-dark-500">QuickBooks tracked</p>
          </div>
          <div>
            <p className="text-xs text-dark-400">Net Profit</p>
            <p className={`text-2xl font-bold font-heading ${netRevenue - qbExpenses >= 0 ? "text-green-400" : "text-red-400"}`}>
              {formatCurrency(netRevenue - qbExpenses)}
            </p>
            <p className="text-xs text-dark-500">Net rev - expenses</p>
          </div>
        </div>
        <YTDSummaryBar label="Phase 1 Revenue Target ($108K)" value={grossRevenue} target={annualTarget} color="bg-brand-500" />
      </div>

      <div className="card mb-6">
        <h3 className="text-sm font-semibold text-dark-300 uppercase tracking-wide font-heading mb-3">
          Tax Reserve Range
        </h3>
        <p className="text-xs text-dark-400 mb-4">
          You should set aside between{" "}
          <span className="text-brand-400 font-medium">{formatCurrency(netRevTax)}</span>{" "}
          (based on net revenue after Stripe fees) and{" "}
          <span className="text-brand-400 font-medium">{formatCurrency(grossTax)}</span>{" "}
          (max safe, based on gross revenue) for taxes this year.
        </p>
        <div className="bg-dark-800 rounded-lg p-4 flex items-center justify-between">
          <div className="text-center">
            <p className="text-xs text-dark-500">Min Reserve (Net Rev)</p>
            <p className="text-xl font-bold text-green-400 font-heading">{formatCurrency(netRevTax)}</p>
          </div>
          <div className="flex-1 mx-4">
            <div className="w-full bg-dark-700 rounded-full h-2 relative">
              <div className="bg-gradient-to-r from-green-500 to-brand-500 h-2 rounded-full" style={{ width: "100%" }} />
            </div>
          </div>
          <div className="text-center">
            <p className="text-xs text-dark-500">Max Reserve (Gross)</p>
            <p className="text-xl font-bold text-brand-400 font-heading">{formatCurrency(grossTax)}</p>
          </div>
        </div>
      </div>

      <MonthlyBreakdownTable qbMonths={qbPnl?.months} stripeData={stripeData} />

      <div className="mt-6 card border border-dark-600">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-white">CPA: Turner & Costa PC</p>
            <p className="text-xs text-dark-400 mt-1">
              Revenue and fees are pulled directly from Stripe (actual payments processed). Expenses tracked in QuickBooks. The 30% tax reserve is a conservative estimate. Consult Turner & Costa for your actual tax obligation based on deductions, self-employment tax, and quarterly estimated payments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
