"use client";

import {
  Activity,
  Search,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

type AuditTab = "audit" | "sessions" | "search";

interface AuditTabsProps {
  activeTab: AuditTab;
  onChange: (tab: AuditTab) => void;
}

const tabs = [
  {
    id: "audit" as const,
    label: "Audit Logs",
    description: "Activity & security events",
    icon: ShieldCheck,
    iconClass:
      "bg-violet-100 text-violet-600 group-hover:bg-violet-600 group-hover:text-white",
    activeClass:
      "border-violet-200 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 shadow-[0_8px_30px_rgba(124,58,237,0.10)]",
  },
  {
    id: "sessions" as const,
    label: "Sessions",
    description: "Login & device sessions",
    icon: Smartphone,
    iconClass:
      "bg-cyan-100 text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white",
    activeClass:
      "border-cyan-200 bg-gradient-to-br from-cyan-50 via-white to-blue-50 shadow-[0_8px_30px_rgba(6,182,212,0.10)]",
  },
  {
    id: "search" as const,
    label: "Search History",
    description: "User search activity",
    icon: Search,
    iconClass:
      "bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white",
    activeClass:
      "border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-teal-50 shadow-[0_8px_30px_rgba(16,185,129,0.10)]",
  },
];

export default function AuditTabs({
  activeTab,
  onChange,
}: AuditTabsProps) {
  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-2 shadow-[0_10px_40px_rgba(15,23,42,0.06)] backdrop-blur">
      <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={[
                "group relative flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-violet-500/30",
                active
                  ? `${tab.activeClass} translate-y-[-1px]`
                  : "border-transparent bg-slate-50/70 hover:border-slate-200 hover:bg-white hover:shadow-sm",
              ].join(" ")}
            >
              <div
                className={[
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all duration-200",
                  tab.iconClass,
                  active && "shadow-sm",
                ].join(" ")}
              >
                <Icon className="h-5 w-5" strokeWidth={2.2} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-bold text-slate-900">
                    {tab.label}
                  </span>

                  {active && (
                    <span className="h-1.5 w-1.5 rounded-full bg-violet-500 shadow-[0_0_0_4px_rgba(139,92,246,0.10)]" />
                  )}
                </div>

                <p className="mt-0.5 truncate text-xs font-medium text-slate-500">
                  {tab.description}
                </p>
              </div>

              <Activity
                className={[
                  "h-4 w-4 transition-all",
                  active
                    ? "text-violet-500 opacity-100"
                    : "text-slate-300 opacity-0 group-hover:opacity-100",
                ].join(" ")}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}