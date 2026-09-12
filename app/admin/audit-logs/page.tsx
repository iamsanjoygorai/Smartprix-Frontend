"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Search,
  RefreshCw,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  X,
  Download,
  FileJson,
  FileSpreadsheet,
  CalendarDays,
  UserRound,
  Activity,
  CheckCircle2,
  XCircle,
  Clock3,
  Eye,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5000/api";

interface AuditActor {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  profileImageUrl: string | null;
}

interface AuditLog {
  id: string;
  actorUserId: string | null;
  targetUserId: string | null;
  action: string;
  metadata: Record<string, any> | null;
  createdAt: string;
  actor: AuditActor | null;
}

interface AdminFilter {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
}

interface AuditStats {
  total: number;
  today: number;
  adminActions: number;
  failed: number;
}

interface AuditResponse {
  success: boolean;
  data?: {
    logs: AuditLog[];
    stats: AuditStats;
    filters?: {
      actions: string[];
      resources: string[];
      admins: AdminFilter[];
    };
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  message?: string;
}

/* =========================================================
   HELPERS
========================================================= */


/* =========================================================
   HELPERS
========================================================= */

function getDeletedUserMetadata(
  log: AuditLog,
): Record<string, any> | null {
  if (!log.metadata) {
    return null;
  }

  let metadata: any = log.metadata;

  // Metadata may arrive as JSON text
  if (typeof metadata === "string") {
    try {
      metadata = JSON.parse(metadata);
    } catch {
      return null;
    }
  }

  if (!metadata || typeof metadata !== "object") {
    return null;
  }

  // Normal format
  if (
    metadata.name ||
    metadata.email ||
    metadata.deletedUserId ||
    metadata.reason
  ) {
    return metadata;
  }

  // Nested format
  if (
    metadata.metadata &&
    typeof metadata.metadata === "object"
  ) {
    return metadata.metadata;
  }

  return null;
}

function getActorName(log: AuditLog) {
  const metadata = getDeletedUserMetadata(log);

  // Deleted user — always prefer saved metadata
  if (
    metadata &&
    typeof metadata.name === "string" &&
    metadata.name.trim()
  ) {
    return metadata.name.trim();
  }

  // Existing user
  if (
    typeof log.actor?.name === "string" &&
    log.actor.name.trim()
  ) {
    return log.actor.name.trim();
  }

  return "Unknown";
}

function getActorEmail(log: AuditLog) {
  const metadata = getDeletedUserMetadata(log);

  // Deleted user — always prefer saved metadata
  if (
    metadata &&
    typeof metadata.email === "string" &&
    metadata.email.trim()
  ) {
    return metadata.email.trim();
  }

  // Existing user
  if (
    typeof log.actor?.email === "string" &&
    log.actor.email.trim()
  ) {
    return log.actor.email.trim();
  }

  return "Deleted account";
}

 
function formatAction(action: string) {
  return action
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

function getActionType(action: string) {
  const value = action.toUpperCase();

  if (
    value.includes("CREATE") ||
    value.includes("ACTIVATED") ||
    value.includes("ENABLED")
  ) {
    return "create";
  }

  if (
    value.includes("UPDATE") ||
    value.includes("UPDATED") ||
    value.includes("SETTINGS")
  ) {
    return "update";
  }

  if (
    value.includes("DELETE") ||
    value.includes("DELETED") ||
    value.includes("BLOCKED") ||
    value.includes("DISABLED")
  ) {
    return "delete";
  }

  if (value.includes("LOGIN")) {
    return "login";
  }

  if (value.includes("LOGOUT")) {
    return "logout";
  }

  if (
    value.includes("PERMISSION") ||
    value.includes("ROLE")
  ) {
    return "permission";
  }

  return "default";
}

function getActionStyle(action: string) {
  const type = getActionType(action);

  switch (type) {
    case "create":
      return {
        className:
          "border-emerald-200 bg-emerald-50 text-emerald-700",
        dot: "bg-emerald-500",
      };

    case "update":
      return {
        className:
          "border-blue-200 bg-blue-50 text-blue-700",
        dot: "bg-blue-500",
      };

    case "delete":
      return {
        className:
          "border-red-200 bg-red-50 text-red-700",
        dot: "bg-red-500",
      };

    case "login":
      return {
        className:
          "border-violet-200 bg-violet-50 text-violet-700",
        dot: "bg-violet-500",
      };

    case "logout":
      return {
        className:
          "border-orange-200 bg-orange-50 text-orange-700",
        dot: "bg-orange-500",
      };

    case "permission":
      return {
        className:
          "border-amber-200 bg-amber-50 text-amber-700",
        dot: "bg-amber-500",
      };

    default:
      return {
        className:
          "border-slate-200 bg-slate-50 text-slate-700",
        dot: "bg-slate-400",
      };
  }
}

function getResource(action: string) {
  const value = action.toUpperCase();

  if (value.includes("PRODUCT")) return "Product";
  if (value.includes("NEWS")) return "News";
  if (value.includes("USER")) return "User";
  if (value.includes("ADMIN")) return "Admin";
  if (value.includes("ROLE")) return "Role";
  if (value.includes("PERMISSION")) return "Permission";
  if (value.includes("SETTING")) return "Settings";
  if (value.includes("MEDIA")) return "Media";
  if (value.includes("LOGIN")) return "Authentication";
  if (value.includes("LOGOUT")) return "Authentication";

  return "System";
}

function formatDate(date: string) {
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatShortDate(date: string) {
  return new Date(date).toLocaleString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* =========================================================
   PAGE
========================================================= */

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditStats>({
    total: 0,
    today: 0,
    adminActions: 0,
    failed: 0,
  });

  const [actions, setActions] = useState<string[]>([]);
  const [admins, setAdmins] = useState<AdminFilter[]>([]);

  const [search, setSearch] = useState("");
  const [action, setAction] = useState("");
  const [resource, setResource] = useState("");
  const [admin, setAdmin] = useState("");
  const [dateRange, setDateRange] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [selectedLog, setSelectedLog] =
    useState<AuditLog | null>(null);

  const [showExport, setShowExport] = useState(false);

  /* =======================================================
     FETCH LOGS
  ======================================================= */

  const fetchLogs = useCallback(
    async (showRefresh = false) => {
      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const token =
          localStorage.getItem("smartprix_token");

        if (!token) {
          throw new Error(
            "Authentication token not found.",
          );
        }

        const params = new URLSearchParams();

        params.set("page", String(page));
        params.set("limit", "25");

        if (search.trim()) {
          params.set("search", search.trim());
        }

        if (action) {
          params.set("action", action);
        }

        if (resource) {
          params.set("resource", resource);
        }

        if (admin) {
          params.set("admin", admin);
        }

        if (dateRange) {
          params.set("dateRange", dateRange);
        }

        const response = await fetch(
          `${API_URL}/admin/audit-logs?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const result: AuditResponse =
          await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message ??
              "Failed to load audit logs.",
          );
        }

        const data = result.data;
  

        if (!data) {
          throw new Error(
            "Invalid audit logs response.",
          );
        }


        setLogs(data.logs ?? []);

setStats(
  data.stats ?? {
    total: 0,
    today: 0,
    adminActions: 0,
    failed: 0,
  },
);

setActions(
  data.filters?.actions ?? [],
);

setAdmins(
  data.filters?.admins ?? [],
);

setTotal(
  data.pagination?.total ?? 0,
);

setTotalPages(
  data.pagination?.totalPages ?? 1,
);
      } catch (err) {
        console.error(
          "Audit logs error:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load audit logs.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      page,
      search,
      action,
      resource,
      admin,
      dateRange,
    ],
  );

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  /* =======================================================
     CLEAR FILTERS
  ======================================================= */

  const clearFilters = () => {
    setSearch("");
    setAction("");
    setResource("");
    setAdmin("");
    setDateRange("");
    setPage(1);
  };

  /* =======================================================
     EXPORT DATA
  ======================================================= */

  const exportLogs = (
    format: "json" | "csv",
  ) => {
    if (!logs.length) {
      return;
    }

    const exportData = logs.map((log) => ({
      Time: formatDate(log.createdAt),
      Admin: getActorName(log),
Email: getActorEmail(log),
Role:
  log.actor?.role ??
  (log.action === "USER_DELETED" &&
  typeof log.metadata?.role === "string"
    ? log.metadata.role
    : ""),
      Action: formatAction(log.action),
      Resource: getResource(log.action),
      Status: "Success",
      TargetUserId:
        log.targetUserId ?? "",
      Metadata: log.metadata
        ? JSON.stringify(log.metadata)
        : "",
    }));

    if (format === "json") {
      const blob = new Blob(
        [JSON.stringify(exportData, null, 2)],
        {
          type: "application/json",
        },
      );

      const url =
        URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;
      link.download =
        `smartprix-audit-logs-${Date.now()}.json`;

      link.click();

      URL.revokeObjectURL(url);
    }

    if (format === "csv") {
      const headers = Object.keys(
        exportData[0],
      );

      const rows = exportData.map((row) =>
        headers
          .map((header) => {
            const value =
              row[
                header as keyof typeof row
              ];

            return `"${String(value)
              .replaceAll('"', '""')}"`;
          })
          .join(","),
      );

      const csv = [
        headers.join(","),
        ...rows,
      ].join("\n");

      const blob = new Blob([csv], {
        type: "text/csv;charset=utf-8;",
      });

      const url =
        URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;
      link.download =
        `smartprix-audit-logs-${Date.now()}.csv`;

      link.click();

      URL.revokeObjectURL(url);
    }

    setShowExport(false);
  };

