"use client";

import { useState } from "react";

export default function DailyBriefing({ stripeData, acuityData, igData }) {
  const [briefing, setBriefing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function generateBriefing() {
    setLoading(true);
    setError(null);

    const today = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    const prompt = `Generate Matt's daily business briefing. Today: ${today}.

LIVE DATA:
- Month revenue: $${stripeData?.monthRevenue || 0} / $9,000 target
- Year revenue: $${stripeData?.yearRevenue || 0} / $108,000 annual target
- Sessions this week: ${acuityData?.weekSessions || 0} / 18 target
- Instagram followers: ${igData?.followers || 0} / 300 target
- Active customers: ${stripeData?.customerCount || 0}
${stripeData?.recentCharges?.[0] ? `- Last charge: $${stripeData.recentCharges[0].amount} on ${new Date(stripeData.recentCharges[0].date).toLocaleDateString()}` : ""}

Write 3 sentences: (1) performance vs Phase 1 targets, (2) single most important action today, (3) one forward-looking strategic note. No filler.`;

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setBriefing(data.text);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-dark-300 uppercase tracking-wide">
            AI Daily Briefing
          </h3>
          <div className="live-dot" />
        </div>
        <button
          onClick={generateBriefing}
          disabled={loading}
          className="text-xs font-medium px-3 py-1.5 rounded-lg bg-brand-500 text-dark-950 hover:bg-brand-400 disabled:opacity-50 transition-colors"
        >
          {loading ? "Generating..." : briefing ? "Refresh" : "Generate Briefing"}
        </button>
      </div>

      {error && (
        <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          {error}
        </div>
      )}

      {briefing ? (
        <div className="text-sm text-dark-200 leading-relaxed whitespace-pre-wrap">
          {briefing}
        </div>
      ) : !loading && !error ? (
        <div className="text-sm text-dark-500 italic">
          Click &quot;Generate Briefing&quot; to get your AI-powered daily business intelligence.
        </div>
      ) : null}

      {loading && (
        <div className="space-y-2">
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-5/6" />
          <div className="skeleton h-4 w-4/6" />
        </div>
      )}
    </div>
  );
}
