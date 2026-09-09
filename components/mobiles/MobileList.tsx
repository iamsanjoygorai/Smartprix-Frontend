"use client";

import { useEffect, useMemo, useState } from "react";

import MobileCard from "./MobileCard";

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
  id: string;
  url: string;
  altText?: string | null;
  isPrimary?: boolean;
}

interface ProductPrice {
  id: string;
  amount: number | string;
  currency?: string;

  store?: {
    id?: string;
    name?: string;
  } | null;
}

interface ProductVariant {
  id: string;
  ram?: string | null;
  storage?: string | null;
}

interface Product {
  id: string;
  slug: string;
  name: string;

  brand?: {
    id: string;
    name: string;
    slug: string;
  } | null;

  images?: ProductImage[];

  prices?: ProductPrice[];

  variants?: ProductVariant[];

  specifications?: ProductSpecification[];

   reviews?: {
    rating: number;
  }[];

  description?: string | null;

  createdAt?: string;
  updatedAt?: string;
}

interface ProductsResponse {
  success: boolean;
  data: {
    products: Product[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage?: boolean;
      hasPreviousPage?: boolean;
    };
    brandCounts?: Record<string, number>;
  };
}

interface Mobile {
  id: string;
  slug: string;
  name: string;
  price: string;

  score: number;
  rating: number;
  reviewCount: number;

  image: string;

  // Display
  display: string;
  displayType?: string | null;
  refreshRate?: string | null;

  // Battery
  battery: string;
  charging?: string | null;

  // Camera
  camera: string;
  frontCamera?: string | null;

  // Memory
  storage: string;
  ram?: string | null;

  // Processor
  processor?: string | null;

  // Connectivity
  connectivity?: string | null;
  wifi?: string | null;
  bluetooth?: string | null;

  // Other specifications
  memoryCard?: string | null;
  operatingSystem?: string | null;
  reverseWirelessCharging?: string | null;
}

interface MobileListProps {
  search?: string;
  brands?: string[];
  minPrice?: string;
  maxPrice?: string;
  displays?: string[];
  filterValues?: Record<string, string[]>;
  sortBy?: string;

