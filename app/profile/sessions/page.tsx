"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Laptop,
  Loader2,
  Monitor,
  Smartphone,
  ShieldCheck,
  Wifi,
  XCircle,
} from "lucide-react";

import {
  getMySessions,
  type UserSession,
} from "@/lib/api/sessions";

function formatDate(value: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getDeviceIcon(deviceType: string | null) {
  if (deviceType?.toLowerCase() === "mobile") {
    return Smartphone;
  }

  return Laptop;
}

function getSessionDuration(session: UserSession) {
  const start = new Date(session.startedAt).getTime();

  const end = session.endedAt
    ? new Date(session.endedAt).getTime()
    : Date.now();

  const minutes = Math.max(
    0,
    Math.floor((end - start) / 60000),
  );

  if (minutes < 1) return "Less than a minute";

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (!remainingMinutes) {
    return `${hours} hr`;
  }

  return `${hours} hr ${remainingMinutes} min`;
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadSessions() {
      try {
        setLoading(true);
        setError("");

        const data = await getMySessions();

        if (!cancelled) {
          setSessions(data);
        }
      } catch (error) {
        console.error(
          "Failed to load sessions:",
          error,
        );

        if (!cancelled) {
          setError(
            "Unable to load your sessions.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadSessions();

    return () => {
      cancelled = true;
    };
  }, []);

  const activeSessions = useMemo(
    () =>
      sessions.filter(
        (session) => session.isActive,
      ),
    [sessions],
  );

  const previousSessions = useMemo(
    () =>
      sessions.filter(
        (session) => !session.isActive,
      ),
    [sessions],
  );

  return (
    <main className="min-h-screen bg-[#f4f6f8] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/profile"
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Profile
          </Link>

          <div className="rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-6 text-white shadow-xl sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
                <ShieldCheck className="h-6 w-6" />
              </div>

              <div>
                <h1 className="text-2xl font-bold sm:text-3xl">
                  Sessions & Security
                </h1>

                <p className="mt-1 max-w-2xl text-sm text-slate-300 sm:text-base">
                  Review where your Smartprix account is
                  currently signed in and see your previous
                  sessions.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600" />

            <p className="mt-3 text-sm font-medium text-slate-600">
              Loading your sessions...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
            <div className="flex items-center gap-3">
              <XCircle className="h-5 w-5" />

              <div>
                <p className="font-semibold">
                  Something went wrong
                </p>

                <p className="mt-1 text-sm">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
                <p className="text-sm text-slate-500">
                  Total sessions
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {sessions.length}
                </p>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
                <p className="text-sm text-slate-500">
                  Active sessions
                </p>

                <p className="mt-2 text-3xl font-bold text-emerald-600">
                  {activeSessions.length}
                </p>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
                <p className="text-sm text-slate-500">
                  Previous sessions
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {previousSessions.length}
                </p>
              </div>
            </div>

            {/* Active sessions */}
            <section>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Active sessions
                  </h2>

                  <p className="text-sm text-slate-500">
                    Devices currently signed in to your account.
                  </p>
                </div>
              </div>

              {activeSessions.length === 0 ? (
                <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
                  <Monitor className="mx-auto h-8 w-8 text-slate-400" />

                  <p className="mt-3 font-semibold text-slate-700">
                    No active sessions
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeSessions.map((session) => {
                    const DeviceIcon =
                      getDeviceIcon(
                        session.deviceType,
                      );

                    return (
                      <div
                        key={session.id}
                        className="relative overflow-hidden rounded-3xl bg-white p-5 shadow-sm ring-1 ring-emerald-200 sm:p-6"
                      >
                        <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-emerald-100/60 blur-2xl" />

                        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100">
                              <DeviceIcon className="h-6 w-6 text-slate-700" />
                            </div>

                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="font-bold text-slate-900">
                                  {session.browser ??
                                    "Unknown browser"}
                                </h3>

                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                  Active
                                </span>
                              </div>

                              <p className="mt-1 text-sm text-slate-500">
                                {session.operatingSystem ??
                                  "Unknown OS"}{" "}
                                ·{" "}
                                {session.deviceType ??
                                  "Unknown device"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="relative mt-5 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2 lg:grid-cols-4">
                          <Info
                            icon={Clock3}
                            label="Started"
                            value={formatDate(
                              session.startedAt,
                            )}
                          />

                          <Info
                            icon={Clock3}
                            label="Last active"
                            value={formatDate(
                              session.lastSeenAt,
                            )}
                          />

                          <Info
                            icon={Wifi}
                            label="IP address"
                            value={
                              session.ipAddress ??
                              "Unavailable"
                            }
                          />

                          <Info
                            icon={Clock3}
                            label="Session time"
                            value={getSessionDuration(
                              session,
                            )}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Previous sessions */}
            <section>
              <div className="mb-3">
                <h2 className="text-xl font-bold text-slate-900">
                  Previous sessions
                </h2>

                <p className="text-sm text-slate-500">
                  Recently ended sessions on your account.
                </p>
              </div>

              {previousSessions.length === 0 ? (
                <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
                  <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500" />

                  <p className="mt-3 font-semibold text-slate-700">
                    No previous sessions
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {previousSessions.map((session) => {
                    const DeviceIcon =
                      getDeviceIcon(
                        session.deviceType,
                      );

                    return (
                      <div
                        key={session.id}
                        className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                            <DeviceIcon className="h-5 w-5 text-slate-500" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-semibold text-slate-900">
                                {session.browser ??
                                  "Unknown browser"}
                              </h3>

                              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                                <XCircle className="h-3 w-3" />
                                Ended
                              </span>
                            </div>

                            <p className="mt-1 text-sm text-slate-500">
                              {session.operatingSystem ??
                                "Unknown OS"}{" "}
                              ·{" "}
                              {session.deviceType ??
                                "Unknown device"}
                            </p>

                            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                              <span>
                                Started:{" "}
                                {formatDate(
                                  session.startedAt,
                                )}
                              </span>

                              <span>
                                Ended:{" "}
                                {formatDate(
                                  session.endedAt,
                                )}
                              </span>

                              <span>
                                Duration:{" "}
                                {getSessionDuration(
                                  session,
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{
    className?: string;
  }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />

      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 truncate text-sm font-medium text-slate-700">
          {value}
        </p>
      </div>
    </div>
  );
}