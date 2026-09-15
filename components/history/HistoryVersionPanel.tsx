"use client";

import {
  GitCompare,
  GitCommitHorizontal,
  Loader2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import {
  getHistoryDiff,
  getHistoryVersion,
  type HistoryDiffResponse,
  type HistoryVersionResponse,
} from "@/lib/api/history";

interface HistoryVersionPanelProps {
  entityType: string;
  entityId: string;
  version: number;
  onClose: () => void;
}

export default function HistoryVersionPanel({
  entityType,
  entityId,
  version,
  onClose,
}: HistoryVersionPanelProps) {
  const [versionData, setVersionData] =
    useState<HistoryVersionResponse | null>(
      null,
    );

  const [diffData, setDiffData] =
    useState<HistoryDiffResponse | null>(
      null,
    );

  const [compareVersion, setCompareVersion] =
    useState<number | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [comparing, setComparing] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [compareError, setCompareError] =
    useState<string | null>(null);

function formatHistoryValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "null";
  }

  if (value === "") {
    return '""';
  }

  if (typeof value === "string") {
    return JSON.stringify(value);
  }

  if (typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }

  return String(value);
}


  /* =========================================================
     LOAD VERSION
  ========================================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadVersion() {
      setLoading(true);
      setError(null);

      try {
        const result =
          await getHistoryVersion(
            entityType,
            entityId,
            version,
          );

        if (cancelled) return;

        setVersionData(result);
      } catch (err) {
        if (cancelled) return;

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load version.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadVersion();

    return () => {
      cancelled = true;
    };
  }, [
    entityType,
    entityId,
    version,
  ]);

  /* =========================================================
     COMPARE WITH PREVIOUS VERSION
  ========================================================= */

  async function compareWithPrevious() {
    if (version <= 1) {
      setCompareError(
        "Version 1 is the first version and has no previous version.",
      );

      return;
    }

    const previousVersion =
      version - 1;

    setComparing(true);
    setCompareError(null);

    try {
      const result =
        await getHistoryDiff(
          entityType,
          entityId,
          previousVersion,
          version,
        );

      setDiffData(result);
      setCompareVersion(
        previousVersion,
      );
    } catch (err) {
      setDiffData(null);
      setCompareVersion(null);

      setCompareError(
        err instanceof Error
          ? err.message
          : "Failed to compare versions.",
      );
    } finally {
      setComparing(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Overlay */}
      <button
        type="button"
        aria-label="Close history version panel"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]"
      />

      {/* Panel */}
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
              <GitCommitHorizontal className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Git History
              </p>

              <h2 className="truncate text-lg font-black text-slate-950">
                Version {version}
              </h2>

              <p className="truncate text-xs text-slate-500">
                {entityType} · {entityId}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* Loading */}
          {loading && (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-7 w-7 animate-spin text-violet-600" />

                <p className="text-sm font-semibold text-slate-500">
                  Loading version...
                </p>
              </div>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
              <p className="text-sm font-bold text-rose-800">
                Unable to load version
              </p>

              <p className="mt-1 text-xs text-rose-700">
                {error}
              </p>
            </div>
          )}

          {/* Version */}
          {!loading &&
            !error &&
            versionData && (
              <div className="space-y-5">
                {/* Commit information */}
                {versionData.event && (
                  <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                        <GitCommitHorizontal className="h-4 w-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-base font-black text-slate-900">
                            {versionData.event.title}
                          </p>

                          <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-black text-violet-700">
                            v{version}
                          </span>
                        </div>

                        {versionData.event
                          .description && (
                          <p className="mt-1 text-sm leading-6 text-slate-500">
                            {
                              versionData
                                .event
                                .description
                            }
                          </p>
                        )}

                        <p className="mt-3 text-xs font-medium text-slate-400">
                          {new Date(
                            versionData.event.createdAt,
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </section>
                )}

                {/* Compare button */}
                {version > 1 && (
                  <section className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-black text-slate-900">
                          Compare changes
                        </p>

                        <p className="mt-0.5 text-xs text-slate-500">
                          Compare version{" "}
                          {version} with version{" "}
                          {version - 1}.
                        </p>
                      </div>

                      <button
                        type="button"
                        disabled={comparing}
                        onClick={
                          compareWithPrevious
                        }
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-black text-white shadow-sm shadow-violet-200 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {comparing ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Comparing...
                          </>
                        ) : (
                          <>
                            <GitCompare className="h-4 w-4" />
                            Compare v
                            {version - 1} → v
                            {version}
                          </>
                        )}
                      </button>
                    </div>
                  </section>
                )}

                {/* Compare error */}
                {compareError && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                    <p className="text-xs font-bold text-rose-700">
                      {compareError}
                    </p>
                  </div>
                )}

                {/* Changes */}
                {diffData && (
                  <section>
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <GitCompare className="h-4 w-4 text-violet-600" />

                      <h3 className="text-sm font-black text-slate-900">
                        Changes
                      </h3>

                      <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-black text-violet-700">
                        v
                        {
                          diffData.fromVersion
                        }{" "}
                        → v
                        {
                          diffData.toVersion
                        }
                      </span>

                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                        {
                          Object.keys(
                            diffData.changes,
                          ).length
                        }{" "}
                        field
                        {Object.keys(
                          diffData.changes,
                        ).length === 1
                          ? ""
                          : "s"}
                      </span>
                    </div>

                    {Object.keys(
                      diffData.changes,
                    ).length === 0 ? (
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                        No changes detected
                        between these versions.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {Object.entries(
                          diffData.changes,
                        ).map(
                          ([
                            field,
                            change,
                          ]) => (
                            <div
                              key={field}
                              className="overflow-hidden rounded-xl border border-slate-200 shadow-sm"
                            >
                              {/* Field */}
                              <div className="border-b border-slate-200 bg-slate-50 px-4 py-2.5">
                                <span className="text-xs font-black text-slate-700">
                                  {field}
                                </span>
                              </div>

                              {/* Before / After */}
                              <div className="grid gap-px bg-slate-200 md:grid-cols-2">
                                <div className="bg-rose-50 p-4">
                                  <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-rose-600">
                                    − Before
                                  </p>

                                  <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-words text-xs leading-5 text-rose-900">
                                    {formatHistoryValue(change.before)}
                                  </pre>
                                </div>

                                <div className="bg-emerald-50 p-4">
                                  <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-emerald-600">
                                    + After
                                  </p>

                                  <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-words text-xs leading-5 text-emerald-900">
                                    {formatHistoryValue(change.after)}
                                  </pre>
                                </div>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    )}
                  </section>
                )}

                {/* Snapshot */}
                <section>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-900">
                      Snapshot
                    </h3>

                    {compareVersion && (
                      <span className="text-[10px] font-bold text-slate-400">
                        v{version}
                      </span>
                    )}
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950">
                    <pre className="max-h-[500px] overflow-auto p-5 text-xs leading-6 text-slate-200">
                      {JSON.stringify(
                        versionData.snapshot,
                        null,
                        2,
                      )}
                    </pre>
                  </div>
                </section>
              </div>
            )}
        </div>
      </aside>
    </div>
  );
}