  page: number;
  onPageChange: (page: number) => void;
  onSortChange: (sort: string) => void
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5000/api";

const BACKEND_URL = API_URL.replace(
  /\/api\/?$/,
  "",
);

function getSpecification(
  product: Product,
  slugs: string[],
): string | null {
  const specification =
    product.specifications?.find((item) =>
      slugs.includes(
        item.specification.slug,
      ),
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

function getPrimaryImage(
  product: Product,
): string {
  const primaryImage =
    product.images?.find(
      (image) => image.isPrimary,
    ) ?? product.images?.[0];

  if (!primaryImage?.url) {
    return "/images/mobile-placeholder.png";
  }

  const url = primaryImage.url;

  if (
    url.startsWith("http://") ||
    url.startsWith("https://")
  ) {
    return url;
  }

  if (url.startsWith("/")) {
    return `${BACKEND_URL}${url}`;
  }

  return `${BACKEND_URL}/${url}`;
}

function getLowestPrice(
  product: Product,
): ProductPrice | null {
  if (
    !product.prices ||
    product.prices.length === 0
  ) {
    return null;
  }

  return product.prices.reduce(
    (lowest, current) => {
      const lowestAmount = Number(
        lowest.amount,
      );

      const currentAmount = Number(
        current.amount,
      );

      return currentAmount < lowestAmount
        ? current
        : lowest;
    },
  );
}

function formatPrice(
  amount: number | string | null,
): string {
  if (
    amount === null ||
    amount === undefined ||
    amount === ""
  ) {
    return "Price unavailable";
  }

  const numericAmount = Number(amount);

  if (Number.isNaN(numericAmount)) {
    return "Price unavailable";
  }

  return `₹${numericAmount.toLocaleString(
    "en-IN",
  )}`;
}

function calculateSpecScore(product: Product): number {
  const specs = product.specifications ?? [];

  if (specs.length === 0) {
    return 0;
  }

  const getValue = (slugs: string[]) => {
    const spec = specs.find((item) =>
      slugs.includes(item.specification?.slug),
    );

    return spec?.customValue ?? spec?.value?.value ?? "";
  };

  const scores: number[] = [];

  // Battery
  const battery = parseInt(getValue(["battery", "battery-capacity"]));
  if (battery) {
    scores.push(
      Math.min(100, Math.max(0, ((battery - 3000) / 3000) * 100)),
    );
  }

  // RAM
  const ram = parseInt(getValue(["ram"]));
  if (ram) {
    scores.push(
      Math.min(100, Math.max(0, (ram / 16) * 100)),
    );
  }

  // Storage
  const storageText = getValue([
    "internal-storage",
    "inbuilt-memory",
  ]);

  const storage = parseInt(storageText);

  if (storage) {
    scores.push(
      Math.min(100, Math.max(0, (storage / 1024) * 100)),
    );
  }

  // Refresh rate
  const refreshRate = parseInt(getValue(["refresh-rate"]));

  if (refreshRate) {
    scores.push(
      Math.min(100, Math.max(0, (refreshRate / 144) * 100)),
    );
  }

  // Charging
  const charging = parseInt(
    getValue(["charging-wattage", "fast-charging"]),
  );

  if (charging) {
    scores.push(
      Math.min(100, Math.max(0, (charging / 120) * 100)),
    );
  }

  // Rear camera
  const camera = parseInt(getValue(["rear-camera"]));

  if (camera) {
    scores.push(
      Math.min(100, Math.max(0, (camera / 200) * 100)),
    );
  }

  // Display type
  const displayType = getValue(["display-type"]).toLowerCase();

  if (displayType) {
    if (
      displayType.includes("amoled") ||
      displayType.includes("oled")
    ) {
      scores.push(95);
    } else if (displayType.includes("lcd")) {
      scores.push(65);
    } else {
      scores.push(75);
    }
  }

  if (scores.length === 0) {
    return 0;
  }

  return Math.round(
    scores.reduce((sum, value) => sum + value, 0) / scores.length,
  );
}

function calculateRating(product: Product): number {
  const reviews = product.reviews ?? [];

  if (reviews.length === 0) {
    return 0;
  }

  const total = reviews.reduce(
    (sum, review) => sum + Number(review.rating || 0),
    0,
  );

  return Number((total / reviews.length).toFixed(1));
}


function convertProduct(product: Product): Mobile {
  const lowestPrice =
    getLowestPrice(product);

  return {
    id: product.id,

    slug: product.slug,

    name: product.name,

    price: formatPrice(
      lowestPrice
        ? lowestPrice.amount
        : null,
    ),
    score: calculateSpecScore(product),
    rating: calculateRating(product),
    image: getPrimaryImage(product),
    reviewCount: product.reviews?.length ?? 0,

    // =========================
    // DISPLAY
    // =========================

    display:
      getSpecification(product, [
        "screen-size",
      ]) ??
      "Display information unavailable",

    displayType:
      getSpecification(product, [
        "display-type",
      ]) ?? null,

    refreshRate:
      getSpecification(product, [
        "refresh-rate",
      ]) ?? null,

    // =========================
    // BATTERY
    // =========================

    battery:
      getSpecification(product, [
        "battery-capacity",
      ]) ??
      "Battery information unavailable",

    charging:
      getSpecification(product, [
        "charging-wattage",
      ]) ?? null,

    // =========================
    // CAMERA
    // =========================

    camera:
      getSpecification(product, [
        "rear-camera",
      ]) ??
      "Camera information unavailable",

    frontCamera:
      getSpecification(product, [
        "front-camera",
      ]) ?? null,

    // =========================
    // MEMORY
    // =========================

    storage:
      getSpecification(product, [
        "internal-storage",
      ]) ??
      product.variants?.[0]?.storage ??
      "Storage information unavailable",

    ram:
      getSpecification(product, [
        "ram",
      ]) ??
      product.variants?.[0]?.ram ??
      null,

    // =========================
    // PROCESSOR
    // =========================

    processor:
      getSpecification(product, [
        "processor",
      ]) ?? null,

    // =========================
    // CONNECTIVITY
    // =========================

    connectivity:
      getSpecification(product, [
        "network",
      ]) ?? null,

    wifi:
      getSpecification(product, [
        "wifi-version",
      ]) ?? null,

    bluetooth:
      getSpecification(product, [
        "bluetooth",
      ]) ?? null,

    // =========================
    // OTHER
    // =========================

    memoryCard:
      getSpecification(product, [
        "memory-card",
      ]) ?? null,

    operatingSystem:
      getSpecification(product, [
        "operating-system",
      ]) ?? null,

    reverseWirelessCharging:
      getSpecification(product, [
        "reverse-wireless-charging",
      ]) ?? null,
  };
}

export default function MobileList({
  search = "",
  brands = [],
  minPrice = "",
  maxPrice = "",
  displays = [],
  filterValues = {},
  sortBy = "",
  page,
  onPageChange,
}: MobileListProps) {
  const [products, setProducts] = useState<Mobile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
 
const [totalPages, setTotalPages] = useState(1);
const [totalResults, setTotalResults] = useState(0);

const limit = 5;
const startResult =
  totalResults === 0
    ? 0
    : (page - 1) * limit + 1;

const endResult = Math.min(
  page * limit,
  totalResults,
);

// =========================
  // FETCH PRODUCTS
  // =========================

  useEffect(() => {
    let cancelled = false;

    async function fetchProducts() {
      try {
        setLoading(true);
        setError(null);

        const params =
          new URLSearchParams();

        params.set(
          "page",
          String(page),
        );

        params.set(
          "limit",
          String(limit),
        );

        if (search.trim()) {
          params.set(
            "search",
            search.trim(),
          );
        }

        if (brands.length > 0) {
          params.set(
            "brands",
            brands.join(","),
          );
        }

        if (minPrice) {
          params.set(
            "minPrice",
            minPrice,
          );
        }

        if (maxPrice) {
          params.set(
            "maxPrice",
            maxPrice,
          );
        }

        if (displays.length > 0) {
          params.set(
            "displays",
            displays.join(","),
          );
        }

        Object.entries(
          filterValues,
        ).forEach(
          ([group, values]) => {
            if (
              values &&
              values.length > 0
            ) {
              params.set(
                group,
                values.join(","),
              );
            }
          },
        );

        if (sortBy) {
          params.set(
            "sortBy",
            sortBy,
          );
        }

        const response =
          await fetch(
            `${API_URL}/products?${params.toString()}`,
            {
              cache: "no-store",
            },
          );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch products (${response.status})`,
          );
        }

        const result: ProductsResponse =
          await response.json();
  

        if (!result.success) {
          throw new Error(
            "Failed to load products",
          );
        }

        if (cancelled) {
          return;
        }

       const convertedProducts = (
  result.data?.products ?? []
).map((product) => convertProduct(product));

setProducts(convertedProducts);

setTotalPages(
  result.data?.pagination?.totalPages ?? 1,
);

setTotalResults(
  result.data?.pagination?.total ?? 0,
);
      
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error(
          "Mobile products fetch error:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load mobiles",
        );

        setProducts([]);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchProducts();

    return () => {
      cancelled = true;
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
  ]);

  // =========================
  // LOCAL SORTING
  // =========================

  const sortedProducts =
    useMemo(() => {
      const result = [
        ...products,
      ];

      switch (sortBy) {
        case "price-low":
          return result.sort(
            (a, b) => {
              const priceA =
                Number(
                  a.price.replace(
                    /[^\d]/g,
                    "",
                  ),
                ) || 0;

              const priceB =
                Number(
                  b.price.replace(
                    /[^\d]/g,
                    "",
                  ),
                ) || 0;

              return priceA - priceB;
            },
          );

        case "price-high":
          return result.sort(
            (a, b) => {
              const priceA =
                Number(
                  a.price.replace(
                    /[^\d]/g,
                    "",
                  ),
                ) || 0;

              const priceB =
                Number(
                  b.price.replace(
                    /[^\d]/g,
                    "",
                  ),
                ) || 0;

              return priceB - priceA;
            },
          );

        case "rating":
          return result.sort(
            (a, b) =>
              b.rating - a.rating,
          );

        case "score":
          return result.sort(
            (a, b) =>
              b.score - a.score,
          );

        default:
          return result;
      }
    }, [
      products,
      sortBy,
    ]);

  // =========================
  // LOADING STATE
  // =========================

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({
          length: 6,
        }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex gap-4">
              <div className="h-40 w-32 rounded-xl bg-slate-200" />

              <div className="flex-1 space-y-3">
                <div className="h-5 w-3/4 rounded bg-slate-200" />

                <div className="h-4 w-1/2 rounded bg-slate-200" />

                <div className="h-4 w-2/3 rounded bg-slate-200" />

                <div className="h-4 w-1/3 rounded bg-slate-200" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // =========================
  // ERROR STATE
  // =========================

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm font-semibold text-red-600">
          Unable to load mobiles
        </p>

        <p className="mt-1 text-sm text-red-500">
          {error}
        </p>
      </div>
    );
  }

  // =========================
  // EMPTY STATE
  // =========================

  if (
    !loading &&
    sortedProducts.length === 0
  ) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-3xl">
          📱
        </div>

        <h3 className="mt-4 text-lg font-bold text-slate-900">
          No mobiles found
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          Try changing your filters or
          search for another mobile.
        </p>
      </div>
    );
  }

  // =========================
  // PRODUCT LIST
  // =========================

  return (
  <div className="space-y-5">
    {/* RESULTS + SORT BAR */}
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">

      {/* Results */}
      <div className="text-sm text-slate-600">
        Showing{" "}
        <span className="font-semibold text-slate-900">
          {startResult} – {endResult}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-slate-900">
          {totalResults.toLocaleString("en-IN")}
        </span>{" "}
        results
        {search.trim() && (
          <>
            {" "}for{" "}
            <span className="font-semibold text-slate-900">
              "{search.trim()}"
            </span>
          </>
        )}
      </div>

      {/* Sort */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-sm font-semibold text-slate-700">
          Sort By
        </span>

        {[
          {
            value: "relevance",
            label: "Relevance",
          },
          {
            value: "score",
            label: "Popularity",
          },
          {
            value: "price-low",
            label: "Price -- Low to High",
          },
          {
            value: "price-high",
            label: "Price -- High to Low",
          },
          {
            value: "newest",
            label: "Newest First",
          },
        ].map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() =>
              onSortChange(option.value)
            }
            className={`
              rounded-xl px-3 py-2 text-sm font-medium
              transition-all duration-200
              ${
                sortBy === option.value ||
                (!sortBy &&
                  option.value === "relevance")
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                  : "border border-slate-200 bg-white text-slate-600 hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 hover:shadow-sm"
              }
            `}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>

    {/* PRODUCTS */}
    {sortedProducts.map((mobile) => (
      <MobileCard
        key={mobile.id}
        mobile={mobile}
      />
    ))}

    {/* EMPTY STATE */}
    {!loading &&
      !error &&
      sortedProducts.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
            <span className="text-2xl">📱</span>
          </div>

          <h3 className="text-lg font-semibold text-slate-900">
            No mobiles found
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Try changing your search or filters.
          </p>
        </div>
      )}

    {/* PAGINATION */}
    {totalPages > 1 && (
      <div className="flex flex-wrap items-center justify-center gap-2 pt-3">

        {/* PREVIOUS */}
        <button
          type="button"
          onClick={() => {
            if (page > 1) {
              onPageChange(page - 1);
            }
          }}
          disabled={page <= 1}
          className="
            inline-flex h-10 items-center gap-1.5
            rounded-xl border border-gray-200
            bg-white px-3.5
            text-sm font-medium text-gray-700
            shadow-sm
            transition-all duration-200
            hover:-translate-y-0.5
            hover:border-indigo-300
            hover:bg-indigo-50
            hover:text-indigo-600
            hover:shadow-md
            active:translate-y-0
            disabled:cursor-not-allowed
            disabled:opacity-40
            disabled:hover:translate-y-0
            disabled:hover:border-gray-200
            disabled:hover:bg-white
            disabled:hover:text-gray-700
            disabled:hover:shadow-sm
          "
        >
          <span className="text-base">
            ‹
          </span>

          <span className="hidden sm:inline">
            Previous
          </span>
        </button>

        {/* PAGE NUMBERS */}
        {Array.from(
          {
            length: totalPages,
          },
          (_, index) => index + 1,
        )
          .filter((pageNumber) => {
            if (totalPages <= 7) {
              return true;
            }

            return (
              pageNumber === 1 ||
              pageNumber === totalPages ||
              Math.abs(pageNumber - page) <= 1
            );
          })
          .map(
            (
              pageNumber,
              index,
              visiblePages,
            ) => {
              const previousPage =
                visiblePages[index - 1];

              const showEllipsis =
                previousPage &&
                pageNumber - previousPage > 1;

              return (
                <span
                  key={pageNumber}
                  className="flex items-center"
                >
                  {showEllipsis && (
                    <span className="px-2 text-sm font-bold text-slate-400">
                      ...
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      onPageChange(pageNumber)
                    }
                    aria-current={
                      page === pageNumber
                        ? "page"
                        : undefined
                    }
                    className={`
                      flex h-10 min-w-10
                      items-center justify-center
                      rounded-xl px-3
                      text-sm font-semibold
                      transition-all duration-200
                      ${
                        page === pageNumber
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                          : "border border-gray-200 bg-white text-gray-700 shadow-sm hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 hover:shadow-md"
                      }
                    `}
                  >
                    {pageNumber}
                  </button>
                </span>
              );
            },
          )}

        {/* NEXT */}
        <button
          type="button"
          onClick={() => {
            if (page < totalPages) {
              onPageChange(page + 1);
            }
          }}
          disabled={page >= totalPages}
          className="
            inline-flex h-10 items-center gap-1.5
            rounded-xl border border-gray-200
            bg-white px-3.5
            text-sm font-medium text-gray-700
            shadow-sm
            transition-all duration-200
            hover:-translate-y-0.5
            hover:border-indigo-300
            hover:bg-indigo-50
            hover:text-indigo-600
            hover:shadow-md
            active:translate-y-0
            disabled:cursor-not-allowed
            disabled:opacity-40
            disabled:hover:translate-y-0
            disabled:hover:border-gray-200
            disabled:hover:bg-white
            disabled:hover:text-gray-700
            disabled:hover:shadow-sm
          "
        >
          <span className="hidden sm:inline">
            Next
          </span>

          <span className="text-base">
            ›
          </span>
        </button>
      </div>
    )}
  </div>
);
}
