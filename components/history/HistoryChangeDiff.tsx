"use client";

import { ArrowRight, Minus, Plus } from "lucide-react";

export interface HistoryChange {
  before: unknown;
  after: unknown;
}

interface HistoryChangeDiffProps {
  changes:
    | Record<string, HistoryChange>
    | null
    | undefined;
  compact?: boolean;
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "Not set";
  }

  if (typeof value === "string") {
    return value || "Empty";
  }

  if (
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function isEmptyValue(value: unknown): boolean {
  return (
    value === null ||
    value === undefined ||
    value === ""
  );
}

function ChangeRow({
  field,
  change,
  compact,
}: {
  field: string;
  change: HistoryChange;
  compact: boolean;
}) {
  const beforeEmpty = isEmptyValue(change.before);
  const afterEmpty = isEmptyValue(change.after);

  const isAdded = beforeEmpty && !afterEmpty;
  const isRemoved = !beforeEmpty && afterEmpty;

  const beforeText = formatValue(change.before);
  const afterText = formatValue(change.after);

  return (
    <div
      className={[
        "rounded-xl border bg-white",
        compact
          ? "p-3"
          : "p-4",
      ].join(" ")}
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
          {field}
        </span>

        {isAdded && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">
            <Plus className="h-3 w-3" />
            Added
          </span>
        )}

        {isRemoved && (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-1 text-[10px] font-bold text-rose-700">
            <Minus className="h-3 w-3" />
            Removed
          </span>
        )}

        {!isAdded && !isRemoved && (
          <span className="rounded-full bg-violet-50 px-2 py-1 text-[10px] font-bold text-violet-700">
            Changed
          </span>
        )}
      </div>

      <div
        className={[
          "grid gap-2",
          compact
            ? "grid-cols-1"
            : "grid-cols-1 lg:grid-cols-[1fr_auto_1fr]",
        ].join(" ")}
      >
        <div className="min-w-0 rounded-lg border border-rose-100 bg-rose-50/60 p-3">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-rose-500">
            Before
          </p>

          <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-words font-mono text-xs leading-5 text-rose-900">
            {beforeText}
          </pre>
        </div>

        {!compact && (
          <div className="hidden items-center justify-center lg:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm">
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        )}

        <div className="min-w-0 rounded-lg border border-emerald-100 bg-emerald-50/60 p-3">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-emerald-600">
            After
          </p>

          <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-words font-mono text-xs leading-5 text-emerald-900">
            {afterText}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default function HistoryChangeDiff({
  changes,
  compact = false,
}: HistoryChangeDiffProps) {
  if (!changes) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center">
        <p className="text-sm font-medium text-slate-500">
          No field changes recorded.
        </p>
      </div>
    );
  }

  const entries = Object.entries(changes);

  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center">
        <p className="text-sm font-medium text-slate-500">
          No field changes recorded.
        </p>
      </div>
    );
  }

  return (
    <div
      className={[
        "space-y-3",
        compact ? "space-y-2" : "space-y-3",
      ].join(" ")}
    >
      {entries.map(([field, change]) => (
        <ChangeRow
          key={field}
          field={field}
          change={change}
          compact={compact}
        />
      ))}
    </div>
  );
}