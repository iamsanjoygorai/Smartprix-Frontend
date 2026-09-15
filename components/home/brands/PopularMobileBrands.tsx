"use client";

import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  Smartphone,
  Sparkles,
} from "lucide-react";

import type { Product } from "@/types/product";

interface PopularMobileBrandsProps {
  products: Product[];
}

interface BrandItem {
  id: string;
  name: string;
  slug: string;
  count: number;
}

const brandStyles = [
  {
    bg: "bg-blue-50",
    icon: "bg-blue-100 text-blue-600",
    hover: "group-hover:border-blue-200 group-hover:bg-blue-50/70",
  },
  {
    bg: "bg-violet-50",
    icon: "bg-violet-100 text-violet-600",
    hover: "group-hover:border-violet-200 group-hover:bg-violet-50/70",
  },
  {
    bg: "bg-emerald-50",
    icon: "bg-emerald-100 text-emerald-600",
    hover: "group-hover:border-emerald-200 group-hover:bg-emerald-50/70",
  },
  {
    bg: "bg-orange-50",
    icon: "bg-orange-100 text-orange-600",
    hover: "group-hover:border-orange-200 group-hover:bg-orange-50/70",
  },
  {
    bg: "bg-pink-50",
    icon: "bg-pink-100 text-pink-600",
    hover: "group-hover:border-pink-200 group-hover:bg-pink-50/70",
  },
  {
    bg: "bg-cyan-50",
    icon: "bg-cyan-100 text-cyan-600",
    hover: "group-hover:border-cyan-200 group-hover:bg-cyan-50/70",
  },
  {
    bg: "bg-amber-50",
    icon: "bg-amber-100 text-amber-600",
    hover: "group-hover:border-amber-200 group-hover:bg-amber-50/70",
  },
  {
    bg: "bg-indigo-50",
    icon: "bg-indigo-100 text-indigo-600",
    hover: "group-hover:border-indigo-200 group-hover:bg-indigo-50/70",
  },
];

function getInitials(name: string): string {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "?";
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

function getBrandSlug(name: string, slug?: string): string {
  if (slug?.trim()) {
    return slug.trim();
  }

  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function PopularMobileBrands({
  products,
}: PopularMobileBrandsProps) {
  const brandMap = new Map<string, BrandItem>();

  for (const product of products ?? []) {
    const categorySlug =
      product.category?.slug?.toLowerCase() ?? "";

    const categoryName =
      product.category?.name?.toLowerCase() ?? "";

    /*
     * Only count mobile products.
     *
     * If your backend category is simply "mobile",
     * this catches it automatically.
     */
    const isMobile =
      categorySlug.includes("mobile") ||
      categorySlug.includes("phone") ||
      categoryName.includes("mobile") ||
      categoryName.includes("phone");

    if (!isMobile) {
      continue;
    }

    const brand = product.brand;

    if (!brand?.name) {
      continue;
    }

    const key = brand.id || brand.name.toLowerCase();

    const existing = brandMap.get(key);

    if (existing) {
      existing.count += 1;
      continue;
    }

    brandMap.set(key, {
      id: brand.id,
      name: brand.name,
      slug: getBrandSlug(brand.name, brand.slug),
      count: 1,
    });
  }

  const brands = Array.from(brandMap.values())
    .sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }

      return a.name.localeCompare(b.name);
    })
    .slice(0, 8);

  return (
    <section className="relative overflow-hidden rounded-[24px] border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
      {/* Decorative glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-100/50 blur-3xl" />

      <div className="relative">
        {/* Header */}
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Sparkles
                  className="h-4 w-4"
                  strokeWidth={2.2}
                />
              </span>

              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-blue-600">
                Smartphone Brands
              </p>
            </div>

            <h2 className="mt-2 text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
              Popular Mobile Brands
            </h2>

            <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500">
              Explore smartphones from the most popular mobile
              brands and compare their latest models.
            </p>
          </div>

          <Link
            href="/mobiles"
            className="hidden shrink-0 items-center gap-1 rounded-full bg-slate-100 px-3 py-2 text-[10px] font-extrabold uppercase tracking-wide text-slate-600 transition-colors hover:bg-slate-200 sm:flex"
          >
            View All
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Brand grid */}
        {brands.length > 0 ? (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-8">
            {brands.map((brand, index) => {
              const style =
                brandStyles[index % brandStyles.length];

              return (
                <Link
                  key={brand.id || brand.slug}
                  href={`/mobiles?brand=${encodeURIComponent(
                    brand.slug,
                  )}`}
                  className={`group relative overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/70 p-3 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-md ${style.hover}`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${style.icon} transition-transform duration-300 group-hover:scale-105`}
                    >
                      <span className="text-xs font-black">
                        {getInitials(brand.name)}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-xs font-extrabold text-slate-800">
                        {brand.name}
                      </p>

                      <p className="mt-0.5 text-[9px] font-semibold text-slate-400">
                        {brand.count}{" "}
                        {brand.count === 1
                          ? "phone"
                          : "phones"}
                      </p>
                    </div>
                  </div>

                  <ChevronRight
                    className="absolute right-2 top-2 h-3.5 w-3.5 text-slate-300 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100"
                    strokeWidth={2.5}
                  />

                  <div
                    className={`pointer-events-none absolute -bottom-6 -right-6 h-14 w-14 rounded-full ${style.bg} opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-80`}
                  />
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="flex min-h-[100px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 text-center">
            <div>
              <Smartphone className="mx-auto h-6 w-6 text-slate-300" />

              <p className="mt-2 text-xs font-semibold text-slate-500">
                Mobile brands will appear here once products are
                available.
              </p>
            </div>
          </div>
        )}

        {/* Mobile CTA */}
        <div className="mt-3 sm:hidden">
          <Link
            href="/mobiles"
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-extrabold text-slate-700 transition-colors hover:bg-slate-200"
          >
            Explore All Mobile Brands
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}