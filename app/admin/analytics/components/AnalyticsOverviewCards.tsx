"use client";

import {
  Activity,
  Package,
  Star,
  Users,
  type LucideIcon,
} from "lucide-react";

import type { AnalyticsOverview } from "@/lib/api/analytics";

/* =========================================================
   TYPES
========================================================= */

interface AnalyticsOverviewCardsProps {
  data: AnalyticsOverview;
}

interface OverviewCardConfig {
  key: string;
  title: string;
  total: number;
  secondary: number;
  secondaryLabel: string;
  icon: LucideIcon;
  iconWrapperClass: string;
  iconClass: string;
  accentClass: string;
  secondaryClass: string;
}

/* =========================================================
   HELPERS
========================================================= */

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-IN").format(value);
}

/* =========================================================
   COMPONENT
========================================================= */

export default function AnalyticsOverviewCards({
  data,
}: AnalyticsOverviewCardsProps) {
  const cards: OverviewCardConfig[] = [
    {
      key: "users",
      title: "Users",
      total: data.users.total,
      secondary: data.users.active,
      secondaryLabel: "Active users",
      icon: Users,
      iconWrapperClass:
        "bg-blue-50 ring-blue-100",
      iconClass: "text-blue-600",
      accentClass:
        "from-blue-500 to-cyan-500",
      secondaryClass:
        "bg-blue-50 text-blue-700 ring-blue-100",
    },
    {
      key: "products",
      title: "Products",
      total: data.products.total,
      secondary: data.products.active,
      secondaryLabel: "Active products",
      icon: Package,
      iconWrapperClass:
        "bg-violet-50 ring-violet-100",
      iconClass: "text-violet-600",
      accentClass:
        "from-violet-500 to-fuchsia-500",
      secondaryClass:
        "bg-violet-50 text-violet-700 ring-violet-100",
    },
    {
      key: "reviews",
      title: "Reviews",
      total: data.reviews.total,
      secondary: data.reviews.published,
      secondaryLabel: "Published reviews",
      icon: Star,
      iconWrapperClass:
        "bg-amber-50 ring-amber-100",
      iconClass: "text-amber-600",
      accentClass:
        "from-amber-400 to-orange-500",
      secondaryClass:
        "bg-amber-50 text-amber-700 ring-amber-100",
    },
  ];

  return (
    <section
      aria-labelledby="analytics-overview-heading"
      className="mb-6"
    >
      {/* Section heading */}
      <div className="mb-4 flex min-w-0 items-center gap-2 px-0.5">
        <Activity
          className="h-4 w-4 shrink-0 text-slate-400"
          strokeWidth={2}
        />

        <h2
          id="analytics-overview-heading"
          className="whitespace-nowrap text-sm font-bold uppercase tracking-wider text-slate-500"
        >
          Platform Overview
        </h2>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              key={card.key}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
            >
              {/* Top accent */}
              <div
                className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${card.accentClass}`}
                aria-hidden="true"
              />

              {/* Top row */}
              <div className="flex items-start justify-between gap-3">
                {/* Icon */}
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ${card.iconWrapperClass}`}
                >
                  <Icon
                    className={`h-5 w-5 ${card.iconClass}`}
                    strokeWidth={2}
                  />
                </div>

                {/* Secondary metric */}
                <span
                  className={`max-w-[65%] rounded-full px-2.5 py-1 text-right text-[11px] font-semibold leading-4 ring-1 ${card.secondaryClass}`}
                >
                  {formatNumber(card.secondary)}{" "}
                  {card.secondaryLabel}
                </span>
              </div>

              {/* Main metric */}
              <div className="mt-5">
                <p className="text-sm font-medium text-slate-500">
                  {card.title}
                </p>

                <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                  {formatNumber(card.total)}
                </p>
              </div>

              {/* Footer */}
              <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                <span className="text-xs text-slate-400">
                  Total on platform
                </span>

                <span className="shrink-0 text-xs font-semibold text-slate-500">
                  {formatNumber(card.secondary)} active
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}