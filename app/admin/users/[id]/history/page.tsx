"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Image as ImageIcon,
  KeyRound,
  LogIn,
  LogOut,
  RefreshCw,
  Shield,
  Trash2,
  User,
  UserCheck,
  UserCog,
  UserPlus,
  UserX,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  getUserHistory,
  type UserHistoryLog,
  type UserHistoryResponse,
} from "@/lib/api/user";

/* =========================================================
   HELPERS
========================================================= */

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5000/api";

const getImageUrl = (
  image?: string | null,
) => {
  if (!image) return null;

  if (
    image.startsWith("http://") ||
    image.startsWith("https://")
  ) {
    return image;
  }

  return `${API_URL.replace(
    /\/api$/,
    "",
  )}${image.startsWith("/") ? image : `/${image}`}`;
};

const formatDate = (
  value?: string | null,
) => {
  if (!value) return "—";

  return new Date(value).toLocaleString(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  );
};

const formatShortDate = (
  value?: string | null,
) => {
  if (!value) return "—";

  return new Date(value).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  );
};

const formatAction = (
  action: string,
) => {
  return action
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) =>
      char.toUpperCase(),
    );
};

const getMetadata = (
  log: UserHistoryLog,
) => {
  if (
    !log.metadata ||
    typeof log.metadata !== "object"
  ) {
    return {};
  }

  return log.metadata;
};

const getActionCategory = (
  action: string,
) => {
  if (
    action.includes("LOGIN") ||
    action.includes("LOGOUT") ||
    action.includes("PASSWORD")
  ) {
    return "AUTH";
  }

  if (
    action.includes("PROFILE")
  ) {
    return "PROFILE";
  }

  if (
    action.includes("DELETE") ||
    action.includes("DISABLED") ||
    action.includes("ENABLED") ||
    action.includes("REGISTERED")
  ) {
    return "ACCOUNT";
  }

  if (
    action.startsWith("ADMIN_") ||
    action.includes("ROLE_") ||
    action.includes("PERMISSION") ||
    action.includes("SETTINGS")
  ) {
    return "ADMIN";
  }

  return "ACCOUNT";
};

/* =========================================================
   ACTION ICON
========================================================= */

function ActionIcon({
  action,
}: {
  action: string;
}) {
  const size = 19;

  if (action === "USER_LOGIN") {
    return <LogIn size={size} />;
  }

  if (action === "USER_LOGOUT") {
    return <LogOut size={size} />;
  }

  if (action === "USER_REGISTERED") {
    return <UserPlus size={size} />;
  }

  if (action === "USER_DELETED") {
    return <Trash2 size={size} />;
  }

  if (
    action === "PROFILE_IMAGE_UPDATED"
  ) {
    return <ImageIcon size={size} />;
  }

  if (
    action === "PROFILE_IMAGE_DELETED"
  ) {
    return <XCircle size={size} />;
  }

  if (action === "PROFILE_UPDATED") {
    return <UserCog size={size} />;
  }

  if (action === "USER_DISABLED") {
    return <UserX size={size} />;
  }

  if (action === "USER_ENABLED") {
    return <UserCheck size={size} />;
  }

  if (
    action.startsWith("ADMIN_") ||
    action.includes("ROLE_") ||
    action.includes("PERMISSION")
  ) {
    return <Shield size={size} />;
  }

  return <Clock3 size={size} />;
}

/* =========================================================
   ACTION COLOR
========================================================= */

const actionClass = (
  action: string,
) => {
  if (action === "USER_LOGIN") {
    return "bg-emerald-50 text-emerald-600 ring-emerald-100";
  }

  if (action === "USER_LOGOUT") {
    return "bg-slate-100 text-slate-600 ring-slate-200";
  }

  if (action === "USER_REGISTERED") {
    return "bg-blue-50 text-blue-600 ring-blue-100";
  }

  if (action === "USER_DELETED") {
    return "bg-red-50 text-red-600 ring-red-100";
  }

  if (
    action === "PROFILE_IMAGE_UPDATED"
  ) {
    return "bg-purple-50 text-purple-600 ring-purple-100";
  }

  if (
    action === "PROFILE_IMAGE_DELETED"
  ) {
    return "bg-orange-50 text-orange-600 ring-orange-100";
  }

  if (action === "PROFILE_UPDATED") {
    return "bg-indigo-50 text-indigo-600 ring-indigo-100";
  }

  if (
    action.startsWith("ADMIN_") ||
    action.includes("ROLE_") ||
    action.includes("PERMISSION")
  ) {
    return "bg-amber-50 text-amber-600 ring-amber-100";
  }

  return "bg-slate-50 text-slate-600 ring-slate-200";
};

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  title,
  value,
  icon,
  className = "",
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-600">
          {icon}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   LOG DETAILS
