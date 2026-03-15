"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

const INTEGRATIONS = [
  {
    id: "stripe",
    name: "Stripe",
    description: "Payment processing — revenue tracking, customer count, transactions",
    endpoint: "/api/stripe",
    envKeys: ["STRIPE_SECRET_KEY"],
    setupUrl: "https://dashboard.stripe.com/apikeys",
    setupSteps: [
      "Go to Stripe Dashboard → Developers → API Keys",
      "Copy your Secret Key (starts with sk_live_)",
      "Add as STRIPE_SECRET_KEY in Vercel environment variables",
    ],
  },
  {
    id: "acuity",
    name: "Acuity Scheduling",
    description: "Session tracking — weekly bookings, upcoming appointments",
    endpoint: "/api/acuity",
    envKeys: ["ACUITY_USER_ID", "ACUITY_API_KEY"],
    setupUrl: "https://acuityscheduling.com/",
    setupSteps: [
      "Go to Acuity → Business Settings → Integrations → API",
      "Copy your User ID (number) and API Key",
      "Add as ACUITY_USER_ID and ACUITY_API_KEY in Vercel",
    ],
  },
  {
    id: "quickbooks",
    name: "QuickBooks Online",
    description: "Financial data — P&L reports, income/expenses",
    endpoint: "/api/quickbooks",
    envKeys: ["QB_ACCESS_TOKEN", "QB_REALM_ID"],
    setupUrl: "https://developer.intuit.com/",
    setupSteps: [
      "Go to developer.intuit.com → your app → Sandbox/Production",
      "Copy your Access Token and Company ID (Realm ID)",
      "Add as QB_ACCESS_TOKEN and QB_REALM_ID in Vercel",
      "Token auto-refreshes daily via keepalive cron. Click Reconnect above if connection fails.",
    ],
  },
  {
    id: "instagram",
    name: "Instagram",
    description: "Social metrics — follower count, engagement, recent posts",
    endpoint: "/api/instagram",
    envKeys: ["INSTAGRAM_ACCESS_TOKEN"],
    setupUrl: "https://developers.facebook.com/",
    setupSteps: [
      "Create a Facebook Developer App with instagram_basic scope",
      "Connect your Instagram Business Account",
      "Generate a Long-Lived User Access Token",
      "Add as INSTAGRAM_ACCESS_TOKEN in Vercel",
    ],
  },
  {
    id: "ai",
    name: "Claude AI (Anthropic)",
    description: "AI engine — daily briefings, weekly analysis, business intelligence",
    endpoint: "/api/ai",
    envKeys: ["ANTHROPIC_API_KEY"],
    setupUrl: "https://console.anthropic.com/",
    setupSteps: [
      "Go to console.anthropic.com → API Keys",
      "Create a new API key",
      "Add as ANTHROPIC_API_KEY in Vercel",
    ],
  },
];

