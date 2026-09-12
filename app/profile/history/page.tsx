"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Image as ImageIcon,
  LogIn,
  LogOut,
  RefreshCw,
  ShieldCheck,
  User,
  UserCheck,
  UserCog,
  UserPlus,
  UserX,
  Activity,
  Settings,
  Mail,
  Phone,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

interface HistoryUser {
  id: string;
  name: string | null;
  email: string | null;
  mobile: string | null;
  role: string;
  isDisabled: boolean;
  profileImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

interface HistoryLog {
  id: string;
  actorUserId: string | null;
  targetUserId: string | null;
  action: string;
  metadata: unknown;
  createdAt: string;
  actor?: {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
    profileImageUrl: string | null;
  } | null;
}

interface HistoryStats {
  total: number;
  registered: number;
  logins: number;
  logouts: number;
  profileUpdates: number;
  profileImageUpdates: number;
  profileImageDeletes: number;
  deleted: number;
  adminActions: number;
}

interface HistoryResponse {
  user: HistoryUser;
  logs: HistoryLog[];
  stats: HistoryStats;
}

/* =========================================================
   API
========================================================= */

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

/* =========================================================
   HELPERS
========================================================= */

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(date: string) {
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getInitials(name?: string | null) {
  if (!name) return "U";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function getActionTitle(action: string) {
  const titles: Record<string, string> = {
    USER_REGISTERED: "Account created",
    USER_LOGIN: "Signed in",
    USER_LOGOUT: "Signed out",
    PROFILE_UPDATED: "Profile updated",
    PROFILE_IMAGE_UPDATED: "Profile picture updated",
    PROFILE_IMAGE_DELETED: "Profile picture removed",
    USER_DELETED: "Account deleted",
  };

  return titles[action] ?? action.replaceAll("_", " ");
}

function getActionDescription(action: string) {
  const descriptions: Record<string, string> = {
    USER_REGISTERED: "Your Smartprix account was created.",
    USER_LOGIN: "You successfully signed in to your account.",
    USER_LOGOUT: "You signed out of your Smartprix account.",
    PROFILE_UPDATED: "Your account profile information was updated.",
    PROFILE_IMAGE_UPDATED: "Your profile picture was changed.",
    PROFILE_IMAGE_DELETED: "Your profile picture was removed.",
    USER_DELETED: "Your account was deleted.",
  };

  return (
    descriptions[action] ??
    "An activity was recorded on your Smartprix account."
  );
}

function getActionIcon(action: string) {
  switch (action) {
    case "USER_REGISTERED":
      return UserPlus;

    case "USER_LOGIN":
      return LogIn;

    case "USER_LOGOUT":
      return LogOut;

    case "PROFILE_UPDATED":
      return UserCog;

    case "PROFILE_IMAGE_UPDATED":
      return ImageIcon;

    case "PROFILE_IMAGE_DELETED":
      return UserX;

    case "USER_DELETED":
      return UserX;

    default:
      return Activity;
  }
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">
          <Icon className="h-5 w-5 text-gray-700" />
        </div>

        <span className="text-2xl font-bold text-gray-900">
          {value}
        </span>
      </div>

      <p className="mt-4 text-sm font-medium text-gray-500">{label}</p>
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function ProfileHistoryPage() {
  const [history, setHistory] = useState<HistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  /* =======================================================
     FETCH HISTORY
  ======================================================= */

  const loadHistory = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const token = localStorage.getItem("smartprix_token");

      if (!token) {
        setError("Please sign in to view your account history.");
        return;
      }

      const response = await fetch(`${API_URL}/profile/history`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to load profile history."
        );
      }

      setHistory(result.data);
    } catch (err) {
      console.error("Profile history error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading your history."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f4f6f8]">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="h-6 w-32 animate-pulse rounded bg-gray-200" />

          <div className="mt-6 h-40 animate-pulse rounded-3xl bg-white" />

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-32 animate-pulse rounded-2xl bg-white"
              />
            ))}
          </div>

