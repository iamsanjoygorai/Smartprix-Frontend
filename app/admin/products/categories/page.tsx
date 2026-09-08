"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import AdminPermission from "@/components/admin/AdminPermission";
import AdminPermissionGuard from "@/components/admin/AdminPermissionGuard";

import {
  createAdminCategory,
  deleteAdminCategory,
  getAdminCategories,
  updateAdminCategory,
} from "@/lib/api/categories";

import type { AdminCategory } from "@/lib/api/categories";

export default function ProductCategoriesPage() {
  const [categories, setCategories] = useState<AdminCategory[]>(
    [],
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<
    "all" | "root" | "sub"
  >("all");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<AdminCategory | null>(null);

  const [expanded, setExpanded] = useState<
    Record<string, boolean>
  >({});

  const [deleteTarget, setDeleteTarget] =
    useState<AdminCategory | null>(null);

  const [deleting, setDeleting] = useState(false);

  async function loadCategories() {
    try {
      setLoading(true);
      setError("");

      const response = await getAdminCategories();

      setCategories(
        Array.isArray(response.data)
          ? response.data
          : [],
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load categories.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  const rootCategories = useMemo(
    () =>
      categories.filter(
        (category) => !category.parentId,
      ),
    [categories],
  );

  const subcategories = useMemo(
    () =>
      categories.filter(
        (category) => !!category.parentId,
      ),
    [categories],
  );

  const totalProducts = useMemo(
    () =>
      categories.reduce(
        (total, category) =>
          total +
          (category._count?.products ?? 0),
        0,
      ),
    [categories],
  );

  const visibleRootCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    return rootCategories.filter((category) => {
      if (
        filter === "sub"
      ) {
        return false;
      }

      if (!query) {
        return true;
      }

      return (
        category.name
          .toLowerCase()
          .includes(query) ||
        category.slug
          .toLowerCase()
          .includes(query)
      );
    });
  }, [rootCategories, search, filter]);

  const visibleSubcategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    return subcategories.filter((category) => {
      if (
        filter === "root"
      ) {
        return false;
      }

      if (!query) {
        return true;
      }

      return (
        category.name
          .toLowerCase()
          .includes(query) ||
        category.slug
          .toLowerCase()
          .includes(query)
      );
    });
  }, [subcategories, search, filter]);

  const openCreateDrawer = () => {
    setEditingCategory(null);
    setDrawerOpen(true);
  };

  const openEditDrawer = (
    category: AdminCategory,
  ) => {
    setEditingCategory(category);
    setDrawerOpen(true);
  };

  const toggleExpanded = (id: string) => {
    setExpanded((current) => ({
      ...current,
      [id]: !current[id],
    }));
  };

  const handleSaved = async () => {
    setDrawerOpen(false);
    setEditingCategory(null);
    await loadCategories();
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      await deleteAdminCategory(
        deleteTarget.id,
      );

      setDeleteTarget(null);

      await loadCategories();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete category.",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminPermissionGuard permission="categories.view">
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
                Categories
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-gray-950">
              Product Categories
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
              Organize your product catalog with
              structured categories and
              subcategories.
            </p>
          </div>

          <AdminPermission permission="categories.create">
            <button
              type="button"
              onClick={openCreateDrawer}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800"
            >
              <span className="text-lg leading-none">
                +
              </span>

              Add Category
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
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total categories"
            value={categories.length}
            description="All catalog categories"
            icon="▦"
          />

          <StatCard
            label="Root categories"
            value={rootCategories.length}
            description="Top-level categories"
            icon="⌂"
          />

          <StatCard
            label="Subcategories"
            value={subcategories.length}
            description="Nested catalog categories"
            icon="↳"
          />

          <StatCard
            label="Products assigned"
            value={totalProducts}
            description="Products across categories"
            icon="□"
          />
        </div>

        {/* Main card */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {/* Toolbar */}
          <div className="border-b border-gray-100 px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-950">
                  Category structure
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Manage your catalog hierarchy.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                {/* Search */}
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
                    placeholder="Search categories..."
                    className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:bg-white sm:w-64"
                  />
                </div>

                {/* Filter */}
                <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-1">
                  <FilterButton
                    active={filter === "all"}
                    onClick={() =>
                      setFilter("all")
                    }
                  >
                    All
                  </FilterButton>

                  <FilterButton
                    active={filter === "root"}
                    onClick={() =>
                      setFilter("root")
                    }
                  >
                    Root
                  </FilterButton>

                  <FilterButton
                    active={filter === "sub"}
                    onClick={() =>
                      setFilter("sub")
                    }
                  >
                    Subcategories
                  </FilterButton>
                </div>
              </div>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <CategoryLoading />
          )}

          {/* Empty */}
          {!loading &&
            categories.length === 0 && (
              <EmptyState
                onAdd={openCreateDrawer}
              />
            )}

          {/* Category tree */}
          {!loading &&
            categories.length > 0 && (
              <div className="divide-y divide-gray-100">
                {visibleRootCategories.map(
                  (category) => (
                    <CategoryTreeRow
                      key={category.id}
                      category={category}
                      categories={categories}
                      expanded={expanded}
                      onToggle={toggleExpanded}
                      onEdit={openEditDrawer}
                      onDelete={setDeleteTarget}
                    />
                  ),
                )}

                {filter === "sub" &&
                  visibleSubcategories.map(
                    (category) => (
                      <StandaloneSubcategoryRow
                        key={category.id}
                        category={category}
                        onEdit={openEditDrawer}
                        onDelete={setDeleteTarget}
                      />
                    ),
                  )}

                {visibleRootCategories.length ===
                  0 &&
                  visibleSubcategories.length ===
                    0 && (
                    <div className="px-6 py-16 text-center">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-xl text-gray-400">
                        ⌕
                      </div>

                      <p className="text-sm font-semibold text-gray-900">
                        No categories found
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Try changing your search or
                        filter.
                      </p>
                    </div>
                  )}
              </div>
            )}
        </div>
      </div>

      {/* Drawer */}
      {drawerOpen && (
        <CategoryDrawer
          categories={categories}
          category={editingCategory}
          onClose={() => {
            setDrawerOpen(false);
            setEditingCategory(null);
          }}
          onSaved={handleSaved}
        />
      )}

      {/* Delete modal */}
      {deleteTarget && (
        <DeleteModal
          category={deleteTarget}
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

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-sm text-gray-500">
          {icon}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Filter                                                                      */
/* -------------------------------------------------------------------------- */

function FilterButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
        active
          ? "bg-white text-gray-950 shadow-sm"
          : "text-gray-500 hover:text-gray-900"
      }`}
    >
      {children}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Category tree                                                               */
/* -------------------------------------------------------------------------- */

function CategoryTreeRow({
  category,
  categories,
  expanded,
  onToggle,
  onEdit,
  onDelete,
}: {
  category: AdminCategory;
  categories: AdminCategory[];
  expanded: Record<string, boolean>;
  onToggle: (id: string) => void;
  onEdit: (category: AdminCategory) => void;
  onDelete: (category: AdminCategory) => void;
}) {
  const children = categories.filter(
    (item) =>
      item.parentId === category.id,
  );

  const isExpanded =
    expanded[category.id] ?? true;

  return (
    <div>
      <div className="group flex items-center gap-3 px-5 py-4 transition hover:bg-gray-50 sm:px-6">
        <button
          type="button"
          onClick={() =>
            children.length > 0 &&
            onToggle(category.id)
          }
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs transition ${
            children.length > 0
              ? "bg-gray-100 text-gray-500 hover:bg-gray-200"
              : "text-gray-300"
          }`}
        >
          {children.length > 0
            ? isExpanded
              ? "▼"
              : "▶"
            : "•"}
        </button>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-sm font-bold text-gray-500">
          {category.name
            .charAt(0)
            .toUpperCase()}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-semibold text-gray-950">
              {category.name}
            </p>

            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
              Root
            </span>
          </div>

          <p className="mt-1 truncate text-xs text-gray-400">
            /{category.slug}
          </p>
        </div>

        <div className="hidden items-center gap-8 md:flex">
          <Metric
            label="Products"
            value={
              category._count?.products ??
              0
            }
          />

          <Metric
            label="Subcategories"
            value={
              category._count?.children ??
              children.length
            }
          />
        </div>

        <div className="flex items-center gap-1">
          <AdminPermission permission="categories.update">
            <button
              type="button"
              onClick={() =>
                onEdit(category)
              }
              className="rounded-lg px-3 py-2 text-xs font-semibold text-gray-500 opacity-0 transition hover:bg-gray-100 hover:text-gray-900 group-hover:opacity-100"
            >
              Edit
            </button>
          </AdminPermission>

          <AdminPermission permission="categories.delete">
            <button
              type="button"
              onClick={() =>
                onDelete(category)
              }
              className="rounded-lg px-3 py-2 text-xs font-semibold text-red-500 opacity-0 transition hover:bg-red-50 group-hover:opacity-100"
            >
              Delete
            </button>
          </AdminPermission>
        </div>
      </div>

      {isExpanded &&
        children.length > 0 && (
          <div className="border-t border-gray-50 bg-gray-50/50">
            {children.map((child) => (
              <SubcategoryRow
                key={child.id}
                category={child}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
    </div>
  );
}

function SubcategoryRow({
  category,
  onEdit,
  onDelete,
}: {
  category: AdminCategory;
  onEdit: (category: AdminCategory) => void;
  onDelete: (category: AdminCategory) => void;
}) {
  return (
    <div className="group flex items-center gap-3 border-b border-gray-100 px-5 py-3.5 pl-16 last:border-b-0 sm:px-6 sm:pl-[88px]">
      <div className="relative flex h-7 w-7 shrink-0 items-center justify-center">
        <div className="absolute left-0 top-1/2 h-px w-5 bg-gray-300" />

        <div className="relative z-10 h-2 w-2 rounded-full bg-gray-300" />
      </div>

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-bold text-gray-400 ring-1 ring-gray-200">
        {category.name
          .charAt(0)
          .toUpperCase()}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-medium text-gray-800">
            {category.name}
          </p>

          <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400 ring-1 ring-gray-200">
            Subcategory
          </span>
        </div>

        <p className="mt-0.5 truncate text-xs text-gray-400">
          /{category.slug}
        </p>
      </div>

      <div className="hidden md:block">
        <Metric
          label="Products"
          value={
            category._count?.products ??
            0
          }
        />
      </div>

      <div className="flex items-center gap-1">
        <AdminPermission permission="categories.update">
          <button
            type="button"
            onClick={() =>
              onEdit(category)
            }
            className="rounded-lg px-3 py-2 text-xs font-semibold text-gray-500 opacity-0 transition hover:bg-white hover:text-gray-900 group-hover:opacity-100"
          >
            Edit
          </button>
        </AdminPermission>

        <AdminPermission permission="categories.delete">
          <button
            type="button"
            onClick={() =>
              onDelete(category)
            }
            className="rounded-lg px-3 py-2 text-xs font-semibold text-red-500 opacity-0 transition hover:bg-red-50 group-hover:opacity-100"
          >
            Delete
          </button>
        </AdminPermission>
      </div>
    </div>
  );
}

function StandaloneSubcategoryRow({
  category,
  onEdit,
  onDelete,
}: {
  category: AdminCategory;
  onEdit: (category: AdminCategory) => void;
  onDelete: (category: AdminCategory) => void;
}) {
  return (
    <SubcategoryRow
      category={category}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="text-right">
      <p className="text-xs font-semibold text-gray-800">
        {value.toLocaleString("en-IN")}
      </p>

      <p className="text-[10px] text-gray-400">
        {label}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Drawer                                                                      */
/* -------------------------------------------------------------------------- */

function CategoryDrawer({
  categories,
  category,
  onClose,
  onSaved,
}: {
  categories: AdminCategory[];
  category: AdminCategory | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const isEditing = !!category;

  const [name, setName] = useState(
    category?.name ?? "",
  );

  const [description, setDescription] =
    useState(category?.description ?? "");

  const [parentId, setParentId] =
    useState<string>(
      category?.parentId ?? "",
    );

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const availableParents =
    categories.filter(
      (item) =>
        item.id !== category?.id &&
        !isDescendant(
          categories,
          item.id,
          category?.id,
        ),
    );

  const submit = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    if (!name.trim()) {
      setError(
        "Category name is required.",
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      if (isEditing) {
        await updateAdminCategory(
          category.id,
          {
            name: name.trim(),
            description:
              description.trim() || undefined,
            parentId:
              parentId || null,
          },
        );
      } else {
        await createAdminCategory({
          name: name.trim(),
          description:
            description.trim() || undefined,
          parentId:
            parentId || null,
        });
      }

      await onSaved();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save category.",
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
                ? "Edit category"
                : "Create category"}
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

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-800">
                Category name
              </label>

              <input
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="e.g. Mobile Phones"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:bg-white"
              />

              <p className="mt-2 text-xs text-gray-400">
                A unique slug will be generated
                automatically.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-800">
                Parent category
              </label>

              <select
                value={parentId}
                onChange={(event) =>
                  setParentId(
                    event.target.value,
                  )
                }
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-gray-400 focus:bg-white"
              >
                <option value="">
                  No parent — Root category
                </option>

                {availableParents.map(
                  (item) => (
                    <option
                      key={item.id}
                      value={item.id}
                    >
                      {item.parentId
                        ? `↳ ${item.name}`
                        : item.name}
                    </option>
                  ),
                )}
              </select>

              <p className="mt-2 text-xs text-gray-400">
                Choose a parent to create a
                subcategory.
              </p>
            </div>

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
                placeholder="Describe this category..."
                className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:bg-white"
              />
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-gray-500">
                Category structure
              </p>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                {parentId
                  ? "This category will appear underneath the selected parent category."
                  : "This will be created as a top-level catalog category."}
              </p>
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
                  : "Create Category"}
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
  category,
  deleting,
  onCancel,
  onConfirm,
}: {
  category: AdminCategory;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}) {
  const productCount =
    category._count?.products ?? 0;

  const childCount =
    category._count?.children ?? 0;

  const protectedCategory =
    productCount > 0 || childCount > 0;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="p-6">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-lg text-red-600">
            !
          </div>

          <h2 className="text-lg font-bold text-gray-950">
            Delete category?
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            You are about to delete{" "}
            <span className="font-semibold text-gray-800">
              {category.name}
            </span>
            .
          </p>

          {protectedCategory ? (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-800">
                This category cannot be deleted
                yet.
              </p>

              <p className="mt-1 text-xs leading-5 text-amber-700">
                {productCount > 0 &&
                  `${productCount} product${
                    productCount === 1
                      ? ""
                      : "s"
                  } assigned. `}
                {childCount > 0 &&
                  `${childCount} subcategor${
                    childCount === 1
                      ? "y"
                      : "ies"
                  } exist.`}
              </p>
            </div>
          ) : (
            <p className="mt-4 rounded-xl bg-gray-50 p-4 text-xs leading-5 text-gray-500">
              This action permanently removes
              the category from the catalog.
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

          {!protectedCategory && (
            <button
              type="button"
              onClick={onConfirm}
              disabled={deleting}
              className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              {deleting
                ? "Deleting..."
                : "Delete Category"}
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

function CategoryLoading() {
  return (
    <div className="divide-y divide-gray-100">
      {Array.from({
        length: 6,
      }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-4 px-6 py-5"
        >
          <div className="h-8 w-8 animate-pulse rounded-lg bg-gray-100" />

          <div className="h-10 w-10 animate-pulse rounded-xl bg-gray-100" />

          <div className="flex-1">
            <div className="h-4 w-40 animate-pulse rounded bg-gray-100" />

            <div className="mt-2 h-3 w-24 animate-pulse rounded bg-gray-100" />
          </div>
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
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-2xl text-gray-400">
        ▦
      </div>

      <h3 className="text-base font-bold text-gray-950">
        No categories yet
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
        Create your first product category to
        start organizing your catalog.
      </p>

      <AdminPermission permission="categories.create">
        <button
          type="button"
          onClick={onAdd}
          className="mt-6 rounded-xl bg-gray-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
        >
          + Create Category
        </button>
      </AdminPermission>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

function isDescendant(
  categories: AdminCategory[],
  candidateId: string,
  categoryId?: string,
): boolean {
  if (!categoryId) {
    return false;
  }

  let current = categories.find(
    (item) => item.id === candidateId,
  );

  while (current?.parentId) {
    if (current.parentId === categoryId) {
      return true;
    }

    current = categories.find(
      (item) =>
        item.id === current?.parentId,
    );
  }

  return false;
}