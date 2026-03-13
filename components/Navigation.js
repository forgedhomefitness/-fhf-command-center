"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: BarChartIcon },
  { href: "/clients", label: "Clients", icon: UsersIcon },
  { href: "/leads", label: "Lead Pipeline", icon: FunnelIcon },
  { href: "/finances", label: "Finances", icon: DollarIcon },
  { href: "/checkin", label: "Weekly Check-In", icon: ClipboardIcon },
  { href: "/tasks", label: "Tasks", icon: ChecklistIcon },
  { href: "/settings", label: "Integrations", icon: GearIcon },
];

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 md:hidden bg-dark-800 border border-dark-700 rounded-lg p-2"
      >
        <svg className="w-6 h-6 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {mobileOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <nav className={`fixed top-0 left-0 h-full w-64 bg-navy-500 border-r border-navy-400/20 z-40 transform transition-transform duration-200 ${mobileOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
        <div className="p-6">
          {/* FHF Logo */}
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <img
                src="https://images.squarespace-cdn.com/content/v1/691c9de736d12f2c644ca72a/07128094-32d9-4e22-bfee-0e850b821ae7/FullLogo.jpg?format=300w"
                alt="Forged Home Fitness"
                className="w-12 h-12 rounded-lg object-contain bg-navy-400/20"
              />
              <div>
                <h1 className="text-sm font-bold text-brand-500 leading-tight font-heading tracking-wider">
                  FORGED HOME FITNESS
                </h1>
                <p className="text-xs text-navy-100/60">Command Center</p>
              </div>
            </div>
          </div>

          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-brand-500/15 text-brand-500"
                        : "text-navy-100/70 hover:text-white hover:bg-navy-400/20"
                    }`}
                  >
                    <item.icon active={isActive} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-navy-400/20">
          <div className="text-xs text-navy-100/40 uppercase tracking-wider font-heading">Current Phase</div>
          <div className="text-sm font-medium text-brand-500 font-heading">Phase 1 — Build Foundation</div>
          <div className="text-xs text-navy-100/50 mt-1">2026 Target: $108K</div>

          <button
            onClick={handleLogout}
            className="mt-4 flex items-center gap-2 text-xs text-navy-100/40 hover:text-red-400 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </nav>
    </>
  );
}

function BarChartIcon({ active }) {
  return (
    <svg className={`w-5 h-5 ${active ? "text-brand-500" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3v18h18M7 16v-4m4 4v-8m4 8v-6m4 6v-10" />
    </svg>
  );
}

function UsersIcon({ active }) {
  return (
    <svg className={`w-5 h-5 ${active ? "text-brand-500" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function FunnelIcon({ active }) {
  return (
    <svg className={`w-5 h-5 ${active ? "text-brand-500" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
  );
}

function DollarIcon({ active }) {
  return (
    <svg className={`w-5 h-5 ${active ? "text-brand-500" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ClipboardIcon({ active }) {
  return (
    <svg className={`w-5 h-5 ${active ? "text-brand-500" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  );
}

function ChecklistIcon({ active }) {
  return (
    <svg className={`w-5 h-5 ${active ? "text-brand-500" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14" />
    </svg>
  );
}

function GearIcon({ active }) {
  return (
    <svg className={`w-5 h-5 ${active ? "text-brand-500" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
