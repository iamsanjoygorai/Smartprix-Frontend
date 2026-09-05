
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api/client";

type NewsBlock = {
  id?: string;
  type: string;
  position: number;
  content: {
    html?: string;
  };
};

type Category = {
  id: string;
  name: string;
  slug: string;
};

type NewsPost = {
  id: string;
  title: string;
  authorName: string;
  featuredImage?: string | null;
  status: "DRAFT" | "PUBLISHED";
  allowLikes: boolean;
  allowComments: boolean;
  allowSharing: boolean;
  blocks: NewsBlock[];
  categories?: {
    category: Category;
  }[];
};

export default function EditNewsPage() {
  const params = useParams();
  const router = useRouter();

  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [post, setPost] = useState<NewsPost | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
  []
);
const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");

  const [allowLikes, setAllowLikes] = useState(true);
  const [allowComments, setAllowComments] = useState(true);
  const [allowSharing, setAllowSharing] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const loadNews = async () => {
      try {
        setLoading(true);
        setError("");

        console.log("Loading news ID:", id);

        const response = await apiFetch(`/admin/news/${id}`);

        console.log("News API response:", response);

        const news: NewsPost = response?.data ?? response;

        if (!news || !news.id) {
          throw new Error("News post was not found.");
        }

        setPost(news);

        setTitle(news.title ?? "");
        setAuthorName(news.authorName ?? "");
        setFeaturedImage(news.featuredImage ?? "");
        setStatus(news.status ?? "DRAFT");

        setAllowLikes(news.allowLikes ?? true);
        setAllowComments(news.allowComments ?? true);
        setAllowSharing(news.allowSharing ?? true);

        const htmlBlock = news.blocks?.find(
          (block) => block.type === "rich-text"
        );

        setContent(htmlBlock?.content?.html ?? "");

        setSelectedCategoryIds(
          news.categories?.map((item) => item.category.id) ?? []
        );
      } catch (error) {
        console.error("Failed to load news:", error);

        const message =
          error instanceof Error
            ? error.message
            : "Failed to load news.";

        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, [id]);

 useEffect(() => {
  const loadCategories = async () => {
    try {
      setCategoriesLoading(true);

      const response = await apiFetch<{
        success: boolean;
        data: Category[];
      }>("/admin/news/categories");

      console.log("Categories API response:", response);

      if (!response?.success) {
        throw new Error("Failed to load categories.");
      }

      setCategories(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (error) {
      console.error("Failed to load categories:", error);
      setCategories([]);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to load categories."
      );
    } finally {
      setCategoriesLoading(false);
    }
  };

  loadCategories();
}, []);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategoryIds((current) =>
      current.includes(categoryId)
        ? current.filter((item) => item !== categoryId)
        : [...current, categoryId]
    );
  };

  const savePost = async (
    newStatus: "DRAFT" | "PUBLISHED" = status
  ) => {
    if (!title.trim()) {
      alert("Title is required");
      return;
    }

    if (!authorName.trim()) {
      alert("Author name is required");
      return;
    }

    try {
      setSaving(true);

      await apiFetch(`/admin/news/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: title.trim(),
          authorName: authorName.trim(),
          featuredImage: featuredImage.trim() || undefined,
          status: newStatus,
          allowLikes,
          allowComments,
          allowSharing,
          categoryIds: selectedCategoryIds,
          blocks: [
            {
              type: "rich-text",
              position: 0,
              content: {
                html: content,
              },
            },
          ],
        }),
      });

      setStatus(newStatus);

      alert(
        newStatus === "PUBLISHED"
          ? "News published successfully"
          : "Draft saved successfully"
      );

      router.push("/admin/news");
    } catch (error) {
      console.error("Failed to save news:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to save news"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f5f5]">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">
            Loading news...
          </div>

          <div className="mt-2 text-sm text-gray-500">
            Please wait
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] p-8">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-xl border border-red-200 bg-white p-8">
            <h1 className="text-xl font-bold text-gray-900">
              Failed to load news
            </h1>

            <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Try Again
              </button>

              <button
                type="button"
                onClick={() => router.push("/admin/news")}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Back to News
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f5f5]">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900">
            News not found
          </h2>

          <button
            onClick={() => router.push("/admin/news")}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
          >
            Back to News
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-gray-200 bg-white">
        <div className="flex h-[72px] items-center justify-between px-8">
          <div>
            <button
              onClick={() => router.push("/admin/news")}
              className="mb-1 text-sm text-gray-500 hover:text-gray-900"
            >
              ← All Posts
            </button>

            <h1 className="text-2xl font-bold text-gray-900">
              Edit News
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => savePost("DRAFT")}
              disabled={saving}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Draft"}
            </button>

            <button
              type="button"
              onClick={() => savePost("PUBLISHED")}
              disabled={saving}
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Publish"}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">

          {/* Main editor */}
          <div className="space-y-6">

            {/* Title */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Title
              </label>

              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter news title"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Author */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Author
              </label>

              <input
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Author name"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Content */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Content
              </label>

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your news content..."
                rows={18}
                className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 text-sm leading-6 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Categories */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="text-sm font-semibold text-gray-900">
                Categories
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Select one or more categories.
              </p>

             {categoriesLoading ? (
  <p className="mt-4 text-sm text-gray-500">
    Loading categories...
  </p>
) : categories.length === 0 ? (
  <p className="mt-4 text-sm text-gray-500">
    No categories available.
  </p>
) : (
                <div className="mt-4 flex flex-wrap gap-2">
                  {categories.map((category) => {
                    const selected = selectedCategoryIds.includes(
                      category.id
                    );

                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => toggleCategory(category.id)}
                        className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                          selected
                            ? "border-blue-600 bg-blue-50 text-blue-700"
                            : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {selected && "✓ "}
                        {category.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Featured Image */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="text-sm font-semibold text-gray-900">
                Featured Image
              </h2>

              <input
                value={featuredImage}
                onChange={(e) => setFeaturedImage(e.target.value)}
                placeholder="Image URL"
                className="mt-4 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              />

              {featuredImage && (
                <img
                  src={featuredImage}
                  alt=""
                  className="mt-4 aspect-video w-full rounded-lg object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              )}
            </div>

            {/* Status */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="text-sm font-semibold text-gray-900">
                Status
              </h2>

              <select
                value={status}
                onChange={(e) =>
                  setStatus(
                    e.target.value as "DRAFT" | "PUBLISHED"
                  )
                }
                className="mt-4 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none"
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </div>

            {/* Settings */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="text-sm font-semibold text-gray-900">
                Post Settings
              </h2>

              <div className="mt-4 space-y-4">
                <label className="flex items-center justify-between gap-4">
                  <span className="text-sm text-gray-700">
                    Allow Likes
                  </span>

                  <input
                    type="checkbox"
                    checked={allowLikes}
                    onChange={(e) =>
                      setAllowLikes(e.target.checked)
                    }
                    className="h-4 w-4"
                  />
                </label>

                <label className="flex items-center justify-between gap-4">
                  <span className="text-sm text-gray-700">
                    Allow Comments
                  </span>

                  <input
                    type="checkbox"
                    checked={allowComments}
                    onChange={(e) =>
                      setAllowComments(e.target.checked)
                    }
                    className="h-4 w-4"
                  />
                </label>

                <label className="flex items-center justify-between gap-4">
                  <span className="text-sm text-gray-700">
                    Allow Sharing
                  </span>

                  <input
                    type="checkbox"
                    checked={allowSharing}
                    onChange={(e) =>
                      setAllowSharing(e.target.checked)
                    }
                    className="h-4 w-4"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
