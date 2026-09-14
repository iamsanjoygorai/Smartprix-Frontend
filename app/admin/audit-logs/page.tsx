"use client";

import {
  Activity,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  FileText,
  Globe,
  RefreshCw,
  Search,
  ShieldCheck,
  User,
} from "lucide-react";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import AuditFilters from "@/components/admin/audit/AuditFilters";

import {
  getAuditLogs,
  type AuditLog,
} from "@/lib/api/audit";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [action, setAction] = useState("");

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [selectedLog, setSelectedLog] =
    useState<AuditLog | null>(null);

  const limit = 25;

  const loadLogs = useCallback(
    async (showRefresh = false) => {
      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response = await getAuditLogs({
  page,
  limit,
  category,
  action,
});

        if (!response.success) {
          throw new Error(
            response.message || "Failed to load audit logs",
          );
        }

        setLogs(response.data ?? []);
        setTotal(response.pagination?.total ?? 0);
        setTotalPages(
          response.pagination?.totalPages ?? 0,
        );
      } catch (err) {
        console.error(
          "Failed to load audit logs:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load audit logs",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, category, action, search],
  );

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  /*
   * Reset pagination when filters change.
   */
  useEffect(() => {
    setPage(1);
  }, [category, action]);

  /*
   * Search with a small delay.
   */
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [search]);

  const categories = useMemo(() => {
    return Array.from(
      new Set(
        logs
          .map((log) => log.category)
          .filter(Boolean),
      ),
    ).sort();
  }, [logs]);

  const actions = useMemo(() => {
    return Array.from(
      new Set(
        logs
          .map((log) => log.action)
          .filter(Boolean),
      ),
    ).sort();
  }, [logs]);

  const handleClear = () => {
    setSearch("");
    setCategory("");
    setAction("");
    setPage(1);
  };

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-400">
            <span>Admin</span>
            <span>/</span>
            <span className="text-slate-600">
              Audit Logs
            </span>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-500/20">
              <FileText
                className="h-7 w-7"
                strokeWidth={2}
              />
            </div>

            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-950">
                Audit Logs
              </h1>

              <p className="mt-1 max-w-2xl text-sm font-medium text-slate-500">
                Review permanent activity records,
                authentication events, account changes,
                and administrative actions.
              </p>
            </div>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => loadLogs(true)}
          disabled={refreshing}
          className="h-10 gap-2 rounded-xl"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              refreshing ? "animate-spin" : ""
            }`}
          />
          Refresh
        </Button>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total Events"
          value={total}
          icon={<Activity className="h-5 w-5" />}
          className="from-violet-500 to-indigo-600"
        />

        <SummaryCard
          label="Current Page"
          value={logs.length}
          icon={<FileText className="h-5 w-5" />}
          className="from-blue-500 to-cyan-600"
        />

        <SummaryCard
          label="Page"
          value={page}
          icon={<Search className="h-5 w-5" />}
          className="from-emerald-500 to-teal-600"
        />

        <SummaryCard
          label="Total Pages"
          value={totalPages}
          icon={<ShieldCheck className="h-5 w-5" />}
          className="from-orange-500 to-pink-600"
        />
      </div>

      {/* Filters */}
      <AuditFilters
        search={search}
        category={category}
        action={action}
        categories={categories}
        actions={actions}
        onSearchChange={setSearch}
        onCategoryChange={setCategory}
        onActionChange={setAction}
        onClear={handleClear}
      />

      {/* Main table */}
      <Card className="overflow-hidden rounded-2xl border-slate-200/80 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-white via-slate-50/60 to-violet-50/30">
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
                <Clock3 className="h-4 w-4 text-violet-500" />
                Activity History
              </CardTitle>

              <p className="mt-1 text-xs font-medium text-slate-500">
                {total.toLocaleString()} recorded events
              </p>
            </div>

            {loading && (
              <span className="text-xs font-semibold text-slate-400">
                Loading...
              </span>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {error ? (
            <div className="p-8">
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-sm font-black text-red-600">
                    !
                  </div>

                  <div>
                    <h3 className="font-bold text-red-900">
                      Unable to load audit logs
                    </h3>

                    <p className="mt-1 text-sm text-red-700">
                      {error}
                    </p>

                    <Button
                      type="button"
                      onClick={() => loadLogs()}
                      className="mt-4 rounded-lg bg-red-600 hover:bg-red-700"
                    >
                      Retry
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : loading ? (
            <AuditLoading />
          ) : logs.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="divide-y divide-slate-100">
              {logs.map((log) => (
                <AuditRow
                  key={log.id}
                  log={log}
                  onClick={() => setSelectedLog(log)}
                />
              ))}
            </div>
          )}
        </CardContent>

        {!loading && !error && logs.length > 0 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            limit={limit}
            onPrevious={() =>
              setPage((current) =>
                Math.max(current - 1, 1),
              )
            }
            onNext={() =>
              setPage((current) =>
                Math.min(
                  current + 1,
                  Math.max(totalPages, 1),
                ),
              )
            }
          />
        )}
      </Card>

      {/* Detail drawer */}
      <AuditDetailDrawer
        log={selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </div>
  );
}

/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({
  label,
  value,
  icon,
  className,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  className: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div
        className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${className}`}
      />

      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition group-hover:bg-slate-900 group-hover:text-white">
          {icon}
        </div>

        <span className="text-2xl font-black text-slate-900">
          {value.toLocaleString()}
        </span>
      </div>

      <p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
    </div>
  );
}

