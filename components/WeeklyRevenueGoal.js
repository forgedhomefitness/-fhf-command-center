"use client";

const PHASES = [
  { name: "Phase 1", year: "2026", annual: 108000, weekly: 2077 },
  { name: "Phase 2", year: "2027", annual: 192000, weekly: 3692 },
  { name: "Phase 3", year: "2028", annual: 288000, weekly: 5538 },
  { name: "Phase 4", year: "2029+", annual: 500000, weekly: 9615 },
];

function getCurrentPhase() {
  const year = new Date().getFullYear();
  if (year <= 2026) return 0;
  if (year === 2027) return 1;
  if (year === 2028) return 2;
  return 3;
}

export default function WeeklyRevenueGoal({
  weekRevenue = 0,
  weekSessions = 0,
  weekNetRevenue = 0,
  weekStripeFees = 0,
}) {
  const phaseIndex = getCurrentPhase();
  const phase = PHASES[phaseIndex];
  const target = phase.weekly;
  const pct = Math.min(100, Math.round((weekRevenue / target) * 100));
  const remaining = Math.max(0, target - weekRevenue);
  const avgPerSession =
    weekSessions > 0 ? Math.round(weekRevenue / weekSessions) : 130;
  const sessionsNeeded =
    remaining > 0 ? Math.ceil(remaining / avgPerSession) : 0;

  const statusColor =
    pct >= 100
      ? "text-green-400 bg-green-500/10"
      : pct >= 75
        ? "text-brand-400 bg-brand-500/10"
        : pct >= 50
          ? "text-yellow-400 bg-yellow-500/10"
          : "text-red-400 bg-red-500/10";

  const statusText =
    pct >= 100
      ? "Goal Hit"
      : pct >= 75
        ? "Almost There"
        : pct >= 50
          ? "On Pace"
          : "Behind";

  const barColor =
    pct >= 100
      ? "bg-green-500"
      : pct >= 75
        ? "bg-brand-500"
        : pct >= 50
          ? "bg-yellow-500"
          : "bg-red-500";

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-dark-300 uppercase tracking-wide">
          Weekly Revenue Goal
        </h3>
        <span
          className={`text-xs font-medium px-2 py-1 rounded ${statusColor}`}
        >
          {statusText}
        </span>
      </div>

      {/* Gross Revenue */}
      <div className="flex items-end gap-3 mb-1">
        <span className="text-3xl font-bold text-white">
          ${weekRevenue.toLocaleString()}
        </span>
        <span className="text-dark-400 text-sm mb-1">
          / ${target.toLocaleString()} target
        </span>
      </div>

      {/* Net Revenue line */}
      {weekNetRevenue > 0 && (
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm text-green-300 font-medium">
            Net: ${weekNetRevenue.toLocaleString()}
          </span>
          {weekStripeFees > 0 && (
            <span className="text-xs text-dark-500">
              (Stripe fees: -${weekStripeFees.toLocaleString()})
            </span>
          )}
        </div>
      )}

      <p className="text-xs text-dark-500 mb-3">
        {phase.name} ({phase.year}) Â· ${phase.annual.toLocaleString()}/yr
      </p>

      {/* Progress bar */}
      <div className="w-full bg-dark-700 rounded-full h-3 mb-3 relative">
        <div
          className={`${barColor} h-3 rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-dark-300">
          {pct}%
        </span>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="bg-dark-800/50 rounded-lg p-2 text-center">
          <p className="text-lg font-bold text-white">{weekSessions}</p>
          <p className="text-[10px] text-dark-400 uppercase">Sessions</p>
        </div>
        <div className="bg-dark-800/50 rounded-lg p-2 text-center">
          <p className="text-lg font-bold text-white">${avgPerSession}</p>
          <p className="text-[10px] text-dark-400 uppercase">Avg/Session</p>
        </div>
        <div className="bg-dark-800/50 rounded-lg p-2 text-center">
          <p
            className={`text-lg font-bold ${remaining > 0 ? "text-brand-400" : "text-green-400"}`}
          >
            {remaining > 0 ? sessionsNeeded : "\u2713"}
          </p>
          <p className="text-[10px] text-dark-400 uppercase">
            {remaining > 0 ? "Sessions Left" : "Complete"}
          </p>
        </div>
      </div>

      {/* Remaining amount */}
      {remaining > 0 && (
        <p className="text-xs text-dark-400">
          <span className="text-brand-400 font-semibold">
            ${remaining.toLocaleString()}
          </span>{" "}
          more to hit this week's target
          {sessionsNeeded > 0 && (
            <span>
              {" "}
              Â· ~{sessionsNeeded} more session
              {sessionsNeeded > 1 ? "s" : ""} at ${avgPerSession}/avg
            </span>
          )}
        </p>
      )}
      {pct >= 100 && (
        <p className="text-xs text-green-400 font-semibold">
          Week target exceeded by $
          {(weekRevenue - target).toLocaleString()}
        </p>
      )}

      {/* Phase roadmap mini */}
      <div className="mt-4 pt-3 border-t border-dark-700">
        <p className="text-[10px] text-dark-500 uppercase tracking-wide mb-2">
          5-Year Weekly Targets
        </p>
        <div className="flex gap-1">
          {PHASES.map((p, i) => (
            <div
              key={i}
              className={`flex-1 text-center py-1.5 rounded text-[10px] ${
                i === phaseIndex
                  ? "bg-brand-500/20 text-brand-400 font-bold border border-brand-500/30"
                  : i < phaseIndex
                    ? "bg-green-500/10 text-green-500/60"
                    : "bg-dark-800 text-dark-500"
              }`}
            >
              <div className="font-semibold">
                ${p.weekly.toLocaleString()}
              </div>
              <div className="opacity-70">{p.year}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
