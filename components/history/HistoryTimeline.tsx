"use client";

import {
  ChevronLeft,
  ChevronRight,
  History,
} from "lucide-react";

import type { HistoryEvent } from "@/lib/api/history";

import HistoryEventCard from "./HistoryEventCard";

interface HistoryTimelineProps {
  events: HistoryEvent[];
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (
    page: number,
  ) => void;
  loading?: boolean;
}

function EventSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="flex gap-3">
        <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-200" />

        <div className="flex-1">
          <div className="flex justify-between gap-4">
            <div className="space-y-2">
              <div className="h-4 w-48 rounded bg-slate-200" />
              <div className="h-3 w-72 max-w-full rounded bg-slate-200" />
            </div>

            <div className="h-7 w-20 rounded-full bg-slate-200" />
          </div>

          <div className="mt-4 flex gap-2">
            <div className="h-5 w-16 rounded bg-slate-200" />
            <div className="h-5 w-28 rounded bg-slate-200" />
            <div className="h-5 w-20 rounded bg-slate-200" />
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <History className="h-7 w-7" />
      </div>

      <h3 className="mt-4 text-base font-bold text-slate-900">
        No history found
      </h3>

      <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
        There are no history events matching
        your current filters.
      </p>
    </div>
  );
}

function getPageNumbers(
  page: number,
  totalPages: number,
): Array<number | "..."> {
  if (totalPages <= 7) {
    return Array.from(
      { length: totalPages },
      (_, index) => index + 1,
    );
  }

  if (page <= 4) {
    return [
      1,
      2,
      3,
      4,
      5,
      "...",
      totalPages,
    ];
  }

  if (page >= totalPages - 3) {
    return [
      1,
      "...",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "...",
    page - 1,
    page,
    page + 1,
    "...",
    totalPages,
  ];
}

export default function HistoryTimeline({
  events,
  page,
  totalPages,
  total,
  onPageChange,
  loading = false,
}: HistoryTimelineProps) {
  return (
    <section>
      {/* Timeline header */}
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900">
            Activity timeline
          </h2>

          <p className="text-xs text-slate-500">
            {loading
              ? "Loading history..."
              : `${total.toLocaleString()} event${
                  total === 1 ? "" : "s"
                } recorded`}
          </p>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          <EventSkeleton />
          <EventSkeleton />
          <EventSkeleton />
        </div>
      )}

      {/* Empty */}
      {!loading &&
        events.length === 0 && (
          <EmptyState />
        )}

      {/* Events */}
      {!loading &&
        events.length > 0 && (
          <>
            <div className="relative space-y-3">
              {/* Timeline rail */}
              <div className="pointer-events-none absolute bottom-6 left-[20px] top-6 hidden w-px bg-gradient-to-b from-violet-200 via-slate-200 to-transparent sm:block" />

              {events.map((event) => (
                <div
                  key={event.id}
                  className="relative sm:pl-10"
                >
                  <div className="absolute left-[15px] top-5 z-10 hidden h-3 w-3 rounded-full border-2 border-white bg-violet-500 shadow-sm sm:block" />

                  <HistoryEventCard
                    event={event}
                  />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <p className="px-2 text-xs font-medium text-slate-500">
                  Page{" "}
                  <span className="font-bold text-slate-800">
                    {page}
                  </span>{" "}
                  of{" "}
                  <span className="font-bold text-slate-800">
                    {totalPages}
                  </span>
                </p>

                <div className="flex items-center justify-center gap-1">
                  <button
                    type="button"
                    disabled={
                      page <= 1 ||
                      loading
                    }
                    onClick={() =>
                      onPageChange(
                        page - 1,
                      )
                    }
                    aria-label="Previous page"
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  {getPageNumbers(
                    page,
                    totalPages,
                  ).map(
                    (
                      pageNumber,
                      index,
                    ) =>
                      pageNumber ===
                      "..." ? (
                        <span
                          key={`ellipsis-${index}`}
                          className="flex h-9 w-8 items-center justify-center text-xs font-bold text-slate-400"
                        >
                          …
                        </span>
                      ) : (
                        <button
                          key={
                            pageNumber
                          }
                          type="button"
                          disabled={
                            loading
                          }
                          onClick={() =>
                            onPageChange(
                              pageNumber,
                            )
                          }
                          className={[
                            "h-9 min-w-9 rounded-lg px-2 text-xs font-bold transition",
                            pageNumber ===
                            page
                              ? "bg-violet-600 text-white shadow-sm shadow-violet-200"
                              : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                          ].join(
                            " ",
                          )}
                        >
                          {
                            pageNumber
                          }
                        </button>
                      ),
                  )}

                  <button
                    type="button"
                    disabled={
                      page >=
                        totalPages ||
                      loading
                    }
                    onClick={() =>
                      onPageChange(
                        page + 1,
                      )
                    }
                    aria-label="Next page"
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
    </section>
  );
}