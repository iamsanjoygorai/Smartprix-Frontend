"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api/client";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type NewsPost = {
  id: string;
  title: string;
  slug: string;
  authorName: string;
  status: "DRAFT" | "PUBLISHED";
  featuredImage?: string | null;
  publishedAt?: string | null;
  createdAt: string;
  categories?: {
    category: Category;
  }[];
};

export default function NewsAdminPage() {
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "PUBLISHED" | "DRAFT"
  >("ALL");

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deletingSelected, setDeletingSelected] = useState(false);

  const loadPosts = async () => {
  try {
    setLoading(true);

    const response = await apiFetch<{
      success: boolean;
      data: NewsPost[];
    }>("/admin/news");

    console.log("News API response:", response);

    if (!response?.success) {
      throw new Error("Failed to load news posts.");
    }

    setPosts(Array.isArray(response.data) ? response.data : []);
  } catch (error) {
    console.error("Failed to load news:", error);

    alert(
      error instanceof Error
        ? error.message
        : "Failed to load news"
    );
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    loadPosts();
  }, []);

  useEffect(() => {
  const loadCategories = async () => {
    try {
      const response = await apiFetch<{
        success: boolean;
        data: Category[];
      }>("/admin/news/categories");

      if (response.success && Array.isArray(response.data)) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  loadCategories();
}, []);

  const handleDelete = async (
    id: string,
    title: string
  ) => {
    const confirmed = window.confirm(
      `Delete "${title}"?`
    );

    if (!confirmed) return;

    try {
      await apiFetch(`/admin/news/${id}`, {
        method: "DELETE",
      });

      setPosts((current) =>
        current.filter((post) => post.id !== id)
      );
    } catch (error) {
      console.error("Failed to delete news:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to delete news"
      );
    }
  };

  const toggleSelectPost = (id: string) => {
  setSelectedIds((current) =>
    current.includes(id)
      ? current.filter((selectedId) => selectedId !== id)
      : [...current, id]
  );
};

const toggleSelectAll = () => {
  const filteredIds = filteredPosts.map((post) => post.id);

  const allSelected =
    filteredIds.length > 0 &&
    filteredIds.every((id) => selectedIds.includes(id));

  if (allSelected) {
    setSelectedIds((current) =>
      current.filter((id) => !filteredIds.includes(id))
    );
  } else {
    setSelectedIds((current) => [
      ...new Set([...current, ...filteredIds]),
    ]);
  }
};

const handleBulkDelete = async () => {
  if (selectedIds.length === 0) return;

  const confirmed = window.confirm(
    `Delete ${selectedIds.length} selected post${
      selectedIds.length === 1 ? "" : "s"
    }? This action cannot be undone.`
  );

  if (!confirmed) return;

  try {
    setDeletingSelected(true);

    await apiFetch("/admin/news/bulk", {
      method: "DELETE",
      body: JSON.stringify({
        ids: selectedIds,
      }),
    });

    setPosts((current) =>
      current.filter((post) => !selectedIds.includes(post.id))
    );

    setSelectedIds([]);
  } catch (error) {
    console.error("Failed to delete selected news:", error);

    alert(
      error instanceof Error
        ? error.message
        : "Failed to delete selected posts"
    );
  } finally {
    setDeletingSelected(false);
  }
};

  const filteredPosts = useMemo(() => {
  const query = search.trim().toLowerCase();

  return posts.filter((post) => {
    const matchesStatus =
      statusFilter === "ALL" ||
      post.status === statusFilter;

    const matchesCategory =
      categoryFilter === "ALL" ||
      post.categories?.some(
        (item) => item.category.id === categoryFilter
      );

    const matchesSearch =
      !query ||
      post.title.toLowerCase().includes(query) ||
      post.authorName.toLowerCase().includes(query) ||
      post.slug.toLowerCase().includes(query);

    return (
      matchesStatus &&
      matchesCategory &&
      matchesSearch
    );
  });
}, [
  posts,
  search,
  statusFilter,
  categoryFilter,
]);

  const publishedCount = posts.filter(
    (post) => post.status === "PUBLISHED"
  ).length;

  const draftCount = posts.filter(
    (post) => post.status === "DRAFT"
  ).length;

  const formatDate = (date?: string | null) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="flex h-[72px] items-center justify-between px-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              All Posts
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage your news articles
            </p>
          </div>

          <Link
            href="/admin/news/new"
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            + Add New
          </Link>
        </div>
      </div>

      <div className="p-8">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-sm font-medium text-gray-500">
              Total Posts
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {posts.length}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-sm font-medium text-gray-500">
              Published
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              {publishedCount}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-sm font-medium text-gray-500">
              Drafts
            </p>

            <p className="mt-2 text-3xl font-bold text-orange-500">
              {draftCount}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search posts..."
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 lg:max-w-md"
            />

            <div className="flex gap-2">
              {(
                ["ALL", "PUBLISHED", "DRAFT"] as const
              ).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() =>
                    setStatusFilter(status)
                  }
                  className={`rounded-lg px-4 py-2 text-sm font-medium ${
                    statusFilter === status
                      ? "bg-gray-900 text-white"
                      : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {status === "ALL"
                    ? "All"
                    : status === "PUBLISHED"
                      ? "Published"
                      : "Drafts"}
                </button>
              ))}

              <select
  value={categoryFilter}
  onChange={(event) =>
    setCategoryFilter(event.target.value)
  }
  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
>
  <option value="ALL">
    All Categories
  </option>

  {categories.map((category) => (
    <option
      key={category.id}
      value={category.id}
    >
      {category.name}
    </option>
  ))}
</select>

             

              <button
                type="button"
                onClick={loadPosts}
                disabled={loading}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Posts table */}
        <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white">

{selectedIds.length > 0 && (
  <div className="flex items-center justify-between border-b border-red-100 bg-red-50 px-6 py-3">
    <span className="text-sm font-medium text-red-700">
      {selectedIds.length} post
      {selectedIds.length === 1 ? "" : "s"} selected
    </span>

    <button
      type="button"
      onClick={handleBulkDelete}
      disabled={deletingSelected}
      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {deletingSelected
        ? "Deleting..."
        : `Delete Selected (${selectedIds.length})`}
    </button>
  </div>
)}

          {loading ? (
            <div className="px-6 py-16 text-center text-sm text-gray-500">
              Loading posts...
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="text-4xl">📰</div>

              <h3 className="mt-4 text-base font-semibold text-gray-900">
                No posts found
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Create your first news article.
              </p>

              <Link
                href="/admin/news/new"
                className="mt-5 inline-block rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"
              >
                Add New Post
              </Link>

{selectedIds.length > 0 && (
  <div className="flex items-center justify-between border-b border-red-100 bg-red-50 px-6 py-3">
    <p className="text-sm font-medium text-red-700">
      {selectedIds.length} post
      {selectedIds.length === 1 ? "" : "s"} selected
    </p>

    <button
      type="button"
      onClick={handleBulkDelete}
      disabled={deletingSelected}
      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {deletingSelected
        ? "Deleting..."
        : `Delete Selected (${selectedIds.length})`}
    </button>
  </div>
)}

            </div>
          ) : (
            
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
  <div className="flex items-center gap-3">
    <input
      type="checkbox"
      checked={
        filteredPosts.length > 0 &&
        filteredPosts.every((post) =>
          selectedIds.includes(post.id)
        )
      }
      onChange={toggleSelectAll}
      className="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
    />

    <span>Title</span>
  </div>
</th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Author
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Categories
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Date
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredPosts.map((post) => (
                    <tr
                      key={post.id}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-5">
  <div className="flex items-start gap-3">
    <input
      type="checkbox"
      checked={selectedIds.includes(post.id)}
      onChange={() => toggleSelectPost(post.id)}
      className="mt-1 h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
    />

    <div className="max-w-[320px]"></div>
                          <Link
                            href={`/admin/news/${post.id}`}
                            className="font-semibold text-gray-900 hover:text-blue-600"
                          >
                            {post.title}
                          </Link>

                          <p className="mt-1 truncate text-xs text-gray-400">
                            /{post.slug}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-5 text-sm text-gray-700">
                        {post.authorName}
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex max-w-[220px] flex-wrap gap-1.5">
                          {post.categories &&
                          post.categories.length > 0 ? (
                            post.categories.map(
                              (item) => (
                                <span
                                  key={
                                    item.category.id
                                  }
                                  className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
                                >
                                  {item.category.name}
                                </span>
                              )
                            )
                          ) : (
                            <span className="text-sm text-gray-400">
                              Uncategorized
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            post.status === "PUBLISHED"
                              ? "bg-green-50 text-green-700"
                              : "bg-orange-50 text-orange-700"
                          }`}
                        >
                          {post.status}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-6 py-5 text-sm text-gray-500">
                        {formatDate(
                          post.publishedAt ??
                            post.createdAt
                        )}
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/admin/news/${post.id}`}
                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                          >
                            Edit
                          </Link>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                post.id,
                                post.title
                              )
                            }
                            className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}