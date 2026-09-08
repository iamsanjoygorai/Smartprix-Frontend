"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import AdminPermission from "@/components/admin/AdminPermission";
import AdminPermissionGuard from "@/components/admin/AdminPermissionGuard";

import {
  createAdminSpecification,
  deleteAdminSpecification,
  getAdminSpecification,
  getAdminSpecifications,
  updateAdminSpecification,
} from "@/lib/api/specifications";

import type { AdminSpecification } from "@/lib/api/specifications";

const DATA_TYPES = [
  "text",
  "number",
  "boolean",
  "select",
  "multiselect",
];

const DATA_TYPE_LABELS: Record<string, string> = {
  text: "Text",
  number: "Number",
  boolean: "Boolean",
  select: "Select",
  multiselect: "Multi Select",
};

const DATA_TYPE_ICONS: Record<string, string> = {
  text: "T",
  number: "#",
  boolean: "✓",
  select: "▾",
  multiselect: "☷",
};

function formatDataType(type: string) {
  return DATA_TYPE_LABELS[type] || type;
}

function getTypeIcon(type: string) {
  return DATA_TYPE_ICONS[type] || "•";
}

export default function ProductSpecificationsPage() {
  const [specifications, setSpecifications] = useState<
    AdminSpecification[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingSpecification, setEditingSpecification] =
    useState<AdminSpecification | null>(null);

  const [deleteTarget, setDeleteTarget] =
    useState<AdminSpecification | null>(null);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    unit: "",
    dataType: "text",
    group: "General",
  });

  async function loadSpecifications() {
    try {
      setLoading(true);
      setError("");

      const response = await getAdminSpecifications({
        search: search.trim() || undefined,
        group: groupFilter !== "all" ? groupFilter : undefined,
      });

      if (!response.success) {
        throw new Error(
          response.message || "Failed to load specifications.",
        );
      }

      setSpecifications(response.data || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load specifications.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadSpecifications();
    }, 250);

    return () => clearTimeout(timer);
  }, [search, groupFilter]);

  const groups = useMemo(() => {
    const uniqueGroups = new Set<string>();

    specifications.forEach((specification) => {
      if (specification.group) {
        uniqueGroups.add(specification.group);
      }
    });

    return Array.from(uniqueGroups).sort();
  }, [specifications]);

  const stats = useMemo(() => {
    const total = specifications.length;

    const inUse = specifications.filter(
      (specification) =>
        (specification._count?.products || 0) > 0,
    ).length;

    const values = specifications.reduce(
      (sum, specification) =>
        sum + (specification._count?.values || 0),
      0,
    );

    const productsAssigned = specifications.reduce(
      (sum, specification) =>
        sum + (specification._count?.products || 0),
      0,
    );

    return {
      total,
      inUse,
      values,
      productsAssigned,
    };
  }, [specifications]);

  function openCreateDrawer() {
    setEditingSpecification(null);

    setForm({
      name: "",
      unit: "",
      dataType: "text",
      group: "General",
    });

    setError("");
    setDrawerOpen(true);
  }

  async function openEditDrawer(
    specification: AdminSpecification,
  ) {
    try {
      setError("");

      const response = await getAdminSpecification(
        specification.id,
      );

      if (!response.success || !response.data) {
        throw new Error(
          response.message ||
            "Failed to load specification details.",
        );
      }

      setEditingSpecification(response.data);

      setForm({
        name: response.data.name || "",
        unit: response.data.unit || "",
        dataType: response.data.dataType || "text",
        group: response.data.group || "General",
      });

      setDrawerOpen(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load specification details.",
      );
    }
  }

  function closeDrawer() {
    if (saving) return;

    setDrawerOpen(false);
    setEditingSpecification(null);
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const name = form.name.trim();

    if (!name) {
      setError("Specification name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        name,
        unit: form.unit.trim(),
        dataType: form.dataType,
        group: form.group.trim() || "General",
      };

      const response = editingSpecification
        ? await updateAdminSpecification(
            editingSpecification.id,
            payload,
          )
        : await createAdminSpecification(payload);

      if (!response.success) {
        throw new Error(
          response.message ||
            `Failed to ${
              editingSpecification ? "update" : "create"
            } specification.`,
        );
      }

      setDrawerOpen(false);
      setEditingSpecification(null);

      await loadSpecifications();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      setError("");

      const response = await deleteAdminSpecification(
        deleteTarget.id,
      );

      if (!response.success) {
        throw new Error(
          response.message ||
            "Failed to delete specification.",
        );
      }

      setDeleteTarget(null);

      await loadSpecifications();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete specification.",
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AdminPermissionGuard permission="products.view">
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-[1400px] px-6 py-8">
          {/* Breadcrumb */}
          <div className="mb-5 flex items-center gap-2 text-sm">
            <Link
              href="/admin/products"
              className="text-slate-500 transition hover:text-slate-900"
            >
              Products
            </Link>

            <span className="text-slate-300">/</span>

            <span className="font-medium text-slate-900">
              Specifications
            </span>
          </div>

          {/* Header */}
          <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Product Specifications
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Manage technical specifications used across
                your products.
              </p>
            </div>

            <AdminPermission permission="products.create">
              <button
                type="button"
                onClick={openCreateDrawer}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
              >
                <span className="text-lg leading-none">
                  +
                </span>

                Add Specification
              </button>
            </AdminPermission>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <div>
                <div className="font-semibold">
                  Something went wrong
                </div>

                <div className="mt-0.5">
                  {error}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setError("")}
                className="text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          )}

          {/* Stats */}
          <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total specifications"
              value={stats.total}
              icon="⚙"
            />

            <StatCard
              label="Specifications in use"
              value={stats.inUse}
              icon="✓"
            />

            <StatCard
              label="Specification values"
              value={stats.values}
              icon="≡"
            />

            <StatCard
              label="Products assigned"
              value={stats.productsAssigned}
              icon="▦"
            />
          </div>

          {/* Main Card */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* Toolbar */}
            <div className="border-b border-slate-200 px-5 py-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative w-full lg:max-w-md">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    ⌕
                  </span>

                  <input
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Search specifications..."
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={groupFilter}
                    onChange={(event) =>
                      setGroupFilter(event.target.value)
                    }
                    className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  >
                    <option value="all">
                      All groups
                    </option>

                    {groups.map((group) => (
                      <option key={group} value={group}>
                        {group}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Table */}
            {loading ? (
              <SpecificationLoading />
            ) : specifications.length === 0 ? (
              <EmptyState
                hasFilters={
                  Boolean(search.trim()) ||
                  groupFilter !== "all"
                }
                onClear={() => {
                  setSearch("");
                  setGroupFilter("all");
                }}
                onCreate={openCreateDrawer}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[950px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70">
                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Specification
                      </th>

                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Group
                      </th>

                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Data type
                      </th>

                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Unit
                      </th>

                      <th className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Products
                      </th>

                      <th className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Values
                      </th>

                      <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {specifications.map(
                      (specification) => (
                        <SpecificationRow
                          key={specification.id}
                          specification={specification}
                          onEdit={() =>
                            openEditDrawer(
                              specification,
                            )
                          }
                          onDelete={() =>
                            setDeleteTarget(
                              specification,
                            )
                          }
                        />
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]"
            onClick={closeDrawer}
          />

          <div className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col bg-white shadow-2xl">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingSpecification
                    ? "Edit specification"
                    : "Create specification"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {editingSpecification
                    ? "Update the specification details."
                    : "Add a specification that can be assigned to products."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeDrawer}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                ×
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Specification name
                  </label>

                  <input
                    type="text"
                    value={form.name}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    placeholder="e.g. Screen Size"
                    autoFocus
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />

                  <p className="mt-2 text-xs text-slate-400">
                    The name must be unique.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Group
                  </label>

                  <input
                    type="text"
                    value={form.group}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        group: event.target.value,
                      }))
                    }
                    placeholder="e.g. Display"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />

                  <p className="mt-2 text-xs text-slate-400">
                    Group related specifications together.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Data type
                  </label>

                  <select
                    value={form.dataType}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        dataType: event.target.value,
                      }))
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  >
                    {DATA_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {formatDataType(type)}
                      </option>
                    ))}
                  </select>

                  <p className="mt-2 text-xs text-slate-400">
                    Determines how the value is stored and
                    displayed.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Unit
                    <span className="ml-1 font-normal text-slate-400">
                      (optional)
                    </span>
                  </label>

                  <input
                    type="text"
                    value={form.unit}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        unit: event.target.value,
                      }))
                    }
                    placeholder="e.g. inch, Hz, GB"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

                {/* Preview */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Preview
                  </div>

                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-600">
                      {getTypeIcon(form.dataType)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-slate-900">
                        {form.name.trim() ||
                          "Specification name"}
                      </div>

                      <div className="mt-0.5 text-xs text-slate-500">
                        {form.group || "General"} ·{" "}
                        {formatDataType(form.dataType)}
                        {form.unit.trim()
                          ? ` · ${form.unit.trim()}`
                          : ""}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
                <button
                  type="button"
                  onClick={closeDrawer}
                  disabled={saving}
                  className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <AdminPermission
                  permission={
                    editingSpecification
                      ? "products.update"
                      : "products.create"
                  }
                >
                  <button
                    type="submit"
                    disabled={saving}
                    className="h-10 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving
                      ? "Saving..."
                      : editingSpecification
                        ? "Save changes"
                        : "Create specification"}
                  </button>
                </AdminPermission>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteTarget && (
        <DeleteModal
          specification={deleteTarget}
          deleting={deleting}
          onCancel={() => {
            if (!deleting) {
              setDeleteTarget(null);
            }
          }}
          onConfirm={handleDelete}
        />
      )}
    </AdminPermissionGuard>
  );
}

