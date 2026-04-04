"use client";

import { useState, useEffect, useCallback } from "react";
import MetricCard from "@/components/MetricCard";
import PhaseTracker from "@/components/PhaseTracker";
import DailyBriefing from "@/components/DailyBriefing";
import RecentTransactions from "@/components/RecentTransactions";
import UpcomingSessions from "@/components/UpcomingSessions";
import WeeklyRevenueGoal from "@/components/WeeklyRevenueGoal";
import MonthlyRevenue from "@/components/MonthlyRevenue";
import WebsiteVisits from "@/components/WebsiteVisits";
import { timeAgo } from "@/lib/utils";

const REFRESH_INTERVAL = 30 * 60 * 1000;

function WingateCountdown() {
  const target = new Date("2026-07-01");
  const now = new Date();
  const daysLeft = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  const totalDays = Math.ceil(
    (target - new Date("2026-03-01")) / (1000 * 60 * 60 * 24)
  );
  const pct = Math.max(
    0,
    Math.min(100, Math.round(((totalDays - daysLeft) / totalDays) * 100))
  );

  const checklist = [
    { text: "Finalize contract terms", done: false },
    { text: "Additional Insured endorsement", done: false },
    { text: "Group fitness curriculum planned", done: false },
    { text: "Equipment list confirmed", done: false },
    { text: "Launch date locked", done: false },
  ];

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-dark-300 uppercase tracking-wide">
          Wingate Way East
        </h3>
        <span className="text-xs font-medium text-brand-400 bg-brand-500/10 px-2 py-1 rounded">
          {daysLeft > 0 ? `${daysLeft} days to launch` : "LAUNCHED"}
        </span>
      </div>
      <p className="text-xs text-dark-400 mb-3">
        July 1, 2026 · ~$2,600/mo guaranteed
      </p>
      <div className="w-full bg-dark-700 rounded-full h-2 mb-4">
        <div
          className="bg-brand-500 h-2 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="space-y-2">
        {checklist.map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <div
              className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                item.done
                  ? "bg-brand-500 border-brand-500"
                  : "border-dark-500"
              }`}
            >
              {item.done && (
                <svg
                  className="w-2.5 h-2.5 text-dark-950"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
            <span
              className={
                item.done ? "text-dark-500 line-through" : "text-dark-300"
              }
            >
              {item.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SessionPaceTracker({ weekSessions, lastWeekSessions }) {
  const target = 18;
  const current = weekSessions ?? 0;
  const last = lastWeekSessions ?? 0;
  const trend = current - last;
  const pct = Math.min(100, Math.round((current / target) * 100));
  const color =
    pct >= 80 ? "bg-green-500" : pct >= 50 ? "bg-yellow-500" : "bg-red-500";

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-dark-300 uppercase tracking-wide">
          Session Pace
        </h3>
        <span
          className={`text-xs font-medium px-2 py-1 rounded ${
            pct >= 80
              ? "text-green-400 bg-green-500/10"
              : pct >= 50
                ? "text-yellow-400 bg-yellow-500/10"
                : "text-red-400 bg-red-500/10"
          }`}
        >
          {pct >= 80 ? "On Track" : pct >= 50 ? "Behind" : "At Risk"}
        </span>
      </div>
      <div className="flex items-end gap-3 mb-3">
        <span className="text-3xl font-bold text-white">{current}</span>
        <span className="text-dark-400 text-sm mb-1">
          / {target} sessions this week
        </span>
        {last > 0 && (
          <span
            className={`text-xs mb-1 ${
              trend >= 0 ? "text-green-400" : "text-red-400"
            }`}
          >
            {trend >= 0 ? "+" : ""}
            {trend} vs last week
          </span>
        )}
      </div>
      <div className="w-full bg-dark-700 rounded-full h-2.5">
        <div
          className={`${color} h-2.5 rounded-full transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-dark-500 mt-2">
        Target: 18-20 sessions/week for Phase 1 ($108K)
      </p>
    </div>
  );
}

