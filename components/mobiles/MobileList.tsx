"use client";

import { useEffect, useState } from "react";

import MobileCard from "./MobileCard";

import { apiFetch } from "@/lib/api/api";

interface ProductSpecification {
  specification: {
    name: string;
    slug: string;
    unit?: string | null;
  };
  value?: {
    value: string;
  } | null;
  customValue?: string | null;
}

interface ProductImage {
  url: string;
  altText?: string | null;
  isPrimary?: boolean;
}

interface ProductPrice {
  amount: string | number;
  seller?: {
    name: string;
    slug: string;
  } | null;
}

interface ProductVariant {
  storage?: string | null;
  ram?: string | null;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  brand?: {
    name: string;
    slug: string;
  } | null;
  images: ProductImage[];
  prices: ProductPrice[];
  variants?: ProductVariant[];
  specifications?: ProductSpecification[];
}

interface ProductsResponse {
  success: boolean;
  data: {
    products: Product[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
    brandCounts: Record<string, number>;
  };
}

interface MobileListProps {
  search: string;
  brands: string[];
  minPrice: string;
  maxPrice: string;
  displays: string[];
  filterValues: Record<string, string[]>;
  sortBy: string;
  onSortChange: (value: string) => void;
  onBrandCountsChange: (
    counts: Record<string, number>,
  ) => void;
}

function getSpecification(
  product: Product,
  slugs: string[],
) {
  const specification = product.specifications?.find(
    (item) =>
      slugs.includes(item.specification.slug),
  );

  if (!specification) {
    return null;
  }

  return (
    specification.customValue ??
    specification.value?.value ??
    null
  );
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5000/api";

const BACKEND_URL = API_URL.replace(
  /\/api\/?$/,
  "",
);

function getPrimaryImage(product: Product): string {
  const image =
    product.images?.find(
      (item) => item.isPrimary,
    )?.url ??
    product.images?.[0]?.url ??
    "";

  if (!image) {
    return "";
  }

  if (
    image.startsWith("http://") ||
    image.startsWith("https://")
  ) {
    return image;
  }

  if (image.startsWith("/")) {
    return `${BACKEND_URL}${image}`;
  }

  return `${BACKEND_URL}/${image}`;
}

function getLowestPrice(product: Product) {
  if (!product.prices?.length) {
    return null;
  }

  return product.prices.reduce(
    (lowest, current) =>
      Number(current.amount) <
      Number(lowest.amount)
        ? current
        : lowest,
  );
}

function formatPrice(
  amount: string | number | null,
) {
  if (amount === null) {
    return "Price unavailable";
  }

  return `₹${Number(amount).toLocaleString(
    "en-IN",
  )}`;
}

function convertProduct(product: Product) {
  const lowestPrice = getLowestPrice(product);

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,

    price: formatPrice(
      lowestPrice ? lowestPrice.amount : null,
    ),

    score: 0,
    rating: 0,

    image: getPrimaryImage(product),

    display:
      getSpecification(product, [
        "display",
        "display-type",
        "screen-size",
      ]) ??
      "Display information unavailable",

    battery:
      getSpecification(product, [
        "battery",
        "battery-capacity",
      ]) ??
      "Battery information unavailable",

    camera:
      getSpecification(product, [
        "camera",
        "rear-camera",
        "main-camera",
      ]) ??
      "Camera information unavailable",

    storage:
      getSpecification(product, [
        "storage",
        "internal-storage",
      ]) ??
      product.variants?.[0]?.storage ??
      "Storage information unavailable",

    ram:
      getSpecification(product, ["ram"]) ??
      product.variants?.[0]?.ram ??
      null,
  };
}

export default function MobileList({
  search,
  brands,
  minPrice,
  maxPrice,
  displays,
  filterValues,
  sortBy,
  onSortChange,
  onBrandCountsChange,
}: MobileListProps) {
  const [products, setProducts] =
    useState<Product[]>([]);

  const [pagination, setPagination] =
    useState<
      ProductsResponse["data"]["pagination"] | null
    >(null);

  const [page, setPage] = useState(1);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ─────────────────────────────────────────────
  // RESET PAGE WHEN FILTERS CHANGE
  // ─────────────────────────────────────────────

  useEffect(() => {
    setPage(1);
  }, [
    search,
    brands,
    minPrice,
    maxPrice,
    displays,
    filterValues,
    sortBy,
  ]);

  // ─────────────────────────────────────────────
  // FETCH PRODUCTS
  // ─────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const params =
          new URLSearchParams();

        // CATEGORY
        params.set(
          "category",
          "mobiles",
        );

        // PAGINATION
        params.set(
          "page",
          String(page),
        );

        params.set(
          "limit",
          "20",
        );

        // SEARCH
        const trimmedSearch =
          search.trim();

        if (trimmedSearch) {
          params.set(
            "search",
            trimmedSearch,
          );
        }

        // BRANDS
        if (brands.length > 0) {
          params.set(
            "brands",
            brands.join(","),
          );
        }

        // MIN PRICE
        if (minPrice) {
          params.set(
            "minPrice",
            minPrice,
          );
        }

        // MAX PRICE
        if (
          maxPrice &&
          maxPrice !== "30000+"
        ) {
          params.set(
            "maxPrice",
            maxPrice,
          );
        }

        // DISPLAY
        if (displays.length > 0) {
          params.set(
            "displays",
            displays.join(","),
          );
        }

        // OTHER FILTERS
        Object.entries(
          filterValues,
        ).forEach(
          ([key, values]) => {
            if (values.length > 0) {
              params.set(
                key,
                values.join(","),
              );
            }
          },
        );

        // SORT
        if (sortBy) {
          params.set(
            "sort",
            sortBy,
          );
        }

        const response =
          await apiFetch<ProductsResponse>(
            `/products?${params.toString()}`,
          );

        if (cancelled) {
          return;
        }

        const data =
          response.data;

        setProducts(
          data.products ?? [],
        );

        setPagination(
          data.pagination ?? null,
        );

        if (data.brandCounts) {
          onBrandCountsChange(
            data.brandCounts,
          );
        }
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error(
          "Failed to fetch mobile products:",
          err,
        );

        setError(
          "Failed to load mobile phones.",
        );

        setProducts([]);
        setPagination(null);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    const timeout = setTimeout(
      fetchProducts,
      300,
    );

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [
    search,
    brands,
    minPrice,
    maxPrice,
    displays,
    filterValues,
    sortBy,
    page,
    onBrandCountsChange,
  ]);

