"use client";

import {
  Check,
  ChevronDown,
  Search,
  Smartphone,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

import type { CompareProduct } from "./compare.mapper";

interface ComparePhoneSelectorProps {
  products: CompareProduct[];
  selectedProducts: CompareProduct[];
  onChange: (products: CompareProduct[]) => void;
  maxProducts?: number;
}

function formatPrice(price: number | null): string {
  if (price === null || !Number.isFinite(price)) {
    return "Price unavailable";
  }

  return `₹${price.toLocaleString("en-IN")}`;
}

function getImageUrl(image: string | null): string | null {
  if (!image) {
    return null;
  }

  if (
    image.startsWith("http://") ||
    image.startsWith("https://")
  ) {
    return image;
  }

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:5000/api";

  const backendUrl = apiUrl.replace(/\/api\/?$/, "");

  return `${backendUrl}${
    image.startsWith("/") ? image : `/${image}`
  }`;
}

export default function ComparePhoneSelector({
  products,
  selectedProducts,
  onChange,
  maxProducts = 4,
}: ComparePhoneSelectorProps) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const selectedIds = useMemo(
    () =>
      new Set(
        selectedProducts.map(
          (product) => product.id,
        ),
      ),
    [selectedProducts],
  );

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products
      .filter((product) => {
        if (selectedIds.has(product.id)) {
          return false;
        }

        if (!query) {
          return true;
        }

        return (
          product.name
            .toLowerCase()
            .includes(query) ||
          product.brand
            .toLowerCase()
            .includes(query)
        );
      })
      .slice(0, 12);
  }, [products, search, selectedIds]);

  function addProduct(product: CompareProduct) {
    if (selectedIds.has(product.id)) {
      return;
    }

    if (selectedProducts.length >= maxProducts) {
      return;
    }

    onChange([...selectedProducts, product]);
    setSearch("");
    setIsOpen(false);
  }

  function removeProduct(productId: string) {
    onChange(
      selectedProducts.filter(
        (product) => product.id !== productId,
      ),
    );
  }

  return (
    <section className="rounded-[24px] border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
            <Smartphone
              className="h-5 w-5"
              strokeWidth={2.2}
            />
          </div>

          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-cyan-600">
              Compare Phones
            </p>

            <h2 className="mt-0.5 text-xl font-black tracking-tight text-slate-900">
              Choose Smartphones
            </h2>
          </div>
        </div>

        <p className="mt-2 text-xs leading-5 text-slate-500">
          Select 2 to {maxProducts} smartphones to compare
          their specifications, prices and features.
        </p>
      </div>

      {/* Selected products */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {selectedProducts.map((product) => {
          const image = getImageUrl(product.image);

          return (
            <div
              key={product.id}
              className="group relative rounded-2xl border border-cyan-100 bg-cyan-50/40 p-3 transition-all hover:border-cyan-200 hover:bg-cyan-50"
            >
              <button
                type="button"
                onClick={() =>
                  removeProduct(product.id)
                }
                aria-label={`Remove ${product.name}`}
                className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm transition-colors hover:bg-red-50 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-3 pr-7">
                <div className="flex h-16 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white">
                  {image ? (
                    <img
                      src={image}
                      alt={product.name}
                      className="h-full w-full object-contain p-1.5"
                    />
                  ) : (
                    <Smartphone className="h-7 w-7 text-slate-300" />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-[9px] font-extrabold uppercase tracking-wide text-cyan-600">
                    {product.brand}
                  </p>

                  <p className="mt-0.5 line-clamp-2 text-xs font-extrabold leading-4 text-slate-800">
                    {product.name}
                  </p>

                  <p className="mt-1 text-xs font-black text-slate-900">
                    {formatPrice(product.price)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {/* Empty slots */}
        {Array.from({
          length: Math.max(
            0,
            maxProducts - selectedProducts.length,
          ),
        }).map((_, index) => (
          <button
            key={`empty-${index}`}
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex min-h-[94px] items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 text-xs font-bold text-slate-400 transition-all hover:border-cyan-200 hover:bg-cyan-50/40 hover:text-cyan-600"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm">
              <span className="text-lg leading-none">
                +
              </span>
            </div>

            Add Phone
          </button>
        ))}
      </div>

      {/* Search selector */}
      {selectedProducts.length < maxProducts && (
        <div className="relative mt-4">
          <div
            className={`flex items-center gap-2 rounded-2xl border bg-white px-3 py-2.5 transition-all ${
              isOpen
                ? "border-cyan-300 ring-4 ring-cyan-50"
                : "border-slate-200"
            }`}
          >
            <Search className="h-4 w-4 shrink-0 text-slate-400" />

            <input
              type="text"
              value={search}
              onFocus={() => setIsOpen(true)}
              onChange={(event) => {
                setSearch(event.target.value);
                setIsOpen(true);
              }}
              placeholder="Search a phone to compare..."
              className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
            />

            <ChevronDown
              className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>

          {isOpen && (
            <>
              <button
                type="button"
                aria-label="Close phone search"
                className="fixed inset-0 z-20 cursor-default"
                onClick={() => setIsOpen(false)}
              />

              <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                <div className="max-h-[360px] overflow-y-auto p-2">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => {
                      const image = getImageUrl(
                        product.image,
                      );

                      return (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() =>
                            addProduct(product)
                          }
                          className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-colors hover:bg-slate-50"
                        >
                          <div className="flex h-12 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-50">
                            {image ? (
                              <img
                                src={image}
                                alt={product.name}
                                className="h-full w-full object-contain p-1"
                              />
                            ) : (
                              <Smartphone className="h-6 w-6 text-slate-300" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-[9px] font-extrabold uppercase tracking-wide text-slate-400">
                              {product.brand}
                            </p>

                            <p className="truncate text-xs font-extrabold text-slate-800">
                              {product.name}
                            </p>

                            <p className="mt-0.5 text-[11px] font-bold text-slate-500">
                              {formatPrice(
                                product.price,
                              )}
                            </p>
                          </div>

                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-50 text-cyan-600">
                            <Check className="h-3.5 w-3.5" />
                          </span>
                        </button>
                      );
                    })
                  ) : (
                    <div className="px-4 py-8 text-center">
                      <Smartphone className="mx-auto h-7 w-7 text-slate-300" />

                      <p className="mt-2 text-xs font-bold text-slate-500">
                        No matching smartphones found.
                      </p>

                      <p className="mt-1 text-[10px] text-slate-400">
                        Try another brand or model name.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Status */}
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-[10px] font-semibold text-slate-400">
          {selectedProducts.length} of {maxProducts} phones
          selected
        </p>

        {selectedProducts.length >= 2 && (
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wide text-emerald-600">
            Ready to compare
          </span>
        )}
      </div>
    </section>
  );
}