"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api/client";

type Category = {
id: string;
name: string;
slug: string;
};

type NewsBlock = {
id: string;
type: string;
position: number;
content: {
html?: string;
};
};

type NewsPost = {
id: string;
title: string;
slug: string;
authorName: string;
featuredImage?: string | null;
status: "DRAFT" | "PUBLISHED";
publishedAt?: string | null;
createdAt: string;
categories?: {
category: Category;
}[];
blocks?: NewsBlock[];
};

type NewsResponse = {
success: boolean;
data: NewsPost[];
};

export default function NewsPage() {
const [posts, setPosts] = useState<NewsPost[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [search, setSearch] = useState("");
const [categoryFilter, setCategoryFilter] = useState("ALL");

useEffect(() => {
const loadNews = async () => {
try {
setLoading(true);
setError("");

    const response = await apiFetch<NewsResponse>("/news");

    if (!response.success) {
      throw new Error("Failed to load news");
    }

    setPosts(
      Array.isArray(response.data)
        ? response.data.filter(
            (post) => post.status === "PUBLISHED",
          )
        : [],
    );
  } catch (err) {
    console.error("Failed to load public news:", err);

    setError(
      err instanceof Error
        ? err.message
        : "Failed to load news",
    );
  } finally {
    setLoading(false);
  }
};

loadNews();

}, []);

const categories = useMemo(() => {
const map = new Map<string, Category>();

posts.forEach((post) => {
  post.categories?.forEach(({ category }) => {
    map.set(category.id, category);
  });
});

return Array.from(map.values()).sort((a, b) =>
  a.name.localeCompare(b.name),
);

}, [posts]);

const filteredPosts = useMemo(() => {
const query = search.trim().toLowerCase();

return posts.filter((post) => {
  const matchesSearch =
    !query ||
    post.title.toLowerCase().includes(query) ||
    post.authorName.toLowerCase().includes(query);

  const matchesCategory =
    categoryFilter === "ALL" ||
    post.categories?.some(
      ({ category }) =>
        category.id === categoryFilter,
    );

  return matchesSearch && matchesCategory;
});

}, [posts, search, categoryFilter]);

const featuredPosts = filteredPosts.slice(0, 5);
const latestPosts = filteredPosts.slice(5);

const formatDate = (date?: string | null) => {
if (!date) return "";

return new Date(date).toLocaleDateString("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

};

const getImage = (post: NewsPost) => {
if (post.featuredImage) {
return post.featuredImage;
}

return "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=85";

};

const getExcerpt = (post: NewsPost) => {
const html =
post.blocks?.find(
(block) => block.type === "rich-text",
)?.content?.html ?? "";

const text = html
  .replace(/<[^>]*>/g, " ")
  .replace(/\s+/g, " ")
  .trim();

return text.length > 140
  ? `${text.slice(0, 140)}...`
  : text;

};

return (
<main className="min-h-screen bg-[#f3f5f8] pb-10">
<div className="mx-auto max-w-7xl px-4 pt-4">
{/* Header */}
<section className="rounded-md border border-slate-200 bg-white px-5 py-4">
<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
<div>
<h1 className="text-2xl font-extrabold text-slate-900">
News
</h1>

          <p className="mt-1 text-sm text-slate-500">
            Latest technology news, launches,
            reviews and updates.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search news..."
            className="w-full rounded-md border border-slate-300 bg-white px-4 py-2 text-sm outline-none focus:border-blue-500 sm:w-64"
          />

          <select
            value={categoryFilter}
            onChange={(event) =>
              setCategoryFilter(event.target.value)
            }
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm outline-none focus:border-blue-500"
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
        </div>
      </div>

      {/* Category navigation */}
      {categories.length > 0 && (
        <div className="mt-4 flex gap-2 overflow-x-auto border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={() =>
              setCategoryFilter("ALL")
            }
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold ${
              categoryFilter === "ALL"
                ? "bg-[#087be7] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All
          </button>

          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() =>
                setCategoryFilter(category.id)
              }
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold ${
                categoryFilter === category.id
                  ? "bg-[#087be7] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      )}
    </section>

    {/* Loading */}
    {loading && (
      <section className="mt-4 rounded-md border border-slate-200 bg-white p-10 text-center">
        <p className="text-sm text-slate-500">
          Loading latest news...
        </p>
      </section>
    )}

    {/* Error */}
    {!loading && error && (
      <section className="mt-4 rounded-md border border-red-200 bg-white p-10 text-center">
        <p className="font-medium text-red-600">
          {error}
        </p>

        <button
          type="button"
          onClick={() =>
            window.location.reload()
          }
          className="mt-4 rounded-md bg-[#087be7] px-4 py-2 text-sm font-semibold text-white"
        >
          Try Again
        </button>
      </section>
    )}

    {/* Empty */}
    {!loading &&
      !error &&
      filteredPosts.length === 0 && (
        <section className="mt-4 rounded-md border border-slate-200 bg-white p-12 text-center">
          <h2 className="text-lg font-bold text-slate-800">
            No news found
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Try another search or category.
          </p>
        </section>
      )}

    {/* Featured News */}
    {!loading &&
      !error &&
      featuredPosts.length > 0 && (
        <section className="mt-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              Trending News
            </h2>

            <span className="text-xs text-slate-500">
              {filteredPosts.length} articles
            </span>
          </div>

          <div className="grid grid-cols-1 gap-1 overflow-hidden rounded-md md:h-[480px] md:grid-cols-3 md:grid-rows-3">
            {featuredPosts.map((post, index) => {
              const large =
                index === 0 || index === 4;

              const position =
                index === 0
                  ? "md:row-span-2"
                  : index === 4
                    ? "md:col-start-3 md:row-start-2 md:row-span-2"
                    : "";

              return (
                <Link
                  key={post.id}
                  href={`/news/${post.slug}`}
                  className={`group relative flex min-h-[180px] items-end overflow-hidden rounded-[3px] p-4 text-white md:min-h-0 ${position}`}
                >
                  <img
                    src={getImage(post)}
                    alt={post.title}
                    className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {post.categories?.[0] && (
                    <span className="absolute left-0 top-0 bg-[#087be7] px-3 py-1.5 text-xs font-bold">
                      {post.categories[0].category.name}
                    </span>
                  )}

                  <div className="relative">
                    <h2
                      className={`font-extrabold leading-[1.35] drop-shadow-sm ${
                        large
                          ? "text-xl sm:text-2xl"
                          : "text-sm sm:text-[15px]"
                      }`}
                    >
                      {post.title}
                    </h2>

                    <p className="mt-2 text-[11px] text-white/75">
                      {post.authorName}
                      {post.publishedAt &&
                        ` • ${formatDate(post.publishedAt)}`}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

    {/* Latest News */}
    {!loading &&
      !error &&
      latestPosts.length > 0 && (
        <section className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,2fr)_360px]">
          <div className="rounded-md border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-semibold">
                Latest News
              </h2>

              <span className="text-xs text-slate-500">
                {latestPosts.length} articles
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {latestPosts.map((post) => (
                <article
                  key={post.id}
                  className="flex gap-3 py-4"
                >
                  <Link
                    href={`/news/${post.slug}`}
                    className="shrink-0"
                  >
                    <img
                      src={getImage(post)}
                      alt={post.title}
                      className="h-24 w-36 rounded object-cover transition hover:opacity-90"
                    />
                  </Link>

                  <div className="min-w-0">
                    {post.categories?.[0] && (
                      <span className="text-[11px] font-semibold text-[#087be7]">
                        {post.categories[0].category.name}
                      </span>
                    )}

                    <Link
                      href={`/news/${post.slug}`}
                      className="mt-1 block text-sm font-bold leading-6 text-slate-800 hover:text-[#087be7]"
                    >
                      {post.title}
                    </Link>

                    {getExcerpt(post) && (
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                        {getExcerpt(post)}
                      </p>
                    )}

                    <p className="mt-2 text-[11px] text-slate-400">
                      {post.authorName}
                      {post.publishedAt &&
                        ` • ${formatDate(post.publishedAt)}`}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="rounded-md border border-slate-200 bg-white p-4">
            <h2 className="border-b border-slate-100 pb-3 text-lg font-semibold">
              Popular Categories
            </h2>

            <div className="mt-3 space-y-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() =>
                    setCategoryFilter(category.id)
                  }
                  className="flex w-full items-center justify-between rounded-md bg-slate-50 px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-[#087be7]"
                >
                  <span>{category.name}</span>

                  <span className="text-xs text-slate-400">
                    {
                      posts.filter((post) =>
                        post.categories?.some(
                          ({ category: postCategory }) =>
                            postCategory.id ===
                            category.id,
                        ),
                      ).length
                    }
                  </span>
                </button>
              ))}
            </div>
          </aside>
        </section>
      )}
  </div>
</main>

);
}