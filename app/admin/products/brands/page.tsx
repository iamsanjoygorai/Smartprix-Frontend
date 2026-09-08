"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import AdminPermission from "@/components/admin/AdminPermission";
import AdminPermissionGuard from "@/components/admin/AdminPermissionGuard";

import {
  createAdminBrand,
  deleteAdminBrand,
  getAdminBrands,
  updateAdminBrand,
} from "@/lib/api/brands";

import type { AdminBrand } from "@/lib/api/brands";

export default function ProductBrandsPage() {
  const [brands, setBrands] = useState<AdminBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingBrand, setEditingBrand] =
    useState<AdminBrand | null>(null);

  const [deleteTarget, setDeleteTarget] =
    useState<AdminBrand | null>(null);

  const [deleting, setDeleting] = useState(false);

  async function loadBrands() {
    try {
      setLoading(true);
      setError("");

      const response = await getAdminBrands();

      setBrands(
        Array.isArray(response.data)
          ? response.data
          : [],
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load brands.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBrands();
  }, []);

  const filteredBrands = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return brands;
    }

    return brands.filter(
      (brand) =>
        brand.name
          .toLowerCase()
          .includes(query) ||
        brand.slug
          .toLowerCase()
          .includes(query),
    );
  }, [brands, search]);

  const brandsWithProducts = useMemo(
    () =>
      brands.filter(
        (brand) =>
          (brand._count?.products ?? 0) > 0,
      ).length,
    [brands],
  );

  const totalProducts = useMemo(
    () =>
      brands.reduce(
        (total, brand) =>
          total +
          (brand._count?.products ?? 0),
        0,
      ),
    [brands],
  );

  const openCreateDrawer = () => {
    setEditingBrand(null);
    setDrawerOpen(true);
  };

  const openEditDrawer = (
    brand: AdminBrand,
  ) => {
    setEditingBrand(brand);
    setDrawerOpen(true);
  };

  const handleSaved = async () => {
    setDrawerOpen(false);
    setEditingBrand(null);
    await loadBrands();
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      await deleteAdminBrand(
        deleteTarget.id,
      );

      setDeleteTarget(null);

      await loadBrands();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete brand.",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminPermissionGuard permission="products.view">
      <div className="mx-auto w-full max-w-[1400px]">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-gray-400">
              <Link
                href="/admin/products"
                className="hover:text-gray-700"
              >
                Products
              </Link>

              <span>/</span>

              <span className="text-gray-600">
                Brands
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-gray-950">
              Product Brands
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
              Manage manufacturers and brands
              across your entire product catalog.
            </p>
          </div>

          <AdminPermission permission="products.create">
            <button
              type="button"
              onClick={openCreateDrawer}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800"
            >
              <span className="text-lg leading-none">
                +
              </span>

              Add Brand
            </button>
          </AdminPermission>
        </div>

        {/* Error */}
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

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="Total brands"
            value={brands.length}
            description="Brands in your catalog"
            icon="B"
          />

          <StatCard
            label="Brands in use"
            value={brandsWithProducts}
            description="Brands with products"
            icon="✓"
          />

          <StatCard
            label="Products assigned"
            value={totalProducts}
            description="Products across all brands"
            icon="□"
          />
        </div>

        {/* Main card */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {/* Toolbar */}
          <div className="border-b border-gray-100 px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-950">
                  Brand directory
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  {filteredBrands.length}{" "}
                  {filteredBrands.length === 1
                    ? "brand"
                    : "brands"}{" "}
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
                  placeholder="Search brands..."
                  className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:bg-white sm:w-72"
                />
              </div>
            </div>
          </div>

          {/* Loading */}
          {loading && <BrandLoading />}

          {/* Empty */}
          {!loading &&
            brands.length === 0 && (
              <EmptyState
                onAdd={openCreateDrawer}
              />
            )}

          {/* No search results */}
          {!loading &&
            brands.length > 0 &&
            filteredBrands.length === 0 && (
              <div className="px-6 py-16 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-xl text-gray-400">
                  ⌕
                </div>

                <p className="text-sm font-semibold text-gray-900">
                  No brands found
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Try another brand name or slug.
                </p>
              </div>
            )}

          {/* Table */}
          {!loading &&
            filteredBrands.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left">
                  <thead className="border-b border-gray-100 bg-gray-50/70">
                    <tr>
                      <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">
                        Brand
                      </th>

                      <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">
                        Slug
                      </th>

                      <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">
                        Products
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
                    {filteredBrands.map(
                      (brand) => (
                        <BrandRow
                          key={brand.id}
                          brand={brand}
                          onEdit={openEditDrawer}
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

      {/* Drawer */}
      {drawerOpen && (
        <BrandDrawer
          brand={editingBrand}
          onClose={() => {
            setDrawerOpen(false);
            setEditingBrand(null);
          }}
          onSaved={handleSaved}
        />
      )}

      {/* Delete modal */}
      {deleteTarget && (
        <DeleteModal
          brand={deleteTarget}
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

/* -------------------------------------------------------------------------- */
/* Stats                                                                       */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/* Brand row                                                                   */
/* -------------------------------------------------------------------------- */

function BrandRow({
  brand,
  onEdit,
  onDelete,
}: {
  brand: AdminBrand;
  onEdit: (brand: AdminBrand) => void;
  onDelete: (brand: AdminBrand) => void;
}) {
  const productCount =
    brand._count?.products ?? 0;

  return (
    <tr className="group transition hover:bg-gray-50/70">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <BrandAvatar brand={brand} />

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-950">
              {brand.name}
            </p>

            {brand.description && (
              <p className="mt-0.5 max-w-[300px] truncate text-xs text-gray-400">
                {brand.description}
              </p>
            )}
          </div>
        </div>
      </td>

      <td className="px-6 py-4">
        <span className="rounded-lg bg-gray-50 px-2.5 py-1.5 font-mono text-xs text-gray-500">
          /{brand.slug}
        </span>
      </td>

      <td className="px-6 py-4">
        <span className="text-sm font-semibold text-gray-800">
          {productCount.toLocaleString(
            "en-IN",
          )}
        </span>
      </td>

      <td className="px-6 py-4">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-semibold text-green-700">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
          Active
        </span>
      </td>

      <td className="px-6 py-4">
        <div className="flex justify-end gap-1">
          <AdminPermission permission="products.update">
            <button
              type="button"
              onClick={() =>
                onEdit(brand)
              }
              className="rounded-lg px-3 py-2 text-xs font-semibold text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
            >
              Edit
            </button>
          </AdminPermission>

          <AdminPermission permission="products.delete">
            <button
              type="button"
              onClick={() =>
                onDelete(brand)
              }
              className="rounded-lg px-3 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-50"
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
/* Brand avatar                                                                */
/* -------------------------------------------------------------------------- */

function BrandAvatar({
  brand,
}: {
  brand: AdminBrand;
}) {
  if (brand.logoUrl) {
    return (
      <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-white">
        <img
          src={brand.logoUrl}
          alt={`${brand.name} logo`}
          className="h-full w-full object-contain p-1.5"
        />
      </div>
    );
  }

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-950 text-sm font-bold text-white">
      {brand.name
        .charAt(0)
        .toUpperCase()}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Drawer                                                                      */
/* -------------------------------------------------------------------------- */

function BrandDrawer({
  brand,
  onClose,
  onSaved,
}: {
  brand: AdminBrand | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const isEditing = !!brand;

  const [name, setName] = useState(
    brand?.name ?? "",
  );

  const [description, setDescription] =
    useState(brand?.description ?? "");

  const [logoUrl, setLogoUrl] =
    useState(brand?.logoUrl ?? "");

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const submit = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    if (!name.trim()) {
      setError(
        "Brand name is required.",
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      if (isEditing) {
        await updateAdminBrand(
          brand.id,
          {
            name: name.trim(),
            description:
              description.trim() ||
              undefined,
            logoUrl:
              logoUrl.trim() || undefined,
          },
        );
      } else {
        await createAdminBrand({
          name: name.trim(),
          description:
            description.trim() ||
            undefined,
          logoUrl:
            logoUrl.trim() || undefined,
        });
      }

      await onSaved();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save brand.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100]">
      <button
        type="button"
        aria-label="Close drawer"
        onClick={onClose}
        className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"
      />

      <div className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col bg-white shadow-2xl">
        <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-gray-200 px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
              Catalog
            </p>

            <h2 className="mt-1 text-lg font-bold text-gray-950">
              {isEditing
                ? "Edit brand"
                : "Create brand"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <form
          onSubmit={submit}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <div className="flex-1 space-y-6 overflow-y-auto p-6">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Preview */}
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-gray-400">
                Preview
              </p>

              <div className="mt-4 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-white">
                  {logoUrl.trim() ? (
                    <img
                      src={logoUrl.trim()}
                      alt=""
                      className="h-full w-full object-contain p-2"
                    />
                  ) : (
                    <span className="text-lg font-bold text-gray-400">
                      {name
                        .charAt(0)
                        .toUpperCase() ||
                        "B"}
                    </span>
                  )}
                </div>

                <div>
                  <p className="text-sm font-bold text-gray-900">
                    {name.trim() ||
                      "Brand name"}
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    {name.trim()
                      ? `/${createPreviewSlug(
                          name,
                        )}`
                      : "/brand-slug"}
                  </p>
                </div>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-800">
                Brand name
              </label>

              <input
                value={name}
                onChange={(event) =>
                  setName(
                    event.target.value,
                  )
                }
                placeholder="e.g. Apple"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:bg-white"
              />

              <p className="mt-2 text-xs text-gray-400">
                The URL slug will be generated
                automatically.
              </p>
            </div>

            {/* Logo */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-800">
                Logo URL
              </label>

              <input
                value={logoUrl}
                onChange={(event) =>
                  setLogoUrl(
                    event.target.value,
                  )
                }
                placeholder="https://example.com/logo.png"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:bg-white"
              />

              <p className="mt-2 text-xs text-gray-400">
                Optional. Use a publicly accessible
                image URL.
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-800">
                Description
              </label>

              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value,
                  )
                }
                rows={5}
                placeholder="Describe the brand..."
                className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:bg-white"
              />
            </div>
          </div>

          <div className="flex shrink-0 items-center justify-end gap-3 border-t border-gray-200 bg-white px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-gray-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : isEditing
                  ? "Save Changes"
                  : "Create Brand"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Delete modal                                                                */
/* -------------------------------------------------------------------------- */

function DeleteModal({
  brand,
  deleting,
  onCancel,
  onConfirm,
}: {
  brand: AdminBrand;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}) {
  const productCount =
    brand._count?.products ?? 0;

  const protectedBrand =
    productCount > 0;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="p-6">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-lg font-bold text-red-600">
            !
          </div>

          <h2 className="text-lg font-bold text-gray-950">
            Delete brand?
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            You are about to delete{" "}
            <span className="font-semibold text-gray-800">
              {brand.name}
            </span>
            .
          </p>

          {protectedBrand ? (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-800">
                This brand cannot be deleted
                yet.
              </p>

              <p className="mt-1 text-xs leading-5 text-amber-700">
                {productCount}{" "}
                {productCount === 1
                  ? "product is"
                  : "products are"}{" "}
                currently assigned to this
                brand.
              </p>
            </div>
          ) : (
            <p className="mt-4 rounded-xl bg-gray-50 p-4 text-xs leading-5 text-gray-500">
              This action permanently removes
              the brand from your catalog.
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>

          {!protectedBrand && (
            <button
              type="button"
              onClick={onConfirm}
              disabled={deleting}
              className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              {deleting
                ? "Deleting..."
                : "Delete Brand"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Loading / Empty                                                             */
/* -------------------------------------------------------------------------- */

function BrandLoading() {
  return (
    <div className="divide-y divide-gray-100">
      {Array.from({
        length: 5,
      }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-4 px-6 py-5"
        >
          <div className="h-11 w-11 animate-pulse rounded-xl bg-gray-100" />

          <div className="flex-1">
            <div className="h-4 w-36 animate-pulse rounded bg-gray-100" />

            <div className="mt-2 h-3 w-24 animate-pulse rounded bg-gray-100" />
          </div>

          <div className="hidden h-4 w-12 animate-pulse rounded bg-gray-100 sm:block" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({
  onAdd,
}: {
  onAdd: () => void;
}) {
  return (
    <div className="px-6 py-20 text-center">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-xl font-bold text-gray-400">
        B
      </div>

      <h3 className="text-base font-bold text-gray-950">
        No brands yet
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
        Add your first brand to start
        organizing products in your catalog.
      </p>

      <AdminPermission permission="products.create">
        <button
          type="button"
          onClick={onAdd}
          className="mt-6 rounded-xl bg-gray-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
        >
          + Create Brand
        </button>
      </AdminPermission>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

function createPreviewSlug(
  value: string,
) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}