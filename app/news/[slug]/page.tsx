"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
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
allowLikes: boolean;
allowComments: boolean;
allowSharing: boolean;
likeCount: number;
commentCount: number;
shareCount: number;
blocks: NewsBlock[];
categories?: {
category: Category;
}[];
};

type NewsResponse = {
success: boolean;
data: NewsPost;
};

export default function NewsArticlePage() {
const params = useParams();
const slug = params.slug as string;

const [post, setPost] = useState<NewsPost | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

useEffect(() => {
if (!slug) return;

const loadPost = async () => {
  try {
    setLoading(true);
    setError("");

    const response = await apiFetch<NewsResponse>(
      `/news/${encodeURIComponent(slug)}`,
    );

    if (!response.success || !response.data) {
      throw new Error("News article not found.");
    }

    setPost(response.data);
  } catch (err) {
    console.error(
      "Failed to load news article:",
      err,
    );

    setError(
      err instanceof Error
        ? err.message
        : "Failed to load article.",
    );
  } finally {
    setLoading(false);
  }
};

loadPost();

}, [slug]);

const formatDate = (date?: string | null) => {
if (!date) return "";

return new Date(date).toLocaleDateString("en-IN", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

};

const handleShare = async () => {
if (!post) return;

const url = window.location.href;

try {
  if (navigator.share) {
    await navigator.share({
      title: post.title,
      url,
    });
    return;
  }

  await navigator.clipboard.writeText(url);
  alert("Article link copied.");
} catch (error) {
  console.error("Failed to share article:", error);
}

};

if (loading) {
return (
<main className="min-h-screen bg-[#f3f5f8] pb-10">
<div className="mx-auto max-w-7xl px-4 pt-4">
<div className="rounded-md border border-slate-200 bg-white p-10 text-center">
<p className="text-sm text-slate-500">
Loading article...
</p>
</div>
</div>
</main>
);
}

if (error || !post) {
return (
<main className="min-h-screen bg-[#f3f5f8] pb-10">
<div className="mx-auto max-w-7xl px-4 pt-4">
<div className="rounded-md border border-slate-200 bg-white p-10 text-center">
<h1 className="text-xl font-bold text-slate-800">
Article not found
</h1>

        <p className="mt-2 text-sm text-slate-500">
          {error ||
            "The article you are looking for does not exist."}
        </p>

        <Link
          href="/news"
          className="mt-5 inline-flex rounded-md bg-[#087be7] px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          ← Back to News
        </Link>
      </div>
    </div>
  </main>
);

}

return (
<main className="min-h-screen bg-[#f3f5f8] pb-10">
<div className="mx-auto max-w-7xl px-4 pt-4">
{/* Breadcrumb */}
<div className="mb-4 flex items-center gap-2 text-sm text-slate-500">
<Link href="/" className="hover:text-[#087be7]" >
Home
</Link>

      <span>›</span>

      <Link
        href="/news"
        className="hover:text-[#087be7]"
      >
        News
      </Link>

      <span>›</span>

      <span className="truncate text-slate-700">
        {post.title}
      </span>
    </div>

    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
      {/* Main article */}
      <article className="overflow-hidden rounded-md border border-slate-200 bg-white">
        {/* Header */}
        <div className="p-5 md:p-7">
          {/* Categories */}
          {post.categories &&
            post.categories.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {post.categories.map(
                  ({ category }) => (
                    <Link
                      key={category.id}
                      href={`/news?category=${category.slug}`}
                      className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#087be7] hover:bg-blue-100"
                    >
                      {category.name}
                    </Link>
                  ),
                )}
              </div>
            )}

          {/* Title */}
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900 md:text-4xl">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-slate-500">
            <span>
              By{" "}
              <strong className="font-semibold text-slate-700">
                {post.authorName}
              </strong>
            </span>

            {post.publishedAt && (
              <>
                <span>•</span>
                <span>
                  {formatDate(post.publishedAt)}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Featured image */}
        {post.featuredImage && (
          <div className="px-5 md:px-7">
            <img
              src={post.featuredImage}
              alt={post.title}
              className="max-h-[520px] w-full rounded-md object-cover"
            />
          </div>
        )}

        {/* Article content */}
        <div className="px-5 py-7 md:px-7 md:py-9">
          {post.blocks
            .sort(
              (a, b) =>
                a.position - b.position,
            )
            .map((block) => {
              if (
                block.type === "rich-text" &&
                block.content?.html
              ) {
                return (
                  <div
                    key={block.id}
                    className="news-content prose prose-slate max-w-none prose-headings:font-bold prose-a:text-[#087be7] prose-img:rounded-md"
                    dangerouslySetInnerHTML={{
                      __html: block.content.html,
                    }}
                  />
                );
              }

              return null;
            })}
        </div>

        {/* Actions */}
        <div className="border-t border-slate-100 px-5 py-4 md:px-7">
          <div className="flex flex-wrap items-center gap-3">
            {post.allowLikes && (
              <button
                type="button"
                className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-[#087be7]"
              >
                👍 Like
                {post.likeCount > 0 &&
                  ` (${post.likeCount})`}
              </button>
            )}

            {post.allowComments && (
              <button
                type="button"
                className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-[#087be7]"
              >
                💬 Comments
                {post.commentCount > 0 &&
                  ` (${post.commentCount})`}
              </button>
            )}

            {post.allowSharing && (
              <button
                type="button"
                onClick={handleShare}
                className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-[#087be7]"
              >
                🔗 Share
              </button>
            )}
          </div>
        </div>
      </article>

      {/* Sidebar */}
      <aside className="space-y-4">
        <div className="rounded-md border border-slate-200 bg-white p-4">
          <h2 className="border-b border-slate-100 pb-3 text-lg font-semibold text-slate-900">
            News
          </h2>

          <Link
            href="/news"
            className="mt-3 flex items-center justify-between rounded-md bg-blue-50 px-4 py-3 text-sm font-semibold text-[#087be7] hover:bg-blue-100"
          >
            <span>All News</span>
            <span>→</span>
          </Link>
        </div>

        {post.categories &&
          post.categories.length > 0 && (
            <div className="rounded-md border border-slate-200 bg-white p-4">
              <h2 className="border-b border-slate-100 pb-3 text-lg font-semibold text-slate-900">
                Categories
              </h2>

              <div className="mt-3 flex flex-wrap gap-2">
                {post.categories.map(
                  ({ category }) => (
                    <Link
                      key={category.id}
                      href={`/news?category=${category.slug}`}
                      className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-blue-50 hover:text-[#087be7]"
                    >
                      {category.name}
                    </Link>
                  ),
                )}
              </div>
            </div>
          )}

        <Link
          href="/news"
          className="block rounded-md border border-slate-200 bg-white p-4 text-center text-sm font-semibold text-[#087be7] hover:bg-blue-50"
        >
          ← Back to all news
        </Link>
      </aside>
    </div>
  </div>

  <style jsx global>{`
    .news-content {
      color: #334155;
      font-size: 16px;
      line-height: 1.85;
    }

    .news-content h1,
    .news-content h2,
    .news-content h3,
    .news-content h4 {
      color: #0f172a;
      margin-top: 1.8em;
      margin-bottom: 0.7em;
    }

    .news-content p {
      margin-top: 1em;
      margin-bottom: 1em;
    }

    .news-content ul {
      list-style: disc;
      padding-left: 1.5rem;
    }

    .news-content ol {
      list-style: decimal;
      padding-left: 1.5rem;
    }

    .news-content li {
      margin: 0.4rem 0;
    }

    .news-content blockquote {
      margin: 1.5rem 0;
      border-left: 4px solid #087be7;
      background: #f8fafc;
      padding: 1rem 1.25rem;
      color: #475569;
    }

    .news-content img {
      max-width: 100%;
      height: auto;
      margin: 1.5rem auto;
      border-radius: 0.375rem;
    }

    .news-content a {
      color: #087be7;
      text-decoration: underline;
    }

    .news-content strong {
      color: #0f172a;
    }
  `}</style>
</main>

);
}