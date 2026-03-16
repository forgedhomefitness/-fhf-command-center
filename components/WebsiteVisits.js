"use client";

export default function WebsiteVisits({ analytics, loading }) {
  const data = analytics || {};
  const today = data.today ?? 0;
  const week = data.week ?? 0;
  const month = data.month ?? 0;
  const lastWeek = data.lastWeek ?? 0;
  const lastMonth = data.lastMonth ?? 0;
  const quarter = data.quarter ?? 0;
  const lastQuarter = data.lastQuarter ?? 0;
  const year = data.year ?? 0;
  const connected = data.connected ?? false;

  function trendPct(current, previous) {
    if (!previous || previous === 0) return null;
    return Math.round(((current - previous) / previous) * 100);
  }

  function TrendBadge({ current, previous, label }) {
    const pct = trendPct(current, previous);
    if (pct === null) return null;
    const isUp = pct >= 0;
    return (
      <span
        className={`text-[10px] font-medium ${
          isUp ? "text-green-400" : "text-red-400"
        }`}
      >
        {isUp ? "+" : ""}
        {pct}% vs {label}
      </span>
    );
  }

  if (!connected) {
    return (
      <div className="card">
        <p className="text-xs font-semibold text-dark-300 uppercase tracking-wide mb-2">
          Website Visits
        </p>
        <div className="flex items-end gap-2 mb-3">
          <span className="text-3xl font-bold text-dark-500">\u2014</span>
        </div>
        <p className="text-xs text-dark-500">
          Connect Google Analytics to track website visits.
        </p>
        <p className="text-[10px] text-dark-600 mt-1">
          Add GA4 tracking code to Squarespace \u2192 Settings \u2192 Developer Tools \u2192 Code Injection
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-dark-300 uppercase tracking-wide">
          Website Visits
        </h3>
        <span className="text-[10px] text-dark-500">
          forgedhomefitness.com
        </span>
      </div>

      {/* Today highlight */}
      <div className="flex items-end gap-3 mb-4">
        <span className="text-3xl font-bold text-white">
          {today.toLocaleString()}
        </span>
        <span className="text-dark-400 text-sm mb-1">today</span>
      </div>

      {/* Week / Month row */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-dark-800/50 rounded-lg p-3">
          <p className="text-lg font-bold text-white">
            {week.toLocaleString()}
          </p>
          <p className="text-[10px] text-dark-400 uppercase mb-1">
            This Week
          </p>
          <TrendBadge current={week} previous={lastWeek} label="last week" />
        </div>
        <div className="bg-dark-800/50 rounded-lg p-3">
          <p className="text-lg font-bold text-white">
            {month.toLocaleString()}
          </p>
          <p className="text-[10px] text-dark-400 uppercase mb-1">
            This Month
          </p>
          <TrendBadge
            current={month}
            previous={lastMonth}
            label="last month"
          />
        </div>
      </div>

      {/* Quarter / Year row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-dark-800/50 rounded-lg p-3">
          <p className="text-lg font-bold text-white">
            {quarter.toLocaleString()}
          </p>
          <p className="text-[10px] text-dark-400 uppercase mb-1">
            This Quarter
          </p>
          <TrendBadge
            current={quarter}
            previous={lastQuarter}
            label="last quarter"
          />
        </div>
        <div className="bg-dark-800/50 rounded-lg p-3">
          <p className="text-lg font-bold text-white">
            {year.toLocaleString()}
          </p>
          <p className="text-[10px] text-dark-400 uppercase">
            Year to Date
          </p>
        </div>
      </div>
    </div>
  );
}
