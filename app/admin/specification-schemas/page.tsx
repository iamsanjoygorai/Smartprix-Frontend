"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import AdminPermission from "@/components/admin/AdminPermission";
import AdminPermissionGuard from "@/components/admin/AdminPermissionGuard";

import {
  getAdminSpecificationSchemas,
  deleteAdminSpecificationSchema,
} from "@/lib/api/specification-schemas";

import type {
  SpecificationSchema,
} from "@/lib/api/specification-schemas";

export default function SpecificationSchemasPage() {
  const [schemas, setSchemas] = useState<SpecificationSchema[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [deleteTarget, setDeleteTarget] =
    useState<SpecificationSchema | null>(null);

  const [deleting, setDeleting] = useState(false);

  async function loadSchemas() {
    try {
      setLoading(true);
      setError("");

      const response =
        await getAdminSpecificationSchemas();

      setSchemas(
        Array.isArray(response.data)
          ? response.data
          : [],
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load specification schemas.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSchemas();
  }, []);

  const filteredSchemas = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return schemas;
    }

    return schemas.filter((schema) => {
      return (
        schema.name.toLowerCase().includes(query) ||
        schema.slug.toLowerCase().includes(query) ||
        schema.category?.name
          ?.toLowerCase()
          .includes(query)
      );
    });
  }, [schemas, search]);

  const totalGroups = useMemo(
    () =>
      schemas.reduce(
        (total, schema) =>
          total + (schema._count?.groups ?? 0),
        0,
      ),
    [schemas],
  );

  const activeSchemas = useMemo(
    () =>
      schemas.filter(
        (schema) => schema.isActive,
      ).length,
    [schemas],
  );

  async function handleDelete() {
    if (!deleteTarget) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      await deleteAdminSpecificationSchema(
        deleteTarget.id,
      );

      setDeleteTarget(null);

      await loadSchemas();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to deactivate schema.",
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AdminPermissionGuard permission="products.view">
      <div className="mx-auto w-full max-w-[1400px]">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-gray-400">
              <Link
                href="/admin/products"
                className="transition hover:text-gray-700"
              >
                Products
              </Link>

              <span>/</span>

              <span className="text-gray-600">
                Specification Schemas
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-gray-950">
              Specification Schemas
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
              Define reusable product specification
              structures for mobiles, laptops and
              other product categories.
            </p>
          </div>

          <AdminPermission permission="products.create">
            <Link
              href="/admin/specification-schemas/new"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800"
            >
              <span className="text-lg leading-none">
                +
              </span>

              New Schema
            </Link>
          </AdminPermission>
        </div>

        {error && (
          <div className="mb-6 flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              className="font-semibold text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="Total schemas"
            value={schemas.length}
            description="Specification structures"
            icon="▦"
          />

          <StatCard
            label="Active schemas"
            value={activeSchemas}
            description="Currently available"
            icon="✓"
          />

          <StatCard
            label="Total groups"
            value={totalGroups}
            description="Across all schemas"
            icon="≡"
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-950">
                  Schema directory
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  {filteredSchemas.length}{" "}
                  {filteredSchemas.length === 1
                    ? "schema"
                    : "schemas"}{" "}
                  shown
                </p>
              </div>

              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  ⌕
                </span>

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search schemas..."
                  className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:bg-white sm:w-80"
                />
              </div>
            </div>
          </div>

          {loading && <LoadingState />}

          {!loading &&
            schemas.length === 0 && (
              <EmptyState />
            )}

          {!loading &&
            schemas.length > 0 &&
            filteredSchemas.length === 0 && (
              <div className="px-6 py-16 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-xl text-gray-400">
                  ⌕
                </div>

                <p className="text-sm font-semibold text-gray-900">
                  No schemas found
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Try another schema name or category.
                </p>
              </div>
            )}

          {!loading &&
            filteredSchemas.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left">
                  <thead className="border-b border-gray-100 bg-gray-50/70">
                    <tr>
                      <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">
                        Schema
                      </th>

                      <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">
                        Category
                      </th>

                      <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">
                        Version
                      </th>

                      <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">
                        Groups
                      </th>

                      <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">
                        Status
                      </th>

                      <th className="px-6 py-3.5 text-right text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {filteredSchemas.map(
                      (schema) => (
                        <SchemaRow
                          key={schema.id}
                          schema={schema}
                          onDelete={setDeleteTarget}
                        />
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            )}
        </div>
      </div>

      {deleteTarget && (
        <DeleteModal
          schema={deleteTarget}
          deleting={deleting}
          onCancel={() =>
            setDeleteTarget(null)
          }
          onConfirm={handleDelete}
        />
      )}
    </AdminPermissionGuard>
  );
}

function StatCard({
  label,
  value,
  description,
  icon,
}: {
  label: string;
  value: number;
  description: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-400">
            {label}
          </p>

          <p className="mt-3 text-3xl font-bold tracking-tight text-gray-950">
            {value.toLocaleString("en-IN")}
          </p>

          <p className="mt-1 text-xs text-gray-500">
            {description}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-sm font-bold text-gray-500">
          {icon}
        </div>
      </div>
    </div>
  );
}

function SchemaRow({
  schema,
  onDelete,
}: {
  schema: SpecificationSchema;
  onDelete: (
    schema: SpecificationSchema,
  ) => void;
}) {
  return (
    <tr className="group transition hover:bg-gray-50/70">
      <td className="px-6 py-4">
        <div>
          <p className="text-sm font-semibold text-gray-950">
            {schema.name}
          </p>

          <p className="mt-1 font-mono text-xs text-gray-400">
            /{schema.slug}
          </p>

          {schema.description && (
            <p className="mt-1 max-w-[380px] truncate text-xs text-gray-500">
              {schema.description}
            </p>
          )}
        </div>
      </td>

      <td className="px-6 py-4">
        <span className="rounded-lg bg-gray-50 px-2.5 py-1.5 text-xs font-semibold text-gray-600">
          {schema.category?.name ?? "—"}
        </span>
      </td>

      <td className="px-6 py-4">
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">
          v{schema.version}
        </span>
      </td>

      <td className="px-6 py-4">
        <span className="text-sm font-semibold text-gray-800">
          {(schema._count?.groups ?? 0).toLocaleString(
            "en-IN",
          )}
        </span>
      </td>

      <td className="px-6 py-4">
        <span
          className={
            schema.isActive
              ? "inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-semibold text-green-700"
              : "inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-500"
          }
        >
          <span
            className={
              schema.isActive
                ? "h-1.5 w-1.5 rounded-full bg-green-500"
                : "h-1.5 w-1.5 rounded-full bg-gray-400"
            }
          />

          {schema.isActive
            ? "Active"
            : "Inactive"}
        </span>
      </td>

      <td className="px-6 py-4">
        <div className="flex justify-end gap-1">
          <AdminPermission permission="products.update">
            <Link
              href={`/admin/specification-schemas/${schema.id}`}
              className="rounded-lg px-3 py-2 text-xs font-semibold text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
            >
              Edit
            </Link>
          </AdminPermission>

          {schema.isActive && (
            <AdminPermission permission="products.delete">
              <button
                type="button"
                onClick={() =>
                  onDelete(schema)
                }
                className="rounded-lg px-3 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-50"
              >
                Deactivate
              </button>
            </AdminPermission>
          )}
        </div>
      </td>
    </tr>
  );
}

function LoadingState() {
  return (
    <div className="divide-y divide-gray-100">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="flex animate-pulse items-center gap-6 px-6 py-6"
        >
          <div className="h-10 flex-1 rounded-lg bg-gray-100" />
          <div className="h-8 w-28 rounded-lg bg-gray-100" />
          <div className="h-8 w-16 rounded-lg bg-gray-100" />
          <div className="h-8 w-20 rounded-lg bg-gray-100" />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="px-6 py-20 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-2xl text-gray-400">
        ▦
      </div>

      <p className="text-sm font-semibold text-gray-900">
        No specification schemas yet
      </p>

      <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-gray-500">
        Create your first schema to define
        structured specifications for a product
        category.
      </p>

      <AdminPermission permission="products.create">
        <Link
          href="/admin/specification-schemas/new"
          className="mt-5 inline-flex rounded-xl bg-gray-950 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-gray-800"
        >
          Create Schema
        </Link>
      </AdminPermission>
    </div>
  );
}

function DeleteModal({
  schema,
  deleting,
  onCancel,
  onConfirm,
}: {
  schema: SpecificationSchema;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5">
          <h3 className="text-lg font-bold text-gray-950">
            Deactivate schema?
          </h3>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            This will deactivate{" "}
            <span className="font-semibold text-gray-800">
              {schema.name}
            </span>
            . Existing historical data will remain
            preserved.
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            {deleting
              ? "Deactivating..."
              : "Deactivate"}
          </button>
        </div>
      </div>
    </div>
  );
}
