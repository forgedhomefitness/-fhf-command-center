"use client";

import { useState, useEffect, useCallback } from "react";
import MetricCard from "@/components/MetricCard";
import PhaseTracker from "@/components/PhaseTracker";
import DailyBriefing from "@/components/DailyBriefing";
import RecentTransactions from "@/components/RecentTransactions";
import UpcomingSessions from "@/components/UpcomingSessions";
import { timeAgo } from "@/lib/utils";

const REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes

export default function Dashboard() {
  const [stripe, setStripe] = useState(null);
  const [acuity, setAcuity] = useState(null);
  const [quickbooks, setQuickbooks] = useState(null);
  const [instagram, setInstagram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [stripeRes, acuityRes, qbRes, igRes] = await Promise.allSettled([
      fetch("/api/stripe").then((r) => r.json()),
      fetch("/api/acuity").then((r) => r.json()),
      fetch("/api/quickbooks").then((r) => r.json()),
      fetch("/api/instagram").then((r) => r.json()),
    ]);

    if (stripeRes.status === "fulfilled") setStripe(stripeRes.value);
    if (acuityRes.status === "fulfilled") setAcuity(acuityRes.value);
    if (qbRes.status === "fulfilled") setQuickbooks(qbRes.value);
    if (igRes.status === "fulfilled") setInstagram(igRes.value);

    setLastRefresh(new Date().toISOString());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchAll]);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
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

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="Month Revenue"
          value={stripe?.monthRevenue}
          target={9000}
          format="currency"
          loading={loading && !stripe}
        />
        <MetricCard
          label="Year Revenue"
          value={stripe?.yearRevenue}
          target={108000}
          format="currency"
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
      </div>

      {/* AI Briefing */}
      <div className="mb-6">
        <DailyBriefing
          stripeData={stripe}
          acuityData={acuity}
          igData={instagram}
        />
      </div>

      {/* Two-column layout: Transactions + Sessions | Phase Tracker */}
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

          {/* QuickBooks P&L Summary */}
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

        <div>
          <PhaseTracker />

          {/* Instagram Engagement */}
          {instagram?.connected && (
            <div className="card mt-6">
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
                      <p className="truncate">{post.caption || "No caption"}</p>
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
