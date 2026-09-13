"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getProducts } from "@/lib/api/products";
import { apiFetch } from "@/lib/api/client";

import PopularMobiles from "@/components/home/PopularMobiles";
import TrendingNews from "@/components/home/TrendingNews";
import ImageSkeleton from "@/components/home/ImageSkeleton";

import type { Product } from "@/types/product";

/* =========================================================
   TYPES
========================================================= */

interface NewsCategory {
  id: string;
  name: string;
  slug: string;
}

interface NewsBlock {
  id?: string;
  type?: string;
  content?: string;
  data?: unknown;
}

interface NewsPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  status?: string;
  publishedAt?: string | null;
  createdAt: string;
  category?: NewsCategory | null;
  blocks?: NewsBlock[];
  content?: string | null;
  featuredImage?: string | null;
  imageUrl?: string | null;
}

interface NewsResponse {
  success?: boolean;
  data?: NewsPost[];
}

/* =========================================================
   IMAGE URL HELPER
========================================================= */

function getImageUrl(url?: string | null): string {
  if (!url) {
    return "/images/news-placeholder.png";
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

  const backendUrl = apiUrl.replace(/\/api\/?$/, "");

  return `${backendUrl}${url.startsWith("/") ? url : `/${url}`}`;
}

/* =========================================================
   NEWS IMAGE HELPER
========================================================= */

function getNewsThumbnail(post: NewsPost): string | null {
  /*
   * First try explicit image fields.
   */

  if (post.featuredImage) {
    return getImageUrl(post.featuredImage);
  }

  if (post.imageUrl) {
    return getImageUrl(post.imageUrl);
  }

  /*
   * Then inspect rich-text blocks.
   */

  if (Array.isArray(post.blocks)) {
    for (const block of post.blocks) {
      const html =
        typeof block.content === "string"
          ? block.content
          : "";

      if (!html) continue;

      const match = html.match(
        /<img[^>]+src=["']([^"']+)["']/i,
      );

      if (match?.[1]) {
        return getImageUrl(match[1]);
      }
    }
  }

  /*
   * Finally inspect post.content if available.
   */

  if (typeof post.content === "string") {
    const match = post.content.match(
      /<img[^>]+src=["']([^"']+)["']/i,
    );

    if (match?.[1]) {
      return getImageUrl(match[1]);
    }
  }

  return null;
}

/* =========================================================
   STATIC NAVIGATION CATEGORIES
   These are navigation metadata, not product/news content.
========================================================= */

const categories = [
  ["News", "📰", "/news"],
  ["Deals", "🏷️", "/products"],
  ["Grocery", "🛍️", "/products"],
  ["Flights", "✈️", "/flights"],
  ["Mobiles", "📱", "/products?category=mobile"],
  ["Laptops", "💻", "/products?category=laptop"],
  ["TVs", "📺", "/products?category=tv"],
  ["Tablets", "🖥️", "/products?category=tablet"],
  ["Bikes", "🏍️", "/auto"],
  ["Cars", "🚗", "/auto"],
  ["Cameras", "📷", "/electronics/camera"],
  ["Earphones", "🎧", "/accessories"],
  ["Smartwatch", "⌚", "/products?category=smartwatch"],
  ["ACs", "❄️", "/appliances"],
] as const;

/* =========================================================
   HOME PAGE
========================================================= */

export default function HomePage() {
  /* =======================================================
     NEWS STATE
  ======================================================= */

  const [news, setNews] = useState<NewsPost[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);

  /* =======================================================
     PRODUCTS STATE
  ======================================================= */

  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] =
    useState(true);

  /* =======================================================
     LOAD NEWS
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    const loadNews = async () => {
      try {
        setNewsLoading(true);

        const response =
          await apiFetch<NewsResponse>("/news");

        if (!mounted) return;

        if (
          response?.success &&
          Array.isArray(response.data)
        ) {
          const publishedNews = response.data
            .filter(
              (post) =>
                post.status === "PUBLISHED",
            )
            .sort((a, b) => {
              const dateA = new Date(
                a.publishedAt ?? a.createdAt,
              ).getTime();

              const dateB = new Date(
                b.publishedAt ?? b.createdAt,
              ).getTime();

              return dateB - dateA;
            });

          setNews(publishedNews);
        } else {
          setNews([]);
        }
      } catch (error) {
        console.error(
          "Failed to load homepage news:",
          error,
        );

        if (mounted) {
          setNews([]);
        }
      } finally {
        if (mounted) {
          setNewsLoading(false);
        }
      }
    };

    loadNews();

    return () => {
      mounted = false;
    };
  }, []);

  /* =======================================================
     LOAD PRODUCTS
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    const loadProducts = async () => {
      try {
        setProductsLoading(true);

        const response = await getProducts();

        if (!mounted) return;

        const apiProducts = Array.isArray(
          response?.data?.products,
        )
          ? response.data.products
          : [];

        setProducts(apiProducts as Product[]);
      } catch (error) {
        console.error(
          "Failed to load homepage products:",
          error,
        );

        if (mounted) {
          setProducts([]);
        }
      } finally {
        if (mounted) {
          setProductsLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      mounted = false;
    };
  }, []);

  /* =======================================================
     HOMEPAGE DATA
  ======================================================= */

  const homepageNews = news.slice(0, 7);
  const latestNews = news.slice(0, 5);

  const popularProducts = products.slice(0, 8);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="min-h-screen bg-[#f1f3f6] text-slate-900">
      {/* ===================================================
          HERO / CATEGORY STRIP
      =================================================== */}

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1200px] px-4">
          <div className="flex gap-2 overflow-x-auto py-3 scrollbar-hide">
            {categories.map(
              ([label, icon, href]) => (
                <Link
                  key={label}
                  href={href}
                  className="group flex min-w-[82px] flex-col items-center justify-center rounded-xl px-3 py-2.5 transition hover:bg-slate-50"
                >
                  <span className="text-2xl transition-transform duration-200 group-hover:scale-110">
                    {icon}
                  </span>

                  <span className="mt-1 whitespace-nowrap text-xs font-semibold text-slate-600 group-hover:text-[#087f5b]">
                    {label}
                  </span>
                </Link>
              ),
            )}
          </div>
        </div>
      </section>

      {/* ===================================================
          MAIN CONTENT
      =================================================== */}

      <div className="mx-auto max-w-[1200px] px-4 py-5">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          {/* =================================================
              LEFT COLUMN
          ================================================= */}

          <div className="min-w-0 space-y-5">
            {/* ===============================================
                POPULAR MOBILES
            =============================================== */}

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <h2 className="text-lg font-extrabold tracking-tight text-slate-900">
                    Popular Mobiles
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Trending smartphones and latest launches
                  </p>
                </div>

                <Link
                  href="/mobiles"
                  className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-[#087f5b] hover:text-white"
                >
                  View All
                </Link>
              </div>

              <div className="p-4">
                {productsLoading ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {Array.from({ length: 8 }).map(
                      (_, index) => (
                        <div
                          key={index}
                          className="overflow-hidden rounded-xl border border-slate-200 bg-white"
                        >
                          <div className="aspect-square animate-pulse bg-slate-100" />

                          <div className="space-y-2 p-3">
                            <div className="h-3 animate-pulse rounded bg-slate-100" />

                            <div className="h-3 w-2/3 animate-pulse rounded bg-slate-100" />

                            <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100" />
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                ) : popularProducts.length > 0 ? (
                  <PopularMobiles
                    products={popularProducts}
                  />
                ) : (
                  <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl shadow-sm">
                      📱
                    </div>

                    <h3 className="text-sm font-bold text-slate-800">
                      No products available
                    </h3>

                    <p className="mt-1 max-w-sm text-xs text-slate-500">
                      Products will appear here automatically
                      when they are available in your catalog.
                    </p>

                    <Link
                      href="/mobiles"
                      className="mt-4 rounded-lg bg-[#087f5b] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#066b4d]"
                    >
                      Browse Mobiles
                    </Link>
                  </div>
                )}
              </div>
            </section>

            {/* ===============================================
                TRENDING NEWS
            =============================================== */}

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <h2 className="text-lg font-extrabold tracking-tight text-slate-900">
                    Trending News
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Latest technology and gadget stories
                  </p>
                </div>

                <Link
                  href="/news"
                  className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-[#087f5b] hover:text-white"
                >
                  View All
                </Link>
              </div>

              <div className="p-4">
                {newsLoading ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {Array.from({ length: 6 }).map(
                      (_, index) => (
                        <div
                          key={index}
                          className="overflow-hidden rounded-xl border border-slate-200"
                        >
                          <div className="aspect-[16/9] animate-pulse bg-slate-100" />

                          <div className="space-y-2 p-3">
                            <div className="h-3 animate-pulse rounded bg-slate-100" />

                            <div className="h-3 w-4/5 animate-pulse rounded bg-slate-100" />

                            <div className="h-3 w-2/3 animate-pulse rounded bg-slate-100" />
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                ) : homepageNews.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {homepageNews.map(
                      (post) => {
                        const thumbnail =
                          getNewsThumbnail(post);

                        return (
                          <Link
                            key={post.id}
                            href={`/news/${post.slug}`}
                            className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                          >
                            {/* IMAGE */}

                            <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
                              {thumbnail ? (
                                <img
                                  src={thumbnail}
                                  alt={post.title}
                                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                  loading="lazy"
                                />
                              ) : (
                                <ImageSkeleton className="absolute inset-0" />
                              )}

                              {post.category?.name && (
                                <div className="absolute left-3 top-3">
                                  <span className="rounded-full bg-black/65 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
                                    {post.category.name}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* CONTENT */}

                            <div className="p-3.5">
                              <h3 className="line-clamp-2 text-sm font-extrabold leading-5 text-slate-900 transition group-hover:text-[#087f5b]">
                                {post.title}
                              </h3>

                              {post.excerpt && (
                                <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-slate-500">
                                  {post.excerpt}
                                </p>
                              )}

                              <div className="mt-3 flex items-center justify-between">
                                <span className="text-[10px] font-medium text-slate-400">
                                  {new Date(
                                    post.publishedAt ??
                                      post.createdAt,
                                  ).toLocaleDateString(
                                    "en-IN",
                                    {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    },
                                  )}
                                </span>

                                <span className="text-[11px] font-bold text-[#087f5b]">
                                  Read →
                                </span>
                              </div>
                            </div>
                          </Link>
                        );
                      },
                    )}
                  </div>
                ) : (
                  <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl shadow-sm">
                      📰
                    </div>

                    <h3 className="text-sm font-bold text-slate-800">
                      No trending news
                    </h3>

                    <p className="mt-1 max-w-sm text-xs text-slate-500">
                      Published news articles will automatically
                      appear here.
                    </p>

                    <Link
                      href="/news"
                      className="mt-4 rounded-lg bg-[#087f5b] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#066b4d]"
                    >
                      Browse News
                    </Link>
                  </div>
                )}
              </div>
            </section>

            {/* ===============================================
                TRENDING NEWS COMPONENT
                If your existing component is used elsewhere,
                keep this section available.
            =============================================== */}

            {latestNews.length > 0 && (
              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-5 py-4">
                  <h2 className="text-lg font-extrabold tracking-tight text-slate-900">
                    Latest Stories
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Freshly published from the news section
                  </p>
                </div>

                <div className="p-4">
                  <TrendingNews
                    items={latestNews.map(
                      (post) => ({
                        id: post.id,
                        slug: post.slug,
                        title: post.title,
                        imageUrl:
                          getNewsThumbnail(post) ?? "",
                      }),
                    )}
                  />
                </div>
              </section>
            )}

            {/* ===============================================
                AC PROMOTION
            =============================================== */}

            <aside className="flex min-h-[90px] items-center overflow-hidden rounded-2xl bg-gradient-to-r from-[#f3f3f3] from-[40%] to-[#057d77] to-[40%] px-5 shadow-sm">
              <div className="flex w-full items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Compare & Save
                  </p>

                  <h3 className="mt-1 text-base font-extrabold text-slate-900">
                    Find the best AC for your home
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Compare prices, features and ratings.
                  </p>
                </div>

                <Link
                  href="/products?category=ac"
                  className="shrink-0 rounded-lg bg-[#087f5b] px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-[#066b4d]"
                >
                  Compare Now
                </Link>
              </div>
            </aside>
          </div>

          {/* =================================================
              RIGHT SIDEBAR
          ================================================= */}

          <aside className="space-y-5">
            {/* ===============================================
                QUICK CATEGORY CARD
            =============================================== */}

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-4 py-4">
                <h2 className="text-sm font-extrabold text-slate-900">
                  Explore Categories
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-2 p-3">
                {categories.slice(0, 10).map(
                  ([label, icon, href]) => (
                    <Link
                      key={label}
                      href={href}
                      className="group flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 transition hover:border-[#b8dfd0] hover:bg-[#effaf5]"
                    >
                      <span className="text-lg">
                        {icon}
                      </span>

                      <span className="truncate text-xs font-bold text-slate-700 group-hover:text-[#087f5b]">
                        {label}
                      </span>
                    </Link>
                  ),
                )}
              </div>
            </section>

            {/* ===============================================
                PROMOTIONAL CARD
            =============================================== */}

            <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#111827] via-[#172554] to-[#0f766e] p-5 text-white shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white/80">
                  Featured
                </span>

                <span className="text-xl">📱</span>
              </div>

              <h2 className="text-lg font-extrabold leading-6">
                Compare the latest smartphones
              </h2>

              <p className="mt-2 text-xs leading-5 text-white/70">
                Check specifications, prices, ratings and
                offers before you buy.
              </p>

              <Link
                href="/mobiles"
                className="mt-5 inline-flex rounded-lg bg-white px-4 py-2.5 text-xs font-extrabold text-slate-900 transition hover:bg-slate-100"
              >
                Explore Mobiles
              </Link>
            </section>

            {/* ===============================================
                LATEST NEWS SIDEBAR
            =============================================== */}

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
                <h2 className="text-sm font-extrabold text-slate-900">
                  Latest News
                </h2>

                <Link
                  href="/news"
                  className="text-[11px] font-bold text-[#087f5b]"
                >
                  More
                </Link>
              </div>

              {newsLoading ? (
                <div className="space-y-3 p-4">
                  {Array.from({ length: 5 }).map(
                    (_, index) => (
                      <div
                        key={index}
                        className="flex gap-3"
                      >
                        <div className="h-16 w-20 shrink-0 animate-pulse rounded-lg bg-slate-100" />

                        <div className="flex-1 space-y-2">
                          <div className="h-3 animate-pulse rounded bg-slate-100" />

                          <div className="h-3 w-3/4 animate-pulse rounded bg-slate-100" />

                          <div className="h-2 w-1/2 animate-pulse rounded bg-slate-100" />
                        </div>
                      </div>
                    ),
                  )}
                </div>
              ) : latestNews.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {latestNews.map(
                    (post) => {
                      const thumbnail =
                        getNewsThumbnail(post);

                      return (
                        <Link
                          key={post.id}
                          href={`/news/${post.slug}`}
                          className="group flex gap-3 p-3.5 transition hover:bg-slate-50"
                        >
                          <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                            {thumbnail ? (
                              <img
                                src={thumbnail}
                                alt={post.title}
                                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                loading="lazy"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xl">
                                📰
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <h3 className="line-clamp-2 text-xs font-bold leading-4 text-slate-800 group-hover:text-[#087f5b]">
                              {post.title}
                            </h3>

                            <p className="mt-1 text-[10px] text-slate-400">
                              {new Date(
                                post.publishedAt ??
                                  post.createdAt,
                              ).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "numeric",
                                  month: "short",
                                },
                              )}
                            </p>
                          </div>
                        </Link>
                      );
                    },
                  )}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <div className="text-2xl">📰</div>

                  <p className="mt-2 text-xs font-semibold text-slate-500">
                    No published news yet.
                  </p>
                </div>
              )}
            </section>

            {/* ===============================================
                SIMPLE AD / PROMO
            =============================================== */}

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="bg-gradient-to-br from-slate-900 to-slate-700 p-5 text-white">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                  Smartprix
                </p>

                <h3 className="mt-2 text-base font-extrabold">
                  Make smarter buying decisions
                </h3>

                <p className="mt-2 text-xs leading-5 text-white/70">
                  Compare products, specifications and prices
                  in one place.
                </p>

                <Link
                  href="/products"
                  className="mt-4 inline-flex rounded-lg bg-white px-4 py-2 text-xs font-extrabold text-slate-900 transition hover:bg-slate-100"
                >
                  Explore Products
                </Link>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
