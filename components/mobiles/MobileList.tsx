"use client";

import { useEffect, useState } from "react";
import MobileCard from "./MobileCard";

interface ProductSpecification {
  specification?: {
    name?: string;
    slug?: string;
    unit?: string | null;
  };
  value?: {
    value?: string;
  } | null;
  customValue?: string | null;
}

interface ProductImage {
  id: string;
  url: string;
  altText?: string | null;
  isPrimary?: boolean;
  sortOrder?: number;
}

interface ProductSeller {
  id?: string;
  name?: string;
  slug?: string;
  websiteUrl?: string | null;
  logoUrl?: string | null;
}

interface ProductPrice {
  id: string;
  amount: number | string;
  currency?: string;
  inStock?: boolean;
  seller?: ProductSeller | null;
  store?: {
    id?: string;
    name?: string;
  } | null;
}

interface ProductVariant {
  id: string;
  ram?: string | null;
  storage?: string | null;
  name?: string | null;
  sku?: string | null;
  color?: string | null;
}

interface Product {
  id: string;
  slug: string;
  name: string;

  brand?: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string | null;
  } | null;

  category?: {
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
  shortDescription?: string | null;

  releaseDate?: string | null;
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

  brand?: string | null;
  category?: string | null;

  price: string;
  score: number;
  rating: number;
  reviewCount: number;

  image: string;

  display: string;
  displayType?: string | null;
  refreshRate?: string | null;

  battery: string;
  charging?: string | null;

  camera: string;
  frontCamera?: string | null;

  storage: string;
  ram?: string | null;

  processor?: string | null;

  connectivity?: string | null;
  wifi?: string | null;
  bluetooth?: string | null;

  memoryCard?: string | null;
  operatingSystem?: string | null;
  reverseWirelessCharging?: string | null;

  seller?: string | null;
  description?: string | null;
  specifications?: Record<string, string>;
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
  onSortChange: (sort: string) => void;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5000/api";

const BACKEND_URL = API_URL.replace(/\/api\/?$/, "");

/* =========================================================
   BASIC HELPERS
========================================================= */

function cleanText(value: string | null | undefined): string {
  return String(value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function getSpecification(
  product: Product,
  slugs: string[],
): string | null {
  const normalizedSlugs = (slugs ?? []).map((slug) =>
    slug.toLowerCase().trim(),
  );

  const specifications = product.specifications;

  // API returned specifications as an array
  if (Array.isArray(specifications)) {
    const specification = specifications.find(
      (item) => {
        const slug =
          item.specification?.slug
            ?.toLowerCase()
            .trim();

        return Boolean(
          slug && normalizedSlugs.includes(slug),
        );
      },
    );

    if (!specification) {
      return null;
    }

    const value =
      specification.customValue ??
      specification.value?.value ??
      null;

    return value ? cleanText(value) : null;
  }

  // API returned specifications as an object/map
  if (
    specifications &&
    typeof specifications === "object"
  ) {
    const specificationMap =
      specifications as unknown as Record<
        string,
        unknown
      >;

    for (const slug of normalizedSlugs) {
      const matchingKey =
        Object.keys(specificationMap).find(
          (key) =>
            key.toLowerCase().trim() === slug,
        );

      if (!matchingKey) {
        continue;
      }

      const rawValue =
        specificationMap[matchingKey];

      if (
        typeof rawValue === "string" ||
        typeof rawValue === "number"
      ) {
        return cleanText(String(rawValue));
      }

      if (
        rawValue &&
        typeof rawValue === "object"
      ) {
        const obj =
          rawValue as Record<string, unknown>;

        const value =
          obj.value ??
          obj.customValue ??
          null;

        if (
          typeof value === "string" ||
          typeof value === "number"
        ) {
          return cleanText(String(value));
        }
      }
    }
  }

  return null;
}

/* =========================================================
   DESCRIPTION FALLBACKS
========================================================= */

function getDescription(product: Product): string {
  return cleanText(
    product.shortDescription ??
      product.description ??
      "",
  );
}

function getDescriptionValue(
  product: Product,
  patterns: RegExp[],
): string | null {
  const description = getDescription(product);

  if (!description) {
    return null;
  }

  for (const pattern of patterns) {
    const match = description.match(pattern);

    if (match?.[1]) {
      return cleanText(match[1]);
    }
  }

  return null;
}

function getDisplay(product: Product): string | null {
  return (
    getSpecification(product, [
      "screen-size",
      "display-size",
      "screen",
    ]) ??
    getDescriptionValue(product, [
      /(\d+(?:\.\d+)?)\s*(?:inches|inch|")\s*(?:oled|amoled|lcd|display|screen)?/i,
    ])
  );
}

function getDisplayType(
  product: Product,
): string | null {
  return (
    getSpecification(product, [
      "display-type",
      "screen-type",
      "panel-type",
    ]) ??
    getDescriptionValue(product, [
      /\b(AMOLED|OLED|Super AMOLED|LTPO AMOLED|P-OLED|POLED|LCD|IPS LCD|TFT LCD)\b/i,
    ])
  );
}

function getRefreshRate(
  product: Product,
): string | null {
  return (
    getSpecification(product, [
      "refresh-rate",
      "display-refresh-rate",
    ]) ??
    getDescriptionValue(product, [
      /(\d+(?:\.\d+)?)\s*Hz\s*(?:refresh rate)?/i,
    ])
  );
}

function getBattery(product: Product): string | null {
  return (
    getSpecification(product, [
      "battery-capacity",
      "battery",
      "battery-size",
    ]) ??
    getDescriptionValue(product, [
      /(\d+(?:,\d+)?|\d+(?:\.\d+)?)\s*mAh\s*Battery/i,
      /(\d+(?:,\d+)?|\d+(?:\.\d+)?)\s*mAh/i,
    ])
  );
}

function getCharging(product: Product): string | null {
  return (
    getSpecification(product, [
      "charging-wattage",
      "fast-charging",
      "charging",
      "charging-speed",
    ]) ??
    getDescriptionValue(product, [
      /\b(Fast Charging|Super Fast Charging|Turbo Charging|HyperCharge|Dash Charge|Warp Charge|VOOC Charging|SUPERVOOC|Wireless Charging)\b/i,
    ])
  );
}

function getRearCamera(
  product: Product,
): string | null {
  return (
    getSpecification(product, [
      "rear-camera",
      "main-camera",
      "primary-camera",
    ]) ??
    getDescriptionValue(product, [
      /features\s+(.*?)(?:\s+rear camera)/i,
      /(\d+\s*MP(?:\s*\+\s*\d+\s*MP)*(?:\s+[A-Za-z]+)?)\s+rear camera/i,
    ])
  );
}

function getFrontCamera(
  product: Product,
): string | null {
  return (
    getSpecification(product, [
      "front-camera",
      "selfie-camera",
    ]) ??
    getDescriptionValue(product, [
      /(?:and\s+a\s+)?(\d+\s*MP)\s+front camera/i,
      /(\d+\s*MP)\s+selfie camera/i,
    ])
  );
}

function getProcessor(
  product: Product,
): string | null {
  return (
    getSpecification(product, [
      "processor",
      "cpu",
      "chipset",
      "soc",
    ]) ??
    getDescriptionValue(product, [
      /powered by\s+([^.,]+?)(?:\s+with|\s+and|\.)/i,
      /(?:powered by|processor|chipset)\s+([A-Za-z0-9 .-]+)/i,
    ])
  );
}

function getRam(product: Product): string | null {
  return (
    getSpecification(product, [
      "ram",
      "memory",
    ]) ??
    product.variants?.[0]?.ram ??
    getDescriptionValue(product, [
      /with\s+(\d+(?:\.\d+)?\s*(?:GB|MB))\s*RAM/i,
      /(\d+(?:\.\d+)?\s*GB)\s+RAM/i,
    ])
  );
}

function getStorage(
  product: Product,
): string | null {
  return (
    getSpecification(product, [
      "internal-storage",
      "inbuilt-memory",
      "storage",
      "rom",
    ]) ??
    product.variants?.[0]?.storage ??
    getDescriptionValue(product, [
      /(\d+(?:\.\d+)?\s*(?:GB|TB))\s+storage/i,
      /(\d+(?:\.\d+)?\s*(?:GB|TB))\s+inbuilt storage/i,
    ])
  );
}

function getConnectivity(
  product: Product,
): string | null {
  return (
    getSpecification(product, [
      "network",
      "connectivity",
      "network-type",
    ]) ??
    getDescriptionValue(product, [
      /\b(5G|4G|4G LTE|3G)\b/i,
    ])
  );
}

function getWifi(product: Product): string | null {
  return (
    getSpecification(product, [
      "wifi-version",
      "wifi",
      "wi-fi",
    ]) ??
    getDescriptionValue(product, [
      /\b(Wi-Fi\s*\d+(?:\.\d+)?|Wi-Fi\s*[a-z0-9-]+)\b/i,
    ])
  );
}

function getBluetooth(
  product: Product,
): string | null {
  return (
    getSpecification(product, [
      "bluetooth",
      "bluetooth-version",
    ]) ??
    getDescriptionValue(product, [
      /\b(Bluetooth\s*\d+(?:\.\d+)?)\b/i,
    ])
  );
}

function getMemoryCard(
  product: Product,
): string | null {
  return getSpecification(product, [
    "memory-card",
    "expandable-storage",
    "card-slot",
  ]);
}

function getOperatingSystem(
  product: Product,
): string | null {
  return (
    getSpecification(product, [
      "operating-system",
      "os",
      "software",
    ]) ??
    getDescriptionValue(product, [
      /\b(iOS\s*\d+(?:\.\d+)?|Android\s*\d+(?:\.\d+)?|Android)\b/i,
    ])
  );
}

function getReverseWirelessCharging(
  product: Product,
): string | null {
  return (
    getSpecification(product, [
      "reverse-wireless-charging",
      "reverse-charging",
    ]) ??
    getDescriptionValue(product, [
      /\b(Reverse Wireless Charging)\b/i,
    ])
  );
}

function getAllSpecifications(
  product: Product,
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const item of product.specifications ?? []) {
    const slug = item.specification?.slug?.trim().toLowerCase();

    if (!slug) continue;

    const value =
      item.customValue ??
      item.value?.value ??
      "";

    const cleanedValue = cleanText(value);

    if (!cleanedValue) continue;

    result[slug] = cleanedValue;
  }

  return result;
}


/* =========================================================
   IMAGE
========================================================= */

function getPrimaryImage(
  product: Product,
): string {
  const primaryImage =
    product.images?.find(
      (image) => image.isPrimary,
    ) ??
    [...(product.images ?? [])].sort(
      (a, b) =>
        (a.sortOrder ?? 0) -
        (b.sortOrder ?? 0),
    )[0];

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

/* =========================================================
   PRICE
========================================================= */

function getLowestPrice(
  product: Product,
): ProductPrice | null {
  const prices = product.prices ?? [];

  if (prices.length === 0) {
    return null;
  }

  const inStockPrices = prices.filter(
    (price) => price.inStock !== false,
  );

  const usablePrices =
    inStockPrices.length > 0
      ? inStockPrices
      : prices;

  return usablePrices.reduce(
    (lowest, current) => {
      const lowestAmount = Number(
        lowest.amount,
      );

      const currentAmount = Number(
        current.amount,
      );

      if (
        !Number.isFinite(currentAmount)
      ) {
        return lowest;
      }

      if (
        !Number.isFinite(lowestAmount)
      ) {
        return current;
      }

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

  if (!Number.isFinite(numericAmount)) {
    return "Price unavailable";
  }

  return `₹${numericAmount.toLocaleString(
    "en-IN",
  )}`;
}

/* =========================================================
   RATING / SCORE
========================================================= */

function calculateRating(
  product: Product,
): number {
  const reviews = product.reviews ?? [];

  if (reviews.length === 0) {
    return 0;
  }

  const validRatings = reviews
    .map((review) => Number(review.rating))
    .filter((rating) =>
      Number.isFinite(rating),
    );

  if (validRatings.length === 0) {
    return 0;
  }

  const total = validRatings.reduce(
    (sum, rating) => sum + rating,
    0,
  );

  return Number(
    (total / validRatings.length).toFixed(1),
  );
}

function calculateSpecScore(
  product: Product,
): number {
  const scores: number[] = [];

  // Display size
  const displayText = getSpecification(product, [
    "screen-size",
    "display-size",
    "screen",
  ]);

  const display = parseFloat(displayText ?? "");

  if (Number.isFinite(display)) {
    scores.push(
      Math.min(
        100,
        Math.max(
          0,
          (display / 7) * 100,
        ),
      ),
    );
  }

  // Refresh rate
  const refreshText = getSpecification(product, [
    "refresh-rate",
    "display-refresh-rate",
  ]);

  const refreshRate = parseFloat(
    refreshText ?? "",
  );

  if (Number.isFinite(refreshRate)) {
    scores.push(
      Math.min(
        100,
        Math.max(
          0,
          (refreshRate / 165) * 100,
        ),
      ),
    );
  }

  // Battery
  const batteryText = getSpecification(product, [
    "battery-capacity",
    "battery",
    "battery-size",
  ]);

  const battery = parseFloat(
    batteryText?.replace(/,/g, "") ?? "",
  );

  if (Number.isFinite(battery)) {
    scores.push(
      Math.min(
        100,
        Math.max(
          0,
          (battery / 7000) * 100,
        ),
      ),
    );
  }

  // RAM
  const ramText = getSpecification(product, [
    "ram",
    "memory",
  ]);

  const ram = parseFloat(
    ramText ?? "",
  );

  if (Number.isFinite(ram)) {
    scores.push(
      Math.min(
        100,
        Math.max(
          0,
          (ram / 24) * 100,
        ),
      ),
    );
  }

  // Storage
  const storageText = getSpecification(product, [
    "storage",
    "internal-storage",
    "inbuilt-memory",
    "rom",
  ]);

  const storage = parseFloat(
    storageText ?? "",
  );

  if (Number.isFinite(storage)) {
    scores.push(
      Math.min(
        100,
        Math.max(
          0,
          (storage / 1024) * 100,
        ),
      ),
    );
  }

  // Camera
  const cameraText = getSpecification(product, [
    "rear-camera",
    "main-camera",
    "primary-camera",
    "camera",
  ]);

  const camera = parseFloat(
    cameraText ?? "",
  );

  if (Number.isFinite(camera)) {
    scores.push(
      Math.min(
        100,
        Math.max(
          0,
          (camera / 200) * 100,
        ),
      ),
    );
  }

  if (scores.length === 0) {
    return 0;
  }

  const average =
    scores.reduce(
      (sum, score) => sum + score,
      0,
    ) / scores.length;

  return Math.round(
    Math.min(
      100,
      Math.max(0, average),
    ),
  );
}

/* =========================================================
   PRODUCT CONVERSION
========================================================= */

function convertProduct(
  product: Product,
): Mobile {
  const lowestPrice = getLowestPrice(product);

  const display = getDisplay(product);
  const displayType = getDisplayType(product);
  const refreshRate = getRefreshRate(product);
  const battery = getBattery(product);
  const charging = getCharging(product);
  const rearCamera = getRearCamera(product);
  const frontCamera = getFrontCamera(product);
  const processor = getProcessor(product);
  const ram = getRam(product);
  const storage = getStorage(product);
  const connectivity = getConnectivity(product);
  const wifi = getWifi(product);
  const bluetooth = getBluetooth(product);
  const memoryCard = getMemoryCard(product);
  const operatingSystem = getOperatingSystem(product);
  const reverseWirelessCharging =
    getReverseWirelessCharging(product);

  // Complete structured specification map
  const specifications = getAllSpecifications(product);

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,

    brand: product.brand?.name ?? null,
    category: product.category?.name ?? null,

    price: formatPrice(
      lowestPrice
        ? lowestPrice.amount
        : null,
    ),

    score: calculateSpecScore(product),

    rating: calculateRating(product),

    reviewCount:
      product.reviews?.length ?? 0,

    image: getPrimaryImage(product),

    display:
      display ??
      "Display information unavailable",

    displayType,

    refreshRate,

    battery:
      battery ??
      "Battery information unavailable",

    charging,

    camera:
      rearCamera ??
      "Camera information unavailable",

    frontCamera,

    storage:
      storage ??
      "Storage information unavailable",

    ram,

    processor,

    connectivity,

    wifi,

    bluetooth,

    memoryCard,

    operatingSystem,

    reverseWirelessCharging,

    // IMPORTANT:
    // Pass every structured specification
    // to MobileCard.
    specifications,

    seller:
      lowestPrice?.seller?.name ??
      lowestPrice?.store?.name ??
      null,

    description:
      product.shortDescription ??
      product.description ??
      null,
  };
}


/* =========================================================
   COMPONENT
========================================================= */

export default function MobileList({
  search = "",
  brands = [],
  minPrice = "",
  maxPrice = "",
  displays = [],
  filterValues = {},
  sortBy = "relevance",
  page,
  onPageChange,
  onSortChange,
}: MobileListProps) {
  const [products, setProducts] =
    useState<Mobile[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [totalPages, setTotalPages] =
    useState(1);

  const [totalResults, setTotalResults] =
    useState(0);

  const limit = 10;

  const startResult =
    totalResults === 0
      ? 0
      : (page - 1) * limit + 1;

  const endResult = Math.min(
    page * limit,
    totalResults,
  );

  /* =======================================================
     FETCH PRODUCTS
  ======================================================= */

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

        const convertedProducts =
          (
            result.data?.products ??
            []
          ).map(convertProduct);

        setProducts(
          convertedProducts,
        );

        setTotalPages(
          result.data?.pagination
            ?.totalPages ?? 1,
        );

        setTotalResults(
          result.data?.pagination
            ?.total ?? 0,
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

  /* =======================================================
     LOADING
  ======================================================= */

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

  /* =======================================================
     ERROR
  ======================================================= */

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

  /* =======================================================
     EMPTY
  ======================================================= */

  if (products.length === 0) {
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

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="space-y-5">
      {/* RESULTS + SORT */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-slate-600">
          Showing{" "}
          <span className="font-semibold text-slate-900">
            {startResult} – {endResult}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-slate-900">
            {totalResults.toLocaleString(
              "en-IN",
            )}
          </span>{" "}
          results

          {search.trim() && (
            <>
              {" "}
              for{" "}
              <span className="font-semibold text-slate-900">
                "{search.trim()}"
              </span>
            </>
          )}
        </div>

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
                onSortChange(
                  option.value,
                )
              }
              className={`
                rounded-xl px-3 py-2 text-sm font-medium
                transition-all duration-200
                ${
                  sortBy ===
                    option.value ||
                  (!sortBy &&
                    option.value ===
                      "relevance")
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
      {products.map((mobile) => {
  const cameraText = getSpecification(mobile, [
    "rear-camera",
    "main-camera",
    "primary-camera",
    "camera",
  ]);

  const storageText = getSpecification(mobile, [
    "storage",
    "internal-storage",
    "inbuilt-memory",
  ]);

  return (
    <MobileCard
      key={mobile.id}
      mobile={mobile}
      cameraText={cameraText}
      storageText={storageText}
    />
  );
})}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2 pt-3">
          {/* PREVIOUS */}
          <button
            type="button"
            onClick={() => {
              if (page > 1) {
                onPageChange(
                  page - 1,
                );
              }
            }}
            disabled={page <= 1}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40"
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
            (_, index) =>
              index + 1,
          )
            .filter(
              (pageNumber) => {
                if (
                  totalPages <= 7
                ) {
                  return true;
                }

                return (
                  pageNumber === 1 ||
                  pageNumber ===
                    totalPages ||
                  Math.abs(
                    pageNumber - page,
                  ) <= 1
                );
              },
            )
            .map(
              (
                pageNumber,
                index,
                visiblePages,
              ) => {
                const previousPage =
                  visiblePages[
                    index - 1
                  ];

                const showEllipsis =
                  previousPage &&
                  pageNumber -
                    previousPage >
                    1;

                return (
                  <span
                    key={
                      pageNumber
                    }
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
                        onPageChange(
                          pageNumber,
                        )
                      }
                      aria-current={
                        page ===
                        pageNumber
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
                          page ===
                          pageNumber
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
              if (
                page <
                totalPages
              ) {
                onPageChange(
                  page + 1,
                );
              }
            }}
            disabled={
              page >= totalPages
            }
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40"
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