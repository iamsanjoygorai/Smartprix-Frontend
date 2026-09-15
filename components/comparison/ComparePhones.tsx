"use client";

import {
  GitCompareArrows,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

import type { Product } from "@/types/product";

import ComparePhoneSelector from "./ComparePhoneSelector";
import CompareTable from "./CompareTable";
import {
  mapProductsToCompareProducts,
  type CompareProduct,
} from "./compare.mapper";

interface ComparePhonesProps {
  products: Product[];
  initialProductIds?: string[];
  maxProducts?: number;
}

function getMobileProducts(products: Product[]): Product[] {
  return products.filter((product) => {
    const categorySlug =
      product.category?.slug?.toLowerCase() ?? "";

    const categoryName =
      product.category?.name?.toLowerCase() ?? "";

    return (
      categorySlug.includes("mobile") ||
      categorySlug.includes("phone") ||
      categoryName.includes("mobile") ||
      categoryName.includes("phone")
    );
  });
}

export default function ComparePhones({
  products,
  initialProductIds = [],
  maxProducts = 4,
}: ComparePhonesProps) {
  const mobileProducts = useMemo(
    () => getMobileProducts(products),
    [products],
  );

  const compareProducts = useMemo(
    () =>
      mapProductsToCompareProducts(
        mobileProducts,
      ),
    [mobileProducts],
  );

  const initialSelectedProducts = useMemo(() => {
    if (initialProductIds.length === 0) {
      return [];
    }

    const initialIds = new Set(
      initialProductIds.slice(0, maxProducts),
    );

    return compareProducts.filter((product) =>
      initialIds.has(product.id),
    );
  }, [
    compareProducts,
    initialProductIds,
    maxProducts,
  ]);

  const [selectedProducts, setSelectedProducts] =
    useState<CompareProduct[]>(
      initialSelectedProducts,
    );

  const [showComparison, setShowComparison] =
    useState(
      initialSelectedProducts.length >= 2,
    );

  const hasEnoughProducts =
    selectedProducts.length >= 2;

  function handleSelectionChange(
    nextProducts: CompareProduct[],
  ) {
    setSelectedProducts(nextProducts);

    if (nextProducts.length < 2) {
      setShowComparison(false);
    }
  }

  function clearAll() {
    setSelectedProducts([]);
    setShowComparison(false);
  }

  function startComparison() {
    if (selectedProducts.length < 2) {
      return;
    }

    setShowComparison(true);
  }

  return (
    <section className="space-y-5">
      {/* Intro */}
      <div className="relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-gradient-to-br from-cyan-50 via-white to-violet-50 p-5 shadow-sm sm:p-7">
        <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-cyan-200/30 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-violet-200/30 blur-3xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-white/80 px-3 py-1.5 shadow-sm">
              <GitCompareArrows
                className="h-3.5 w-3.5 text-cyan-600"
                strokeWidth={2.5}
              />

              <span className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-cyan-700">
                Smartprix Compare
              </span>
            </div>

            <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
              Compare Smartphones
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Compare up to {maxProducts} smartphones
              side-by-side and quickly find the right
              phone for your needs.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2 rounded-2xl border border-white/80 bg-white/80 px-4 py-3 shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <Sparkles
                className="h-5 w-5"
                strokeWidth={2.2}
              />
            </div>

            <div>
              <p className="text-[9px] font-extrabold uppercase tracking-wide text-slate-400">
                Selected
              </p>

              <p className="text-sm font-black text-slate-800">
                {selectedProducts.length} / {maxProducts}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Selector */}
      <ComparePhoneSelector
        products={compareProducts}
        selectedProducts={selectedProducts}
        onChange={handleSelectionChange}
        maxProducts={maxProducts}
      />

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {hasEnoughProducts ? (
            <p className="text-xs font-semibold text-emerald-600">
              ✓ {selectedProducts.length} phones are ready
              to compare.
            </p>
          ) : (
            <p className="text-xs font-semibold text-slate-400">
              Select at least 2 phones to start comparing.
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {selectedProducts.length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-extrabold text-slate-600 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <RotateCcw className="h-3.5 w-3.5" />

              Clear All
            </button>
          )}

          <button
            type="button"
            disabled={!hasEnoughProducts}
            onClick={startComparison}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-extrabold shadow-sm transition-all ${
              hasEnoughProducts
                ? "bg-slate-950 text-white hover:-translate-y-0.5 hover:bg-cyan-600 hover:shadow-md"
                : "cursor-not-allowed bg-slate-100 text-slate-400"
            }`}
          >
            <GitCompareArrows className="h-4 w-4" />

            Compare Now
          </button>
        </div>
      </div>

      {/* Comparison */}
      {showComparison && hasEnoughProducts && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-cyan-600">
                Comparison Results
              </p>

              <p className="mt-0.5 text-xs font-semibold text-slate-400">
                Side-by-side specifications
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowComparison(false)}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-extrabold text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-3.5 w-3.5" />

              Hide
            </button>
          </div>

          <CompareTable products={selectedProducts} />
        </div>
      )}
    </section>
  );
}