export default function Settings() {
  const [statuses, setStatuses] = useState({});
  const searchParams = useSearchParams();
  const qbParam = searchParams.get("qb");
  const [qbMessage, setQbMessage] = useState(null);

  useEffect(() => {

          {qbMessage && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${qbMessage.type === "success" ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"}`}>
              {qbMessage.text}
            </div>
          )}
    if (qbParam === "connected") {
      setQbMessage({ type: "success", text: "QuickBooks reconnected successfully!" });
      window.history.replaceState({}, "", "/settings");
    } else if (qbParam === "error") {
      const reason = searchParams.get("reason") || "unknown";
      setQbMessage({ type: "error", text: "QuickBooks reconnection failed: " + reason });
    }
  }, [qbParam, searchParams]);

  const [testing, setTesting] = useState({});

  async function testConnection(integration) {
    setTesting((prev) => ({ ...prev, [integration.id]: true }));
    try {
      const method = integration.id === "ai" ? "POST" : "GET";
      const options =
        method === "POST"
          ? {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ prompt: "Say 'Connection successful' in 3 words." }),
            }
          : {};

      const res = await fetch(integration.endpoint, options);
      const data = await res.json();

      setStatuses((prev) => ({
        ...prev,
        [integration.id]: {
          connected: data.connected !== false && !data.error,
          message: data.error || "Connected",
          lastChecked: new Date().toISOString(),
        },
      }));
    } catch (err) {
      setStatuses((prev) => ({
        ...prev,
        [integration.id]: {
          connected: false,
          message: err.message,
          lastChecked: new Date().toISOString(),
        },
      }));
    } finally {
      setTesting((prev) => ({ ...prev, [integration.id]: false }));
    }
  }

  // Test all on mount
  useEffect(() => {
    INTEGRATIONS.forEach((i) => testConnection(i));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const connectedCount = Object.values(statuses).filter(
    (s) => s.connected
  ).length;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-2">Integrations</h1>
      <p className="text-sm text-dark-400 mb-6">
        {connectedCount}/{INTEGRATIONS.length} platforms connected. API keys are
        stored as Vercel environment variables — never in code.
      </p>

      <div className="space-y-4">
        {INTEGRATIONS.map((integration) => {
          const status = statuses[integration.id];
          const isTesting = testing[integration.id];

          return (
            <div key={integration.id} className="card">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {/* Status dot */}
                  <div
                    className={`w-3 h-3 rounded-full flex-shrink-0 ${
                      isTesting
                        ? "bg-yellow-400 animate-pulse"
                        : status?.connected
                        ? "bg-green-400"
                        : "bg-dark-500"
                    }`}
                  />
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      {integration.name}
                    </h3>
                    <p className="text-xs text-dark-400">
                      {integration.description}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => testConnection(integration)}
                  disabled={isTesting}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg border border-dark-600 text-dark-300 hover:text-white hover:border-dark-500 disabled:opacity-50 transition-colors"
                >
                  {isTesting ? "Testing..." : "Test"}
                </button>
              </div>

              {/* Status message */}
              {status && (
                <div
                  className={`text-xs px-3 py-2 rounded-lg mb-3 ${
                    status.connected
                      ? "bg-green-500/10 text-green-400"
                      : "bg-red-500/10 text-red-400"
                  }`}
                >
                  {status.message}
                </div>
              )}

              {/* Setup instructions */}
              <details className="group">
                <summary className="text-xs text-dark-500 cursor-pointer hover:text-dark-300 transition-colors">
                  Setup instructions
                </summary>
                <div className="mt-2 pl-4 border-l-2 border-dark-700 space-y-1.5">
                  {integration.setupSteps.map((step, i) => (
                    <p key={i} className="text-xs text-dark-400">
                      {i + 1}. {step}
                    </p>
                  ))}
                  <p className="text-xs mt-2">
                    <a
                      href={integration.setupUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-400 hover:text-brand-300 transition-colors"
                    >
                      Open {integration.name} →
                    </a>
                  </p>
                  <p className="text-xs text-dark-500 mt-1">
                    Env vars needed:{" "}
                    {integration.envKeys.map((k) => (
                      <code
                        key={k}
                        className="text-dark-300 bg-dark-800 px-1 py-0.5 rounded mx-0.5"
                      >
                        {k}
                      </code>
                    ))}
                  </p>
                </div>
              </details>
            </div>
          );
        })}
      </div>

      {/* Vercel deployment note */}
      <div className="card mt-6 border-brand-500/20">
        <h3 className="text-sm font-semibold text-brand-400 mb-2">
          Updating API Keys
        </h3>
        <p className="text-xs text-dark-300 leading-relaxed">
          All API keys live in Vercel environment variables. To update: go to
          your Vercel project → Settings → Environment Variables. After changing
          a key, redeploy for changes to take effect. Never put API keys in the
          source code.
        </p>
      </div>
    </div>
  );
}