/* =========================================================
   AUDIT ROW
========================================================= */

function AuditRow({
  log,
  onClick,
}: {
  log: AuditLog;
  onClick: () => void;
}) {
  const actorName =
    log.actor?.name ||
    log.actor?.email ||
    "System";

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-slate-50"
    >
      {/* Avatar */}
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 text-sm font-black text-slate-600">
        {actorName
          .charAt(0)
          .toUpperCase()}
      </div>

      {/* Main */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-slate-900">
            {actorName}
          </span>

          <Badge
            variant="secondary"
            className="rounded-full text-[10px] font-bold"
          >
            {log.category}
          </Badge>

          <Badge
            variant="outline"
            className="rounded-full text-[10px] font-bold"
          >
            {log.action.replaceAll("_", " ")}
          </Badge>
        </div>

        <p className="mt-1 truncate text-sm text-slate-600">
          {log.description ||
            "Audit activity recorded."}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-medium text-slate-400">
          <span className="inline-flex items-center gap-1">
            <Clock3 className="h-3 w-3" />
            {formatDate(log.createdAt)}
          </span>

          {log.ipAddress && (
            <span className="inline-flex items-center gap-1">
              <Globe className="h-3 w-3" />
              {log.ipAddress}
            </span>
          )}

          {log.entityType && (
            <span>
              {log.entityType}
              {log.entityId
                ? ` · ${log.entityId}`
                : ""}
            </span>
          )}
        </div>
      </div>

      {/* Action */}
      <div className="hidden shrink-0 sm:block">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition group-hover:bg-white group-hover:text-violet-600">
          <Eye className="h-4 w-4" />
        </div>
      </div>
    </button>
  );
}

/* =========================================================
   DETAIL DRAWER
========================================================= */

