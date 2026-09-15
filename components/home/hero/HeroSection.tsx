"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Flame,
  GitCompareArrows,
  Smartphone,
  Sparkles,
  Zap,
} from "lucide-react";

import type { HomeProduct } from "@/components/home/products/ProductCard";

interface HeroSectionProps {
  products: HomeProduct[];
}

function formatPrice(price?: number | null) {
  if (price == null) return null;

  return `₹${price.toLocaleString("en-IN")}`;
}

function ProductVisual({
  product,
  size = "large",
}: {
  product?: HomeProduct;
  size?: "large" | "medium" | "small";
}) {
  const imageHeight =
    size === "large"
      ? "h-48 sm:h-56"
      : size === "medium"
        ? "h-32"
        : "h-24";

  if (!product?.image) {
    return (
      <div
        className={`flex ${imageHeight} items-center justify-center`}
      >
        <div className="flex h-28 w-16 items-center justify-center rounded-[18px] border-[3px] border-slate-300 bg-gradient-to-br from-white via-slate-100 to-slate-200 shadow-xl">
          <Smartphone
            className="h-8 w-8 text-slate-300"
            strokeWidth={1.3}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative flex ${imageHeight} items-center justify-center`}
    >
      <div className="absolute h-28 w-28 rounded-full bg-white/60 blur-3xl" />

      <img
        src={product.image}
        alt={product.name}
        className="relative max-h-full max-w-[72%] object-contain drop-shadow-[0_18px_25px_rgba(15,23,42,0.18)] transition-transform duration-500 group-hover:scale-105"
      />
    </div>
  );
}

function ProductMeta({
  product,
  compact = false,
}: {
  product?: HomeProduct;
  compact?: boolean;
}) {
  if (!product) return null;

  const price = formatPrice(product.price);

  return (
    <div>
      <h3
        className={`line-clamp-2 font-black text-slate-900 ${
          compact ? "text-xs leading-4" : "text-sm leading-5"
        }`}
      >
        {product.name}
      </h3>

      {price && (
        <p
          className={`mt-1 font-black text-slate-900 ${
            compact ? "text-sm" : "text-lg"
          }`}
        >
          {price}
        </p>
      )}

      <div className="mt-2 flex flex-wrap gap-1.5">
        {product.rating != null && (
          <span className="rounded-full bg-amber-50 px-2 py-1 text-[8px] font-black text-amber-700">
            ★ {product.rating.toFixed(1)}
          </span>
        )}

        <span className="rounded-full bg-blue-50 px-2 py-1 text-[8px] font-black text-blue-600">
          Specs
        </span>
      </div>
    </div>
  );
}

function BlockHeader({
  icon,
  label,
  title,
}: {
  icon: React.ReactNode;
  label: string;
  title: string;
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-[8px] font-black uppercase tracking-[0.16em] text-slate-400">
            {label}
          </p>

          <h2 className="truncate text-sm font-black text-slate-900 sm:text-base">
            {title}
          </h2>
        </div>
      </div>

      <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
    </div>
  );
}

export default function HeroSection({
  products,
}: HeroSectionProps) {
  const items = (products ?? []).slice(0, 5);

  const featured = items[0];
  const trending = items[1] ?? items[0];
  const deal = items[2] ?? items[0];
  const launchOne = items[3] ?? items[0];
  const launchTwo = items[4] ?? items[1] ?? items[0];

  const compareOne = items[0];
  const compareTwo = items[1] ?? items[0];

  if (!featured) {
    return null;
  }

  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white p-3 shadow-sm sm:p-4">
      <div className="grid gap-3 lg:grid-cols-3">
        {/* =====================================================
            FEATURED PHONE
        ===================================================== */}

        <Link
          href={featured.href ?? `/mobiles/${featured.slug}`}
          className="group relative overflow-hidden rounded-[24px] bg-gradient-to-br from-blue-50 via-violet-50 to-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg sm:p-5 lg:row-span-2"
        >
          <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-blue-200/40 blur-3xl" />

          <div className="relative flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-2.5 py-1.5 text-[8px] font-black uppercase tracking-wide text-violet-700">
              <Sparkles className="h-3 w-3" />
              Editor's Choice
            </span>

            <span className="rounded-full bg-white/80 px-2.5 py-1.5 text-[8px] font-black text-slate-500 shadow-sm">
              Featured
            </span>
          </div>

          <ProductVisual
            product={featured}
            size="large"
          />

          <div className="relative">
            <ProductMeta product={featured} />

            <span className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-black text-blue-600 transition-all group-hover:gap-2.5">
              View Full Specifications
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </Link>

        {/* =====================================================
            TRENDING
        ===================================================== */}

        <Link
          href={trending.href ?? `/mobiles/${trending.slug}`}
          className="group relative overflow-hidden rounded-[24px] border border-orange-100 bg-gradient-to-br from-orange-50 to-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
        >
          <BlockHeader
            icon={
              <Flame
                className="h-4 w-4 text-orange-500"
                fill="currentColor"
              />
            }
            label="What's Hot"
            title="Trending Phones"
          />

          <div className="grid grid-cols-[1fr_120px] items-center gap-2">
            <ProductMeta
              product={trending}
              compact
            />

            <ProductVisual
              product={trending}
              size="medium"
            />
          </div>
        </Link>

        {/* =====================================================
            BEST DEALS
        ===================================================== */}

        <Link
          href={deal.href ?? `/mobiles/${deal.slug}`}
          className="group relative overflow-hidden rounded-[24px] border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
        >
          <BlockHeader
            icon={
              <Zap
                className="h-4 w-4 text-emerald-500"
                fill="currentColor"
              />
            }
            label="Value Picks"
            title="Best Deals"
          />

          <div className="grid grid-cols-[1fr_120px] items-center gap-2">
            <div>
              <span className="mb-2 inline-flex rounded-full bg-emerald-100 px-2 py-1 text-[8px] font-black uppercase tracking-wide text-emerald-700">
                Best Price
              </span>

              <ProductMeta
                product={deal}
                compact
              />
            </div>

            <ProductVisual
              product={deal}
              size="medium"
            />
          </div>
        </Link>

        {/* =====================================================
            NEW LAUNCHES
        ===================================================== */}

        <Link
          href={launchOne.href ?? `/mobiles/${launchOne.slug}`}
          className="group relative overflow-hidden rounded-[24px] border border-violet-100 bg-gradient-to-br from-violet-50 to-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
        >
          <BlockHeader
            icon={
              <Sparkles className="h-4 w-4 text-violet-600" />
            }
            label="Discover"
            title="New Launches"
          />

          <div className="flex items-end justify-between gap-2">
            <ProductMeta
              product={launchOne}
              compact
            />

            <ProductVisual
              product={launchOne}
              size="small"
            />
          </div>

          <div className="mt-2 flex -space-x-3">
            <div className="relative z-20">
              <ProductVisual
                product={launchOne}
                size="small"
              />
            </div>

            {launchTwo && launchTwo.id !== launchOne.id && (
              <div className="relative z-10">
                <ProductVisual
                  product={launchTwo}
                  size="small"
                />
              </div>
            )}
          </div>
        </Link>

        {/* =====================================================
            COMPARE
        ===================================================== */}

        <Link
          href={`/compare?product1=${compareOne.id}&product2=${compareTwo.id}`}
          className="group relative overflow-hidden rounded-[24px] border border-cyan-100 bg-gradient-to-br from-cyan-50 to-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
        >
          <BlockHeader
            icon={
              <GitCompareArrows className="h-4 w-4 text-cyan-600" />
            }
            label="Decide Better"
            title="Compare Phones"
          />

          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <div className="min-w-0">
              <ProductVisual
                product={compareOne}
                size="small"
              />

              <p className="mt-1 line-clamp-2 text-center text-[9px] font-black text-slate-700">
                {compareOne.name}
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-[9px] font-black text-white shadow-md">
              VS
            </div>

            <div className="min-w-0">
              <ProductVisual
                product={compareTwo}
                size="small"
              />

              <p className="mt-1 line-clamp-2 text-center text-[9px] font-black text-slate-700">
                {compareTwo.name}
              </p>
            </div>
          </div>

          <div className="mt-2 flex items-center justify-center gap-1 text-[9px] font-black text-cyan-600">
            Compare Specifications
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>
      </div>

      {/* =======================================================
          SPECIFICATION SIGNALS
      ======================================================= */}

      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 rounded-2xl bg-slate-50 px-4 py-3">
        <div className="flex items-center gap-1.5">
          <Smartphone className="h-3.5 w-3.5 text-blue-500" />
          <span className="text-[9px] font-bold text-slate-500">
            Detailed Specifications
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <GitCompareArrows className="h-3.5 w-3.5 text-violet-500" />
          <span className="text-[9px] font-bold text-slate-500">
            Compare Phones
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <BarChart3 className="h-3.5 w-3.5 text-emerald-500" />
          <span className="text-[9px] font-bold text-slate-500">
            Ratings
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5 text-orange-500" />
          <span className="text-[9px] font-bold text-slate-500">
            Latest Prices
          </span>
        </div>
      </div>
    </section>
  );
}