"use client";

import {
  Activity,
  Eye,
  MousePointerClick,
  Package,
} from "lucide-react";

import type {
  AnalyticsEngagement,
} from "@/lib/api/analytics";

/* =========================================================
   TYPES
========================================================= */

interface AnalyticsEngagementProps {
  data: AnalyticsEngagement;
}

/* =========================================================
   HELPERS
========================================================= */

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-IN").format(value);
}

function formatEventName(eventType: string): string {
  return eventType
    .toLowerCase()
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1),
    )
    .join(" ");
}

/* =========================================================
   EVENT ICON
========================================================= */

function EventIcon({
  eventType,
}: {
  eventType: string;
}) {
  if (eventType === "PRODUCT_VIEW") {
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
        <Eye
          className="h-4 w-4"
          strokeWidth={2}
        />
      </div>
    );
  }

  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 ring-1 ring-violet-100">
      <MousePointerClick
        className="h-4 w-4"
        strokeWidth={2}
      />
    </div>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState() {
  return (
    <div className="flex min-h-[250px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm ring-1 ring-slate-200">
        <Activity
          className="h-5 w-5"
          strokeWidth={2}
        />
      </div>

      <p className="mt-3 text-sm font-semibold text-slate-600">
        No engagement data yet
      </p>

      <p className="mt-1 max-w-xs text-xs leading-5 text-slate-400">
        User interaction events will appear here
        once activity is recorded.
      </p>
    </div>
  );
}

/* =========================================================
   EVENT ROW
========================================================= */

function EventRow({
  eventType,
  count,
  totalEvents,
}: {
  eventType: string;
  count: number;
  totalEvents: number;
}) {
  const percentage =
    totalEvents > 0
      ? (count / totalEvents) * 100
      : 0;

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-3 transition-all duration-200 hover:border-slate-200 hover:shadow-sm">
      <div className="flex items-center gap-3">
        <EventIcon eventType={eventType} />

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <p className="truncate text-sm font-semibold text-slate-700">
              {formatEventName(eventType)}
            </p>

            <span className="shrink-0 text-xs font-bold text-slate-700">
              {formatNumber(count)}
            </span>
          </div>

          <div className="mt-2 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                style={{
                  width: `${Math.max(
                    percentage,
                    2,
                  )}%`,
                }}
              />
            </div>

            <span className="w-12 shrink-0 text-right text-[10px] font-medium text-slate-400">
              {percentage.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function AnalyticsEngagement({
  data,
}: AnalyticsEngagementProps) {
  return (
    <section
      aria-labelledby="analytics-engagement-heading"
      className="mb-6"
    >
      <div className="mb-3 flex items-center gap-2">
        <Activity
          className="h-4 w-4 text-slate-400"
          strokeWidth={2}
        />

        <h2
          id="analytics-engagement-heading"
          className="text-sm font-bold uppercase tracking-wider text-slate-500"
        >
          Engagement Analytics
        </h2>
      </div>

      <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
              <Activity
                className="h-5 w-5"
                strokeWidth={2}
              />
            </div>

            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900">
                User Engagement
              </h3>

              <p className="mt-0.5 text-xs text-slate-400">
                Interaction activity • {data.range}
              </p>
            </div>
          </div>

          {/* ===================================================
              SUMMARY
          =================================================== */}

          <div className="grid grid-cols-2 gap-5 sm:flex sm:items-center sm:gap-6">
            <div className="text-left sm:text-right">
              <p className="text-lg font-bold tracking-tight text-slate-900">
                {formatNumber(data.totalEvents)}
              </p>

              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                Total events
              </p>
            </div>

            <div className="h-8 w-px bg-slate-200" />

            <div className="text-left sm:text-right">
              <p className="text-lg font-bold tracking-tight text-slate-900">
                {formatNumber(
                  data.uniqueProductsViewed,
                )}
              </p>

              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                Products viewed
              </p>
            </div>
          </div>
        </div>

        {/* =====================================================
            CONTENT
        ===================================================== */}

        <div className="p-5">
          {data.events.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {data.events.map((event) => (
                <EventRow
                  key={event.eventType}
                  eventType={event.eventType}
                  count={event.count}
                  totalEvents={data.totalEvents}
                />
              ))}
            </div>
          )}
        </div>

        {/* =====================================================
            PRODUCT VIEW INSIGHT
        ===================================================== */}

        {data.uniqueProductsViewed > 0 && (
          <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm ring-1 ring-slate-200">
                <Package
                  className="h-4 w-4"
                  strokeWidth={2}
                />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-700">
                  Product discovery
                </p>

                <p className="mt-0.5 text-[11px] leading-5 text-slate-400">
                  {formatNumber(
                    data.uniqueProductsViewed,
                  )}{" "}
                  unique product
                  {data.uniqueProductsViewed === 1
                    ? ""
                    : "s"}{" "}
                  viewed during this period.
                </p>
              </div>
            </div>
          </div>
        )}
      </article>
    </section>
  );
}