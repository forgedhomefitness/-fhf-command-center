"use client";

import { formatCurrency, progressPercent } from "@/lib/utils";

export default function MetricCard({
  label,
  value,
  target,
  format = "currency",
  icon,
  trend,
  subtitle,
  loading,
}) {
  if (loading) {
    return (
      <div className="metric-card">
        <div className="skeleton h-4 w-24 mb-3" />
        <div className="skeleton h-8 w-32 mb-2" />
        <div className="skeleton h-2 w-full" />
      </div>
    );
  }

  const displayValue =
    format === "currency"
      ? formatCurrency(value || 0)
      : (value || 0).toLocaleString();

  const pct = target ? progressPercent(value || 0, target) : null;

  return (
    <div className="metric-card">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-dark-400 uppercase tracking-wide">
          {label}
        </span>
        {icon && <span className="text-lg">{icon}</span>}
      </div>
      <div className="flex items-end gap-2 mb-1">
        <span className="text-2xl font-bold text-white">{displayValue}</span>
        {target && (
          <span className="text-sm text-dark-400 mb-0.5">
            / {format === "currency" ? formatCurrency(target) : target}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="text-xs text-green-300 font-medium mb-1">{subtitle}</p>
      )}
      {pct !== null && (
        <div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-dark-500">{pct}% of target</span>
            {trend && (
              <span
                className={`text-xs font-medium ${
                  trend > 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {trend > 0 ? "+" : ""}
                {trend}%
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
