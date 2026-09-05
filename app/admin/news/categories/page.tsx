"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api/client";

type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  _count?: {
    posts: number;
  };
};

export default function NewsCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);

  const loadCategories = async () => {
    try {
      setLoading(true);

      const response = await apiFetch<{
        success: boolean;
        data: Category[];
      }>("/admin/news/categories");

      setCategories(Array.isArray(response?.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to load categories:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to load categories",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const resetForm = () => {
    setName("");
    setDescription("");
    setEditingId(null);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!name.trim()) {
      alert("Category name is required");
      return;
    }

    try {
      setSaving(true);

      if (editingId) {
        await apiFetch(`/admin/news/categories/${editingId}`, {
          method: "PUT",
          body: JSON.stringify({
            name: name.trim(),
            description: description.trim() || undefined,
          }),
        });

        alert("Category updated successfully");
      } else {
        await apiFetch("/admin/news/categories", {
          method: "POST",
          body: JSON.stringify({
            name: name.trim(),
            description: description.trim() || undefined,
          }),
        });

        alert("Category created successfully");
      }

      resetForm();
      await loadCategories();
    } catch (error) {
      console.error(
        editingId
          ? "Failed to update category:"
          : "Failed to create category:",
        error,
      );

      alert(
        error instanceof Error
          ? error.message
          : editingId
            ? "Failed to update category"
            : "Failed to create category",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setName(category.name);
    setDescription(category.description ?? "");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (
    id: string,
    categoryName: string,
    postCount: number,
  ) => {
    if (postCount > 0) {
      const confirmed = window.confirm(
        `"${categoryName}" is assigned to ${postCount} ${
          postCount === 1 ? "post" : "posts"
        }.\n\nAre you sure you want to delete this category?`,
      );

      if (!confirmed) return;
    } else {
      const confirmed = window.confirm(
        `Delete category "${categoryName}"?`,
      );

      if (!confirmed) return;
    }

    try {
      setDeletingId(id);

      await apiFetch(`/admin/news/categories/${id}`, {
        method: "DELETE",
      });

      setCategories((current) =>
        current.filter((category) => category.id !== id),
      );

      if (editingId === id) {
        resetForm();
      }
    } catch (error) {
      console.error("Failed to delete category:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to delete category",
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="flex h-[72px] items-center justify-between px-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Categories
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage news categories
            </p>
          </div>

          <Link
            href="/admin/news/new"
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            + Add New Post
          </Link>
        </div>
      </div>

      <div className="p-8">
        {/* Add / Edit Category */}
        <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {editingId ? "Edit Category" : "Add Category"}
              </h2>

              {editingId && (
                <p className="mt-1 text-sm text-gray-500">
                  Update the category information below.
                </p>
              )}
            </div>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid gap-4 md:grid-cols-[1fr_1fr_auto]"
          >
            {/* Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Mobile"
                disabled={saving}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Description
              </label>

              <input
                type="text"
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Optional description"
                disabled={saving}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
              />
            </div>

            {/* Submit */}
            <div className="flex items-end gap-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
              >
                {saving
                  ? editingId
                    ? "Updating..."
                    : "Adding..."
                  : editingId
                    ? "Update Category"
                    : "Add Category"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Category List */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  All Categories
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {categories.length}{" "}
                  {categories.length === 1
                    ? "category"
                    : "categories"}
                </p>
              </div>

              <button
                type="button"
                onClick={loadCategories}
                disabled={loading}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                {loading ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="px-6 py-12 text-center text-sm text-gray-500">
              Loading categories...
            </div>
          ) : categories.length === 0 ? (
            /* Empty */
            <div className="px-6 py-16 text-center">
              <div className="text-4xl">📂</div>

              <h3 className="mt-4 text-base font-semibold text-gray-900">
                No categories yet
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Create your first news category above.
              </p>
            </div>
          ) : (
            /* List */
            <div className="divide-y divide-gray-100">
              {categories.map((category) => {
                const postCount =
                  category._count?.posts ?? 0;

                return (
                  <div
                    key={category.id}
                    className="flex items-center justify-between px-6 py-5 transition hover:bg-gray-50"
                  >
                    {/* Information */}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-semibold text-gray-900">
                          {category.name}
                        </h3>

                        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-500">
                          {category.slug}
                        </span>
                      </div>

                      {category.description && (
                        <p className="mt-1 text-sm text-gray-500">
                          {category.description}
                        </p>
                      )}

                      <p className="mt-2 text-xs text-gray-400">
                        {postCount}{" "}
                        {postCount === 1 ? "post" : "posts"}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="ml-4 flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(category)}
                        disabled={deletingId === category.id}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(
                            category.id,
                            category.name,
                            postCount,
                          )
                        }
                        disabled={
                          deletingId === category.id
                        }
                        className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingId === category.id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}