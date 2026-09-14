"use client";

import {
  AlertCircle,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getHistoryTimeline,
  type HistoryTimelineResponse,
} from "@/lib/api/history";

import HistoryFilters, {
  type HistoryFilterState,
} from "./HistoryFilters";
import HistoryStats from "./HistoryStats";
import HistoryTimeline from "./HistoryTimeline";

const DEFAULT_FILTERS: HistoryFilterState = {
  search: "",
  category: "",
  eventType: "",
  operation: "",
  entityType: "",
  from: "",
  to: "",
};

const PAGE_SIZE = 25;

function getStartOfToday(): Date {
  const date = new Date();

  date.setHours(0, 0, 0, 0);

  return date;
}

export default function HistoryDashboard() {
  const [filters, setFilters] =
    useState<HistoryFilterState>(
      DEFAULT_FILTERS,
    );

  const [page, setPage] =
    useState(1);

  const [data, setData] =
    useState<HistoryTimelineResponse | null>(
      null,
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const loadHistory =
    useCallback(async () => {
      setLoading(true);
      setError(null);

      try {
        const result =
          await getHistoryTimeline({
            page,
            limit: PAGE_SIZE,

            search:
              filters.search || undefined,

            category:
              filters.category || undefined,

            eventType:
              filters.eventType || undefined,

            operation:
              filters.operation || undefined,

            entityType:
              filters.entityType || undefined,

            from:
              filters.from
                ? new Date(
                    filters.from,
                  ).toISOString()
                : undefined,

            to:
              filters.to
                ? new Date(
                    filters.to,
                  ).toISOString()
                : undefined,
          });

        setData(result);
      } catch (err) {
        console.error(
          "Failed to load history:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load history.",
        );
      } finally {
        setLoading(false);
      }
    }, [
      page,
      filters.search,
      filters.category,
      filters.eventType,
      filters.operation,
      filters.entityType,
      filters.from,
      filters.to,
    ]);

  useEffect(() => {
    const timer =
      window.setTimeout(
        () => {
          void loadHistory();
        },
        filters.search ? 350 : 0,
      );

    return () =>
      window.clearTimeout(
        timer,
      );
  }, [
    loadHistory,
    filters.search,
  ]);

  const handleFiltersChange =
    useCallback(
      (
        nextFilters: HistoryFilterState,
      ) => {
        setPage(1);
        setFilters(nextFilters);
      },
      [],
    );

  const handleReset =
    useCallback(() => {
      setPage(1);
      setFilters(
        DEFAULT_FILTERS,
      );
    }, []);

  const handlePageChange =
    useCallback(
      (nextPage: number) => {
        if (
          nextPage < 1 ||
          (data &&
            nextPage >
              data.totalPages)
        ) {
          return;
        }

        setPage(nextPage);

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      },
      [data],
    );

  const stats = useMemo(() => {
    const events =
      data?.events ?? [];

    const todayStart =
      getStartOfToday();

    const todayEvents =
      events.filter(
        (event) =>
          new Date(
            event.createdAt,
          ) >= todayStart,
      ).length;

    const actors =
      new Set(
        events
          .map(
            (event) =>
              event.actorUserId,
          )
          .filter(Boolean),
      );

    const changes =
      events.filter(
        (event) =>
          Boolean(
            event.changes &&
              Object.keys(
                event.changes,
              ).length,
          ),
      ).length;

    return {
      totalEvents:
        data?.total ?? 0,
      todayEvents,
      uniqueActors:
        actors.size,
      changes,
    };
  }, [data]);

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      {/* Hero */}
      <div className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto max-w-[1500px] px-4 py-7 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-200">
                <ShieldCheck className="h-6 w-6" />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                    History
                  </h1>

                  <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-violet-700">
                    SUPER ADMIN
                  </span>
                </div>

                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                  Monitor user, admin, editor,
                  product, security and system
                  activity from one immutable
                  timeline.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                void loadHistory()
              }
              disabled={loading}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                className={[
                  "h-4 w-4",
                  loading
                    ? "animate-spin"
                    : "",
                ].join(" ")}
              />

              Refresh
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[1500px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

            <div className="flex-1">
              <p className="text-sm font-bold">
                Unable to load history
              </p>

              <p className="mt-1 text-xs text-rose-700">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                void loadHistory()
              }
              className="rounded-lg bg-white px-3 py-2 text-xs font-bold text-rose-700 shadow-sm ring-1 ring-rose-200 transition hover:bg-rose-100"
            >
              Try again
            </button>
          </div>
        )}

        {/* Stats */}
        <HistoryStats
          totalEvents={
            stats.totalEvents
          }
          todayEvents={
            stats.todayEvents
          }
          uniqueActors={
            stats.uniqueActors
          }
          changes={stats.changes}
          loading={loading}
        />

        {/* Filters */}
        <HistoryFilters
          filters={filters}
          onChange={
            handleFiltersChange
          }
          onReset={handleReset}
          loading={loading}
        />

        {/* Timeline */}
        <HistoryTimeline
          events={
            data?.events ?? []
          }
          page={
            data?.page ?? page
          }
          totalPages={
            data?.totalPages ?? 1
          }
          total={
            data?.total ?? 0
          }
          onPageChange={
            handlePageChange
          }
          loading={loading}
        />
      </main>
    </div>
  );
}