"use client";

import {
  BarChart3,
  Search,
  TrendingUp,
} from "lucide-react";

import type {
  AnalyticsSearches,
} from "@/lib/api/analytics";

/* =========================================================
   TYPES
========================================================= */

interface AnalyticsSearchesProps {
  data: AnalyticsSearches;
}

/* =========================================================
   HELPERS
========================================================= */

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-IN").format(value);
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptySearchState() {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm ring-1 ring-slate-200">
        <Search
          className="h-5 w-5"
          strokeWidth={2}
        />
      </div>

      <p className="mt-3 text-sm font-semibold text-slate-600">
        No search data yet
      </p>

      <p className="mt-1 max-w-xs text-xs leading-5 text-slate-400">
        Search activity will appear here once users
        start searching for products.
      </p>
    </div>
  );
}

/* =========================================================
   SEARCH ROW
========================================================= */

function SearchRow({
  query,
  count,
  rank,
  maxCount,
}: {
  query: string;
  count: number;
  rank: number;
  maxCount: number;
}) {
  const percentage =
    maxCount > 0
      ? Math.max((count / maxCount) * 100, 4)
      : 0;

  return (
    <div className="group rounded-xl border border-slate-100 bg-white p-3 transition-all duration-200 hover:border-slate-200 hover:shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-xs font-bold text-slate-400 ring-1 ring-slate-200">
          #{rank}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Search
              className="h-3.5 w-3.5 shrink-0 text-slate-400"
              strokeWidth={2}
            />

            <p
              className="truncate text-sm font-semibold text-slate-700"
              title={query}
            >
              {query}
            </p>
          </div>

          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
              style={{
                width: `${percentage}%`,
              }}
            />
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-sm font-bold text-slate-800">
            {formatNumber(count)}
          </p>

          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
            Searches
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function AnalyticsSearches({
  data,
}: AnalyticsSearchesProps) {
  const searches = data.topSearches;

  const maxCount =
    searches.length > 0
      ? Math.max(
          ...searches.map(
            (search) => search.count,
          ),
          1,
        )
      : 0;

  return (
    <section
      aria-labelledby="analytics-searches-heading"
      className="mb-6"
    >
      <div className="mb-3 flex items-center gap-2">
        <Search
          className="h-4 w-4 text-slate-400"
          strokeWidth={2}
        />

        <h2
          id="analytics-searches-heading"
          className="text-sm font-bold uppercase tracking-wider text-slate-500"
        >
          Search Analytics
        </h2>
      </div>

      <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 ring-1 ring-cyan-100">
              <TrendingUp
                className="h-5 w-5"
                strokeWidth={2}
              />
            </div>

            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900">
                Popular Searches
              </h3>

              <p className="mt-0.5 text-xs text-slate-400">
                Search demand • {data.range}
              </p>
            </div>
          </div>

          {/* ===================================================
              SUMMARY STATS
          =================================================== */}

          <div className="grid grid-cols-2 gap-5 sm:flex sm:items-center sm:gap-6">
            <div className="text-left sm:text-right">
              <p className="text-lg font-bold tracking-tight text-slate-900">
                {formatNumber(data.totalSearches)}
              </p>

              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                Total searches
              </p>
            </div>

            <div className="h-8 w-px bg-slate-200" />

            <div className="text-left sm:text-right">
              <p className="text-lg font-bold tracking-tight text-slate-900">
                {formatNumber(data.uniqueSearches)}
              </p>

              <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                Unique terms
              </p>
            </div>
          </div>
        </div>

        {/* =====================================================
            CONTENT
        ===================================================== */}

        <div className="p-5">
          {searches.length === 0 ? (
            <EmptySearchState />
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <BarChart3
                    className="h-4 w-4 text-slate-400"
                    strokeWidth={2}
                  />

                  <p className="text-xs font-semibold text-slate-600">
                    Top search terms
                  </p>
                </div>

                <p className="text-[11px] text-slate-400">
                  Showing {searches.length}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                {searches.map((search, index) => (
                  <SearchRow
                    key={`${search.query}-${index}`}
                    query={search.query}
                    count={search.count}
                    rank={index + 1}
                    maxCount={maxCount}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </article>
    </section>
  );
}