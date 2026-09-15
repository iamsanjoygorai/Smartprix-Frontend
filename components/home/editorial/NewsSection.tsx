"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Newspaper,
} from "lucide-react";

export interface HomeNewsItem {
  id: string;
  title: string;
  slug?: string | null;
  image?: string | null;
  category?: string | null;
  publishedAt?: string | null;
}

interface NewsSectionProps {
  news: HomeNewsItem[];
}

function formatDate(date?: string | null) {
  if (!date) {
    return null;
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function NewsSection({
  news,
}: NewsSectionProps) {
  const items = news.slice(0, 6);

  return (
    <section className="w-full">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Newspaper
              className="h-5 w-5"
              strokeWidth={2}
            />
          </div>

          <div className="min-w-0">
            <p className="mb-0.5 text-[11px] font-bold uppercase tracking-[0.15em] text-blue-600">
              Stay Updated
            </p>

            <h2 className="truncate text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
              Latest News
            </h2>
          </div>
        </div>

        <Link
          href="/news"
          className="group hidden shrink-0 items-center gap-1.5 text-sm font-bold text-blue-600 sm:flex"
        >
          View All
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      </div>

      {items.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const href = item.slug
              ? `/news/${item.slug}`
              : "/news";

            const date = formatDate(item.publishedAt);

            return (
              <Link
                key={item.id}
                href={href}
                className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition-all duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
              >
                <div className="relative h-44 overflow-hidden bg-slate-100">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-50 via-violet-50 to-slate-100">
                      <Newspaper className="h-9 w-9 text-slate-300" />
                    </div>
                  )}

                  {item.category && (
                    <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-600 shadow-sm backdrop-blur-sm">
                      {item.category}
                    </span>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="line-clamp-2 text-sm font-extrabold leading-5 text-slate-900 transition-colors group-hover:text-blue-600">
                    {item.title}
                  </h3>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    {date ? (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {date}
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-slate-400">
                        Latest story
                      </span>
                    )}

                    <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition-all duration-200 group-hover:translate-x-1 group-hover:text-blue-500" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white text-center">
          <Newspaper className="h-9 w-9 text-slate-300" />

          <p className="mt-3 text-sm font-semibold text-slate-500">
            No news available
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Latest stories will appear here when published.
          </p>
        </div>
      )}

      <Link
        href="/news"
        className="mt-3 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-blue-600 transition hover:border-blue-200 hover:bg-blue-50 sm:hidden"
      >
        View All News
        <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  );
}