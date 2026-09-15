"use client";

import {
  Check,
  Search,
  X,
  Smartphone,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { CompareProduct } from "./compare.mapper";

/* =========================================================
   TYPES
========================================================= */

interface CompareProductPickerProps {
  open: boolean;
  products: CompareProduct[];
  selectedProductIds: string[];
  onSelect: (product: CompareProduct) => void;
  onClose: () => void;
  maxProducts?: number;
}

/* =========================================================
   HELPERS
========================================================= */

function getImageUrl(image: string | null): string | null {
  if (!image) return null;

  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("data:")
  ) {
    return image;
  }

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:5000/api";

  const baseUrl = apiUrl.replace(/\/api\/?$/, "");

  if (image.startsWith("/")) {
    return `${baseUrl}${image}`;
  }

  return `${baseUrl}/${image}`;
}

function formatPrice(price: number | null): string {
  if (price === null || !Number.isFinite(price)) {
    return "Price unavailable";
  }

  return `₹${price.toLocaleString("en-IN")}`;
}

/* =========================================================
   COMPONENT
========================================================= */

export default function CompareProductPicker({
  open,
  products,
  selectedProductIds,
  onSelect,
  onClose,
  maxProducts = 4,
}: CompareProductPickerProps) {
  const [search, setSearch] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  /* =======================================================
     RESET / ESCAPE / BODY LOCK
  ======================================================= */

  useEffect(() => {
    if (!open) {
      setSearch("");
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const timer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 100);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  /* =======================================================
     FILTER PRODUCTS
  ======================================================= */

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return products.slice(0, 20);
    }

    return products
      .filter((product) => {
        const searchableText = [
          product.name,
          product.brand,
          product.slug,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(query);
      })
      .slice(0, 20);
  }, [products, search]);

  /* =======================================================
     SELECT PRODUCT
  ======================================================= */

  const handleSelect = (product: CompareProduct) => {
    const alreadySelected = selectedProductIds.includes(product.id);

    if (alreadySelected) {
      return;
    }

    if (selectedProductIds.length >= maxProducts) {
      return;
    }

    onSelect(product);
  };

  /* =======================================================
     CLOSED
  ======================================================= */

  if (!open) {
    return null;
  }

  const isFull = selectedProductIds.length >= maxProducts;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      className="fixed inset-0 z-[100]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="compare-product-picker-title"
    >
      {/* ===================================================
          BACKDROP
      =================================================== */}

      <button
        type="button"
        aria-label="Close product picker"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-slate-950/55 backdrop-blur-[3px]"
      />

      {/* ===================================================
          BOTTOM SHEET
      =================================================== */}

      <div className="absolute inset-x-0 bottom-0 flex max-h-[88vh] justify-center">
        <div className="flex w-full max-w-3xl flex-col overflow-hidden rounded-t-[28px] border border-white/70 bg-white shadow-[0_-20px_70px_rgba(15,23,42,0.25)]">
          {/* ===============================================
              TOP ACCENT
          =============================================== */}

          <div className="h-1.5 w-full bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600" />

          {/* ===============================================
              HEADER
          =============================================== */}

          <div className="flex items-start justify-between gap-4 px-5 pb-4 pt-5 sm:px-7 sm:pt-6">
            <div className="min-w-0">
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-500/20">
                  <Smartphone
                    size={20}
                    strokeWidth={2.3}
                  />
                </div>

                <div>
                  <h2
                    id="compare-product-picker-title"
                    className="text-lg font-extrabold tracking-tight text-slate-950 sm:text-xl"
                  >
                    Add Product To Comparison
                  </h2>

                  <p className="mt-0.5 text-xs font-medium text-slate-500 sm:text-sm">
                    Search or select a product and it'll be
                    added to comparison.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 active:scale-95"
            >
              <X size={19} />
            </button>
          </div>

          {/* ===============================================
              SEARCH
          =============================================== */}

          <div className="px-5 pb-4 sm:px-7">
            <div className="relative">
              <Search
                size={19}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                ref={inputRef}
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search products..."
                disabled={isFull}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-11 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* =============================================
                QUEUE STATUS
            ============================================= */}

            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-xs font-semibold text-slate-500">
                {search
                  ? `${filteredProducts.length} product${
                      filteredProducts.length === 1
                        ? ""
                        : "s"
                    } found`
                  : "Popular products"}
              </p>

              <span
                className={[
                  "rounded-full px-2.5 py-1 text-[11px] font-bold",
                  isFull
                    ? "bg-amber-100 text-amber-700"
                    : "bg-blue-50 text-blue-700",
                ].join(" ")}
              >
                {selectedProductIds.length}/{maxProducts} selected
              </span>
            </div>
          </div>

          {/* ===============================================
              PRODUCT LIST
          =============================================== */}

          <div className="min-h-0 flex-1 overflow-y-auto border-t border-slate-100 bg-slate-50/70 px-4 py-3 sm:px-5">
            {filteredProducts.length > 0 ? (
              <div className="space-y-2">
                {filteredProducts.map((product) => {
                  const selected =
                    selectedProductIds.includes(product.id);

                  const disabled =
                    selected || isFull;

                  const imageUrl = getImageUrl(
                    product.image,
                  );

                  return (
                    <button
                      key={product.id}
                      type="button"
                      disabled={disabled}
                      onClick={() => handleSelect(product)}
                      className={[
                        "group flex w-full items-center gap-3 rounded-2xl border bg-white p-3 text-left transition",
                        selected
                          ? "cursor-default border-blue-200 bg-blue-50/70"
                          : disabled
                            ? "cursor-not-allowed border-slate-200 opacity-55"
                            : "border-slate-200 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-white hover:shadow-lg hover:shadow-slate-900/5",
                      ].join(" ")}
                    >
                      {/* PRODUCT IMAGE */}

                      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={product.name}
                            className="h-full w-full object-contain p-1.5"
                            loading="lazy"
                          />
                        ) : (
                          <Smartphone
                            size={25}
                            className="text-slate-300"
                          />
                        )}
                      </div>

                      {/* PRODUCT INFO */}

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] font-bold uppercase tracking-wide text-blue-600">
                          {product.brand}
                        </p>

                        <p className="mt-0.5 line-clamp-2 text-sm font-bold leading-5 text-slate-900">
                          {product.name}
                        </p>

                        <div className="mt-1.5 flex items-center gap-2">
                          <span className="text-sm font-extrabold text-slate-950">
                            {formatPrice(product.price)}
                          </span>

                          {product.rating !== null && (
                            <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                              ★ {product.rating.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* SELECT STATE */}

                      <div
                        className={[
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition",
                          selected
                            ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                            : disabled
                              ? "bg-slate-100 text-slate-300"
                              : "border border-slate-200 bg-white text-slate-400 group-hover:border-blue-300 group-hover:bg-blue-50 group-hover:text-blue-600",
                        ].join(" ")}
                      >
                        {selected ? (
                          <Check
                            size={18}
                            strokeWidth={2.8}
                          />
                        ) : (
                          <span className="text-lg font-bold">
                            +
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              /* ===========================================
                 EMPTY STATE
              =========================================== */

              <div className="flex min-h-[240px] flex-col items-center justify-center px-6 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <Search size={27} />
                </div>

                <h3 className="text-base font-extrabold text-slate-900">
                  No products found
                </h3>

                <p className="mt-1.5 max-w-sm text-sm leading-6 text-slate-500">
                  Try searching with a different phone
                  name, brand, or model.
                </p>

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-700 active:scale-95"
                  >
                    Clear search
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ===============================================
              FOOTER
          =============================================== */}

          <div className="border-t border-slate-200 bg-white px-5 py-3.5 sm:px-7">
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs font-medium text-slate-500">
                {isFull
                  ? `Maximum ${maxProducts} products selected.`
                  : "Select a product to add it to your compare queue."}
              </p>

              <button
                type="button"
                onClick={onClose}
                className="shrink-0 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 active:scale-95"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
