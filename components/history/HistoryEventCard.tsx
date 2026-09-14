"use client";

import {
  Activity,
  Archive,
  ArrowDownToLine,
  ArrowUpFromLine,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Copy,
  Edit3,
  Eye,
  FileText,
  KeyRound,
  LogIn,
  LogOut,
  ShieldCheck,
  Trash2,
  UserPlus,
  UserRound,
  XCircle,
  Zap,
} from "lucide-react";
import { useState } from "react";

import type { HistoryEvent } from "@/lib/api/history";

import HistoryChangeDiff from "./HistoryChangeDiff";

interface HistoryEventCardProps {
  event: HistoryEvent;
}

const operationConfig: Record<
  string,
  {
    label: string;
    className: string;
    icon: React.ReactNode;
  }
> = {
  CREATE: {
    label: "Created",
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-100",
    icon: <UserPlus className="h-3.5 w-3.5" />,
  },

  UPDATE: {
    label: "Updated",
    className:
      "bg-blue-50 text-blue-700 border-blue-100",
    icon: <Edit3 className="h-3.5 w-3.5" />,
  },

  DELETE: {
    label: "Deleted",
    className:
      "bg-rose-50 text-rose-700 border-rose-100",
    icon: <Trash2 className="h-3.5 w-3.5" />,
  },

  RESTORE: {
    label: "Restored",
    className:
      "bg-amber-50 text-amber-700 border-amber-100",
    icon: <Archive className="h-3.5 w-3.5" />,
  },

  ENABLE: {
    label: "Enabled",
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-100",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },

  DISABLE: {
    label: "Disabled",
    className:
      "bg-orange-50 text-orange-700 border-orange-100",
    icon: <XCircle className="h-3.5 w-3.5" />,
  },

  LOGIN: {
    label: "Login",
    className:
      "bg-violet-50 text-violet-700 border-violet-100",
    icon: <LogIn className="h-3.5 w-3.5" />,
  },

  LOGOUT: {
    label: "Logout",
    className:
      "bg-slate-100 text-slate-700 border-slate-200",
    icon: <LogOut className="h-3.5 w-3.5" />,
  },

  PASSWORD_CHANGE: {
    label: "Password changed",
    className:
      "bg-indigo-50 text-indigo-700 border-indigo-100",
    icon: <KeyRound className="h-3.5 w-3.5" />,
  },

  ROLE_CHANGE: {
    label: "Role changed",
    className:
      "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100",
    icon: <ShieldCheck className="h-3.5 w-3.5" />,
  },

  PERMISSION_CHANGE: {
    label: "Permission changed",
    className:
      "bg-purple-50 text-purple-700 border-purple-100",
    icon: <ShieldCheck className="h-3.5 w-3.5" />,
  },

  PUBLISH: {
    label: "Published",
    className:
      "bg-cyan-50 text-cyan-700 border-cyan-100",
    icon: <ArrowUpFromLine className="h-3.5 w-3.5" />,
  },

  UNPUBLISH: {
    label: "Unpublished",
    className:
      "bg-slate-100 text-slate-700 border-slate-200",
    icon: <ArrowDownToLine className="h-3.5 w-3.5" />,
  },

  ARCHIVE: {
    label: "Archived",
    className:
      "bg-slate-100 text-slate-700 border-slate-200",
    icon: <Archive className="h-3.5 w-3.5" />,
  },
};

const categoryColors: Record<
  string,
  string
> = {
  USER:
    "bg-blue-50 text-blue-700",
  ADMIN:
    "bg-violet-50 text-violet-700",
  EDITOR:
    "bg-fuchsia-50 text-fuchsia-700",
  PRODUCT:
    "bg-emerald-50 text-emerald-700",
  NEWS:
    "bg-cyan-50 text-cyan-700",
  SECURITY:
    "bg-rose-50 text-rose-700",
  SYSTEM:
    "bg-slate-100 text-slate-700",
};

function getOperationConfig(
  operation: string | null,
) {
  if (
    operation &&
    operationConfig[operation]
  ) {
    return operationConfig[operation];
  }

  return {
    label: operation || "Event",
    className:
      "bg-slate-100 text-slate-700 border-slate-200",
    icon: <Activity className="h-3.5 w-3.5" />,
  };
}

function formatDate(
  value: string,
): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(date);
}

function getActorName(
  event: HistoryEvent,
): string {
  return (
    event.actor?.name ||
    event.actor?.email ||
    event.actorUserId ||
    "System"
  );
}

function getTargetName(
  event: HistoryEvent,
): string | null {
  if (!event.target && !event.targetUserId) {
    return null;
  }

  return (
    event.target?.name ||
    event.target?.email ||
    event.targetUserId ||
    null
  );
}

