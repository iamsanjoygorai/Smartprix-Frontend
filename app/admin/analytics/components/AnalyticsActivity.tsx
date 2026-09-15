"use client";

import {
  Activity,
  ClipboardList,
  ShieldCheck,
  Users,
} from "lucide-react";

import type { AnalyticsActivity } from "@/lib/api/analytics";

/* =========================================================
   TYPES
========================================================= */

interface AnalyticsActivityProps {
  data: AnalyticsActivity;
}

/* =========================================================
   HELPERS
========================================================= */

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-IN").format(value);
}

function formatActionName(action: string): string {
  return action
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
   ACTION ICON
========================================================= */

function ActionIcon({
  action,
}: {
  action: string;
}) {
  if (
    action.includes("ADMIN") ||
    action.includes("ROLE") ||
    action.includes("PERMISSION")
  ) {
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 ring-1 ring-violet-100">
        <ShieldCheck
          className="h-4 w-4"
          strokeWidth={2}
        />
      </div>
    );
  }

  if (
    action.includes("USER") ||
    action.includes("PROFILE")
  ) {
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
        <Users
          className="h-4 w-4"
          strokeWidth={2}
        />
      </div>
    );
  }

  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500 ring-1 ring-slate-200">
      <ClipboardList
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
    <div className="flex min-h-[260px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm ring-1 ring-slate-200">
        <Activity
          className="h-5 w-5"
          strokeWidth={2}
        />
      </div>

      <p className="mt-3 text-sm font-semibold text-slate-600">
        No activity recorded
      </p>

      <p className="mt-1 max-w-xs text-xs leading-5 text-slate-400">
        Administrative and user activity will appear
        here once audit events are recorded.
      </p>
    </div>
  );
}

/* =========================================================
   ACTIVITY ROW
========================================================= */

function ActivityRow({
  action,
  count,
  totalActivities,
  rank,
}: {
  action: string;
  count: number;
  totalActivities: number;
  rank: number;
}) {
  const percentage =
    totalActivities > 0
      ? (count / totalActivities) * 100
      : 0;

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-3 transition-all duration-200 hover:border-slate-200 hover:shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-[11px] font-bold text-slate-400 ring-1 ring-slate-200">
          #{rank}
        </div>

        <ActionIcon action={action} />

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <p
              className="truncate text-sm font-semibold text-slate-700"
              title={action}
            >
              {formatActionName(action)}
            </p>

            <span className="shrink-0 text-sm font-bold text-slate-800">
              {formatNumber(count)}
            </span>
          </div>

          <div className="mt-2 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-500"
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

export default function AnalyticsActivity({
  data,
}: AnalyticsActivityProps) {
  return (
    <section
      aria-labelledby="analytics-activity-heading"
      className="mb-6"
    >
      {/* Section heading */}
      <div className="mb-4 flex min-w-0 items-center gap-2 px-0.5">
        <Activity
          className="h-4 w-4 shrink-0 text-slate-400"
          strokeWidth={2}
        />

        <h2
          id="analytics-activity-heading"
          className="whitespace-nowrap text-sm font-bold uppercase tracking-wider text-slate-500"
        >
          Activity Analytics
        </h2>
      </div>

      <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-fuchsia-50 text-fuchsia-600 ring-1 ring-fuchsia-100">
              <ClipboardList
                className="h-5 w-5"
                strokeWidth={2}
              />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-bold text-slate-900">
                System Activity
              </h3>

              <p className="mt-0.5 truncate text-xs text-slate-400">
                Audit activity • {data.range}
              </p>
            </div>
          </div>

          {/* ===================================================
              TOTAL
          =================================================== */}

          <div className="shrink-0 text-left sm:text-right">
            <p className="text-xl font-bold tracking-tight text-slate-900">
              {formatNumber(data.totalActivities)}
            </p>

            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              Total activities
            </p>
          </div>
        </div>

        {/* =====================================================
            CONTENT
        ===================================================== */}

        <div className="p-5">
          {data.activities.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Activity
                    className="h-4 w-4 shrink-0 text-slate-400"
                    strokeWidth={2}
                  />

                  <p className="text-xs font-semibold text-slate-600">
                    Activity breakdown
                  </p>
                </div>

                <p className="shrink-0 text-[11px] text-slate-400">
                  Showing {data.activities.length}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                {data.activities.map(
                  (activity, index) => (
                    <ActivityRow
                      key={`${activity.action}-${index}`}
                      action={activity.action}
                      count={activity.count}
                      totalActivities={
                        data.totalActivities
                      }
                      rank={index + 1}
                    />
                  ),
                )}
              </div>
            </>
          )}
        </div>

        {/* =====================================================
            FOOTER INSIGHT
        ===================================================== */}

        {data.activities.length > 0 && (
          <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm ring-1 ring-slate-200">
                <ShieldCheck
                  className="h-4 w-4"
                  strokeWidth={2}
                />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-700">
                  Audit monitoring
                </p>

                <p className="mt-0.5 text-[11px] leading-5 text-slate-400">
                  Activity is aggregated from the existing
                  permanent audit history.
                </p>
              </div>
            </div>
          </div>
        )}
      </article>
    </section>
  );
}