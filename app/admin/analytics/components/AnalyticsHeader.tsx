"use client";

import {
  CalendarDays,
  RefreshCw,
  Sparkles,
} from "lucide-react";

export type AnalyticsRange =
  | 7
  | 30
  | 90
  | 365;

interface AnalyticsHeaderProps {
  range: AnalyticsRange;
  onRangeChange: (range: AnalyticsRange) => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

const RANGE_OPTIONS: Array<{
  value: AnalyticsRange;
  label: string;
}> = [
  {
    value: 7,
    label: "7 Days",
  },
  {
    value: 30,
    label: "30 Days",
  },
  {
    value: 90,
    label: "90 Days",
  },
  {
    value: 365,
    label: "1 Year",
  },
];

export default function AnalyticsHeader({
  range,
  onRangeChange,
  onRefresh,
  isRefreshing = false,
}: AnalyticsHeaderProps) {
  return (
    <header className="mb-6">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Premium accent */}
        <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500" />

        <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          {/* =====================================================
              TITLE
          ===================================================== */}
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-white shadow-lg shadow-indigo-200">
              <Sparkles
                className="h-6 w-6"
                strokeWidth={2}
              />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                  Analytics
                </h1>

                <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700">
                  Admin
                </span>
              </div>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                Monitor users, products, searches, engagement,
                and platform activity from one place.
              </p>
            </div>
          </div>

          {/* =====================================================
              CONTROLS
          ===================================================== */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Date range */}
            <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
              <div className="hidden items-center px-2 text-slate-400 sm:flex">
                <CalendarDays
                  className="h-4 w-4"
                  strokeWidth={2}
                />
              </div>

              {RANGE_OPTIONS.map((option) => {
                const isActive = option.value === range;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      onRangeChange(option.value)
                    }
                    aria-pressed={isActive}
                    className={[
                      "rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-200",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1",
                      isActive
                        ? "bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200"
                        : "text-slate-500 hover:bg-white/80 hover:text-slate-800",
                    ].join(" ")}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>

            {/* Refresh */}
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={[
                  "h-4 w-4",
                  isRefreshing
                    ? "animate-spin"
                    : "",
                ].join(" ")}
                strokeWidth={2}
              />

              <span>
                {isRefreshing
                  ? "Refreshing..."
                  : "Refresh"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