function getInitials(
  name: string,
): string {
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

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function getEntityIcon(
  entityType: string | null,
) {
  switch (entityType) {
    case "User":
      return (
        <UserRound className="h-4 w-4" />
      );

    case "Product":
      return (
        <Zap className="h-4 w-4" />
      );

    case "News":
      return (
        <FileText className="h-4 w-4" />
      );

    default:
      return (
        <Activity className="h-4 w-4" />
      );
  }
}

export default function HistoryEventCard({
  event,
}: HistoryEventCardProps) {
  const [expanded, setExpanded] =
    useState(false);

  const operation = getOperationConfig(
    event.operation,
  );

  const categoryClass =
    categoryColors[event.category] ||
    "bg-slate-100 text-slate-700";

  const actorName =
    getActorName(event);

  const targetName =
    getTargetName(event);

  const hasChanges =
    Boolean(
      event.changes &&
        Object.keys(event.changes)
          .length > 0,
    );

  return (
    <article className="group relative rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:border-slate-300 hover:shadow-lg">
      <div className="p-4 sm:p-5">
        {/* Top row */}
        <div className="flex items-start gap-3">
          {/* Actor avatar */}
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-xs font-bold text-white shadow-sm">
            {event.actor?.profileImageUrl ? (
              <img
                src={
                  event.actor
                    .profileImageUrl
                }
                alt={actorName}
                className="h-full w-full object-cover"
              />
            ) : (
              getInitials(actorName)
            )}
          </div>

          <div className="min-w-0 flex-1">
            {/* Title */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h3 className="font-bold text-slate-900">
                  {event.title}
                </h3>

                {event.description && (
                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    {event.description}
                  </p>
                )}
              </div>

              <span
                className={[
                  "inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold",
                  operation.className,
                ].join(" ")}
              >
                {operation.icon}
                {operation.label}
              </span>
            </div>

            {/* Metadata */}
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">
                {actorName}
              </span>

              {targetName && (
                <>
                  <span>→</span>

                  <span>
                    {targetName}
                  </span>
                </>
              )}

              <span className="text-slate-300">
                •
              </span>

              <span className="inline-flex items-center gap-1">
                {getEntityIcon(
                  event.entityType,
                )}

                {event.entityType ||
                  "System"}
              </span>

              <span className="text-slate-300">
                •
              </span>

              <span className="inline-flex items-center gap-1">
                <Clock3 className="h-3.5 w-3.5" />
                {formatDate(
                  event.createdAt,
                )}
              </span>
            </div>

            {/* Tags */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span
                className={[
                  "rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wide",
                  categoryClass,
                ].join(" ")}
              >
                {event.category}
              </span>

              <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-[10px] font-semibold text-slate-600">
                {event.eventType}
              </span>

              {event.version !==
                null && (
                <span className="rounded-md bg-violet-50 px-2 py-1 font-mono text-[10px] font-bold text-violet-700">
                  v{event.version}
                </span>
              )}

              {event.entityId && (
                <span className="max-w-[220px] truncate rounded-md bg-slate-50 px-2 py-1 font-mono text-[10px] text-slate-500">
                  {event.entityId}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Expand */}
        {(hasChanges ||
          event.metadata) && (
          <div className="mt-4 border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={() =>
                setExpanded(
                  (value) => !value,
                )
              }
              className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              {expanded
                ? "Hide details"
                : "View details"}

              <ChevronDown
                className={[
                  "h-3.5 w-3.5 transition-transform",
                  expanded
                    ? "rotate-180"
                    : "",
                ].join(" ")}
              />
            </button>
          </div>
        )}

        {/* Details */}
        {expanded && (
          <div className="mt-4 space-y-4 border-t border-slate-100 pt-4">
            {hasChanges && (
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Copy className="h-4 w-4 text-violet-500" />

                  <h4 className="text-sm font-bold text-slate-900">
                    Changes
                  </h4>
                </div>

                <HistoryChangeDiff
                  changes={
                    event.changes
                  }
                  compact
                />
              </div>
            )}

            {event.metadata && (
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Eye className="h-4 w-4 text-slate-500" />

                  <h4 className="text-sm font-bold text-slate-900">
                    Event metadata
                  </h4>
                </div>

                <pre className="max-h-64 overflow-auto rounded-xl border border-slate-200 bg-slate-950 p-4 text-xs leading-5 text-slate-200">
                  {JSON.stringify(
                    event.metadata,
                    null,
                    2,
                  )}
                </pre>
              </div>
            )}

            {(event.ipAddress ||
              event.userAgent ||
              event.city ||
              event.country) && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {event.ipAddress && (
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      IP address
                    </p>

                    <p className="mt-1 font-mono text-xs text-slate-700">
                      {event.ipAddress}
                    </p>
                  </div>
                )}

                {event.userAgent && (
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      User agent
                    </p>

                    <p className="mt-1 break-words text-xs text-slate-700">
                      {event.userAgent}
                    </p>
                  </div>
                )}

                {(event.city ||
                  event.country) && (
                  <div className="rounded-xl bg-slate-50 p-3 sm:col-span-2">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      Approximate location
                    </p>

                    <p className="mt-1 text-xs text-slate-700">
                      {[
                        event.city,
                        event.state,
                        event.country,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}