          <div className="mt-6 h-96 animate-pulse rounded-3xl bg-white" />
        </div>
      </main>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error || !history) {
    return (
      <main className="min-h-screen bg-[#f4f6f8]">
        <div className="mx-auto flex min-h-screen max-w-xl items-center justify-center px-5">
          <div className="w-full rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <Activity className="h-7 w-7 text-red-500" />
            </div>

            <h1 className="mt-5 text-xl font-bold text-gray-900">
              Unable to load history
            </h1>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              {error || "We couldn't load your account activity."}
            </p>

            <button
              onClick={() => loadHistory()}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-black"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
          </div>
        </div>
      </main>
    );
  }

  const { user, logs, stats } = history;

  /* =======================================================
     MAIN
  ======================================================= */

  return (
    <main className="min-h-screen bg-[#f4f6f8]">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">

        {/* =================================================
            TOP BAR
        ================================================= */}

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Profile
          </Link>

          <button
            onClick={() => loadHistory(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                refreshing ? "animate-spin" : ""
              }`}
            />

            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* =================================================
            PROFILE HEADER
        ================================================= */}

        <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="h-28 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700" />

          <div className="px-5 pb-6 sm:px-7">
            <div className="-mt-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

              <div className="flex items-end gap-4">
                {/* Avatar */}
                <div className="relative">
                  <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-gray-100 text-2xl font-bold text-gray-600 shadow-md">
                    {user.profileImageUrl ? (
                      <img
                        src={user.profileImageUrl}
                        alt={user.name ?? "Profile"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      getInitials(user.name)
                    )}
                  </div>

                  <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-4 border-white bg-emerald-500" />
                </div>

                <div className="pb-1">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {user.name || "Smartprix User"}
                  </h1>

                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                    {user.email && (
                      <span className="inline-flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5" />
                        {user.email}
                      </span>
                    )}

                    {user.mobile && (
                      <span className="inline-flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5" />
                        {user.mobile}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {user.isDisabled ? "Disabled" : "Active"}
                </span>

                <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-gray-600">
                  {user.role}
                </span>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-5 border-t border-gray-100 pt-5 text-sm text-gray-500">
              <div className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Joined {formatDate(user.createdAt)}
              </div>

              <div className="inline-flex items-center gap-2">
                <Clock3 className="h-4 w-4" />
                Updated {formatDate(user.updatedAt)}
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            STATS
        ================================================= */}

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Activity}
            label="Total activities"
            value={stats.total}
          />

          <StatCard
            icon={LogIn}
            label="Successful logins"
            value={stats.logins}
          />

          <StatCard
            icon={UserCog}
            label="Profile updates"
            value={stats.profileUpdates}
          />

          <StatCard
            icon={ImageIcon}
            label="Image updates"
            value={stats.profileImageUpdates}
          />
        </section>

        {/* =================================================
            EXTRA STATS
        ================================================= */}

        <section className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Registered
            </p>
            <p className="mt-1 text-xl font-bold text-gray-900">
              {stats.registered}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Logouts
            </p>
            <p className="mt-1 text-xl font-bold text-gray-900">
              {stats.logouts}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Profile images removed
            </p>
            <p className="mt-1 text-xl font-bold text-gray-900">
              {stats.profileImageDeletes}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Admin actions
            </p>
            <p className="mt-1 text-xl font-bold text-gray-900">
              {stats.adminActions}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Deleted events
            </p>
            <p className="mt-1 text-xl font-bold text-gray-900">
              {stats.deleted}
            </p>
          </div>
        </section>

        {/* =================================================
            ACTIVITY HISTORY
        ================================================= */}

        <section className="mt-6 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-5 sm:px-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Account activity
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  A timeline of activity associated with your Smartprix account.
                </p>
              </div>

              <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-gray-100 sm:flex">
                <Activity className="h-5 w-5 text-gray-600" />
              </div>
            </div>
          </div>

          {logs.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <Clock3 className="h-7 w-7 text-gray-400" />
              </div>

              <h3 className="mt-5 text-lg font-bold text-gray-900">
                No activity yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                Your account activity will appear here when actions are
                recorded.
              </p>
            </div>
          ) : (
            <div className="px-5 py-7 sm:px-7">
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute bottom-5 left-[19px] top-5 w-px bg-gray-200" />

                <div className="space-y-7">
                  {logs.map((log) => {
                    const Icon = getActionIcon(log.action);

                    const isDanger =
                      log.action === "USER_DELETED" ||
                      log.action === "PROFILE_IMAGE_DELETED";

                    return (
                      <div
                        key={log.id}
                        className="relative flex gap-4"
                      >
                        {/* Icon */}
                        <div
                          className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-4 border-white shadow-sm ${
                            isDanger
                              ? "bg-red-50 text-red-500"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>

                        {/* Content */}
                        <div className="min-w-0 flex-1 rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <h3 className="font-bold text-gray-900">
                                {getActionTitle(log.action)}
                              </h3>

                              <p className="mt-1 text-sm leading-6 text-gray-500">
                                {getActionDescription(log.action)}
                              </p>
                            </div>

                            <span className="shrink-0 text-xs font-medium text-gray-400">
                              {formatDateTime(log.createdAt)}
                            </span>
                          </div>

                          {/* Actor */}
                          {log.actor && log.actor.id !== user.id && (
                            <div className="mt-3 flex items-center gap-2 border-t border-gray-200 pt-3">
                              <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-gray-200 text-[10px] font-bold text-gray-600">
                                {log.actor.profileImageUrl ? (
                                  <img
                                    src={log.actor.profileImageUrl}
                                    alt={log.actor.name ?? "User"}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  getInitials(log.actor.name)
                                )}
                              </div>

                              <div className="text-xs text-gray-500">
                                Action performed by{" "}
                                <span className="font-semibold text-gray-700">
                                  {log.actor.name || "Administrator"}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* =================================================
            SECURITY / SETTINGS
        ================================================= */}

        <section className="mt-6 mb-8 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                <ShieldCheck className="h-6 w-6 text-gray-700" />
              </div>

              <div>
                <h2 className="font-bold text-gray-900">
                  Manage your account
                </h2>

                <p className="mt-1 text-sm leading-6 text-gray-500">
                  Update your profile information, password and account
                  preferences from Account Settings.
                </p>
              </div>
            </div>

            <Link
              href="/profile/settings"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-black"
            >
              <Settings className="h-4 w-4" />
              Account Settings
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