function AuditDetailDrawer({
  log,
  onClose,
}: {
  log: AuditLog | null;
  onClose: () => void;
}) {
  return (
    <Sheet
      open={Boolean(log)}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        {log && (
          <>
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-violet-600" />
                Audit Event
              </SheetTitle>

              <SheetDescription>
                Complete details for this activity record.
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              <div className="rounded-2xl bg-gradient-to-br from-violet-50 via-white to-blue-50 p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600 text-lg font-black text-white">
                    {(log.actor?.name ||
                      log.actor?.email ||
                      "S"
                    )
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>
                    <p className="font-bold text-slate-900">
                      {log.actor?.name ||
                        "System"}
                    </p>

                    <p className="text-sm text-slate-500">
                      {log.actor?.email ||
                        "System event"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <DetailItem
                  label="Action"
                  value={log.action.replaceAll(
                    "_",
                    " ",
                  )}
                />

                <DetailItem
                  label="Category"
                  value={log.category}
                />

                <DetailItem
                  label="Entity"
                  value={
                    log.entityType ||
                    "—"
                  }
                />

                <DetailItem
                  label="Entity ID"
                  value={
                    log.entityId ||
                    "—"
                  }
                />

                <DetailItem
                  label="IP Address"
                  value={
                    log.ipAddress ||
                    "—"
                  }
                />

                <DetailItem
  label="Timezone"
  value={log.timezone || "—"}
/>

                <DetailItem
                  label="Device"
                  value={
                    log.session?.deviceType ||
                    "—"
                  }
                />

                <DetailItem
                  label="Browser"
                  value={
                    log.session?.browser ||
                    "—"
                  }
                />

                <DetailItem
                  label="Operating System"
                  value={
                    log.session
                      ?.operatingSystem ||
                    "—"
                  }
                />

                <DetailItem
                  label="Created"
                  value={formatDate(
                    log.createdAt,
                  )}
                />
              </div>

              <div>
                <h3 className="mb-2 text-sm font-bold text-slate-900">
                  Description
                </h3>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                  {log.description ||
                    "No description available."}
                </div>
              </div>

              {log.metadata && (
                <div>
                  <h3 className="mb-2 text-sm font-bold text-slate-900">
                    Metadata
                  </h3>

                  <pre className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-950 p-4 text-xs leading-5 text-slate-200">
                    {JSON.stringify(
                      log.metadata,
                      null,
                      2,
                    )}
                  </pre>
                </div>
              )}

              {log.userAgent && (
                <div>
                  <h3 className="mb-2 text-sm font-bold text-slate-900">
                    User Agent
                  </h3>

                  <div className="break-all rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-5 text-slate-600">
                    {log.userAgent}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

/* =========================================================
   DETAIL ITEM
========================================================= */

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold text-slate-800">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   PAGINATION
========================================================= */

function Pagination({
  page,
  totalPages,
  total,
  limit,
  onPrevious,
  onNext,
}: {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPrevious: () => void;
  onNext: () => void;
}) {
  const start =
    total === 0
      ? 0
      : (page - 1) * limit + 1;

  const end = Math.min(
    page * limit,
    total,
  );

  return (
    <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs font-semibold text-slate-500">
        Showing{" "}
        <span className="text-slate-900">
          {start}
        </span>{" "}
        to{" "}
        <span className="text-slate-900">
          {end}
        </span>{" "}
        of{" "}
        <span className="text-slate-900">
          {total.toLocaleString()}
        </span>
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={onPrevious}
          className="gap-1 rounded-lg"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="rounded-lg border bg-white px-3 py-1.5 text-xs font-bold text-slate-700">
          {page} / {Math.max(totalPages, 1)}
        </div>

        <Button
          variant="outline"
          size="sm"
          disabled={
            totalPages === 0 ||
            page >= totalPages
          }
          onClick={onNext}
          className="gap-1 rounded-lg"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

/* =========================================================
   LOADING
========================================================= */

function AuditLoading() {
  return (
    <div className="divide-y divide-slate-100">
      {Array.from({ length: 6 }).map(
        (_, index) => (
          <div
            key={index}
            className="flex animate-pulse items-center gap-4 px-5 py-5"
          >
            <div className="h-11 w-11 rounded-xl bg-slate-200" />

            <div className="flex-1 space-y-2">
              <div className="h-4 w-48 rounded bg-slate-200" />
              <div className="h-3 w-72 rounded bg-slate-100" />
              <div className="h-3 w-40 rounded bg-slate-100" />
            </div>
          </div>
        ),
      )}
    </div>
  );
}

/* =========================================================
   EMPTY
========================================================= */

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <Search className="h-7 w-7" />
      </div>

      <h3 className="mt-5 text-base font-bold text-slate-900">
        No audit activity found
      </h3>

      <p className="mt-1 max-w-sm text-sm text-slate-500">
        Try changing your search or clearing
        the active filters.
      </p>
    </div>
  );
}

/* =========================================================
   DATE FORMAT
========================================================= */

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(
    undefined,
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(date);
}