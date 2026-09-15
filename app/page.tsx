"use client";

import { useEffect, useState } from "react";

import { getProducts } from "@/lib/api/products";
import { apiFetch } from "@/lib/api/client";

import CategoryExplorer from "@/components/home/categories/CategoryExplorer";
import GadgetCategories from "@/components/home/categories/GadgetCategories";

import ProductSection from "@/components/home/products/ProductSection";
import {
  mapProductToHomeProduct,
} from "@/components/home/products/product.mapper";

import HeroSection from "@/components/home/hero/HeroSection";

import AutomotiveSection from "@/components/home/automotive/AutomotiveSection";
import ApplianceSection from "@/components/home/appliances/ApplianceSection";

import UpcomingSection from "@/components/home/editorial/UpcomingSection";
import ReviewsSection from "@/components/home/editorial/ReviewsSection";
import NewsSection from "@/components/home/editorial/NewsSection";

import HomeSectionCard from "@/components/home/shared/HomeSectionCard";

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

  if (
    url.startsWith("http://") ||
    url.startsWith("https://")
  ) {
    return url;
  }

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:5000/api";

  const backendUrl = apiUrl.replace(/\/api\/?$/, "");

  return `${backendUrl}${url.startsWith("/") ? url : `/${url}`}`;
}

/* =========================================================
   NEWS IMAGE HELPER
========================================================= */

function getNewsThumbnail(
  post: NewsPost,
): string | null {
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
   HOME PAGE
========================================================= */

export default function HomePage() {
  /* =======================================================
     NEWS STATE
  ======================================================= */

  const [news, setNews] = useState<NewsPost[]>([]);

  /* =======================================================
     PRODUCTS STATE
  ======================================================= */

  const [products, setProducts] = useState<Product[]>([]);

  /* =======================================================
     LOAD NEWS
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    const loadNews = async () => {
      try {

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

  /*
   * Mobile products
   */

  const popularProducts = products.slice(0, 5);

  const homeProducts = popularProducts.map(
    (product, index) =>
      mapProductToHomeProduct(
        product,
        index === 0
          ? "Editor's Choice"
          : "Popular",
        index === 0
          ? "purple"
          : "blue",
      ),
  );

  /*
   * Laptop / computer products
   */

  const laptopProducts = products
    .filter((product) => {
      const categorySlug =
        product.category?.slug?.toLowerCase() ?? "";

      const categoryName =
        product.category?.name?.toLowerCase() ?? "";

      return (
        categorySlug.includes("laptop") ||
        categorySlug.includes("computer") ||
        categoryName.includes("laptop") ||
        categoryName.includes("computer")
      );
    })
    .slice(0, 4);

  const homeLaptopProducts =
    laptopProducts.map(
      (product, index) =>
        mapProductToHomeProduct(
          product,
          index === 0
            ? "Featured"
            : "Popular",
          index === 0
            ? "purple"
            : "blue",
        ),
    );

  /* =======================================================
     RENDER
  ======================================================= */

 return (
  <main className="min-h-screen bg-[#f1f3f6]">
      <div className="mx-auto w-full max-w-[1280px] px-3 py-4 sm:px-5 sm:py-6 lg:px-6">
      {/* =====================================================
          FEATURED + TRENDING
      ===================================================== */}

      <div className="mb-6">
       <HeroSection products={homeProducts} />
      </div>

      {/* =====================================================
          EXPLORE CATEGORIES
      ===================================================== */}

      <div className="mb-6">
        <CategoryExplorer />
      </div>

      {/* =====================================================
          MOBILE PHONES
      ===================================================== */}

      <div className="mb-5">
        <HomeSectionCard accent="blue">
          <ProductSection
            products={homeProducts}
            title="Mobile Phones"
            viewAllHref="/mobiles"
          />
        </HomeSectionCard>
      </div>

      {/* =====================================================
          LAPTOPS & COMPUTERS
      ===================================================== */}

      <div className="mb-5">
        <HomeSectionCard accent="violet">
          <ProductSection
            products={homeLaptopProducts}
            title="Laptops & Computers"
            viewAllHref="/products?category=laptop"
          />
        </HomeSectionCard>
      </div>

      {/* =====================================================
          GADGETS & ACCESSORIES
      ===================================================== */}

      <div className="mb-5">
        <HomeSectionCard accent="violet">
          <GadgetCategories />
        </HomeSectionCard>
      </div>

      {/* =====================================================
          CARS & MOTORCYCLES
      ===================================================== */}

      <div className="mb-5">
        <HomeSectionCard accent="emerald">
          <AutomotiveSection />
        </HomeSectionCard>
      </div>

      {/* =====================================================
          HOME APPLIANCES
      ===================================================== */}

      <div className="mb-5">
        <HomeSectionCard accent="orange">
          <ApplianceSection />
        </HomeSectionCard>
      </div>

      {/* =====================================================
          UPCOMING
      ===================================================== */}

      <div className="mb-5">
        <HomeSectionCard accent="amber">
          <UpcomingSection />
        </HomeSectionCard>
      </div>

      {/* =====================================================
          REVIEWS & BUYING GUIDES
      ===================================================== */}

      <div className="mb-5">
        <HomeSectionCard accent="pink">
          <ReviewsSection />
        </HomeSectionCard>
      </div>

      {/* =====================================================
          LATEST NEWS
      ===================================================== */}

      <HomeSectionCard accent="blue">
        <NewsSection
          news={homepageNews.map((item) => ({
            id: item.id,
            title: item.title,
            slug: item.slug,
            image: getNewsThumbnail(item),
            category: item.category?.name ?? null,
            publishedAt: item.publishedAt,
          }))}
        />
      </HomeSectionCard>
    </div>
  </main>
);
}