========================================================= */

function LogDetails({
  log,
}: {
  log: UserHistoryLog;
}) {
  const metadata = getMetadata(log);

  if (
    log.action === "USER_LOGIN"
  ) {
    const method =
      typeof metadata.method === "string"
        ? metadata.method
        : "password";

    const identifierType =
      typeof metadata.identifierType ===
      "string"
        ? metadata.identifierType
        : null;

    return (
      <div className="space-y-2 text-sm">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            Login successful
          </span>

          <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
            Method: {method}
          </span>

          {identifierType && (
            <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
              Via {identifierType}
            </span>
          )}
        </div>
      </div>
    );
  }

  if (
    log.action === "USER_LOGOUT"
  ) {
    return (
      <span className="text-sm text-slate-500">
        User manually logged out of the account.
      </span>
    );
  }

  if (
    log.action === "USER_REGISTERED"
  ) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-slate-600">
          Account created successfully.
        </p>

        <div className="flex flex-wrap gap-2">
          {typeof metadata.method ===
            "string" && (
            <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
              {metadata.method}
            </span>
          )}
        </div>
      </div>
    );
  }

  if (
    log.action === "PROFILE_UPDATED"
  ) {
    const changedFields =
      Array.isArray(
        metadata.changedFields,
      )
        ? metadata.changedFields.filter(
            (item): item is string =>
              typeof item === "string",
          )
        : [];

    return (
      <div>
        <p className="text-sm text-slate-600">
          Profile information was updated.
        </p>

        {changedFields.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {changedFields.map(
              (field) => (
                <span
                  key={field}
                  className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700"
                >
                  {field}
                </span>
              ),
            )}
          </div>
        )}
      </div>
    );
  }

  if (
    log.action ===
    "PROFILE_IMAGE_UPDATED"
  ) {
    return (
      <div>
        <p className="text-sm text-slate-600">
          Profile picture was updated.
        </p>

        {typeof metadata.hadPreviousImage ===
          "boolean" && (
          <p className="mt-1 text-xs text-slate-400">
            Previous image:{" "}
            {metadata.hadPreviousImage
              ? "Yes"
              : "No"}
          </p>
        )}
      </div>
    );
  }

  if (
    log.action ===
    "PROFILE_IMAGE_DELETED"
  ) {
    return (
      <p className="text-sm text-slate-600">
        Profile picture was removed from the account.
      </p>
    );
  }

  if (
    log.action === "USER_DELETED"
  ) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50/60 p-4">
        <p className="text-sm font-semibold text-red-700">
          Account permanently deleted
        </p>

        <div className="mt-3 grid gap-2 text-xs text-red-700 sm:grid-cols-2">
          {typeof metadata.name ===
            "string" && (
            <div>
              <span className="font-semibold">
                Name:
              </span>{" "}
              {metadata.name}
            </div>
          )}

          {typeof metadata.email ===
            "string" && (
            <div>
              <span className="font-semibold">
                Email:
              </span>{" "}
              {metadata.email}
            </div>
          )}

          {typeof metadata.mobile ===
            "string" && (
            <div>
              <span className="font-semibold">
                Mobile:
              </span>{" "}
              {metadata.mobile}
            </div>
          )}

          {typeof metadata.reason ===
            "string" && (
            <div>
              <span className="font-semibold">
                Reason:
              </span>{" "}
              {metadata.reason}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (
    log.action === "USER_DISABLED"
  ) {
    return (
      <p className="text-sm text-slate-600">
        The account was disabled by an administrator.
      </p>
    );
  }

  if (
    log.action === "USER_ENABLED"
  ) {
    return (
      <p className="text-sm text-slate-600">
        The account was enabled by an administrator.
      </p>
    );
  }

  if (
    log.action.startsWith("ADMIN_") ||
    log.action.includes("ROLE_") ||
    log.action.includes("PERMISSION") ||
    log.action.includes("SETTINGS")
  ) {
    return (
      <p className="text-sm text-slate-600">
        Administrative action performed on this account.
      </p>
    );
  }

  return (
    <p className="text-sm text-slate-500">
      Activity recorded in the system.
    </p>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function UserHistoryPage() {
  const params = useParams();

  const userId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const [result, setResult] =
    useState<UserHistoryResponse | null>(
      null,
    );

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [filter, setFilter] =
    useState("ALL");

  /* =======================================================
     LOAD
  ======================================================= */

  const loadHistory = useCallback(
    async (
      showRefresh = false,
    ) => {
      if (!userId) return;

      try {
        setError("");

        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const response =
          await getUserHistory(userId);

        setResult(response);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load user history",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [userId],
  );

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  /* =======================================================
     FILTER
  ======================================================= */

  const logs = useMemo(() => {
    const source =
      result?.data?.logs ?? [];

    if (filter === "ALL") {
      return source;
    }

    return source.filter(
      (log) =>
        getActionCategory(
          log.action,
        ) === filter,
    );
  }, [result, filter]);

  const user =
    result?.data?.user ?? null;

  const stats =
    result?.data?.stats;

  const isDeleted =
    Boolean(
      stats?.deleted &&
        stats.deleted > 0,
    ) && !user?.updatedAt;

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f7fb] p-6">
        <div className="mx-auto max-w-[1400px] animate-pulse space-y-6">
          <div className="h-10 w-64 rounded-xl bg-slate-200" />
          <div className="h-44 rounded-3xl bg-white" />

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({
              length: 4,
            }).map((_, index) => (
              <div
                key={index}
                className="h-28 rounded-2xl bg-white"
              />
            ))}
          </div>

          <div className="h-[500px] rounded-3xl bg-white" />
        </div>
      </div>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error) {
    return (
      <div className="min-h-screen bg-[#f5f7fb] p-6">
        <div className="mx-auto max-w-[1400px]">
          <Link
            href="/admin/users"
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft size={17} />
            Back to Users
          </Link>

          <div className="rounded-3xl border border-red-100 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <XCircle size={28} />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              Unable to load history
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                loadHistory()
              }
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <RefreshCw size={16} />
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     MAIN
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <div className="mx-auto max-w-[1400px] space-y-6 p-4 sm:p-6 lg:p-8">

        {/* =================================================
            TOP BAR
        ================================================= */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/admin/users"
              className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
            >
              <ArrowLeft size={16} />
              Back to Users
            </Link>

            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              User History
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Complete account activity and audit timeline.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              loadHistory(true)
            }
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
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
        </div>

        {/* =================================================
            USER HERO
        ================================================= */}

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="h-2 bg-gradient-to-r from-blue-500 via-violet-500 to-fuchsia-500" />

          <div className="p-6 sm:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 text-2xl font-black text-white shadow-lg">
                    {user?.profileImageUrl ? (
                      <img
                        src={getImageUrl(
                          user.profileImageUrl,
                        ) ?? ""}
                        alt={
                          user.name ??
                          "User"
                        }
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span>
                        {(
                          user?.name ??
                          user?.email ??
                          "U"
                        )
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                    )}
                  </div>

                  <span
                    className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-4 border-white ${
                      user?.isDisabled
                        ? "bg-red-500"
                        : "bg-emerald-500"
                    }`}
                  />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-black text-slate-900 sm:text-2xl">
                      {user?.name ||
                        "Deleted User"}
                    </h2>

                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
                        user?.isDisabled
                          ? "bg-red-50 text-red-600"
                          : "bg-emerald-50 text-emerald-600"
                      }`}
                    >
                      {user?.isDisabled
                        ? "Disabled"
                        : "Active"}
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-slate-500">
                    {user?.email ||
                      "No email available"}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                      <Shield size={13} />
                      {user?.role ??
                        "USER"}
                    </span>

                    {user?.mobile && (
                      <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                        {user.mobile}
                      </span>
                    )}

                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                      <Clock3 size={13} />
                      Joined{" "}
                      {formatShortDate(
                        user?.createdAt,
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 md:min-w-[220px]">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Last activity
                </p>

                <p className="mt-2 text-sm font-bold text-slate-800">
                  {logs[0]
                    ? formatDate(
                        logs[0].createdAt,
                      )
                    : "No activity"}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {logs[0]
                    ? formatAction(
                        logs[0].action,
                      )
                    : "—"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            STATS
        ================================================= */}

        {stats && (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              title="Total Events"
              value={stats.total}
              icon={<Clock3 size={20} />}
            />

            <StatCard
              title="Logins"
              value={stats.logins}
              icon={<LogIn size={20} />}
            />

            <StatCard
              title="Profile Changes"
              value={
                stats.profileUpdates +
                stats.profileImageUpdates +
                stats.profileImageDeletes
              }
              icon={<UserCog size={20} />}
            />

            <StatCard
              title="Admin Actions"
              value={stats.adminActions}
              icon={<Shield size={20} />}
            />
          </div>
        )}

        {/* =================================================
            FILTERS
        ================================================= */}

        <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
          <div className="flex gap-1 overflow-x-auto">
            {[
              "ALL",
              "AUTH",
              "PROFILE",
              "ACCOUNT",
              "ADMIN",
            ].map((item) => {
              const active =
                filter === item;

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() =>
                    setFilter(item)
                  }
                  className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                    active
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                  }`}
                >
                  {item === "ALL"
                    ? "All Activity"
                    : item.charAt(0) +
                      item
                        .slice(1)
                        .toLowerCase()}
                </button>
              );
            })}
          </div>
        </div>

        {/* =================================================
            TIMELINE
        ================================================= */}

        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5 sm:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Activity Timeline
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  {logs.length} event
                  {logs.length === 1
                    ? ""
                    : "s"} shown
                </p>
              </div>

              <div className="hidden items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500 sm:flex">
                <KeyRound size={14} />
                Audit history
              </div>
            </div>
          </div>

          {logs.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Clock3 size={25} />
              </div>

              <h4 className="mt-4 font-bold text-slate-800">
                No activity found
              </h4>

              <p className="mt-1 text-sm text-slate-400">
                No events match the selected filter.
              </p>
            </div>
          ) : (
            <div className="p-6 sm:p-8">
              <div className="relative">
                <div className="absolute bottom-5 left-[21px] top-5 w-px bg-slate-200" />

                <div className="space-y-8">
                  {logs.map(
                    (
                      log,
                      index,
                    ) => {
                      const actor =
                        log.actor;

                      const category =
                        getActionCategory(
                          log.action,
                        );

                      return (
                        <div
                          key={log.id}
                          className="relative flex gap-4"
                        >
                          {/* ICON */}
                          <div
                            className={`relative z-10 flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-2xl ring-4 ring-white ${actionClass(
                              log.action,
                            )}`}
                          >
                            <ActionIcon
                              action={
                                log.action
                              }
                            />
                          </div>

                          {/* CONTENT */}
                          <div className="min-w-0 flex-1">
                            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition hover:border-slate-200 hover:bg-white hover:shadow-sm sm:p-5">
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h4 className="font-bold text-slate-900">
                                      {formatAction(
                                        log.action,
                                      )}
                                    </h4>

                                    <span className="rounded-md bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 shadow-sm">
                                      {category}
                                    </span>
                                  </div>

                                  <p className="mt-1 text-xs text-slate-400">
                                    {formatDate(
                                      log.createdAt,
                                    )}
                                  </p>
                                </div>

                                {index ===
                                  0 && (
                                  <span className="inline-flex w-fit items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600">
                                    <CheckCircle2
                                      size={
                                        12
                                      }
                                    />
                                    Latest
                                  </span>
                                )}
                              </div>

                              <div className="mt-4">
                                <LogDetails
                                  log={log}
                                />
                              </div>

                              {/* ACTOR */}
                              {actor &&
                                log.actorUserId !==
                                  userId && (
                                  <div className="mt-4 flex items-center gap-3 border-t border-slate-200/70 pt-4">
                                    <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-slate-200 text-xs font-bold text-slate-600">
                                      {actor.profileImageUrl ? (
                                        <img
                                          src={
                                            getImageUrl(
                                              actor.profileImageUrl,
                                            ) ??
                                            ""
                                          }
                                          alt={
                                            actor.name ??
                                            "Admin"
                                          }
                                          className="h-full w-full object-cover"
                                        />
                                      ) : (
                                        (
                                          actor.name ??
                                          actor.email ??
                                          "A"
                                        )
                                          .charAt(
                                            0,
                                          )
                                          .toUpperCase()
                                      )}
                                    </div>

                                    <div>
                                      <p className="text-xs font-bold text-slate-700">
                                        {actor.name ||
                                          actor.email}
                                      </p>

                                      <p className="text-[11px] text-slate-400">
                                        {actor.role} · Performed this action
                                      </p>
                                    </div>
                                  </div>
                                )}

                              {/* SELF ACTION */}
                              {log.actorUserId ===
                                userId && (
                                <div className="mt-4 border-t border-slate-200/70 pt-3">
                                  <span className="text-[11px] font-semibold text-slate-400">
                                    Action performed by the user
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* =================================================
            FOOTER INFO
        ================================================= */}

        <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <span>
            User ID:{" "}
            <span className="font-mono text-slate-500">
              {userId}
            </span>
          </span>

          <span>
            History is generated from the audit log.
          </span>
        </div>
      </div>
    </div>
  );
}