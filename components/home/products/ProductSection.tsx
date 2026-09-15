"use client";

import Link from "next/link";
import {
    ArrowRight,
  Laptop,
  Smartphone,
  Sparkles,
} from "lucide-react";

import ProductCard, {
  type HomeProduct,
} from "./ProductCard";

import ProductTabs, {
  type ProductTab,
} from "./ProductTabs";
import { useMemo, useState } from "react";

interface ProductSectionProps {
  products: HomeProduct[];
  activeTab?: ProductTab;
  onTabChange?: (tab: ProductTab) => void;
  title?: string;
  viewAllHref?: string;
}


function getSectionIcon(title: string) {
  const normalizedTitle = title.toLowerCase();

  if (
    normalizedTitle.includes("laptop") ||
    normalizedTitle.includes("computer")
  ) {
    return Laptop;
  }

  return Smartphone;
}

export default function ProductSection({
  products,
  activeTab,
  onTabChange,
  title = "Mobile Phones",
  viewAllHref = "/mobiles",
}: ProductSectionProps) {

  const [selectedTab, setSelectedTab] =
  useState<ProductTab>("latest");

  const SectionIcon = getSectionIcon(title);

const visibleProducts = useMemo(() => {
  const items = [...products];

  switch (selectedTab) {
    case "deals":
      return items.sort(
        (a, b) => (a.price ?? Infinity) - (b.price ?? Infinity),
      );

    case "popular":
      return items;

    case "upcoming":
  return items.filter(
    (product) => product.isUpcoming === true,
  );

    case "latest":
    default:
      return items;
  }
}, [products, selectedTab]);

  const isMobileSection =
    title.toLowerCase().includes("mobile");

  const handleTabChange = (tab: ProductTab) => {
    onTabChange?.(tab);
  };

  return (
    <section className="w-full">
      {/* Section Header */}
      <div className="mb-4 flex items-end justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
              isMobileSection
                ? "bg-blue-50 text-blue-600"
                : "bg-violet-50 text-violet-600"
            }`}
          >
            <div
              className={`absolute inset-0 rounded-xl blur-md ${
                isMobileSection
                  ? "bg-blue-100/60"
                  : "bg-violet-100/60"
              }`}
            />

            <SectionIcon
  className="relative h-5 w-5"
  strokeWidth={2}
/>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em]">
  Smartprix Picks
</p>

              {isMobileSection && (
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 text-[9px] font-extrabold uppercase text-orange-600">
                  <Sparkles className="h-2.5 w-2.5" />
                  Popular
                </span>
              )}
            </div>

            <h2 className="truncate text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
              {title}
            </h2>
          </div>
        </div>

        <Link
          href={viewAllHref}
          className={`group hidden shrink-0 items-center gap-1.5 text-sm font-bold sm:flex ${
            isMobileSection
              ? "text-blue-600"
              : "text-violet-600"
          }`}
        >
          View All
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Tabs only for mobile phones */}
      {isMobileSection && (
       <ProductTabs
  value={selectedTab}
  onChange={(tab) => {
    setSelectedTab(tab);
    handleTabChange(tab);
  }}
/>
      )}

      {/* Products */}
      {visibleProducts.length > 0 ? (
        <div className="grid grid-flow-col auto-cols-[195px] gap-3 overflow-x-auto pb-3 scrollbar-none sm:grid-flow-row sm:auto-cols-auto sm:grid-cols-2 sm:overflow-visible lg:grid-cols-5">
          {visibleProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      ) : (
        <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white">
          <div className="text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Smartphone className="h-5 w-5" />
            </div>

            <p className="mt-3 text-sm font-semibold text-slate-600">
              No products available
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Products will appear here when available.
            </p>
          </div>
        </div>
      )}

      {/* Mobile View All */}
      <Link
        href={viewAllHref}
        className={`mt-2 flex items-center justify-center gap-1.5 rounded-xl border px-4 py-2.5 text-sm font-bold transition sm:hidden ${
          isMobileSection
            ? "border-blue-100 bg-blue-50 text-blue-600 hover:bg-blue-100"
            : "border-violet-100 bg-violet-50 text-violet-600 hover:bg-violet-100"
        }`}
      >
        View All
        <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  );
}