"use client";

import { formatDate } from "@/lib/utils";

export default function UpcomingSessions({ sessions, loading }) {
  if (loading) {
    return (
      <div className="card">
        <h3 className="text-sm font-semibold text-dark-300 uppercase tracking-wide mb-4">
          Upcoming Sessions
        </h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-12 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const list = sessions || [];

  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-dark-300 uppercase tracking-wide mb-4">
        Upcoming Sessions
      </h3>
      {list.length === 0 ? (
        <p className="text-sm text-dark-500 italic">No upcoming sessions</p>
      ) : (
        <div className="space-y-2">
          {list.slice(0, 6).map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between p-3 bg-dark-800/50 rounded-lg"
            >
              <div>
                <p className="text-sm font-medium text-white">{s.client}</p>
                <p className="text-xs text-dark-400">{s.type}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-dark-200">{s.time}</p>
                <p className="text-xs text-dark-500">{formatDate(s.date)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
