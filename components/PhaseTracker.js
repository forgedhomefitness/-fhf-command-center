"use client";

import { PHASES } from "@/lib/constants";
import { getCurrentPhase, formatCurrency } from "@/lib/utils";

export default function PhaseTracker() {
  const currentPhase = getCurrentPhase();

  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-dark-300 uppercase tracking-wide mb-4">
        5-Year Growth Roadmap
      </h3>
      <div className="space-y-3">
        {PHASES.map((phase) => {
          const isActive = phase.phase === currentPhase;
          const isComplete = phase.phase < currentPhase;

          return (
            <div
              key={phase.phase}
              className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-brand-500/10 border border-brand-500/20"
                  : isComplete
                  ? "bg-dark-800/50 opacity-60"
                  : "bg-dark-800/30 opacity-40"
              }`}
            >
              {/* Phase indicator */}
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  isActive
                    ? "bg-brand-500 text-dark-950"
                    : isComplete
                    ? "bg-green-500/20 text-green-400"
                    : "bg-dark-700 text-dark-400"
                }`}
              >
                {isComplete ? "\u2713" : phase.phase}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">
                    {phase.label}
                  </span>
                  {isActive && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-full">
                      Current
                    </span>
                  )}
                </div>
                <div className="text-xs text-dark-400 mt-0.5">
                  {phase.year} — {formatCurrency(phase.annualTarget)}/yr target
                </div>
                {isActive && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {phase.milestones.map((m, i) => (
                      <span
                        key={i}
                        className="text-[10px] text-dark-300 bg-dark-700 px-2 py-0.5 rounded-full"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
