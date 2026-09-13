"use client";

import {
  Activity,
  AlertTriangle,
  ShieldCheck,
  Users,
} from "lucide-react";

interface AuditStatsProps {
  total: number;
  authentication: number;
  account: number;
  security: number;
}

const stats = [
  {
    key: "total",
    label: "Total Events",
    icon: Activity,
    gradient: "from-violet-500 to-fuchsia-500",
    background: "from-violet-50 to-fuchsia-50",
    iconBackground: "bg-violet-100 text-violet-600",
  },
  {
    key: "authentication",
    label: "Authentication",
    icon: ShieldCheck,
    gradient: "from-blue-500 to-cyan-500",
    background: "from-blue-50 to-cyan-50",
    iconBackground: "bg-blue-100 text-blue-600",
  },
  {
    key: "account",
    label: "Account & Profile",
    icon: Users,
    gradient: "from-emerald-500 to-teal-500",
    background: "from-emerald-50 to-teal-50",
    iconBackground: "bg-emerald-100 text-emerald-600",
  },
  {
    key: "security",
    label: "Security Events",
    icon: AlertTriangle,
    gradient: "from-orange-500 to-amber-500",
    background: "from-orange-50 to-amber-50",
    iconBackground: "bg-orange-100 text-orange-600",
  },
] as const;

export default function AuditStats({
  total,
  authentication,
  account,
  security,
}: AuditStatsProps) {
  const values = {
    total,
    authentication,
    account,
    security,
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.key}
            className={[
              "group relative overflow-hidden rounded-2xl border border-slate-200/80",
              "bg-gradient-to-br",
              stat.background,
              "p-5 shadow-sm transition-all duration-300",
              "hover:-translate-y-1 hover:shadow-lg",
            ].join(" ")}
          >
            {/* Decorative glow */}
            <div
              className={[
                "absolute -right-8 -top-8 h-24 w-24 rounded-full",
                "bg-gradient-to-br opacity-10 blur-2xl",
                stat.gradient,
              ].join(" ")}
            />

            <div className="relative flex items-start justify-between">
              <div
                className={[
                  "flex h-11 w-11 items-center justify-center rounded-xl",
                  stat.iconBackground,
                  "transition-transform duration-300 group-hover:scale-110",
                ].join(" ")}
              >
                <Icon className="h-5 w-5" strokeWidth={2.2} />
              </div>

              <div
                className={[
                  "h-1.5 w-10 rounded-full bg-gradient-to-r",
                  stat.gradient,
                ].join(" ")}
              />
            </div>

            <div className="relative mt-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {stat.label}
              </p>

              <p className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">
                {values[stat.key].toLocaleString()}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}