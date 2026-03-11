"use client";

import { formatCurrency, formatDate } from "@/lib/utils";

export default function RecentTransactions({ charges, loading }) {
  if (loading) {
    return (
      <div className="card">
        <h3 className="text-sm font-semibold text-dark-300 uppercase tracking-wide mb-4">
          Recent Transactions
        </h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between">
              <div className="skeleton h-4 w-40" />
              <div className="skeleton h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const list = charges || [];

  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-dark-300 uppercase tracking-wide mb-4">
        Recent Transactions
      </h3>
      {list.length === 0 ? (
        <p className="text-sm text-dark-500 italic">No transactions yet</p>
      ) : (
        <div className="space-y-2">
          {list.slice(0, 8).map((charge) => (
            <div
              key={charge.id}
              className="flex items-center justify-between py-2 border-b border-dark-700 last:border-0"
            >
              <div>
                <p className="text-sm text-white">{charge.description}</p>
                <p className="text-xs text-dark-500">
                  {formatDate(charge.date)}
                </p>
              </div>
              <span className="text-sm font-semibold text-green-400">
                +{formatCurrency(charge.amount)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
