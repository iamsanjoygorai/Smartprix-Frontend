"use client";

import Link from "next/link";
import { ArrowLeft, GitCompareArrows, Smartphone } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { getProducts } from "@/lib/api/products";
import type { Product } from "@/types/product";

import {
  mapProductsToCompareProducts,
  type CompareProduct,
} from "@/components/comparison/compare.mapper";

import CompareTable from "@/components/comparison/CompareTable";

/* =========================================================
   TYPES
========================================================= */

interface ProductsResponse {
  data?: {
    products?: Product[];
  };
}

/* =========================================================
   PAGE
========================================================= */

export default function ComparePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =======================================================
     READ QUERY PARAMETER
  ======================================================= */

  const productIds = useMemo(() => {
    if (typeof window === "undefined") {
      return [];
    }

    const params = new URLSearchParams(
      window.location.search,
    );

    const value = params.get("products");

    if (!value) {
      return [];
    }

    return value
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);
  }, []);

  /* =======================================================
     FETCH PRODUCTS
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      try {
        setLoading(true);
        setError("");

        const response =
          (await getProducts()) as ProductsResponse;

        if (cancelled) {
          return;
        }

        const allProducts =
          response?.data?.products ?? [];

        setProducts(allProducts);
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error(
          "Failed to load comparison products:",
          err,
        );

        setError(
          "We couldn't load the products for comparison.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =======================================================
     MAP SELECTED PRODUCTS
  ======================================================= */

  const compareProducts = useMemo<CompareProduct[]>(() => {
    if (productIds.length === 0) {
      return [];
    }

    const selectedProducts = productIds
      .map((id) =>
        products.find(
          (product) => product.id === id,
        ),
      )
      .filter(
        (product): product is Product =>
          Boolean(product),
      );

    return mapProductsToCompareProducts(
      selectedProducts,
    );
  }, [products, productIds]);

  /* =======================================================
     INVALID / INCOMPLETE SELECTION
  ======================================================= */

  const hasEnoughProducts =
    compareProducts.length >= 2;

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f1f3f6]">
        <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-[28px] border border-white bg-white p-8 shadow-sm">
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex h-16 w-16 animate-pulse items-center justify-center rounded-2xl bg-blue-50 text-blue-500">
                <GitCompareArrows size={30} />
              </div>

              <h1 className="mt-5 text-xl font-extrabold text-slate-900">
                Preparing your comparison...
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Loading product details.
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error) {
    return (
      <main className="min-h-screen bg-[#f1f3f6]">
        <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-[28px] border border-red-100 bg-white p-8 shadow-sm">
            <div className="mx-auto max-w-lg py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                <GitCompareArrows size={29} />
              </div>

              <h1 className="mt-5 text-xl font-extrabold text-slate-900">
                Comparison unavailable
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {error}
              </p>

              <Link
                href="/mobiles"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
              >
                <Smartphone size={17} />
                Browse Mobiles
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* =======================================================
     NO PRODUCTS
  ======================================================= */

  if (!hasEnoughProducts) {
    return (
      <main className="min-h-screen bg-[#f1f3f6]">
        <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 lg:px-8">
          {/* HEADER */}

          <div className="mb-5">
            <Link
              href="/mobiles"
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-blue-600"
            >
              <ArrowLeft size={17} />
              Back to Mobiles
            </Link>
          </div>

          {/* EMPTY STATE */}

          <div className="overflow-hidden rounded-[28px] border border-white bg-white shadow-sm">
            <div className="h-2 bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600" />

            <div className="flex flex-col items-center px-5 py-20 text-center sm:px-8">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-50 to-violet-50 text-blue-600">
                <GitCompareArrows size={36} />
              </div>

              <h1 className="mt-6 text-2xl font-black tracking-tight text-slate-950">
                Compare Smartphones
              </h1>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                Select at least two smartphones to compare
                their specifications, prices and ratings
                side by side.
              </p>

              <Link
                href="/mobiles"
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-blue-500/20 transition hover:from-blue-700 hover:to-violet-700"
              >
                <Smartphone size={18} />
                Choose Phones
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* =======================================================
     MAIN COMPARISON
  ======================================================= */

  return (
    <main className="min-h-screen bg-[#f1f3f6]">
      <div className="mx-auto w-full max-w-[1280px] px-3 py-5 sm:px-5 sm:py-7 lg:px-6">
        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <div className="mb-5">
          <Link
            href="/mobiles"
            className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-blue-600"
          >
            <ArrowLeft size={17} />
            Back to Mobiles
          </Link>

          <div className="overflow-hidden rounded-[28px] border border-white bg-white shadow-sm">
            <div className="h-2 bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600" />

            <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-500/20">
                  <GitCompareArrows
                    size={23}
                    strokeWidth={2.3}
                  />
                </div>

                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-blue-600">
                    Smartprix Comparison
                  </p>

                  <h1 className="mt-0.5 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                    Compare Smartphones
                  </h1>

                  <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">
                    Compare {compareProducts.length} phones
                    side by side.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />

                <span className="text-xs font-bold text-slate-600">
                  {compareProducts.length} products selected
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            COMPARISON TABLE
        ================================================= */}

        <CompareTable products={compareProducts} />
      </div>
    </main>
  );
}
