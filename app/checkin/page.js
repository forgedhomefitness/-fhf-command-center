"use client";

import { useState, useEffect } from "react";

export default function WeeklyCheckIn() {
  const [form, setForm] = useState({
    wins: "",
    blockers: "",
    addedClients: "",
    lostClients: "",
    notes: "",
  });
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [liveData, setLiveData] = useState(null);

  // Fetch live data for context
  useEffect(() => {
    async function fetchData() {
      const [stripe, acuity, ig] = await Promise.allSettled([
        fetch("/api/stripe").then((r) => r.json()),
        fetch("/api/acuity").then((r) => r.json()),
        fetch("/api/instagram").then((r) => r.json()),
      ]);
      setLiveData({
        stripe: stripe.status === "fulfilled" ? stripe.value : null,
        acuity: acuity.status === "fulfilled" ? acuity.value : null,
        ig: ig.status === "fulfilled" ? ig.value : null,
      });
    }
    fetchData();
  }, []);

  async function submitCheckIn(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const s = liveData?.stripe;
    const a = liveData?.acuity;
    const ig = liveData?.ig;

    const prompt = `Matt's weekly check-in. Analyze against 5-year plan.

LIVE DATA:
- Month revenue: $${s?.monthRevenue || 0} / $9,000 target
- Year revenue: $${s?.yearRevenue || 0} / $108,000 target
- Active customers: ${s?.customerCount || 0}
- Sessions this week: ${a?.weekSessions || 0} / 18 target
- Instagram followers: ${ig?.followers || 0} / 300 target

MATT'S NOTES:
- Wins: ${form.wins || "None listed"}
- Blockers: ${form.blockers || "None listed"}
- New clients: ${form.addedClients || "None"}
- Lost clients: ${form.lostClients || "None"}
- Notes: ${form.notes || "None"}

Respond with exactly this structure:
PERFORMANCE SNAPSHOT
WINS
WATCH POINTS
TOP 3 PRIORITIES NEXT WEEK
STRATEGIC INSIGHT`;

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAnalysis(data.text);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-2">Weekly Check-In</h1>
      <p className="text-sm text-dark-400 mb-6">
        Add your notes below. Live Stripe, Acuity, and Instagram data will be
        auto-injected into the AI analysis.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <form onSubmit={submitCheckIn} className="space-y-4">
          <Field
            label="Wins this week"
            placeholder="New client signed, hit session target, great feedback..."
            value={form.wins}
            onChange={(v) => setForm({ ...form, wins: v })}
          />
          <Field
            label="Blockers"
            placeholder="Scheduling conflicts, weather cancellations, equipment issues..."
            value={form.blockers}
            onChange={(v) => setForm({ ...form, blockers: v })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="New clients"
              placeholder="e.g. 2"
              value={form.addedClients}
              onChange={(v) => setForm({ ...form, addedClients: v })}
            />
            <Field
              label="Lost clients"
              placeholder="e.g. 0"
              value={form.lostClients}
              onChange={(v) => setForm({ ...form, lostClients: v })}
            />
          </div>
          <Field
            label="Other notes"
            placeholder="Anything else — ideas, opportunities, concerns..."
            value={form.notes}
            onChange={(v) => setForm({ ...form, notes: v })}
            multiline
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-brand-500 text-dark-950 font-semibold text-sm hover:bg-brand-400 disabled:opacity-50 transition-colors"
          >
            {loading ? "Analyzing..." : "Submit & Get AI Analysis"}
          </button>
        </form>

        {/* Analysis Result */}
        <div>
          {error && (
            <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
              {error}
            </div>
          )}

          {analysis ? (
            <div className="card">
              <h3 className="text-sm font-semibold text-brand-400 uppercase tracking-wide mb-4">
                AI Weekly Analysis
              </h3>
              <div className="text-sm text-dark-200 leading-relaxed whitespace-pre-wrap">
                {analysis}
              </div>
            </div>
          ) : (
            <div className="card flex items-center justify-center min-h-[300px]">
              <p className="text-sm text-dark-500 italic text-center">
                Fill in your weekly notes and submit to get a personalized AI
                analysis of your progress against the 5-year plan.
              </p>
            </div>
          )}

          {loading && (
            <div className="card mt-4 space-y-3">
              <div className="skeleton h-4 w-48" />
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-5/6" />
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-3/4" />
            </div>
          )}

          {/* Live data status */}
          <div className="card mt-4">
            <h4 className="text-xs text-dark-500 uppercase tracking-wide mb-2">
              Auto-injected Live Data
            </h4>
            <div className="space-y-1 text-xs">
              <StatusDot
                label="Stripe"
                connected={liveData?.stripe?.connected}
              />
              <StatusDot
                label="Acuity"
                connected={liveData?.acuity?.connected}
              />
              <StatusDot
                label="Instagram"
                connected={liveData?.ig?.connected}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, placeholder, value, onChange, multiline }) {
  const cls =
    "w-full bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white placeholder-dark-500 focus:border-brand-500 focus:outline-none transition-colors";
  return (
    <div>
      <label className="block text-xs font-medium text-dark-300 mb-1.5">
        {label}
      </label>
      {multiline ? (
        <textarea
          className={`${cls} resize-none h-24`}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className={cls}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}

function StatusDot({ label, connected }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-1.5 h-1.5 rounded-full ${
          connected ? "bg-green-400" : "bg-dark-500"
        }`}
      />
      <span className={connected ? "text-dark-300" : "text-dark-500"}>
        {label} — {connected ? "Connected" : "Not connected"}
      </span>
    </div>
  );
}