  // ─────────────────────────────────────────────
  // ACTIVE FILTER COUNT
  // ─────────────────────────────────────────────

  const activeFilterCount =
    brands.length +
    displays.length +
    Object.values(filterValues).reduce(
      (total, values) =>
        total + values.length,
      0,
    ) +
    (minPrice ? 1 : 0) +
    (maxPrice &&
    maxPrice !== "30000+"
      ? 1
      : 0);

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────

  return (
    <section className="overflow-hidden bg-white">
      {/* =====================================================
          LIST HEADER
      ====================================================== */}

      <div className="border-b border-slate-200 bg-gradient-to-r from-white via-white to-indigo-50/30 px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* RESULT INFORMATION */}

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-[17px] font-black tracking-tight text-slate-900 sm:text-[19px]">
                {loading
                  ? "Loading Mobile Phones..."
                  : `${pagination?.total ?? 0} Mobile Phones`}
              </h2>

              {!loading &&
                activeFilterCount > 0 && (
                  <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-black text-indigo-600">
                    {activeFilterCount} filter
                    {activeFilterCount !== 1
                      ? "s"
                      : ""}{" "}
                    applied
                  </span>
                )}
            </div>

            <p className="mt-1 text-[11px] font-medium text-slate-400">
              {search.trim()
                ? `Showing results for "${search.trim()}"`
                : "Compare smartphones, prices and specifications"}
            </p>
          </div>

          {/* SORT */}

          <div className="flex items-center gap-2">
            <span className="hidden text-[11px] font-bold uppercase tracking-wider text-slate-400 sm:block">
              Sort by
            </span>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(event) => {
                  onSortChange(
                    event.target.value,
                  );
                  setPage(1);
                }}
                className="h-10 min-w-[155px] appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-9 text-[12px] font-bold text-slate-700 outline-none transition-all hover:border-indigo-300 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              >
                <option value="relevance">
                  Relevance
                </option>

                <option value="newest">
                  Newest
                </option>

                <option value="oldest">
                  Oldest
                </option>

                <option value="name_asc">
                  Name: A to Z
                </option>