  /* =======================================================
     FILTERED RESOURCE OPTIONS
  ======================================================= */

  const resources = useMemo(() => {
    const set = new Set<string>();

    actions.forEach((item) => {
      set.add(getResource(item));
    });

    return Array.from(set).sort();
  }, [actions]);

  /* =======================================================
     PAGINATION
  ======================================================= */

  const start =
    total === 0
      ? 0
      : (page - 1) * 25 + 1;

  const end = Math.min(
    page * 25,
    total,
  );

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#f5f7fb] p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-[1500px]">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-200">
                <Activity
                  size={22}
                  strokeWidth={2.4}
                />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Audit Logs
                </h1>

                <p className="mt-0.5 text-sm text-slate-500">
                  Track important admin activity
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">

            {/* EXPORT */}

            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setShowExport(
                    (value) => !value,
                  )
                }
                disabled={!logs.length}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-violet-200 hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Download size={16} />
                Export
              </button>

              {showExport && (
                <div className="absolute right-0 z-30 mt-2 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl">

                  <button
                    type="button"
                    onClick={() =>
                      exportLogs("csv")
                    }
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    <FileSpreadsheet
                      size={17}
                    />
                    Export Excel
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      exportLogs("json")
                    }
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-violet-50 hover:text-violet-700"
                  >
                    <FileJson
                      size={17}
                    />
                    Export JSON
                  </button>
                </div>
              )}
            </div>

            {/* REFRESH */}

            <button
              type="button"
              onClick={() =>
                fetchLogs(true)
              }
              disabled={refreshing}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-violet-200 hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />
              Refresh
            </button>

            <div className="hidden items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-bold text-violet-700 sm:flex">
              <ShieldCheck size={15} />
              SUPER_ADMIN ONLY
            </div>
          </div>
        </div>

        {/* =================================================
            STATS
        ================================================= */}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <StatCard
            title="Total Logs"
            value={stats.total}
            icon={
              <Activity size={19} />
            }
            iconClass="bg-violet-100 text-violet-600"
          />

          <StatCard
            title="Today"
            value={stats.today}
            icon={
              <CalendarDays size={19} />
            }
            iconClass="bg-blue-100 text-blue-600"
          />

          <StatCard
            title="Admin Actions"
            value={stats.adminActions}
            icon={
              <ShieldCheck size={19} />
            }
            iconClass="bg-emerald-100 text-emerald-600"
          />

          <StatCard
            title="Failed"
            value={stats.failed}
            icon={
              stats.failed > 0 ? (
                <XCircle size={19} />
              ) : (
                <CheckCircle2 size={19} />
              )
            }
            iconClass={
              stats.failed > 0
                ? "bg-red-100 text-red-600"
                : "bg-emerald-100 text-emerald-600"
            }
          />
        </div>

        {/* =================================================
            FILTERS
        ================================================= */}

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

          {/* SEARCH */}

          <div className="relative mb-3">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(event) => {
                setSearch(
                  event.target.value,
                );
                setPage(1);
              }}
              placeholder="Search logs..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
            />
          </div>

          {/* FILTER ROW */}

          <div className="grid gap-3 lg:grid-cols-5">

            {/* ACTION */}

            <FilterSelect
              icon={
                <Activity size={16} />
              }
              value={action}
              onChange={(value) => {
                setAction(value);
                setPage(1);
              }}
              placeholder="Action"
              options={actions.map(
                (item) => ({
                  label:
                    formatAction(item),
                  value: item,
                }),
              )}
            />

            {/* RESOURCE */}

            <FilterSelect
              icon={
                <Activity size={16} />
              }
              value={resource}
              onChange={(value) => {
                setResource(value);
                setPage(1);
              }}
              placeholder="Resource"
              options={resources.map(
                (item) => ({
                  label: item,
                  value: item,
                }),
              )}
            />

            {/* ADMIN */}

            <FilterSelect
              icon={
                <UserRound size={16} />
              }
              value={admin}
              onChange={(value) => {
                setAdmin(value);
                setPage(1);
              }}
              placeholder="Admin"
              options={admins.map(
                (item) => ({
                  label:
                    item.name ??
                    item.email ??
                    "Unknown admin",
                  value: item.id,
                }),
              )}
            />

            {/* DATE */}

            <FilterSelect
              icon={
                <CalendarDays size={16} />
              }
              value={dateRange}
              onChange={(value) => {
                setDateRange(value);
                setPage(1);
              }}
              placeholder="Date range"
              options={[
                {
                  label: "Today",
                  value: "today",
                },
                {
                  label: "Last 7 days",
                  value: "7days",
                },
                {
                  label: "Last 30 days",
                  value: "30days",
                },
                {
                  label: "Last 90 days",
                  value: "90days",
                },
              ]}
            />

            {/* CLEAR */}

            <button
              type="button"
              onClick={clearFilters}
              className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <X size={16} />
              Clear filters
            </button>
          </div>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-5 flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <div className="flex items-center gap-2">
              <XCircle size={18} />
              {error}
            </div>

            <button
              type="button"
              onClick={() =>
                fetchLogs(true)
              }
              className="font-semibold underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* =================================================
            TABLE
        ================================================= */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[900px]">

              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-left">
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Time
                  </th>

                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Admin
                  </th>

                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Action
                  </th>

                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Resource
                  </th>

                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                    Details
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {loading
                  ? Array.from({
                      length: 8,
                    }).map((_, index) => (
                      <tr key={index}>
                        <td
                          colSpan={6}
                          className="px-5 py-4"
                        >
                          <div className="h-8 animate-pulse rounded-lg bg-slate-100" />
                        </td>
                      </tr>
                    ))
                  : logs.length === 0
                    ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-5 py-16 text-center"
                        >
                          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                            <Activity
                              size={22}
                            />
                          </div>

                          <p className="mt-3 text-sm font-semibold text-slate-700">
                            No audit logs found
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            Try changing your filters.
                          </p>
                        </td>
                      </tr>
                    )
                    : logs.map((log) => {
                        const style =
                          getActionStyle(
                            log.action,
                          );
                          {console.log(
  "FINAL LOGS USED BY TABLE:",
  logs.map((log) => ({
    action: log.action,
    metadata: log.metadata,
    name: getActorName(log),
    email: getActorEmail(log),
  })),
)}

                        return (
                          <tr
                            key={log.id}
                            onClick={() =>
                              setSelectedLog(
                                log,
                              )
                            }
                            className="cursor-pointer transition hover:bg-violet-50/40"
                          >

                            {/* TIME */}

                            <td className="whitespace-nowrap px-5 py-4">
                              <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                <Clock3
                                  size={15}
                                  className="text-slate-400"
                                />

                                {formatShortDate(
                                  log.createdAt,
                                )}
                              </div>

                              <div className="mt-0.5 text-xs text-slate-400">
                                {new Date(
                                  log.createdAt,
                                ).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                  },
                                )}
                              </div>
                            </td>

                            {/* ADMIN */}

                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">

                                {log.actor
                                  ?.profileImageUrl ? (
                                  <img
                                    src={
                                      log.actor
                                        .profileImageUrl
                                    }
                                    alt=""
                                    className="h-9 w-9 rounded-full border border-slate-200 object-cover"
                                  />
                                ) : (
                                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-xs font-bold text-white">
                                    {getActorName(log)
                                      .trim()
                                      .charAt(0)
                                      .toUpperCase()}
                                  </div>
                                )}

                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-slate-800">
                                    {getActorName(log)}
                                  </p>

                                  <p className="truncate text-xs text-slate-400">
                                    {getActorEmail(log)}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* ACTION */}

                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${style.className}`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${style.dot}`}
                                />

                                {formatAction(
                                  log.action,
                                )}
                              </span>
                            </td>

                            {/* RESOURCE */}

                            <td className="px-5 py-4">
                              <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-600">
                                {getResource(
                                  log.action,
                                )}
                              </span>
                            </td>

                            {/* STATUS */}

                            <td className="px-5 py-4">
                              <span className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600">
                                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                Success
                              </span>
                            </td>

                            {/* DETAILS */}

                            <td className="px-5 py-4 text-right">
                              <button
                                type="button"
                                onClick={(
                                  event,
                                ) => {
                                  event.stopPropagation();

                                  setSelectedLog(
                                    log,
                                  );
                                }}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-violet-100 hover:text-violet-600"
                              >
                                <Eye
                                  size={17}
                                />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
              </tbody>
            </table>
          </div>

          {/* =================================================
              PAGINATION
          ================================================= */}

          <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

            <p className="text-sm text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-700">
                {start}
              </span>
              –
              <span className="font-semibold text-slate-700">
                {end}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-700">
                {total}
              </span>
            </p>

            <div className="flex items-center gap-1">

              <button
                type="button"
                disabled={page <= 1}
                onClick={() =>
                  setPage(
                    (value) =>
                      Math.max(
                        value - 1,
                        1,
                      ),
                  )
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft
                  size={17}
                />
              </button>

              {Array.from(
                {
                  length: totalPages,
                },
                (_, index) =>
                  index + 1,
              )
                .slice(
                  Math.max(
                    page - 3,
                    0,
                  ),
                  Math.min(
                    page + 2,
                    totalPages,
                  ),
                )
                .map(
                  (pageNumber) => (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() =>
                        setPage(
                          pageNumber,
                        )
                      }
                      className={`h-9 min-w-9 rounded-lg px-2 text-sm font-semibold transition ${
                        pageNumber === page
                          ? "bg-violet-600 text-white shadow-sm"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  ),
                )}

              <button
                type="button"
                disabled={
                  page >= totalPages
                }
                onClick={() =>
                  setPage(
                    (value) =>
                      Math.min(
                        value + 1,
                        totalPages,
                      ),
                  )
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight
                  size={17}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          DETAIL DRAWER
      ===================================================== */}

      {selectedLog && (
        <div
          className="fixed inset-0 z-50"
          onClick={() =>
            setSelectedLog(null)
          }
        >
          <div className="absolute inset-0 bg-slate-950/30 backdrop-blur-sm" />

          <aside
            onClick={(event) =>
              event.stopPropagation()
            }
            className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col bg-white shadow-2xl"
          >

            {/* DRAWER HEADER */}

            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-violet-600">
                  Audit Event
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  {formatAction(
                    selectedLog.action,
                  )}
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedLog(null)
                }
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* DRAWER BODY */}

            <div className="flex-1 overflow-y-auto p-6">

              {/* ADMIN */}

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">

                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Admin
                </p>

                <div className="flex items-center gap-3">

                  {selectedLog.actor
                    ?.profileImageUrl ? (
                    <img
                      src={
                        selectedLog.actor
                          .profileImageUrl
                      }
                      alt=""
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 font-bold text-white">
                      {getActorName(selectedLog)
  .charAt(0)
  .toUpperCase()}
                    </div>
                  )}

                  <div>
  <p className="font-bold text-slate-800">
    {getActorName(selectedLog)}
  </p>

  <p className="text-sm text-slate-500">
    {getActorEmail(selectedLog)}
  </p>

  <span className="mt-1 inline-flex rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-bold text-violet-700">
    {selectedLog.action === "USER_DELETED" &&
typeof getDeletedUserMetadata(selectedLog)?.role === "string"
  ? getDeletedUserMetadata(selectedLog)?.role
  : selectedLog.actor?.role ?? "UNKNOWN"}
  </span>
</div>
                </div>
              </div>

              {/* EVENT INFO */}

              <div className="mt-5 grid grid-cols-2 gap-3">

                <InfoBox
                  label="Action"
                  value={formatAction(
                    selectedLog.action,
                  )}
                />

                <InfoBox
                  label="Resource"
                  value={getResource(
                    selectedLog.action,
                  )}
                />

                <InfoBox
                  label="Status"
                  value="Success"
                />

                <InfoBox
                  label="Time"
                  value={formatDate(
                    selectedLog.createdAt,
                  )}
                />
              </div>

              {/* TARGET */}

              {selectedLog.targetUserId && (
                <div className="mt-5 rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Target User
                  </p>

                  <p className="mt-2 break-all text-sm font-semibold text-slate-700">
                    {selectedLog.targetUserId}
                  </p>
                </div>
              )}

              {/* METADATA */}

              <div className="mt-5">

                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-800">
                    Event Metadata
                  </p>

                  <span className="text-xs text-slate-400">
                    JSON
                  </span>
                </div>

                <pre className="max-h-[420px] overflow-auto rounded-2xl bg-slate-950 p-4 text-xs leading-6 text-slate-200">
                  {JSON.stringify(
                    selectedLog.metadata ??
                      {},
                    null,
                    2,
                  )}
                </pre>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  title,
  value,
  icon,
  iconClass,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  iconClass: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

      <div className="flex items-start justify-between">

        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {value.toLocaleString("en-IN")}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   FILTER SELECT
========================================================= */

function FilterSelect({
  icon,
  value,
  onChange,
  placeholder,
  options,
}: {
  icon: React.ReactNode;
  value: string;
  onChange: (
    value: string,
  ) => void;
  placeholder: string;
  options: {
    label: string;
    value: string;
  }[];
}) {
  return (
    <div className="relative">

      <div className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-slate-400">
        {icon}
      </div>

      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-10 pr-8 text-sm font-medium text-slate-600 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
      >
        <option value="">
          {placeholder}
        </option>

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>

      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
        ▾
      </div>
    </div>
  );
}

/* =========================================================
   INFO BOX
========================================================= */

function InfoBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold text-slate-800">
        {value}
      </p>
    </div>
  );
}