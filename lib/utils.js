// ============================================
// Utility functions
// ============================================

/**
 * Get start of current month as Unix timestamp (seconds)
 */
export function getMonthStartTimestamp() {
  const now = new Date();
  return Math.floor(new Date(now.getFullYear(), now.getMonth(), 1).getTime() / 1000);
}

/**
 * Get start of current year as Unix timestamp (seconds)
 */
export function getYearStartTimestamp() {
  const now = new Date();
  return Math.floor(new Date(now.getFullYear(), 0, 1).getTime() / 1000);
}

/**
 * Get start and end of current week (Monday-Sunday) as ISO date strings
 */
export function getWeekRange() {
  const now = new Date();
  const day = now.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return {
    start: monday.toISOString().split("T")[0],
    end: sunday.toISOString().split("T")[0],
  };
}

/**
 * Format currency
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date for display
 */
export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format time for display
 */
export function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Calculate progress percentage (capped at 100)
 */
export function progressPercent(current, target) {
  if (!target) return 0;
  return Math.min(Math.round((current / target) * 100), 100);
}

/**
 * Get current phase index (0-based) based on year
 * Phase 1=2026 (idx 0), Phase 2=2027 (idx 1), Phase 3=2028 (idx 2), Phase 4=2029 (idx 3), Phase 5=2030+ (idx 4)
 */
export function getCurrentPhaseIndex() {
  const year = new Date().getFullYear();
  if (year <= 2026) return 0;
  if (year === 2027) return 1;
  if (year === 2028) return 2;
  if (year === 2029) return 3;
  return 4;
}

// Keep backward compat — returns 1-based phase number
export function getCurrentPhase() {
  return getCurrentPhaseIndex() + 1;
}

/**
 * Relative time string (e.g. "5 min ago", "2 hours ago")
 */
export function timeAgo(dateStr) {
  if (!dateStr) return "Never";
  const now = new Date();
  const then = new Date(dateStr);
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}
