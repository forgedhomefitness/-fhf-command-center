"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Invalid password");
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img
            src="https://images.squarespace-cdn.com/content/v1/691c9de736d12f2c644ca72a/07128094-32d9-4e22-bfee-0e850b821ae7/FullLogo.jpg?format=300w"
            alt="Forged Home Fitness"
            className="w-20 h-20 rounded-xl object-contain bg-navy-400/20 mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-brand-500 font-heading tracking-wider">
            COMMAND CENTER
          </h1>
          <p className="text-sm text-navy-100/50 mt-1">
            Forged Home Fitness
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-navy-100/50 mb-2 font-heading">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-dark-900 border border-dark-700 rounded-lg text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              placeholder="Enter access password"
              autoFocus
              required
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-brand py-3 text-base disabled:opacity-50"
          >
            {loading ? "Verifying..." : "ACCESS DASHBOARD"}
          </button>
        </form>

        <p className="text-center text-xs text-navy-100/30 mt-6">
          Authorized access only
        </p>
      </div>
    </div>
  );
}
