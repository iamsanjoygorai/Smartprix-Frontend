
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { apiFetch } from "@/lib/api/client";

import dynamic from "next/dynamic";

const NewsEditor = dynamic(
  () => import("@/components/admin/news/NewsEditor"),
  {
    ssr: false,
  }
);

type NewsStatus = "DRAFT" | "PUBLISHED";

type NewsForm = {
  title: string;
  authorName: string;
  featuredImage: string;
  status: NewsStatus;
  allowLikes: boolean;
  allowComments: boolean;
  allowSharing: boolean;
};

type Category = {
  id: string;
  name: string;
  slug: string;
};

type ApiResponse = {
  success?: boolean;
  message?: string;
  data?: any;
  error?: string;
};

export default function NewNewsPage() {
  const router = useRouter();

  // =========================================================
  // FORM STATE
  // =========================================================

  const [form, setForm] = useState<NewsForm>({
    title: "",
    authorName: "",
    featuredImage: "",
    status: "DRAFT",
    allowLikes: true,
    allowComments: true,
    allowSharing: true,
  });

  const [content, setContent] = useState("");

const [contentJSON, setContentJSON] = useState<
  Record<string, unknown> | null
>(null);

const [contentText, setContentText] = useState("");

  const [saving, setSaving] = useState(false);

  const [saveMessage, setSaveMessage] = useState("");

  const [featuredImageInput, setFeaturedImageInput] =
    useState("");

  const [showPublishSettings, setShowPublishSettings] =
    useState(false);

  const [showVisibilitySettings, setShowVisibilitySettings] =
    useState(false);

  const [showPreview, setShowPreview] = useState(false);

  // =========================================================
  // CATEGORY STATE
  // =========================================================

  const [categories, setCategories] = useState<Category[]>([]);
const [selectedCategoryIds, setSelectedCategoryIds] =
  useState<string[]>([]);
const [categoriesLoading, setCategoriesLoading] = useState(true);

  // =========================================================
  // REFS
  // =========================================================

  const titleInputRef =
    useRef<HTMLInputElement | null>(null);

  // =========================================================
  // LOAD CATEGORIES
  // =========================================================

  useEffect(() => {
  const loadCategories = async () => {
    try {
      setCategoriesLoading(true);

      const response = await apiFetch<{
        success: boolean;
        data: Category[];
      }>("/admin/news/categories");

      if (!response?.success) {
        throw new Error(
          "Failed to load news categories.",
        );
      }

      setCategories(
        Array.isArray(response.data)
          ? response.data
          : [],
      );
    } catch (error) {
      console.error(
        "Failed to load categories:",
        error,
      );

      setCategories([]);

      window.alert(
        error instanceof Error
          ? error.message
          : "Failed to load categories.",
      );
    } finally {
      setCategoriesLoading(false);
    }
  };

  loadCategories();
}, []);

  // =========================================================
  // AUTO FOCUS TITLE
  // =========================================================

  useEffect(() => {
    titleInputRef.current?.focus();
  }, []);

  // =========================================================
  // SLUG PREVIEW
  // =========================================================

  const previewSlug = useMemo(() => {
    const slug = form.title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    return slug || "your-news-title";
  }, [form.title]);

  // =========================================================
  // UPDATE FORM FIELD
  // =========================================================

  const updateForm = <K extends keyof NewsForm>(
    field: K,
    value: NewsForm[K]
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };


  const getNodeText = (
  node: Record<string, unknown>,
): string => {
  if (typeof node.text === "string") {
    return node.text;
  }

  const children =
    (node.content as Array<Record<string, unknown>> | undefined) ??
    [];

  return children
    .map((child) => getNodeText(child))
    .join("");
};

  // =========================================================
  // CATEGORY TOGGLE
  // =========================================================

  const toggleCategory = (categoryId: string) => {
    setSelectedCategoryIds((current) =>
      current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId]
    );
  };

  // =========================================================
  // CREATE NEWS BLOCKS
  // =========================================================

  const createBlocks = () => {
  return [
    {
      type: "rich-text",
      position: 0,
      content: {
        html: content,
        text: contentText,
      },
    },
  ];
};

  // =========================================================
  // SAVE POST
  // =========================================================

  const savePost = async (status: NewsStatus) => {
  if (!form.title.trim()) {
    window.alert("Please enter a title.");
    titleInputRef.current?.focus();
    return;
  }

  if (!form.authorName.trim()) {
    window.alert("Please enter the author name.");
    return;
  }

  if (!contentJSON) {
    const shouldContinue = window.confirm(
      "The article content is empty. Do you want to continue?"
    );

    if (!shouldContinue) {
      return;
    }
  }

  try {
    setSaving(true);
    setSaveMessage("");

    const payload = {
      title: form.title.trim(),
      authorName: form.authorName.trim(),
      featuredImage:
        form.featuredImage.trim() || undefined,
      status,
      allowLikes: form.allowLikes,
      allowComments: form.allowComments,
      allowSharing: form.allowSharing,
      blocks: createBlocks(),
      categoryIds: selectedCategoryIds,
    };

    console.log("Creating news post:", payload);

    const response = (await apiFetch("/admin/news", {
      method: "POST",
      body: JSON.stringify(payload),
    })) as ApiResponse;

    console.log("Create news response:", response);

    if (!response) {
      throw new Error("No response received from server.");
    }

    if (response.success === false) {
      throw new Error(
        response.message ||
          response.error ||
          "Failed to save news."
      );
    }

    setForm((previous) => ({
      ...previous,
      status,
    }));

    setSaveMessage(
      status === "PUBLISHED"
        ? "Post published successfully."
        : "Draft saved successfully."
    );

    // Go back to All Posts
    setTimeout(() => {
      router.push("/admin/news");
    }, 700);
  } catch (error) {
    console.error("Save news error:", error);

    window.alert(
      error instanceof Error
        ? error.message
        : "Failed to save news post."
    );
  } finally {
    setSaving(false);
  }
};


  // =========================================================
  // SAVE DRAFT
  // =========================================================

  const handleSaveDraft = async () => {
    await savePost("DRAFT");
  };

  // =========================================================
  // PUBLISH
  // =========================================================

  const handlePublish = async () => {
    await savePost("PUBLISHED");
  };

  // =========================================================
  // FEATURED IMAGE
  // =========================================================

  const setFeaturedImage = () => {
  const cleanUrl = featuredImageInput.trim();

  updateForm("featuredImage", cleanUrl);
};



  // =========================================================
  // PREVIEW
  // =========================================================

  const openPreview = () => {
    setShowPreview(true);
  };

  // =========================================================
  // WORD COUNT
  // =========================================================

  const wordCount = content
    .replace(/<[^>]*>/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-screen bg-[#f1f1f1] text-[#1d2327]">

      {/* =====================================================
          PAGE HEADER
          ===================================================== */}

      <div className="border-b border-[#dcdcde] bg-white px-5 py-4">
        <div className="flex items-center justify-between gap-4">

          <div>
            <h1 className="text-2xl font-normal">
              Add Post
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Create and publish a news article.
            </p>
          </div>

          <button
            type="button"
            className="rounded border border-[#c3c4c7] bg-white px-4 py-2 text-sm text-[#2c3338] shadow-sm hover:bg-[#f6f7f7]"
          >
            Screen Options ▾
          </button>

        </div>
      </div>

      {/* =====================================================
          MAIN ADMIN AREA
          ===================================================== */}

      <div className="px-5 py-5">

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">

          {/* =================================================
              MAIN COLUMN
              ================================================= */}

          <main className="min-w-0">

            {/* TITLE */}

            <input
              ref={titleInputRef}
              type="text"
              value={form.title}
              onChange={(event) =>
                updateForm(
                  "title",
                  event.target.value
                )
              }
              placeholder="Add title"
              className="mb-2 h-[48px] w-full border border-[#c3c4c7] bg-white px-3 text-[24px] font-normal text-[#2c3338] outline-none placeholder:text-[#646970] focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
            />

            {/* PERMALINK */}

            <div className="mb-4 flex flex-wrap items-center gap-1 px-2 text-[13px] text-[#50575e]">

              <span>
                Permalink:
              </span>

              <span className="text-[#2271b1]">
                /news/{previewSlug}
              </span>

              <button
                type="button"
                className="ml-2 rounded border border-[#c3c4c7] bg-[#f6f7f7] px-2 py-1 text-xs hover:bg-white"
                onClick={() => {
                  window.alert(
                    "The final slug is generated by the backend from the news title."
                  );
                }}
              >
                Edit
              </button>

            </div>

            {/* ADD MEDIA */}

            <div className="mb-2">

              <button
                type="button"
                onClick={() => {
                  window.alert(
                    "Use the image button inside the editor to insert images at the cursor position."
                  );
                }}
                className="rounded border border-[#2271b1] bg-white px-3 py-2 text-sm font-medium text-[#2271b1] hover:bg-[#f0f6fc]"
              >
                🖼 Add Media
              </button>

            </div>

            {/* EDITOR */}

            <div className="bg-white">

              <NewsEditor
  value={content}
  onChange={setContent}
  onChangeJSON={setContentJSON}
  onChangeText={setContentText}
/>

            </div>

            {/* EDITOR STATUS */}

            <div className="mt-2 flex items-center justify-between text-xs text-[#646970]">

              <span>
                Words: {wordCount}
              </span>

              {saveMessage && (
                <span className="text-green-600">
                  {saveMessage}
                </span>
              )}

            </div>

            {/* =================================================
                AUTHOR
                ================================================= */}

            <div className="mt-5 border border-[#dcdcde] bg-white">

              <div className="border-b border-[#dcdcde] px-4 py-3">

                <h2 className="text-sm font-semibold">
                  Author
                </h2>

              </div>

              <div className="p-4">

                <label className="mb-2 block text-sm font-medium">
                  Author Name
                </label>

                <input
                  type="text"
                  value={form.authorName}
                  onChange={(event) =>
                    updateForm(
                      "authorName",
                      event.target.value
                    )
                  }
                  placeholder="Enter author name"
                  className="w-full max-w-md rounded border border-[#c3c4c7] px-3 py-2 text-sm outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
                />

              </div>

            </div>

          </main>

          {/* =================================================
              RIGHT SIDEBAR
              ================================================= */}

          <aside className="space-y-4">

            {/* =================================================
                PUBLISH BOX
                ================================================= */}

            <section className="border border-[#c3c4c7] bg-white shadow-sm">

              <div className="flex items-center justify-between border-b border-[#dcdcde] px-3 py-3">

                <h2 className="text-sm font-semibold">
                  Publish
                </h2>

                <button
                  type="button"
                  className="text-gray-500"
                  onClick={() =>
                    setShowPublishSettings(
                      (value) => !value
                    )
                  }
                >
                  {showPublishSettings
                    ? "⌃"
                    : "⌄"}
                </button>

              </div>

              <div className="p-3">

                <div className="mb-3 flex gap-2">

                  <button
                    type="button"
                    disabled={saving}
                    onClick={handleSaveDraft}
                    className="rounded border border-[#2271b1] bg-white px-3 py-2 text-sm text-[#2271b1] hover:bg-[#f0f6fc] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving
                      ? "Saving..."
                      : "Save Draft"}
                  </button>

                  <button
                    type="button"
                    disabled={saving}
                    onClick={openPreview}
                    className="rounded border border-[#c3c4c7] bg-white px-3 py-2 text-sm text-[#2c3338] hover:bg-[#f6f7f7] disabled:opacity-50"
                  >
                    Preview
                  </button>

                </div>

                {/* STATUS */}

                <div className="border-t border-[#eee] py-2 text-sm">

                  <div className="flex items-center justify-between">

                    <span>
                      <span className="mr-2">
                        ●
                      </span>

                      Status:

                      <strong className="ml-1">
                        {form.status ===
                        "PUBLISHED"
                          ? "Published"
                          : "Draft"}
                      </strong>
                    </span>

                    <button
                      type="button"
                      className="text-[#2271b1]"
                      onClick={() =>
                        setShowPublishSettings(
                          true
                        )
                      }
                    >
                      Edit
                    </button>

                  </div>

                </div>

                {/* VISIBILITY */}

                <div className="border-t border-[#eee] py-2 text-sm">

                  <div className="flex items-center justify-between">

                    <span>
                      👁 Visibility:
                      <strong className="ml-1">
                        Public
                      </strong>
                    </span>

                    <button
                      type="button"
                      className="text-[#2271b1]"
                      onClick={() =>
                        setShowVisibilitySettings(
                          (value) => !value
                        )
                      }
                    >
                      Edit
                    </button>

                  </div>

                  {showVisibilitySettings && (
                    <div className="mt-2 rounded bg-[#f6f7f7] p-2 text-xs text-gray-600">
                      News visibility is currently public.
                    </div>
                  )}

                </div>

                {/* PUBLISH TIME */}

                <div className="border-t border-[#eee] py-2 text-sm">

                  <div className="flex items-center justify-between">

                    <span>
                      📅 Publish:
                      <strong className="ml-1">
                        Immediately
                      </strong>
                    </span>

                    <button
                      type="button"
                      className="text-[#2271b1]"
                      onClick={() =>
                        window.alert(
                          "Scheduled publishing can be added to the News model later."
                        )
                      }
                    >
                      Edit
                    </button>

                  </div>

                </div>

                {/* PUBLISH SETTINGS */}

                {showPublishSettings && (
                  <div className="mt-3 border-t border-[#eee] pt-3">

                    <label className="mb-2 block text-xs font-semibold uppercase text-gray-500">
                      Status
                    </label>

                    <select
                      value={form.status}
                      onChange={(event) =>
                        updateForm(
                          "status",
                          event.target
                            .value as NewsStatus
                        )
                      }
                      className="w-full rounded border border-[#c3c4c7] bg-white px-2 py-2 text-sm"
                    >
                      <option value="DRAFT">
                        Draft
                      </option>

                      <option value="PUBLISHED">
                        Published
                      </option>
                    </select>

                  </div>
                )}

                {/* PUBLISH BUTTON */}

                <div className="mt-4 flex justify-end border-t border-[#eee] pt-3">

                  <button
                    type="button"
                    disabled={saving}
                    onClick={handlePublish}
                    className="rounded bg-[#2271b1] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#135e96] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving
                      ? "Publishing..."
                      : "Publish"}
                  </button>

                </div>

              </div>

            </section>

            {/* =================================================
                FEATURED IMAGE
                ================================================= */}

            <section className="border border-[#c3c4c7] bg-white shadow-sm">
  <div className="flex items-center justify-between border-b border-[#dcdcde] px-3 py-3">
    <h2 className="text-sm font-semibold">
      Featured Image
    </h2>

    <span className="text-gray-500">
      ⌃
    </span>
  </div>

  <div className="p-3">
    <label className="mb-2 block text-xs font-medium text-[#50575e]">
      Image URL
    </label>

    <input
      type="url"
      value={featuredImageInput}
      onChange={(event) => {
        const value = event.target.value;

        setFeaturedImageInput(value);
        updateForm("featuredImage", value);
      }}
      placeholder="https://example.com/image.jpg"
      className="w-full rounded border border-[#c3c4c7] px-3 py-2 text-sm outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
    />

    <p className="mt-2 text-xs text-gray-500">
      Enter a public image URL for the article's featured image.
    </p>

    {form.featuredImage && (
      <div className="mt-3">
        <img
          src={form.featuredImage}
          alt="Featured"
          className="aspect-video w-full rounded border border-[#dcdcde] object-cover"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />

        <div className="mt-2 flex justify-between">
          <button
            type="button"
            onClick={() => {
              setFeaturedImageInput("");
              updateForm("featuredImage", "");
            }}
            className="text-sm text-red-600 hover:underline"
          >
            Remove image
          </button>

          <button
            type="button"
            onClick={setFeaturedImage}
            className="text-sm text-[#2271b1] hover:underline"
          >
            Update
          </button>
        </div>
      </div>
    )}
  </div>