export default function Dashboard() {
  const [stripe, setStripe] = useState(null);
  const [acuity, setAcuity] = useState(null);
  const [quickbooks, setQuickbooks] = useState(null);
  const [instagram, setInstagram] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [stripeRes, acuityRes, qbRes, igRes, analyticsRes] = await Promise.allSettled([
      fetch("/api/stripe").then((r) => r.json()),
      fetch("/api/acuity").then((r) => r.json()),
      fetch("/api/quickbooks").then((r) => r.json()),
      fetch("/api/instagram").then((r) => r.json()),
      fetch("/api/analytics").then((r) => r.json()),
    ]);

    if (stripeRes.status === "fulfilled") setStripe(stripeRes.value);
    if (acuityRes.status === "fulfilled") setAcuity(acuityRes.value);
    if (qbRes.status === "fulfilled") setQuickbooks(qbRes.value);
    if (igRes.status === "fulfilled") setInstagram(igRes.value);
    if (analyticsRes.status === "fulfilled") setAnalytics(analyticsRes.value);

    setLastRefresh(new Date().toISOString());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchAll]);

  // Calculate net revenue for Year Revenue card
  const yearGross = stripe?.yearRevenue || 0;
  const yearNet = stripe?.yearNetRevenue || 0;

  // Calculate net for weekly revenue
  const weekGross = acuity?.weekRevenue ?? 0;
  const weekSessions = acuity?.weekSessions ?? 0;
  const weekStripeFees =
    Math.round((weekGross * 0.029 + weekSessions * 0.3) * 100) / 100;
  const weekNet = Math.round((weekGross - weekStripeFees) * 100) / 100;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-dark-400">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastRefresh && (
            <span className="text-xs text-dark-500">
              Updated {timeAgo(lastRefresh)}
            </span>
          )}
          <button
            onClick={fetchAll}
            disabled={loading}
            className="text-xs font-medium px-4 py-2 rounded-lg border border-dark-600 text-dark-300 hover:text-white hover:border-dark-500 disabled:opacity-50 transition-colors"
          >
            {loading ? "Refreshing..." : "Refresh Data"}
          </button>
        </div>
      </div>

      {/* Monthly Revenue — Top of Dashboard */}
      <MonthlyRevenue
        acuityData={acuity}
        stripeData={stripe}
        loading={loading && !acuity && !stripe}
      />

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <MetricCard
          label="Month Revenue"
          value={acuity?.monthEarnedRevenue ?? stripe?.monthRevenue}
          target={9000}
          format="currency"
          subtitle={stripe?.monthNetRevenue > 0 ? `Net: $${Math.round(stripe.monthNetRevenue).toLocaleString()}` : null}
          loading={loading && !acuity && !stripe}
        />
        <MetricCard
          label="Year Revenue"
          value={yearGross}
          target={108000}
          format="currency"
          subtitle={yearNet > 0 ? `Net: $${Math.round(yearNet).toLocaleString()}` : null}
          loading={loading && !stripe}
        />
        <MetricCard
          label="Sessions This Week"
          value={acuity?.weekSessions}
          target={18}
          format="number"
          loading={loading && !acuity}
        />
        <MetricCard
          label="Instagram Followers"
          value={instagram?.followers}
          target={300}
          format="number"
          loading={loading && !instagram}
        />
        <WebsiteVisits analytics={analytics} loading={loading && !analytics} />
        <div className="card">
          <p className="text-xs font-semibold text-dark-300 uppercase tracking-wide mb-2">
            Wingate Launch
          </p>
          <div className="flex items-end gap-2 mb-2">
            <span className="text-3xl font-bold text-brand-400">
              {Math.ceil(
                (new Date("2026-07-01") - new Date()) /
                  (1000 * 60 * 60 * 24)
              )}
            </span>
            <span className="text-dark-400 text-sm mb-1">days</span>
          </div>
          <p className="text-xs text-dark-500">July 1, 2026 · +$2,600/mo</p>
        </div>
      </div>

      {/* Weekly Revenue Goal */}
      <div className="mb-6">
        <WeeklyRevenueGoal
          weekRevenue={weekGross}
          weekSessions={weekSessions}
          weekNetRevenue={weekNet}
          weekStripeFees={weekStripeFees}
        />
      </div>

      {/* Session Pace Tracker */}
      <div className="mb-6">
        <SessionPaceTracker
          weekSessions={acuity?.weekSessions}
          lastWeekSessions={acuity?.lastWeekSessions}
        />
      </div>

      {/* AI Briefing */}
      <div className="mb-6">
        <DailyBriefing
          stripeData={stripe}
          acuityData={acuity}
          igData={instagram}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <RecentTransactions
            charges={stripe?.recentCharges}
            loading={loading && !stripe}
          />
          <UpcomingSessions
            sessions={acuity?.upcoming}
            loading={loading && !acuity}
          />
          {quickbooks?.connected && (
            <div className="card">
              <h3 className="text-sm font-semibold text-dark-300 uppercase tracking-wide mb-4">
                QuickBooks P&L — {quickbooks.period}
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-dark-400">Income</p>
                  <p className="text-lg font-bold text-green-400">
                    ${quickbooks.totalIncome.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-dark-400">Expenses</p>
                  <p className="text-lg font-bold text-red-400">
                    ${quickbooks.totalExpenses.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-dark-400">Net Income</p>
                  <p
                    className={`text-lg font-bold ${
                      quickbooks.netIncome >= 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    ${quickbooks.netIncome.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <PhaseTracker />
          <WingateCountdown />
          {instagram?.connected && (
            <div className="card">
              <h3 className="text-sm font-semibold text-dark-300 uppercase tracking-wide mb-3">
                Instagram — @{instagram.username}
              </h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <p className="text-xs text-dark-400">Followers</p>
                  <p className="text-lg font-bold text-white">
                    {instagram.followers}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-dark-400">Avg Engagement</p>
                  <p className="text-lg font-bold text-white">
                    {instagram.avgEngagement}
                  </p>
                </div>
              </div>
              {instagram.recentPosts?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-dark-500">Recent Posts</p>
                  {instagram.recentPosts.slice(0, 3).map((post) => (
                    <div
                      key={post.id}
                      className="text-xs text-dark-300 p-2 bg-dark-800/50 rounded"
                    >
                      <p className="truncate">
                        {post.caption || "No caption"}
                      </p>
                      <p className="text-dark-500 mt-1">
                        {post.likes} likes · {post.comments} comments
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
