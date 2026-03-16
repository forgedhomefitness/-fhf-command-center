"use client";

const PHASES = [
  { name: "Phase 1", year: "2026", annual: 108000 },
  { name: "Phase 2", year: "2027", annual: 192000 },
  { name: "Phase 3", year: "2028", annual: 288000 },
  { name: "Phase 4", year: "2029+", annual: 500000 },
  { name: "Phase 5", year: "2030", annual: 1000000 },
];

function getCurrentPhase() {
  const year = new Date().getFullYear();
  if (year <= 2026) return 0;
  if (year === 2027) return 1;
  if (year === 2028) return 2;
  if (year === 2029) return 3;
  return 4;
}

function MonthlyCard({ label, amount, target, color, subtitle }) {
  const pct = target > 0 ? Math.min(100, Math.round((amount / target) * 100)) : 0;

  const barColor =
    pct >= 100
      ? "bg-green-500"
      : pct >= 75
        ? "bg-brand-500"
        : pct >= 50
          ? "bg-yellow-500"
          : "bg-red-500";

  const pctColor =
    pct >= 100
      ? "text-green-400"
      : pct >= 75
        ? "text-brand-400"
        : pct >= 50
          ? "text-yellow-400"
          : "text-red-400";

  return (
    <div className={`rounded-xl border p-5 ${color}`}>
      <p className="text-xs font-semibold text-dark-300 uppercase tracking-wide mb-3">
        {label}
      </p>
      <div className="mb-1">
        <span className="text-3xl font-bold text-white">
          ${amount.toLocaleString()}
        </span>
      </div>
      {subtitle && (
        <p className="text-xs text-dark-400 mb-3">{subtitle}</p>
      )}
      <div className="w-full bg-dark-700/50 rounded-full h-2.5 mb-2">
        <div
          className={`${barColor} h-2.5 rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center justify-between">
        <span className={`text-xl font-bold ${pctColor}`}>{pct}%</span>
        <span className="text-xs text-dark-500">
          of ${target.toLocaleString()} target
        </span>
      </div>
    </div>
  );
        }
export default function MonthlyRevenue({ acuityData, stripeData, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card">
            <div className="skeleton h-4 w-24 mb-3" />
            <div className="skeleton h-8 w-32 mb-2" />
            <div className="skeleton h-2 w-full" />
          </div>
        ))}
      </div>
    );
  }

  const phase = PHASES[getCurrentPhase()];
  const monthTarget = Math.round(phase.annual / 12);

  const monthEarned = acuityData?.monthEarnedRevenue ?? stripeData?.monthRevenue ?? 0;
  const monthProjected = acuityData?.monthProjectedRevenue ?? monthEarned;
  const monthSessions = acuityData?.monthSessionCount ?? 0;

  const now = new Date();
  const monthName = now.toLocaleString("en-US", { month: "long" });
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dayOfMonth = now.getDate();
  const daysLeft = daysInMonth - dayOfMonth;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-dark-300 uppercase tracking-wide">
          {monthName} Revenue
        </h2>
        <span className="text-xs text-dark-500">
          Day {dayOfMonth} of {daysInMonth} - {daysLeft} days left
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MonthlyCard
          label="Earned So Far"
          amount={monthEarned}
          target={monthTarget}
          color="border-dark-700 bg-dark-800/60"
          subtitle={`${monthSessions} sessions completed`}
        />
        <MonthlyCard
          label="Projected Total"
          amount={monthProjected}
          target={monthTarget}
          color="border-brand-500/30 bg-brand-500/5"
          subtitle={`Earned + ${monthSessions > 0 ? "scheduled" : "upcoming"} sessions`}
        />
        <MonthlyCard
          label="Monthly Target"
          amount={monthTarget}
          target={monthTarget}
          color="border-dark-600 bg-dark-800/40"
          subtitle={`${phase.name} - $${phase.annual.toLocaleString()}/yr`}
        />
      </div>
    </div>
  );
}