</section>

            {/* =================================================
                CATEGORIES
                ================================================= */}

            <section className="border border-[#c3c4c7] bg-white shadow-sm">

              <div className="flex items-center justify-between border-b border-[#dcdcde] px-3 py-3">

                <h2 className="text-sm font-semibold">
                  Categories
                </h2>

                <span className="text-gray-500">
                  ⌃
                </span>

              </div>

              <div className="p-3">

                <div className="mb-3 flex gap-4 border-b border-[#eee] pb-2 text-xs">

                  <button
                    type="button"
                    className="font-medium text-[#2271b1]"
                  >
                    All Categories
                  </button>

                  <button
                    type="button"
                    className="text-[#2271b1]"
                  >
                    Most Used
                  </button>

                </div>

                {categoriesLoading ? (
  <p className="text-sm text-gray-500">
    Loading categories...
  </p>
) : categories.length === 0 ? (
  <p className="text-sm text-gray-500">
    No categories available.
  </p>
) : (
                  <div className="space-y-2 text-sm">

                    {categories.map((category) => (

                      <label
                        key={category.id}
                        className="flex cursor-pointer items-center gap-2"
                      >

                        <input
                          type="checkbox"
                          checked={selectedCategoryIds.includes(
                            category.id
                          )}
                          onChange={() =>
                            toggleCategory(
                              category.id
                            )
                          }
                        />

                        <span>
                          {category.name}
                        </span>

                      </label>

                    ))}

                  </div>
                )}

                {selectedCategoryIds.length > 0 && (
                  <p className="mt-3 text-xs text-gray-500">
                    {selectedCategoryIds.length}{" "}
                    {selectedCategoryIds.length === 1
                      ? "category"
                      : "categories"}{" "}
                    selected
                  </p>
                )}

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/admin/news/categories"
                    )
                  }
                  className="mt-4 text-sm text-[#2271b1] hover:underline"
                >
                  + Add New Category
                </button>

              </div>

            </section>

            {/* =================================================
                ARTICLE SETTINGS
                ================================================= */}

            <section className="border border-[#c3c4c7] bg-white shadow-sm">

              <div className="border-b border-[#dcdcde] px-3 py-3">

                <h2 className="text-sm font-semibold">
                  Article Settings
                </h2>

              </div>

              <div className="space-y-3 p-3 text-sm">

                <label className="flex items-center justify-between gap-3">

                  <span>
                    Allow Likes
                  </span>

                  <input
                    type="checkbox"
                    checked={form.allowLikes}
                    onChange={(event) =>
                      updateForm(
                        "allowLikes",
                        event.target.checked
                      )
                    }
                  />

                </label>

                <label className="flex items-center justify-between gap-3">

                  <span>
                    Allow Comments
                  </span>

                  <input
                    type="checkbox"
                    checked={form.allowComments}
                    onChange={(event) =>
                      updateForm(
                        "allowComments",
                        event.target.checked
                      )
                    }
                  />

                </label>

                <label className="flex items-center justify-between gap-3">

                  <span>
                    Allow Sharing
                  </span>

                  <input
                    type="checkbox"
                    checked={form.allowSharing}
                    onChange={(event) =>
                      updateForm(
                        "allowSharing",
                        event.target.checked
                      )
                    }
                  />

                </label>

              </div>

            </section>

          </aside>

        </div>

      </div>

      {/* =====================================================
          PREVIEW MODAL
          ===================================================== */}

      {showPreview && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-5">

          <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl">

            {/* PREVIEW HEADER */}

            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">

              <div>

                <h2 className="text-lg font-semibold">
                  Post Preview
                </h2>

                <p className="text-xs text-gray-500">
                  Preview of the current article
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setShowPreview(false)
                }
                className="rounded px-3 py-2 text-xl text-gray-500 hover:bg-gray-100"
              >
                ×
              </button>

            </div>

            {/* PREVIEW CONTENT */}

            <div className="overflow-y-auto p-6">

              <article className="mx-auto max-w-3xl">

                <h1 className="text-4xl font-bold text-gray-900">
                  {form.title ||
                    "Untitled News Post"}
                </h1>

                <div className="mt-3 text-sm text-gray-500">
                  By{" "}
                  {form.authorName ||
                    "Unknown Author"}{" "}
                  · Updated just now
                </div>

                {/* PREVIEW IMAGE */}

                {form.featuredImage && (
                  <img
                    src={form.featuredImage}
                    alt={
                      form.title ||
                      "Featured image"
                    }
                    className="mt-6 w-full rounded-lg object-cover"
                  />
                )}

                {/* PREVIEW CATEGORIES */}

                {selectedCategoryIds.length > 0 && (

                  <div className="mt-5 flex flex-wrap gap-2">

                    {categories
                      .filter((category) =>
                        selectedCategoryIds.includes(
                          category.id
                        )
                      )
                      .map((category) => (

                        <span
                          key={category.id}
                          className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                        >
                          {category.name}
                        </span>

                      ))}

                  </div>

                )}

                {/* ARTICLE CONTENT */}

                <div
                  className="mt-8"
                  dangerouslySetInnerHTML={{
                    __html: content,
                  }}
                />

              </article>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}