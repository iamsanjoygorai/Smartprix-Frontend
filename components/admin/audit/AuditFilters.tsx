"use client";

import {
  Filter,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

interface AuditFiltersProps {
  search: string;
  category: string;
  action: string;
  categories: string[];
  actions: string[];
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onActionChange: (value: string) => void;
  onClear: () => void;
}

export default function AuditFilters({
  search,
  category,
  action,
  categories,
  actions,
  onSearchChange,
  onCategoryChange,
  onActionChange,
  onClear,
}: AuditFiltersProps) {
  const hasFilters =
    search.trim() !== "" ||
    category !== "" ||
    action !== "";

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-violet-50/40 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-md shadow-violet-500/20">
            <SlidersHorizontal
              className="h-5 w-5"
              strokeWidth={2.2}
            />
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Filter Audit Activity
            </h3>
            <p className="text-xs font-medium text-slate-500">
              Find specific activity and security events
            </p>
          </div>
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Clear filters
          </button>
        )}
      </div>

      {/* Controls */}
      <div className="p-5">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Search */}
          <div className="lg:col-span-6">
            <label className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-600">
              <Search className="h-3.5 w-3.5 text-violet-500" />
              Search activity
            </label>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(event) =>
                  onSearchChange(event.target.value)
                }
                placeholder="Search user, email, action, entity..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-10 pr-10 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Category */}
          <div className="lg:col-span-3">
            <label className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-600">
              <Filter className="h-3.5 w-3.5 text-blue-500" />
              Category
            </label>

            <select
              value={category}
              onChange={(event) =>
                onCategoryChange(event.target.value)
              }
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="">All categories</option>

              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {/* Action */}
          <div className="lg:col-span-3">
            <label className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-600">
              <ActivityIcon />
              Action
            </label>

            <select
              value={action}
              onChange={(event) =>
                onActionChange(event.target.value)
              }
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            >
              <option value="">All actions</option>

              {actions.map((item) => (
                <option key={item} value={item}>
                  {item.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active filters */}
        {hasFilters && (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Active:
            </span>

            {search && (
              <FilterBadge
                label={`Search: ${search}`}
                onRemove={() => onSearchChange("")}
              />
            )}

            {category && (
              <FilterBadge
                label={`Category: ${category}`}
                onRemove={() => onCategoryChange("")}
              />
            )}

            {action && (
              <FilterBadge
                label={`Action: ${action.replaceAll("_", " ")}`}
                onRemove={() => onActionChange("")}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function FilterBadge({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-[11px] font-bold text-violet-700">
      <span className="truncate">{label}</span>

      <button
        type="button"
        onClick={onRemove}
        className="shrink-0 rounded-full p-0.5 transition hover:bg-violet-200"
        aria-label={`Remove ${label}`}
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

function ActivityIcon() {
  return (
    <span className="flex h-3.5 w-3.5 items-center justify-center">
      <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.12)]" />
    </span>
  );
}