/* -------------------------------------------------------------------------- */
/* Stat Card                                                                  */
/* -------------------------------------------------------------------------- */

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {value.toLocaleString()}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-600">
          {icon}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Specification Row                                                          */
/* -------------------------------------------------------------------------- */

function SpecificationRow({
  specification,
  onEdit,
  onDelete,
}: {
  specification: AdminSpecification;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const productCount =
    specification._count?.products || 0;

  const valueCount =
    specification._count?.values || 0;

  return (
    <tr className="group transition hover:bg-slate-50/70">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-600">
            {getTypeIcon(specification.dataType)}
          </div>

          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-slate-900">
              {specification.name}
            </div>

            <div className="mt-0.5 truncate text-xs text-slate-400">
              {specification.slug}
            </div>
          </div>
        </div>
      </td>

      <td className="px-5 py-4">
        <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
          {specification.group || "General"}
        </span>
      </td>

      <td className="px-5 py-4">
        <span className="text-sm font-medium text-slate-700">
          {formatDataType(specification.dataType)}
        </span>
      </td>

      <td className="px-5 py-4">
        <span className="text-sm text-slate-500">
          {specification.unit || "—"}
        </span>
      </td>

      <td className="px-5 py-4 text-center">
        <span
          className={
            productCount > 0
              ? "text-sm font-semibold text-slate-900"
              : "text-sm text-slate-400"
          }
        >
          {productCount}
        </span>
      </td>

      <td className="px-5 py-4 text-center">
        <span
          className={
            valueCount > 0
              ? "text-sm font-semibold text-slate-900"
              : "text-sm text-slate-400"
          }
        >
          {valueCount}
        </span>
      </td>

      <td className="px-5 py-4">
        <div className="flex items-center justify-end gap-2 opacity-100 transition lg:opacity-0 lg:group-hover:opacity-100">
          <AdminPermission permission="products.update">
            <button
              type="button"
              onClick={onEdit}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Edit
            </button>
          </AdminPermission>

          <AdminPermission permission="products.delete">
            <button
              type="button"
              onClick={onDelete}
              className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
            >
              Delete
            </button>
          </AdminPermission>
        </div>
      </td>
    </tr>
  );
}

/* -------------------------------------------------------------------------- */
/* Delete Modal                                                               */
/* -------------------------------------------------------------------------- */

function DeleteModal({
  specification,
  deleting,
  onCancel,
  onConfirm,
}: {
  specification: AdminSpecification;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const productCount =
    specification._count?.products || 0;

  const isProtected = productCount > 0;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px]"
        onClick={onCancel}
      />

      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="p-6">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-xl text-red-600">
            !
          </div>

          <h3 className="text-lg font-bold text-slate-900">
            Delete specification?
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            You are about to delete{" "}
            <span className="font-semibold text-slate-700">
              {specification.name}
            </span>
            .
          </p>

          {isProtected ? (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-800">
                This specification cannot be deleted.
              </p>

              <p className="mt-1 text-xs leading-5 text-amber-700">
                It is currently assigned to{" "}
                {productCount} product
                {productCount === 1 ? "" : "s"}. Remove
                those assignments first.
              </p>
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-4">
              <p className="text-xs leading-5 text-red-700">
                This action cannot be undone.
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          {!isProtected && (
            <AdminPermission permission="products.delete">
              <button
                type="button"
                onClick={onConfirm}
                disabled={deleting}
                className="h-10 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting
                  ? "Deleting..."
                  : "Delete specification"}
              </button>
            </AdminPermission>
          )}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Loading                                                                    */
/* -------------------------------------------------------------------------- */

function SpecificationLoading() {
  return (
    <div className="divide-y divide-slate-100">
      {Array.from({ length: 7 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-5 px-5 py-5"
        >
          <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-100" />

          <div className="flex-1">
            <div className="h-4 w-48 animate-pulse rounded bg-slate-100" />

            <div className="mt-2 h-3 w-32 animate-pulse rounded bg-slate-100" />
          </div>

          <div className="hidden h-4 w-24 animate-pulse rounded bg-slate-100 md:block" />

          <div className="hidden h-4 w-20 animate-pulse rounded bg-slate-100 md:block" />

          <div className="hidden h-4 w-12 animate-pulse rounded bg-slate-100 lg:block" />

          <div className="hidden h-4 w-12 animate-pulse rounded bg-slate-100 lg:block" />

          <div className="h-8 w-20 animate-pulse rounded-lg bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Empty State                                                                */
/* -------------------------------------------------------------------------- */

function EmptyState({
  hasFilters,
  onClear,
  onCreate,
}: {
  hasFilters: boolean;
  onClear: () => void;
  onCreate: () => void;
}) {
  return (
    <div className="px-6 py-20 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-xl font-bold text-slate-500">
        ⚙
      </div>

      <h3 className="mt-5 text-base font-bold text-slate-900">
        {hasFilters
          ? "No specifications found"
          : "No specifications yet"}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {hasFilters
          ? "Try changing your search or group filter."
          : "Create your first product specification to start building your product specification system."}
      </p>

      <div className="mt-5 flex items-center justify-center gap-3">
        {hasFilters ? (
          <button
            type="button"
            onClick={onClear}
            className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Clear filters
          </button>
        ) : (
          <AdminPermission permission="products.create">
            <button
              type="button"
              onClick={onCreate}
              className="h-10 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Add specification
            </button>
          </AdminPermission>
        )}
      </div>
    </div>
  );
}