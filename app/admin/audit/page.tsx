"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
   getAuditLogs,
  getAllSessions,
  getAllSearchHistory,
  type AuditLog,
  type UserSession,
  type SearchHistoryItem,
} from "@/lib/api/audit";
import AuditTabs from "@/components/admin/audit/AuditTabs";
import AuditStats from "@/components/admin/audit/AuditStats";
import AuditFilters from "@/components/admin/audit/AuditFilters";

/* =========================================================
   TYPES
========================================================= */

type Tab = "audit" | "sessions" | "search";
type SessionStatus = "" | "active" | "ended";

/* =========================================================
   PAGE
========================================================= */

function SearchHistorySection() {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });

  const [selectedSearch, setSelectedSearch] =
    useState<SearchHistoryItem | null>(null);

  const loadSearchHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAllSearchHistory({
        page,
        limit: 50,
        search: search.trim() || undefined,
      });

      setHistory(response.data);
      setPagination(response.pagination);
    } catch (err) {
      console.error("Failed to load search history:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load search history",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSearchHistory();
  }, [page, search]);

  const formatDate = (value: string) => {
    try {
      return new Date(value).toLocaleString();
    } catch {
      return value;
    }
  };

  const getUserName = (item: SearchHistoryItem) => {
    return (
      item.user?.name ||
      item.user?.email ||
      item.user?.mobile ||
      "Guest User"
    );
  };

  const getLocation = (item: SearchHistoryItem) => {
    const parts = [
      item.city,
      item.state,
      item.country,
    ].filter(Boolean);

    return parts.length
      ? parts.join(", ")
      : "Unknown location";
  };

  return (
    <>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Search History
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              View searches performed by users across Smartprix.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Total Searches
            </p>

            <p className="mt-0.5 text-lg font-bold text-slate-900">
              {pagination.total.toLocaleString()}
            </p>
          </div>
        </div>

        {/* SEARCH */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="relative">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>

            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search query, user name, email or mobile..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
            />
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* TABLE */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-[1050px] w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Search
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    User
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Location
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    IP Address
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Device
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Time
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <tr key={index}>
                      {Array.from({ length: 7 }).map(
                        (_, cellIndex) => (
                          <td
                            key={cellIndex}
                            className="px-5 py-5"
                          >
                            <div className="h-4 animate-pulse rounded bg-slate-100" />
                          </td>
                        ),
                      )}
                    </tr>
                  ))
                ) : history.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-16 text-center"
                    >
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                        <svg
                          className="h-7 w-7 text-slate-400"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <circle
                            cx="11"
                            cy="11"
                            r="7"
                          />
                          <path d="m20 20-3.5-3.5" />
                        </svg>
                      </div>

                      <p className="mt-4 font-semibold text-slate-700">
                        No search history found
                      </p>

                      <p className="mt-1 text-sm text-slate-400">
                        Searches will appear here once users
                        perform searches.
                      </p>
                    </td>
                  </tr>
                ) : (
                  history.map((item) => (
                    <tr
                      key={item.id}
                      className="group transition hover:bg-slate-50"
                    >
                      {/* SEARCH */}
                      <td className="px-5 py-4">
                        <div className="max-w-[260px]">
                          <p
                            className="truncate font-semibold text-slate-800"
                            title={item.query}
                          >
                            {item.query}
                          </p>

                          {item.normalized !== item.query && (
                            <p className="mt-1 truncate text-xs text-slate-400">
                              {item.normalized}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* USER */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 text-xs font-bold text-white">
                            {item.user?.profileImageUrl ? (
                              <img
                                src={item.user.profileImageUrl}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              getUserName(item)
                                .charAt(0)
                                .toUpperCase()
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-800">
                              {getUserName(item)}
                            </p>

                            {item.user?.role && (
                              <p className="text-xs text-slate-400">
                                {item.user.role}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* LOCATION */}
                      <td className="px-5 py-4">
                        <p className="text-sm text-slate-700">
                          {getLocation(item)}
                        </p>
                      </td>

                      {/* IP */}
                      <td className="px-5 py-4">
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-xs text-slate-600">
                          {item.ipAddress || "—"}
                        </span>
                      </td>

                      {/* DEVICE */}
                      <td className="px-5 py-4">
                        <div>
                          <p className="text-sm font-medium text-slate-700">
                            {item.session?.deviceType ||
                              "Unknown"}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-400">
                            {item.session?.browser ||
                              "Unknown browser"}
                          </p>
                        </div>
                      </td>

                      {/* TIME */}
                      <td className="px-5 py-4">
                        <p className="whitespace-nowrap text-sm text-slate-700">
                          {formatDate(item.createdAt)}
                        </p>
                      </td>

                      {/* ACTION */}
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedSearch(item)
                          }
                          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {!loading && history.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Page{" "}
                <span className="font-semibold text-slate-700">
                  {pagination.page}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700">
                  {Math.max(
                    pagination.totalPages,
                    1,
                  )}
                </span>
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() =>
                    setPage((current) =>
                      Math.max(current - 1, 1),
                    )
                  }
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                <button
                  type="button"
                  disabled={
                    page >= pagination.totalPages
                  }
                  onClick={() =>
                    setPage((current) =>
                      Math.min(
                        current + 1,
                        pagination.totalPages,
                      ),
                    )
                  }
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DETAIL DRAWER */}
      {selectedSearch && (
        <div
          className="fixed inset-0 z-[100] flex justify-end bg-slate-950/40 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedSearch(null);
            }
          }}
        >
          <div className="h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl">
            {/* DRAWER HEADER */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                  Search Details
                </p>

                <h3 className="mt-1 text-xl font-bold text-slate-900">
                  Search Activity
                </h3>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedSearch(null)
                }
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
              >
                ×
              </button>
            </div>

            <div className="space-y-6 p-6">
              {/* QUERY */}
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">
                  Search Query
                </p>

                <p className="mt-2 break-words text-xl font-bold text-slate-900">
                  {selectedSearch.query}
                </p>

                {selectedSearch.normalized && (
                  <p className="mt-2 text-sm text-slate-500">
                    Normalized:{" "}
                    <span className="font-medium text-slate-700">
                      {selectedSearch.normalized}
                    </span>
                  </p>
                )}
              </div>

              {/* USER */}
              <div>
                <h4 className="mb-3 text-sm font-bold text-slate-900">
                  User
                </h4>

                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="font-semibold text-slate-800">
                    {getUserName(selectedSearch)}
                  </p>

                  {selectedSearch.user?.email && (
                    <p className="mt-1 text-sm text-slate-500">
                      {selectedSearch.user.email}
                    </p>
                  )}

                  {selectedSearch.user?.mobile && (
                    <p className="mt-1 text-sm text-slate-500">
                      {selectedSearch.user.mobile}
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedSearch.user?.role && (
                      <span className="rounded-lg bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
                        {selectedSearch.user.role}
                      </span>
                    )}

                    {selectedSearch.user?.isDeleted && (
                      <span className="rounded-lg bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                        Deleted
                      </span>
                    )}

                    {selectedSearch.user?.isDisabled && (
                      <span className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                        Disabled
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* SESSION */}
              <div>
                <h4 className="mb-3 text-sm font-bold text-slate-900">
                  Session
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <InfoBox
                    label="Device"
                    value={
                      selectedSearch.session
                        ?.deviceType || "Unknown"
                    }
                  />

                  <InfoBox
                    label="Browser"
                    value={
                      selectedSearch.session?.browser ||
                      "Unknown"
                    }
                  />

                  <InfoBox
                    label="Operating System"
                    value={
                      selectedSearch.session
                        ?.operatingSystem || "Unknown"
                    }
                  />

                  <InfoBox
                    label="Status"
                    value={
                      selectedSearch.session?.isActive
                        ? "Active"
                        : "Ended"
                    }
                  />
                </div>
              </div>

              {/* NETWORK */}
              <div>
                <h4 className="mb-3 text-sm font-bold text-slate-900">
                  Network & Location
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <InfoBox
                    label="IP Address"
                    value={
                      selectedSearch.ipAddress || "Unknown"
                    }
                  />

                  <InfoBox
                    label="Timezone"
                    value={
                      selectedSearch.timezone || "Unknown"
                    }
                  />

                  <InfoBox
                    label="City"
                    value={
                      selectedSearch.city || "Unknown"
                    }
                  />

                  <InfoBox
                    label="State"
                    value={
                      selectedSearch.state || "Unknown"
                    }
                  />

                  <InfoBox
                    label="Country"
                    value={
                      selectedSearch.country || "Unknown"
                    }
                  />

                  <InfoBox
                    label="Performed At"
                    value={formatDate(
                      selectedSearch.createdAt,
                    )}
                  />
                </div>
              </div>

              {/* FILTERS */}
              {selectedSearch.filters && (
                <div>
                  <h4 className="mb-3 text-sm font-bold text-slate-900">
                    Search Filters
                  </h4>

                  <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs leading-6 text-slate-200">
                    {JSON.stringify(
                      selectedSearch.filters,
                      null,
                      2,
                    )}
                  </pre>
                </div>
              )}

              {/* USER AGENT */}
              {selectedSearch.userAgent && (
                <div>
                  <h4 className="mb-3 text-sm font-bold text-slate-900">
                    User Agent
                  </h4>

                  <div className="break-all rounded-2xl bg-slate-50 p-4 font-mono text-xs leading-5 text-slate-600">
                    {selectedSearch.userAgent}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function InfoBox({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}

export default function AdminAuditPage() {
  const [tab, setTab] = useState<"audit" | "sessions" | "search">("audit");

  return (
    <>
      <div className="space-y-7">
        <PageHeader />
           <AuditTabs
            activeTab={tab}
            onChange={setTab}
           />       

           {tab === "audit" ? (
            <AuditLogsSection />
          ) : tab === "sessions" ? (
            <SessionsSection />
          ) : (
            <SearchHistorySection />
          )}
                </div>
              </>
            );
          }

/* =========================================================
   PAGE HEADER
========================================================= */

function PageHeader() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="mb-2 flex items-center gap-2">
          <Link
            href="/admin"
            className="text-xs font-medium text-gray-400 transition hover:text-gray-700"
          >
            Admin
          </Link>

          <span className="text-gray-300">/</span>

          <span className="text-xs font-medium text-gray-500">
            Audit & Security
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-900 text-lg text-white shadow-sm">
            🛡
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Audit & Security
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Monitor permanent activity and user sessions across Smartprix.
            </p>
          </div>
        </div>
      </div>

      <Link
        href="/admin"
        className="inline-flex h-10 items-center justify-center rounded-xl border bg-white px-4 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
      >
        ← Dashboard
      </Link>
    </div>
  );
}

/* =========================================================
   TAB BUTTON
========================================================= */

function TabButton({
  active,
  icon,
  label,
  description,
  onClick,
}: {
  active: boolean;
  icon: string;
  label: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-left transition ${
        active
          ? "bg-gray-900 text-white shadow-sm"
          : "text-gray-600 hover:bg-gray-50"
      }`}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${
          active
            ? "bg-white/10 text-white"
            : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"
        }`}
      >
        {icon}
      </span>

      <span className="min-w-0">
        <span
          className={`block text-sm font-bold ${
            active ? "text-white" : "text-gray-900"
          }`}
        >
          {label}
        </span>

        <span
          className={`mt-0.5 block text-[11px] ${
            active ? "text-gray-300" : "text-gray-400"
          }`}
        >
          {description}
        </span>
      </span>
    </button>
  );
}

/* =========================================================
   AUDIT LOGS SECTION
========================================================= */

function AuditLogsSection() {
const [logs, setLogs] = useState<AuditLog[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

const [statistics, setStatistics] = useState({
  total: 0,
  active: 0,
  ended: 0,
});

const [search, setSearch] = useState("");
const [category, setCategory] = useState("");
const [action, setAction] = useState("");
const [page, setPage] = useState(1);

const [pagination, setPagination] = useState({
page: 1,
limit: 50,
total: 0,
totalPages: 0,
});

const [selectedLog, setSelectedLog] =
useState<AuditLog | null>(null);


/* =======================================================
LOAD AUDIT LOGS
======================================================= */

const loadLogs = useCallback(async () => {
  try {
    setLoading(true);
    setError("");

    const response = await getAuditLogs({
      page,
      limit: 50,
      user: search.trim() || undefined,
      category: category || undefined,
      action: action || undefined,
    });

    console.log(
  "🚨🚨🚨 NEW AUDIT CODE IS RUNNING 🚨🚨🚨",
  JSON.stringify(response),
);

    console.log("🔥 AUDIT SUCCESS:", response.success);
    console.log("🔥 AUDIT DATA:", response.data);
    console.log(
      "🔥 AUDIT DATA IS ARRAY:",
      Array.isArray(response.data),
    );
    console.log(
      "🔥 AUDIT DATA LENGTH:",
      Array.isArray(response.data)
        ? response.data.length
        : "NOT ARRAY",
    );
    console.log(
      "🔥 FIRST AUDIT RECORD:",
      Array.isArray(response.data)
        ? response.data[0]
        : response.data,
    );

    if (!response.success) {
      throw new Error(
        response.message || "Failed to load audit logs",
      );
    }

    const auditLogs = Array.isArray(response.data)
      ? response.data
      : response.data?.logs || [];

    setLogs(auditLogs);

    setPagination(
      !Array.isArray(response.data) &&
      response.data?.pagination
        ? response.data.pagination
        : {
            page,
            limit: 50,
            total: auditLogs.length,
            totalPages: auditLogs.length > 0 ? 1 : 0,
          },
    );

  } catch (err) {
    console.error("Failed to load audit logs:", err);

    setError(
      err instanceof Error
        ? err.message
        : "Failed to load audit history",
    );
  } finally {
    setLoading(false);
  }
}, [page, search, category, action]);
 

useEffect(() => {
loadLogs();
}, [loadLogs]);

/* =======================================================
STATISTICS
======================================================= */

<AuditStats
  total={logs.length}
  authentication={
    logs.filter((log) => log.category === "AUTH").length
  }
  account={
    logs.filter(
      (log) =>
        log.category === "ACCOUNT" ||
        log.category === "PROFILE",
    ).length
  }
  security={
    logs.filter(
      (log) =>
        log.category === "SECURITY" ||
        log.category === "PERMISSION" ||
        log.category === "ADMIN",
    ).length
  }
/>

/* =======================================================
FILTER STATE
======================================================= */

const hasFilters =
Boolean(search.trim()) ||
Boolean(category) ||
Boolean(action);

function clearFilters() {
setSearch("");
setCategory("");
setAction("");
setPage(1);
}

/* =======================================================
LOADING
======================================================= */

if (loading && logs.length === 0) {
return <AuditLoading />;
}

/* =======================================================
ERROR
======================================================= */

if (error && logs.length === 0) {
return ( <div className="rounded-2xl border border-red-200 bg-red-50 p-6"> <div className="flex items-start gap-4"> <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold text-red-600">
! </div>

 
      <div>
        <h2 className="font-semibold text-red-900">
          Unable to load audit history
        </h2>

        <p className="mt-1 text-sm text-red-700">
          {error}
        </p>

        <button
          type="button"
          onClick={loadLogs}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    </div>
  </div>
);
 

}

return (
<>
{/* =================================================
STATISTICS
================================================= */}

 
<AuditStats
  total={logs.length}
  authentication={
    logs.filter((log) => log.category === "AUTH").length
  }
  account={
    logs.filter(
      (log) =>
        log.category === "ACCOUNT" ||
        log.category === "PROFILE",
    ).length
  }
  security={
    logs.filter(
      (log) =>
        log.category === "SECURITY" ||
        log.category === "PERMISSION" ||
        log.category === "ADMIN",
    ).length
  }
/>

  {/* =================================================
      FILTERS
  ================================================= */}

  <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
    <div className="border-b border-gray-100 px-5 py-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold text-gray-900">
            Activity Filters
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            Search and filter recorded security activity.
          </p>
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs font-semibold text-gray-500 transition hover:text-red-600"
          >
            Clear all filters
          </button>
        )}
      </div>
    </div>

    <div className="p-5">
      <div className="grid gap-3 lg:grid-cols-[1fr_190px_220px_auto]">
        {/* SEARCH */}

        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            ⌕
          </span>

          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search user, email, action or entity..."
            className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* CATEGORY */}

        <select
          value={category}
          onChange={(event) => {
            setCategory(event.target.value);
            setPage(1);
          }}
          className="h-11 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
        >
          <option value="">
            All Categories
          </option>

          <option value="AUTH">
            Authentication
          </option>

          <option value="ACCOUNT">
            Account
          </option>

          <option value="PROFILE">
            Profile
          </option>

          <option value="SECURITY">
            Security
          </option>

          <option value="SESSION">
            Session
          </option>

          <option value="SEARCH">
            Search
          </option>

          <option value="PRODUCT">
            Product
          </option>

          <option value="REVIEW">
            Review
          </option>

          <option value="COMMENT">
            Comment
          </option>

          <option value="SOCIAL">
            Social
          </option>

          <option value="ADMIN">
            Admin
          </option>

          <option value="CONTENT">
            Content
          </option>

          <option value="PERMISSION">
            Permission
          </option>

          <option value="SYSTEM">
            System
          </option>
        </select>

        {/* ACTION */}

        <select
          value={action}
          onChange={(event) => {
            setAction(event.target.value);
            setPage(1);
          }}
          className="h-11 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
        >
          <option value="">
            All Actions
          </option>

          <option value="ACCOUNT_REGISTERED">
            Account Registered
          </option>

          <option value="LOGIN_SUCCESS">
            Login Success
          </option>

          <option value="LOGIN_FAILED">
            Login Failed
          </option>

          <option value="LOGOUT">
            Logout
          </option>

          <option value="SESSION_CREATED">
            Session Created
          </option>

          <option value="SESSION_ENDED">
            Session Ended
          </option>

          <option value="PROFILE_UPDATED">
            Profile Updated
          </option>

          <option value="PROFILE_IMAGE_UPLOADED">
            Profile Image Uploaded
          </option>

          <option value="PROFILE_IMAGE_DELETED">
            Profile Image Deleted
          </option>

          <option value="PASSWORD_CHANGED">
            Password Changed
          </option>

          <option value="PASSWORD_RESET_REQUESTED">
            Password Reset Requested
          </option>

          <option value="PASSWORD_RESET_COMPLETED">
            Password Reset Completed
          </option>

          <option value="SEARCH_PERFORMED">
            Search Performed
          </option>

          <option value="PRODUCT_VIEWED">
            Product Viewed
          </option>

          <option value="PRODUCT_CREATED">
            Product Created
          </option>

          <option value="PRODUCT_UPDATED">
            Product Updated
          </option>

          <option value="PRODUCT_DELETED">
            Product Deleted
          </option>

          <option value="REVIEW_CREATED">
            Review Created
          </option>

          <option value="REVIEW_UPDATED">
            Review Updated
          </option>

          <option value="REVIEW_DELETED">
            Review Deleted
          </option>

          <option value="PRODUCT_SHARED">
            Product Shared
          </option>

          <option value="PRODUCT_FAVORITED">
            Product Favorited
          </option>

          <option value="PRODUCT_UNFAVORITED">
            Product Unfavorited
          </option>

          <option value="USER_VIEWED">
            User Viewed
          </option>

          <option value="USER_UPDATED">
            User Updated
          </option>

          <option value="ADMIN_CREATED">
            Admin Created
          </option>

          <option value="ADMIN_UPDATED">
            Admin Updated
          </option>

          <option value="ADMIN_DISABLED">
            Admin Disabled
          </option>

          <option value="ADMIN_ENABLED">
            Admin Enabled
          </option>

          <option value="PERMISSION_GRANTED">
            Permission Granted
          </option>

          <option value="PERMISSION_REVOKED">
            Permission Revoked
          </option>

          <option value="AUDIT_HISTORY_VIEWED">
            Audit History Viewed
          </option>
        </select>

        {/* RESET */}

        <button
          type="button"
          onClick={clearFilters}
          disabled={!hasFilters}
          className="h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Reset
        </button>
      </div>

      {/* ACTIVE FILTERS */}

      {hasFilters && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
            Active:
          </span>

          {search.trim() && (
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              Search: {search.trim()}
            </span>
          )}

          {category && (
            <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
              Category: {category}
            </span>
          )}

          {action && (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Action: {formatAction(action)}
            </span>
          )}
        </div>
      )}
    </div>
  </section>

  {/* =================================================
      AUDIT TABLE
  ================================================= */}

  <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
    <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
      <div>
        <h2 className="font-semibold text-gray-900">
          Audit Events
        </h2>

        <p className="mt-1 text-xs text-gray-500">
          {pagination.total.toLocaleString("en-IN")} total events
        </p>
      </div>

      <div className="flex items-center gap-3">
        {loading && (
          <span className="text-xs font-medium text-blue-600">
            Refreshing...
          </span>
        )}

        <span className="rounded-full bg-gray-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-gray-500">
          Append Only
        </span>
      </div>
    </div>

   {error && logs.length > 0 && (
  <div className="border-b border-red-100 bg-red-50 px-5 py-3 text-xs font-medium text-red-700">
    {error}
  </div>
)}

{logs.length > 0 ? (
  <div className="divide-y divide-gray-100">
    {logs.map((log) => (
      <AuditRow
        key={log.id}
        log={log}
        onClick={() => setSelectedLog(log)}
      />
    ))}
  </div>
) : (
  <EmptyState />
)}
{logs.length === 0 ? (
  <EmptyState />
) : (
  <div className="divide-y divide-gray-100">
    {logs.map((log) => (
      <AuditRow
        key={log.id}
        log={log}
        onClick={() => setSelectedLog(log)}
      />
    ))}
  </div>
)}
  </section>

  {/* =================================================
      PAGINATION
  ================================================= */}

  {pagination.totalPages > 1 && (
    <Pagination
      page={pagination.page}
      totalPages={pagination.totalPages}
      onChange={setPage}
    />
  )}

  {/* =================================================
      AUDIT DETAIL DRAWER
  ================================================= */}

  {selectedLog && (
    <AuditDetailDrawer
      log={selectedLog}
      onClose={() => setSelectedLog(null)}
    />
  )}
</>
 

);
}


/* =========================================================
   SESSIONS SECTION
========================================================= */

function SessionsSection() {
  const [statistics, setStatistics] = useState({
    total: 0,
    active: 0,
    ended: 0,
  });

  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<SessionStatus>("");
  const [page, setPage] = useState(1);
  const [now, setNow] = useState(() => Date.now());

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });

  const [selectedSession, setSelectedSession] =
    useState<UserSession | null>(null);

  /* =======================================================
     LIVE CLOCK
  ======================================================= */

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  /* =======================================================
     LOAD SESSIONS
  ======================================================= */

  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAllSessions({
        page,
        limit: 50,
        search: search.trim() || undefined,
        status: status || undefined,
      });

      if (!response.success) {
        throw new Error(
          response.message || "Failed to load sessions",
        );
      }

      setSessions(response.data || []);

      setStatistics({
        total: Number(response.statistics?.total ?? 0),
        active: Number(response.statistics?.active ?? 0),
        ended: Number(response.statistics?.ended ?? 0),
      });

      setPagination(
        response.pagination || {
          page,
          limit: 50,
          total: 0,
          totalPages: 0,
        },
      );
    } catch (err) {
      console.error("Failed to load sessions:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load sessions",
      );
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  /* =======================================================
     CLEAR FILTERS
  ======================================================= */

  function clearSessionFilters() {
    setSearch("");
    setStatus("");
    setPage(1);
  }

  const hasFilters =
    Boolean(search.trim()) || Boolean(status);

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading && sessions.length === 0) {
    return <SessionsLoading />;
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error && sessions.length === 0) {
    return (
      <Card className="border-red-200 bg-red-50/60">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 font-bold text-red-600">
              !
            </div>

            <div>
              <h2 className="font-semibold text-red-900">
                Unable to load sessions
              </h2>

              <p className="mt-1 text-sm text-red-700">
                {error}
              </p>

              <Button
                type="button"
                onClick={loadSessions}
                className="mt-4 bg-red-600 text-white hover:bg-red-700"
              >
                Retry
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* =================================================
          STATISTICS
      ================================================= */}

      <section className="grid gap-4 sm:grid-cols-3">
        <SessionStatCard
          label="Total Sessions"
          value={statistics.total}
          icon="◌"
          description="All recorded sessions"
        />

        <SessionStatCard
          label="Active Sessions"
          value={statistics.active}
          icon="●"
          description="Currently active"
        />

        <SessionStatCard
          label="Ended Sessions"
          value={statistics.ended}
          icon="✓"
          description="Completed sessions"
        />
      </section>

      {/* =================================================
          FILTERS
      ================================================= */}

      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-white to-slate-50/70 px-5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base">
                Session Monitor
              </CardTitle>

              <p className="mt-1 text-xs text-slate-500">
                Super Admin view of user login sessions and connection details.
              </p>
            </div>

            <Badge
              variant="outline"
              className="w-fit border-violet-200 bg-violet-50 text-violet-700"
            >
              <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-violet-500" />
              Security Console
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-5">
          <div className="grid gap-3 lg:grid-cols-[1fr_200px_auto]">
            {/* SEARCH */}

            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-slate-400">
                ⌕
              </span>

              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search user, email or mobile..."
                className="h-11 bg-slate-50 pl-9 focus:bg-white"
              />
            </div>

            {/* STATUS */}

            <Select
              value={status || "all"}
              onValueChange={(value) => {
                setStatus(
                  value === "all"
                    ? ""
                    : (value as SessionStatus),
                );
                setPage(1);
              }}
            >
              <SelectTrigger className="h-11 bg-slate-50">
                <SelectValue placeholder="All Sessions" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">
                  All Sessions
                </SelectItem>

                <SelectItem value="active">
                  Active Only
                </SelectItem>

                <SelectItem value="ended">
                  Ended Only
                </SelectItem>
              </SelectContent>
            </Select>

            {/* CLEAR */}

            <Button
              type="button"
              variant="outline"
              onClick={clearSessionFilters}
              disabled={!hasFilters}
              className="h-11"
            >
              Clear
            </Button>
          </div>

          {hasFilters && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Active filters
              </span>

              {search.trim() && (
                <Badge
                  variant="secondary"
                  className="bg-blue-50 text-blue-700 hover:bg-blue-50"
                >
                  Search: {search.trim()}
                </Badge>
              )}

              {status && (
                <Badge
                  variant="secondary"
                  className="bg-violet-50 text-violet-700 hover:bg-violet-50"
                >
                  Status: {status}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* =================================================
          SESSION TABLE
      ================================================= */}

      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base">
                User Sessions
              </CardTitle>

              <p className="mt-1 text-xs text-slate-500">
                {pagination.total.toLocaleString("en-IN")} sessions recorded
              </p>
            </div>

            <div className="flex items-center gap-2">
              {loading && (
                <Badge
                  variant="outline"
                  className="border-blue-200 bg-blue-50 text-blue-600"
                >
                  Refreshing...
                </Badge>
              )}

              <Badge
                variant="outline"
                className="hidden border-slate-200 bg-slate-50 text-slate-500 sm:inline-flex"
              >
                Read Only
              </Badge>
            </div>
          </div>
        </CardHeader>

        {error && sessions.length > 0 && (
          <div className="border-b border-red-100 bg-red-50 px-5 py-3 text-xs font-medium text-red-700">
            {error}
          </div>
        )}

        {sessions.length === 0 ? (
          <SessionsEmptyState />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px]">
              <thead>
                <tr className="border-b bg-slate-50/80 text-left">
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    User
                  </th>

                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Device
                  </th>

                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Browser / OS
                  </th>

                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Network
                  </th>

                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Last Activity
                  </th>

                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Duration
                  </th>

                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Status
                  </th>

                  <th className="w-10 px-3" />
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {sessions.map((session) => (
                  <SessionRow
                    key={session.id}
                    session={session}
                    onClick={() => setSelectedSession(session)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* =================================================
          PAGINATION
      ================================================= */}

      {pagination.totalPages > 1 && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onChange={setPage}
        />
      )}

      {/* =================================================
          SESSION DETAIL
      ================================================= */}

      {selectedSession && (
        <SessionDetailDrawer
          session={selectedSession}
          now={now}
          onClose={() => setSelectedSession(null)}
        />
      )}
    </>
  );
}

/* =========================================================
   SESSION STAT CARD
========================================================= */

function SessionStatCard({
  label,
  value,
  icon,
  description,
}: {
  label: string;
  value: number;
  icon: string;
  description: string;
}) {
  return (
    <Card className="group overflow-hidden border-slate-200 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="relative p-5">
        <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-slate-100/70 transition-transform duration-300 group-hover:scale-125" />

        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">
              {label}
            </p>

            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              {Number(value ?? 0).toLocaleString("en-IN")}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {description}
            </p>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-lg shadow-sm transition-colors group-hover:bg-slate-900 group-hover:text-white">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* =========================================================
   SESSION ROW
========================================================= */

function SessionRow({
  session,
  onClick,
}: {
  session: UserSession;
  onClick: () => void;
}) {
  const userName =
    session.user?.name ||
    session.user?.email ||
    session.user?.mobile ||
    "Unknown User";

  return (
    <tr
      onClick={onClick}
      className="group cursor-pointer transition-colors hover:bg-slate-50/80"
    >
      {/* USER */}

      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <UserAvatar
            name={userName}
            image={session.user?.profileImageUrl}
          />

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">
              {userName}
            </p>

            <p className="mt-0.5 truncate text-xs text-slate-400">
              {session.user?.email ||
                session.user?.mobile ||
                shortId(session.user?.id)}
            </p>

            <Badge
              variant="secondary"
              className="mt-1 h-5 rounded-full bg-slate-100 px-2 text-[9px] font-bold uppercase text-slate-500 hover:bg-slate-100"
            >
              {session.user?.role || "USER"}
            </Badge>
          </div>
        </div>
      </td>

      {/* DEVICE */}

      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600">
            {getDeviceIcon(session.deviceType)}
          </div>

          <span className="text-sm font-medium text-slate-700">
            {session.deviceType || "Unknown"}
          </span>
        </div>
      </td>

      {/* BROWSER / OS */}

      <td className="px-5 py-4">
        <p className="text-sm font-medium text-slate-700">
          {session.browser || "Unknown"}
        </p>

        <p className="mt-1 text-xs text-slate-400">
          {session.operatingSystem || "Unknown"}
        </p>
      </td>

      {/* NETWORK */}

      <td className="px-5 py-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="w-fit">
              <p className="font-mono text-xs font-medium text-slate-600">
                {session.ipAddress || "—"}
              </p>

              <p className="mt-1 max-w-[180px] truncate text-xs text-slate-400">
                {formatLocation(session)}
              </p>
            </div>
          </TooltipTrigger>

          <TooltipContent>
            <p>{formatLocation(session)}</p>
          </TooltipContent>
        </Tooltip>
      </td>

      {/* LAST ACTIVITY */}

      <td className="px-5 py-4">
        <p className="text-xs font-medium text-slate-700">
          {session.lastSeenAt
            ? formatDateTime(session.lastSeenAt)
            : "—"}
        </p>

        <p className="mt-1 text-[10px] text-slate-400">
          Started {formatDateTime(session.startedAt)}
        </p>
      </td>

      {/* DURATION */}

      <td className="px-5 py-4">
        <span className="font-mono text-xs font-semibold text-slate-700">
          {getSessionDuration(session, Date.now())}
        </span>
      </td>

      {/* STATUS */}

      <td className="px-5 py-4">
        <SessionStatusBadge active={session.isActive} />
      </td>

      {/* ARROW */}

      <td className="px-3 py-4">
        <span className="text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-slate-600">
          →
        </span>
      </td>
    </tr>
  );
}

/* =========================================================
   USER AVATAR
========================================================= */

function UserAvatar({
  name,
  image,
}: {
  name: string;
  image?: string | null;
}) {
  const initials = getInitials(name);

  return (
    <div className="relative shrink-0">
      <Avatar className="h-10 w-10 rounded-xl ring-1 ring-slate-200">
        {image && (
          <AvatarImage
            src={image}
            alt={name}
            className="object-cover"
          />
        )}

        <AvatarFallback className="rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white">
          {initials}
        </AvatarFallback>
      </Avatar>

      <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
    </div>
  );
}

/* =========================================================
   SESSION STATUS
========================================================= */

function SessionStatusBadge({
  active,
}: {
  active: boolean;
}) {
  return (
    <Badge
      variant="secondary"
      className={
        active
          ? "gap-1.5 border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
          : "gap-1.5 border border-slate-200 bg-slate-100 text-slate-500 hover:bg-slate-100"
      }
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active
            ? "animate-pulse bg-emerald-500"
            : "bg-slate-400"
        }`}
      />

      {active ? "Active" : "Ended"}
    </Badge>
  );
}

/* =========================================================
   SESSION DETAIL DRAWER
========================================================= */

function SessionDetailDrawer({
  session,
  now,
  onClose,
}: {
  session: UserSession;
  now: number;
  onClose: () => void;
}) {
  const userName =
    session.user?.name ||
    session.user?.email ||
    session.user?.mobile ||
    "Unknown User";

  const duration = getSessionDuration(session, now);

  return (
    <Sheet
      open={Boolean(session)}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <SheetContent
        side="right"
        className="w-full overflow-y-auto p-0 sm:max-w-xl"
      >
        {/* HEADER */}

        <SheetHeader className="border-b bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-6 py-6 text-white">
          <div className="flex items-center gap-3">
            <UserAvatar
              name={userName}
              image={session.user?.profileImageUrl}
            />

            <div className="min-w-0">
              <SheetTitle className="truncate text-lg text-white">
                {userName}
              </SheetTitle>

              <SheetDescription className="mt-1 text-slate-300">
                Session security details
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6 p-6">
          {/* STATUS */}

          <Card
            className={
              session.isActive
                ? "border-emerald-200 bg-emerald-50/70"
                : "border-slate-200 bg-slate-50"
            }
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500">
                    Session Status
                  </p>

                  <div className="mt-2">
                    <SessionStatusBadge
                      active={session.isActive}
                    />
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs font-medium text-slate-500">
                    Duration
                  </p>

                  <p
                    className={`mt-1 font-mono text-xl font-bold ${
                      session.isActive
                        ? "text-emerald-700"
                        : "text-slate-800"
                    }`}
                  >
                    {duration}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <DetailSection title="User">
            <DetailRow
              label="Name"
              value={userName}
            />

            <DetailRow
              label="Email"
              value={session.user?.email || "—"}
            />

            <DetailRow
              label="Mobile"
              value={session.user?.mobile || "—"}
            />

            <DetailRow
              label="Role"
              value={session.user?.role || "USER"}
            />

            <DetailRow
              label="User ID"
              value={session.user?.id || "—"}
              mono
            />
          </DetailSection>

          <DetailSection title="Session">
            <DetailRow
              label="Session ID"
              value={session.id}
              mono
            />

            <DetailRow
              label="Started"
              value={formatDateTime(session.startedAt)}
            />

            <DetailRow
              label="Last Seen"
              value={
                session.lastSeenAt
                  ? `${formatDateTime(
                      session.lastSeenAt,
                    )} (${formatRelativeTime(
                      session.lastSeenAt,
                      now,
                    )})`
                  : "—"
              }
            />

            <DetailRow
              label="Ended"
              value={
                session.endedAt
                  ? formatDateTime(session.endedAt)
                  : "Still active"
              }
            />

            <DetailRow
              label="Duration"
              value={duration}
            />
          </DetailSection>

          <DetailSection title="Device">
            <DetailRow
              label="Device Type"
              value={session.deviceType || "—"}
            />

            <DetailRow
              label="Browser"
              value={session.browser || "—"}
            />

            <DetailRow
              label="Operating System"
              value={session.operatingSystem || "—"}
            />
          </DetailSection>

          <DetailSection title="Network & Location">
            <DetailRow
              label="IP Address"
              value={session.ipAddress || "—"}
              mono
            />

            <DetailRow
              label="Country"
              value={session.country || "—"}
            />

            <DetailRow
              label="State"
              value={session.state || "—"}
            />

            <DetailRow
              label="City"
              value={session.city || "—"}
            />

            <DetailRow
              label="Timezone"
              value={session.timezone || "—"}
            />
          </DetailSection>

          <DetailSection title="Technical">
            <div className="px-4 py-3">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-medium text-slate-500">
                  User Agent
                </span>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="max-w-[280px] cursor-help truncate text-right font-mono text-xs text-slate-700">
                      {session.userAgent || "—"}
                    </span>
                  </TooltipTrigger>

                  <TooltipContent className="max-w-sm break-all">
                    {session.userAgent || "Unknown user agent"}
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            <Separator />

            <DetailRow
              label="Created"
              value={formatDateTime(session.createdAt)}
            />

            <DetailRow
              label="Updated"
              value={formatDateTime(session.updatedAt)}
            />
          </DetailSection>

          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-xs font-semibold text-amber-800">
              Security note
            </p>

            <p className="mt-1 text-xs leading-5 text-amber-700">
              Session information is displayed for security auditing.
              Sensitive authentication secrets are never displayed here.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
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
  const colors = getCategoryColors(
    log.category,
  );

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full flex-col gap-4 px-5 py-5 text-left transition hover:bg-gray-50 lg:flex-row lg:items-center lg:justify-between"
    >
      <div className="flex min-w-0 items-start gap-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${colors.icon}`}
        >
          {getCategoryIcon(log.category)}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${colors.badge}`}
            >
              {log.category || "SYSTEM"}
            </span>

            <span className="text-xs text-gray-400">
              {formatDateTime(log.createdAt)}
            </span>
          </div>

          <h3 className="mt-2 truncate text-sm font-semibold text-gray-900">
            {formatAction(log.action)}
          </h3>

          <p className="mt-1 max-w-2xl truncate text-xs text-gray-500">
            {log.description ||
              formatAction(log.action)}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-400">
            <span>
              Actor:{" "}
              {log.actor?.name ||
                log.actor?.email ||
                shortId(log.actorUserId)}
            </span>

            {log.entityType && (
              <span>
                {log.entityType}
                {log.entityId
                  ? ` • ${shortId(
                      log.entityId,
                    )}`
                  : ""}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-4 pl-15 lg:pl-0">
        {log.ipAddress && (
          <span className="hidden rounded-lg bg-gray-100 px-2.5 py-1.5 font-mono text-[10px] text-gray-500 md:block">
            {log.ipAddress}
          </span>
        )}

        <span className="text-gray-300 transition group-hover:translate-x-1 group-hover:text-gray-500">
          →
        </span>
      </div>
    </button>
  );
}

/* =========================================================
   AUDIT DETAIL DRAWER
========================================================= */

function AuditDetailDrawer({
  log,
  onClose,
}: {
  log: AuditLog;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close audit details"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
      />

      <aside className="absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl">
        <div className="sticky top-0 z-10 border-b bg-white/95 px-6 py-5 backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Audit Event
              </p>

              <h2 className="mt-1 text-xl font-bold text-gray-900">
                {formatAction(log.action)}
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-lg border text-gray-500 transition hover:bg-gray-50 hover:text-gray-900"
            >
              ×
            </button>
          </div>
        </div>

        <div className="space-y-6 p-6">
          {/* EVENT */}

          <DetailSection title="Event">
            <DetailRow
              label="Action"
              value={formatAction(log.action)}
            />

            <DetailRow
              label="Category"
              value={log.category || "SYSTEM"}
            />

            <DetailRow
              label="Description"
              value={
                log.description ||
                "No description"
              }
            />

            <DetailRow
              label="Timestamp"
              value={formatDateTime(
                log.createdAt,
              )}
            />
          </DetailSection>

          {/* USERS */}

          <DetailSection title="Users">
            <DetailRow
              label="Actor"
              value={
                log.actor?.name ||
                log.actor?.email ||
                log.actorUserId ||
                "Unknown"
              }
            />

            <DetailRow
              label="Actor ID"
              value={
                log.actorUserId || "—"
              }
              mono
            />

            <DetailRow
              label="Target User ID"
              value={
                log.targetUserId || "—"
              }
              mono
            />
          </DetailSection>

          {/* ENTITY */}

          <DetailSection title="Entity">
            <DetailRow
              label="Type"
              value={log.entityType || "—"}
            />

            <DetailRow
              label="Entity ID"
              value={log.entityId || "—"}
              mono
            />
          </DetailSection>

          {/* NETWORK */}

          <DetailSection title="Network & Location">
            <DetailRow
              label="IP Address"
              value={log.ipAddress || "—"}
              mono
            />

            <DetailRow
              label="Country"
              value={log.country || "—"}
            />

            <DetailRow
              label="State"
              value={log.state || "—"}
            />

            <DetailRow
              label="City"
              value={log.city || "—"}
            />

            <DetailRow
              label="Timezone"
              value={
                log.timezone || "—"
              }
            />
          </DetailSection>

          {/* SESSION */}

          {log.session && (
            <DetailSection title="Session">
              <DetailRow
                label="Session ID"
                value={log.session.id}
                mono
              />

              <DetailRow
                label="Device"
                value={
                  log.session.deviceType ||
                  "—"
                }
              />

              <DetailRow
                label="Browser"
                value={
                  log.session.browser ||
                  "—"
                }
              />

              <DetailRow
                label="Operating System"
                value={
                  log.session
                    .operatingSystem ||
                  "—"
                }
              />

              <DetailRow
                label="Status"
                value={
                  log.session.isActive
                    ? "Active"
                    : "Ended"
                }
              />

              <DetailRow
                label="Started"
                value={formatDateTime(
                  log.session.startedAt,
                )}
              />

              <DetailRow
                label="Last Seen"
                value={
                  log.session.lastSeenAt
                    ? formatDateTime(
                        log.session.lastSeenAt,
                      )
                    : "—"
                }
              />
            </DetailSection>
          )}

          {/* TECHNICAL */}

          <DetailSection title="Technical">
            <DetailRow
              label="User Agent"
              value={
                log.userAgent || "—"
              }
            />

            <DetailRow
              label="Audit ID"
              value={log.id}
              mono
            />
          </DetailSection>

          {/* METADATA */}

          {log.metadata &&
            Object.keys(log.metadata).length >
              0 && (
              <DetailSection title="Metadata">
                <pre className="overflow-x-auto rounded-xl bg-gray-950 p-4 text-xs leading-6 text-gray-200">
                  {JSON.stringify(
                    log.metadata,
                    null,
                    2,
                  )}
                </pre>
              </DetailSection>
            )}
        </div>
      </aside>
    </div>
  );
}

/* =========================================================
   DETAIL COMPONENTS
========================================================= */

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
        {title}
      </h3>

      <div className="overflow-hidden rounded-xl border bg-gray-50">
        {children}
      </div>
    </section>
  );
}

function DetailRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex gap-4 border-b border-gray-200 px-4 py-3 last:border-b-0">
      <span className="w-32 shrink-0 text-xs font-medium text-gray-500">
        {label}
      </span>

      <span
        className={`min-w-0 break-words text-right text-xs text-gray-900 ${
          mono ? "font-mono" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  label,
  value,
  icon,
  description,
}: {
  label: string;
  value?: number | null;
  icon: string;
  description: string;
}) {
  return (
    <div className="group rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">
            {label}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
            {Number(value ?? 0).toLocaleString("en-IN")}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-lg text-gray-700 transition group-hover:bg-gray-900 group-hover:text-white">
          {icon}
        </div>
      </div>

      <p className="mt-3 text-xs text-gray-400">
        {description}
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
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border bg-white px-5 py-4 shadow-sm">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="rounded-lg border px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        ← Previous
      </button>

      <span className="text-sm text-gray-500">
        Page{" "}
        <strong className="text-gray-900">
          {page}
        </strong>{" "}
        of{" "}
        <strong className="text-gray-900">
          {totalPages}
        </strong>
      </span>

      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="rounded-lg border px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next →
      </button>
    </div>
  );
}

/* =========================================================
   EMPTY STATES
========================================================= */

function EmptyState() {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center px-5 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-2xl">
        🛡
      </div>

      <h3 className="mt-5 font-semibold text-gray-900">
        No audit events found
      </h3>

      <p className="mt-1 max-w-sm text-sm text-gray-500">
        There are no audit records matching the current filters.
      </p>
    </div>
  );
}

function SessionsEmptyState() {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center px-5 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-2xl text-blue-600">
        ◌
      </div>

      <h3 className="mt-5 font-semibold text-gray-900">
        No sessions found
      </h3>

      <p className="mt-1 max-w-sm text-sm text-gray-500">
        No user sessions match the current search or status filter.
      </p>
    </div>
  );
}

/* =========================================================
   LOADING
========================================================= */

function AuditLoading() {
  return (
    <div className="space-y-7">
      <div className="h-20 animate-pulse rounded-2xl bg-gray-100" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-32 animate-pulse rounded-2xl bg-gray-100"
          />
        ))}
      </div>

      <div className="h-20 animate-pulse rounded-2xl bg-gray-100" />

      <div className="h-[500px] animate-pulse rounded-2xl bg-gray-100" />
    </div>
  );
}

function SessionsLoading() {
  return (
    <div className="space-y-7">
      <div className="grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <Card key={item}>
            <CardContent className="space-y-4 p-5">
              <div className="flex justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-9 w-20" />
                </div>

                <Skeleton className="h-11 w-11 rounded-xl" />
              </div>

              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="space-y-4 p-5">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-72" />

          <div className="grid gap-3 lg:grid-cols-[1fr_200px_auto]">
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-24" />
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader>
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-3 w-48" />
        </CardHeader>

        <CardContent className="space-y-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-4"
            >
              <Skeleton className="h-10 w-10 rounded-xl" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

/* =========================================================
   CATEGORY HELPERS
========================================================= */

function getCategoryColors(
  category: string,
) {
  switch (category?.toUpperCase()) {
    case "AUTH":
      return {
        icon: "bg-blue-50 text-blue-600",
        badge: "bg-blue-50 text-blue-700",
      };

    case "SECURITY":
      return {
        icon: "bg-red-50 text-red-600",
        badge: "bg-red-50 text-red-700",
      };

    case "ADMIN":
      return {
        icon: "bg-purple-50 text-purple-600",
        badge: "bg-purple-50 text-purple-700",
      };

    case "PROFILE":
      return {
        icon: "bg-pink-50 text-pink-600",
        badge: "bg-pink-50 text-pink-700",
      };

    case "PRODUCT":
      return {
        icon: "bg-orange-50 text-orange-600",
        badge: "bg-orange-50 text-orange-700",
      };

    case "REVIEW":
      return {
        icon: "bg-yellow-50 text-yellow-700",
        badge: "bg-yellow-50 text-yellow-700",
      };

    case "SEARCH":
      return {
        icon: "bg-cyan-50 text-cyan-600",
        badge: "bg-cyan-50 text-cyan-700",
      };

    case "PERMISSION":
      return {
        icon: "bg-indigo-50 text-indigo-600",
        badge: "bg-indigo-50 text-indigo-700",
      };

    case "ACCOUNT":
      return {
        icon: "bg-green-50 text-green-600",
        badge: "bg-green-50 text-green-700",
      };

    case "SESSION":
      return {
        icon: "bg-violet-50 text-violet-600",
        badge: "bg-violet-50 text-violet-700",
      };

    default:
      return {
        icon: "bg-gray-100 text-gray-600",
        badge: "bg-gray-100 text-gray-700",
      };
  }
}

function getCategoryIcon(
  category: string,
) {
  switch (category?.toUpperCase()) {
    case "AUTH":
      return "↪";

    case "SECURITY":
      return "◆";

    case "ADMIN":
      return "★";

    case "PROFILE":
      return "●";

    case "PRODUCT":
      return "▣";

    case "REVIEW":
      return "★";

    case "SEARCH":
      return "⌕";

    case "PERMISSION":
      return "✓";

    case "ACCOUNT":
      return "◎";

    case "SESSION":
      return "◌";

    default:
      return "•";
  }
}

/* =========================================================
   DEVICE HELPERS
========================================================= */

function getDeviceIcon(
  device?: string | null,
) {
  const value =
    device?.toLowerCase() || "";

  if (
    value.includes("mobile") ||
    value.includes("phone")
  ) {
    return "▯";
  }

  if (value.includes("tablet")) {
    return "▯";
  }

  if (
    value.includes("desktop") ||
    value.includes("computer")
  ) {
    return "▣";
  }

  return "◇";
}

function formatLocation(
  session: UserSession,
) {
  const parts = [
    session.city,
    session.state,
    session.country,
  ].filter(Boolean);

  if (parts.length > 0) {
    return parts.join(", ");
  }

  return "Location unavailable";
}

/* =========================================================
   SESSION DURATION HELPERS
========================================================= */

function getSessionDuration(
  session: UserSession,
  now: number,
) {
  const startedAt =
    new Date(session.startedAt).getTime();

  if (!Number.isFinite(startedAt)) {
    return "—";
  }

  let endAt: number;

  if (
    session.isActive ||
    !session.endedAt
  ) {
    endAt = now;
  } else {
    endAt =
      new Date(session.endedAt).getTime();

    if (!Number.isFinite(endAt)) {
      endAt = now;
    }
  }

  const durationMs = Math.max(
    0,
    endAt - startedAt,
  );

  return formatDuration(durationMs);
}

function formatDuration(
  durationMs: number,
) {
  const totalSeconds = Math.floor(
    durationMs / 1000,
  );

  const days = Math.floor(
    totalSeconds / 86400,
  );

  const hours = Math.floor(
    (totalSeconds % 86400) / 3600,
  );

  const minutes = Math.floor(
    (totalSeconds % 3600) / 60,
  );

  const seconds =
    totalSeconds % 60;

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }

  return `${seconds}s`;
}

function formatRelativeTime(
  date: string,
  now: number,
) {
  const timestamp =
    new Date(date).getTime();

  if (!Number.isFinite(timestamp)) {
    return "Unknown";
  }

  const diffSeconds = Math.max(
    0,
    Math.floor(
      (now - timestamp) / 1000,
    ),
  );

  if (diffSeconds < 5) {
    return "Just now";
  }

  if (diffSeconds < 60) {
    return `${diffSeconds}s ago`;
  }

  const minutes = Math.floor(
    diffSeconds / 60,
  );

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(
    minutes / 60,
  );

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(
    hours / 24,
  );

  return `${days}d ago`;
}

/* =========================================================
   FORMATTERS
========================================================= */

function formatAction(
  action: string,
) {
  if (!action) {
    return "Unknown Activity";
  }

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

function formatDateTime(
  date: string,
) {
  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    },
  ).format(new Date(date));
}

function shortId(
  id?: string | null,
) {
  if (!id) {
    return "Unknown";
  }

  if (id.length <= 14) {
    return id;
  }

  return `${id.slice(0, 7)}…${id.slice(-5)}`;
}

function getInitials(
  name: string,
) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "?";
  }

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    parts[0].charAt(0) +
    parts[parts.length - 1].charAt(0)
  ).toUpperCase();
}