                <option value="name_desc">
                  Name: Z to A
                </option>

                <option value="price_asc">
                  Price: Low to High
                </option>

                <option value="price_desc">
                  Price: High to Low
                </option>

                <option value="rating_desc">
                  Rating: High to Low
                </option>
              </select>

              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          LOADING
      ====================================================== */}

      {loading && (
        <div className="divide-y divide-slate-100">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="flex gap-5 p-5"
            >
              <div className="h-[180px] w-[120px] shrink-0 animate-pulse rounded-2xl bg-slate-100" />

              <div className="flex-1 space-y-4 py-2">
                <div className="h-5 w-2/3 animate-pulse rounded-lg bg-slate-100" />

                <div className="h-4 w-1/3 animate-pulse rounded-lg bg-slate-100" />

                <div className="h-8 w-1/2 animate-pulse rounded-lg bg-slate-100" />

                <div className="grid grid-cols-2 gap-3">
                  <div className="h-4 animate-pulse rounded bg-slate-100" />
                  <div className="h-4 animate-pulse rounded bg-slate-100" />
                  <div className="h-4 animate-pulse rounded bg-slate-100" />
                  <div className="h-4 animate-pulse rounded bg-slate-100" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =====================================================
          ERROR
      ====================================================== */}

      {!loading && error && (
        <div className="px-5 py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle
                cx="12"
                cy="12"
                r="9"
              />
              <path d="M12 8v4" />
              <path d="M12 16h.01" />
            </svg>
          </div>

          <p className="mt-4 text-[14px] font-bold text-slate-800">
            Something went wrong
          </p>

          <p className="mt-1 text-[12px] text-slate-400">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
            className="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5 text-[12px] font-bold text-white shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-700 hover:shadow-indigo-200"
          >
            Try Again
          </button>
        </div>
      )}

      {/* =====================================================
          EMPTY STATE
      ====================================================== */}

      {!loading &&
        !error &&
        products.length === 0 && (
          <div className="px-5 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect
                  x="7"
                  y="2"
                  width="10"
                  height="20"
                  rx="2"
                />
                <path d="M11 18h2" />
              </svg>
            </div>

            <h3 className="mt-4 text-[16px] font-black text-slate-800">
              No mobile phones found
            </h3>

            <p className="mx-auto mt-1 max-w-md text-[12px] leading-5 text-slate-400">
              {search.trim()
                ? `We couldn't find any mobile phones matching "${search.trim()}". Try another search or adjust your filters.`
                : "Try changing your filters to see more mobile phones."}
            </p>
          </div>
        )}

      {/* =====================================================
          PRODUCTS
      ====================================================== */}

      {!loading &&
        !error &&
        products.length > 0 && (
          <div className="divide-y divide-slate-100">
            {products.map((product) => (
              <MobileCard
                key={product.id}
                mobile={convertProduct(
                  product,
                )}
              />
            ))}
          </div>
        )}

      {/* =====================================================
          PAGINATION
      ====================================================== */}

      {!loading &&
        !error &&
        pagination &&
        pagination.totalPages > 1 && (
          <div className="border-t border-slate-200 bg-slate-50/50 px-4 py-4 sm:px-5">
            <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
              {/* PAGE INFO */}

              <p className="text-[11px] font-semibold text-slate-400">
                Page{" "}
                <span className="font-black text-slate-700">
                  {pagination.page}
                </span>{" "}
                of{" "}
                <span className="font-black text-slate-700">
                  {pagination.totalPages}
                </span>
              </p>

              {/* BUTTONS */}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={
                    !pagination.hasPreviousPage
                  }
                  onClick={() =>
                    setPage(
                      (current) =>
                        Math.max(
                          1,
                          current - 1,
                        ),
                    )
                  }
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-bold text-slate-600 transition-all hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m15 18-6-6 6-6" />
                  </svg>

                  Previous
                </button>

                <div className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-indigo-600 px-3 text-[11px] font-black text-white shadow-md shadow-indigo-100">
                  {pagination.page}
                </div>

                <button
                  type="button"
                  disabled={
                    !pagination.hasNextPage
                  }
                  onClick={() =>
                    setPage(
                      (current) =>
                        current + 1,
                    )
                  }
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-bold text-slate-600 transition-all hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next

                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
    </section>
  );
}

