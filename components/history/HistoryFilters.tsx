"use client";

import {
  CalendarDays,
  Filter,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

export interface HistoryFilterState {
  search: string;
  category: string;
  eventType: string;
  operation: string;
  entityType: string;
  from: string;
  to: string;
}

interface HistoryFiltersProps {
  filters: HistoryFilterState;
  onChange: (
    filters: HistoryFilterState,
  ) => void;
  onReset: () => void;
  loading?: boolean;
}

const categories = [
  { value: "", label: "All categories" },
  { value: "USER", label: "Users" },
  { value: "ADMIN", label: "Admins" },
  { value: "EDITOR", label: "Editors" },
  { value: "PRODUCT", label: "Products" },
  { value: "NEWS", label: "News" },
  { value: "SECURITY", label: "Security" },
  { value: "SYSTEM", label: "System" },
];

const operations = [
  { value: "", label: "All operations" },
  { value: "CREATE", label: "Created" },
  { value: "UPDATE", label: "Updated" },
  { value: "DELETE", label: "Deleted" },
  { value: "RESTORE", label: "Restored" },
  { value: "ENABLE", label: "Enabled" },
  { value: "DISABLE", label: "Disabled" },
  { value: "LOGIN", label: "Login" },
  { value: "LOGOUT", label: "Logout" },
  { value: "PUBLISH", label: "Published" },
  { value: "UNPUBLISH", label: "Unpublished" },
];

const entityTypes = [
  { value: "", label: "All entities" },
  { value: "User", label: "Users" },
  { value: "Product", label: "Products" },
  { value: "News", label: "News" },
  { value: "Brand", label: "Brands" },
  { value: "Category", label: "Categories" },
];

function SelectField({
  value,
  onChange,
  children,
  disabled,
}: {
  value: string;
  onChange: (
    value: string,
  ) => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(event) =>
        onChange(event.target.value)
      }
      className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </select>
  );
}

export default function HistoryFilters({
  filters,
  onChange,
  onReset,
  loading = false,
}: HistoryFiltersProps) {
  const update = (
    key: keyof HistoryFilterState,
    value: string,
  ) => {
    onChange({
      ...filters,
      [key]: value,
    });
  };

  const hasFilters =
    Boolean(filters.search) ||
    Boolean(filters.category) ||
    Boolean(filters.eventType) ||
    Boolean(filters.operation) ||
    Boolean(filters.entityType) ||
    Boolean(filters.from) ||
    Boolean(filters.to);

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
            <SlidersHorizontal className="h-4 w-4" />
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-900">
              History filters
            </h2>

            <p className="text-xs text-slate-500">
              Narrow down activity and changes
            </p>
          </div>
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={onReset}
            disabled={loading}
            className="inline-flex items-center gap-2 self-start rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50 sm:self-auto"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset filters
          </button>
        )}
      </div>

      <div className="space-y-4 p-4">
        {/* Search */}
        <div>
          <label
            htmlFor="history-search"
            className="mb-1.5 block text-xs font-semibold text-slate-600"
          >
            Search history
          </label>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              id="history-search"
              type="search"
              value={filters.search}
              disabled={loading}
              onChange={(event) =>
                update(
                  "search",
                  event.target.value,
                )
              }
              placeholder="Search event titles, descriptions..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-9 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-500/10 disabled:cursor-not-allowed disabled:opacity-50"
            />

            {filters.search && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() =>
                  update("search", "")
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Select filters */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
              Category
            </label>

            <SelectField
              value={filters.category}
              disabled={loading}
              onChange={(value) =>
                update("category", value)
              }
            >
              {categories.map((item) => (
                <option
                  key={item.value}
                  value={item.value}
                >
                  {item.label}
                </option>
              ))}
            </SelectField>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
              Operation
            </label>

            <SelectField
              value={filters.operation}
              disabled={loading}
              onChange={(value) =>
                update("operation", value)
              }
            >
              {operations.map((item) => (
                <option
                  key={item.value}
                  value={item.value}
                >
                  {item.label}
                </option>
              ))}
            </SelectField>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
              Entity
            </label>

            <SelectField
              value={filters.entityType}
              disabled={loading}
              onChange={(value) =>
                update("entityType", value)
              }
            >
              {entityTypes.map((item) => (
                <option
                  key={item.value}
                  value={item.value}
                >
                  {item.label}
                </option>
              ))}
            </SelectField>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
              Event type
            </label>

            <div className="relative">
              <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={filters.eventType}
                disabled={loading}
                onChange={(event) =>
                  update(
                    "eventType",
                    event.target.value.toUpperCase(),
                  )
                }
                placeholder="e.g. USER_UPDATED"
                className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Date range */}
        <div>
          <div className="mb-1.5 flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-slate-400" />

            <span className="text-xs font-semibold text-slate-600">
              Date range
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              type="datetime-local"
              value={filters.from}
              disabled={loading}
              onChange={(event) =>
                update("from", event.target.value)
              }
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 disabled:cursor-not-allowed disabled:opacity-50"
            />

            <input
              type="datetime-local"
              value={filters.to}
              disabled={loading}
              onChange={(event) =>
                update("to", event.target.value)
              }
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>
      </div>
    </section>
  );
}