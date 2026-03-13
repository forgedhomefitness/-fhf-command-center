"use client";

import { useState, useEffect } from "react";

const CATEGORY_CONFIG = {
  gas: { label: "Gas & Fuel", icon: "⛽", color: "text-orange-400" },
  vehicle: { label: "Vehicle & Auto", icon: "🚗", color: "text-blue-400" },
  equipment: { label: "Equipment", icon: "🏋️", color: "text-green-400" },
  marketing: { label: "Marketing", icon: "📢", color: "text-purple-400" },
  insurance: { label: "Insurance", icon: "🛡️", color: "text-cyan-400" },
  software: { label: "Software & Subs", icon: "💻", color: "text-indigo-400" },
  other: { label: "Other", icon: "📋", color: "text-dark-300" },
};

function ExpenseCategoryCard({ category, total, items, totalExpenses }) {
  const [expanded, setExpanded] = useState(false);
  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.other;
  const pct = totalExpenses > 0 ? Math.round((total / totalExpenses) * 100) : 0;

  return (
    <div className="card">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{config.icon}</span>
            <h3 className="text-sm font-semibold text-dark-300 uppercase tracking-wide">
              {config.label}
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-lg font-bold ${config.color}`}>
              ${total.toLocaleString()}
            </span>
            <span className="text-xs text-dark-500">{pct}%</span>
            <svg
              className={`w-4 h-4 text-dark-400 transition-transform ${expanded ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        <div className="w-full bg-dark-700 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full bg-brand-500`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </button>
      {expanded && items.length > 0 && (
        <div className="mt-3 pt-3 border-t border-dark-700 space-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex justify-between text-xs">
              <span className="text-dark-300">{item.name}</span>
              <span className="text-dark-400 font-medium">
                ${item.amount.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MileageCard({ mileageEstimate }) {
  if (!mileageEstimate) return null;

  return (
    <div className="card border border-brand-500/20">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🚗</span>
        <h3 className="text-sm font-semibold text-brand-400 uppercase tracking-wide">
          Mileage Deduction Estimate
        </h3>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
        <div>
          <p className="text-xs text-dark-400">Gas Spent</p>
          <p className="text-lg font-bold text-white">
            ${mileageEstimate.gasSpent.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs text-dark-400">Est. Miles</p>
          <p className="text-lg font-bold text-white">
            {mileageEstimate.estimatedMiles.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs text-dark-400">IRS Rate</p>
          <p className="text-lg font-bold text-white">
            ${mileageEstimate.irsRate}/mi
          </p>
        </div>
        <div>
          <p className="text-xs text-dark-400">Potential Deduction</p>
          <p className="text-lg font-bold text-green-400">
            ${mileageEstimate.potentialDeduction.toLocaleString()}
          </p>
        </div>
      </div>
      <p className="text-xs text-dark-500 bg-dark-800/50 rounded p-2">
        {mileageEstimate.note}
      </p>
    </div>
  );
}

export default function ExpensesPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("ytd");

  useEffect(() => {
    async function fetchExpenses() {
      setLoading(true);
      try {
        const res = await fetch(`/api/quickbooks/expenses?period=${period}`);
        const json = await res.json();
        if (json.connected) setData(json);
      } catch (err) {
        console.error("Failed to fetch expenses:", err);
      }
      setLoading(false);
    }
    fetchExpenses();
  }, [period]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Expenses</h1>
          <p className="text-sm text-dark-400">
            QuickBooks expense breakdown · {data?.period || "Loading..."}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPeriod("month")}
            className={`text-xs font-medium px-4 py-2 rounded-lg border transition-colors ${
              period === "month"
                ? "border-brand-500 text-brand-400 bg-brand-500/10"
                : "border-dark-600 text-dark-300 hover:text-white hover:border-dark-500"
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setPeriod("ytd")}
            className={`text-xs font-medium px-4 py-2 rounded-lg border transition-colors ${
              period === "ytd"
                ? "border-brand-500 text-brand-400 bg-brand-500/10"
                : "border-dark-600 text-dark-300 hover:text-white hover:border-dark-500"
            }`}
          >
            Year to Date
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-500 border-t-transparent" />
        </div>
      ) : !data ? (
        <div className="card text-center py-10">
          <p className="text-dark-400">
            Unable to load expense data. Check QuickBooks connection.
          </p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="card">
              <p className="text-xs text-dark-400 uppercase tracking-wide mb-1">Total Income</p>
              <p className="text-2xl font-bold text-green-400">
                ${data.totalIncome.toLocaleString()}
              </p>
            </div>
            <div className="card">
              <p className="text-xs text-dark-400 uppercase tracking-wide mb-1">Total Expenses</p>
              <p className="text-2xl font-bold text-red-400">
                ${data.totalExpenses.toLocaleString()}
              </p>
            </div>
            <div className="card">
              <p className="text-xs text-dark-400 uppercase tracking-wide mb-1">Net Income</p>
              <p className={`text-2xl font-bold ${data.netIncome >= 0 ? "text-green-400" : "text-red-400"}`}>
                ${data.netIncome.toLocaleString()}
              </p>
            </div>
            <div className="card">
              <p className="text-xs text-dark-400 uppercase tracking-wide mb-1">Expense Ratio</p>
              <p className="text-2xl font-bold text-brand-400">
                {data.totalIncome > 0
                  ? Math.round((data.totalExpenses / data.totalIncome) * 100)
                  : 0}%
              </p>
              <p className="text-[10px] text-dark-500 mt-1">Target: under 30%</p>
            </div>
          </div>

          {/* Mileage Estimate */}
          <div className="mb-6">
            <MileageCard mileageEstimate={data.mileageEstimate} />
          </div>

          {/* Expense Categories */}
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-dark-300 uppercase tracking-wide mb-3">
              Expense Breakdown
            </h2>
          </div>
          <div className="space-y-3 mb-6">
            {data.expensesByCategory.map((cat) => (
              <ExpenseCategoryCard
                key={cat.category}
                category={cat.category}
                total={cat.total}
                items={cat.items}
                totalExpenses={data.totalExpenses}
              />
            ))}
          </div>

          {/* Top Expenses Table */}
          <div className="card">
            <h3 className="text-sm font-semibold text-dark-300 uppercase tracking-wide mb-4">
              Top 10 Expenses
            </h3>
            <div className="space-y-2">
              {data.topExpenses.map((exp, i) => {
                const config = CATEGORY_CONFIG[exp.category] || CATEGORY_CONFIG.other;
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2 border-b border-dark-700 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-dark-500 w-5">{i + 1}.</span>
                      <span className="text-sm">{config.icon}</span>
                      <div>
                        <p className="text-sm text-dark-200">{exp.name}</p>
                        <p className="text-[10px] text-dark-500 uppercase">{config.label}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-white">
                      ${exp.amount.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CPA Note */}
          <div className="mt-6 p-4 rounded-lg border border-dark-700 bg-dark-800/30">
            <p className="text-xs text-dark-400">
              <span className="text-brand-400 font-semibold">CPA Note:</span>{" "}
              All expense data sourced from QuickBooks Online. For tax filing,
              Turner & Costa PC will reconcile these figures with actual receipts
              and bank statements. Keep all receipts for expenses over $75.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
