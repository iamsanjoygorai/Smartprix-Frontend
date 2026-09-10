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
  specifications?:
  | ProductSpecification[]
  | Record<string, unknown>;

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

/* =========================================================
   FILTER QUERY MAPPING
========================================================= */

function normalizeFilterValue(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ");
}

function mapFilterValue(
  group: string,
  value: string,
): string {
  const normalized = normalizeFilterValue(value);

  const mappings: Record<
    string,
    Record<string, string>
  > = {
    availability: {
      "in stock": "in-stock",
      "out of stock": "out-of-stock",
    },

    types: {
      smartphones: "smartphones",
      "foldable phones": "foldable",
      "gaming phones": "gaming",
      "rugged phones": "rugged",
    },

    "launched-within": {
      "last 1 month": "1-month",
      "last 3 months": "3-months",
      "last 6 months": "6-months",
      "last 1 year": "12-months",
    },

    design: {
      "water drop notch": "water-drop-notch",
      "punch hole": "punch-hole",
      "bezel-less": "bezel-less",
      "curved display": "curved-display",
      "flat display": "flat-display",
    },

    "screen-sizes": {
      "below 6 inch": "below-6",
      "6 - 6.4 inch": "6-6.4",
      "6.4 - 6.7 inch": "6.4-6.7",
      "above 6.7 inch": "above-6.7",
    },

    "screen-resolution": {
      "hd+": "hd+",
      "full hd+": "full-hd+",
      "1.5k": "1.5k",
      "2k": "2k",
      "qhd+": "qhd+",
    },

    "rear-camera": {
      "12 mp & below": "12mp-above",
      "13 - 32 mp": "13mp-above",
      "33 - 49 mp": "33mp-above",
      "50 mp": "48mp-above",
      "64 mp": "64mp-above",
      "108 mp": "108mp-above",
      "200 mp": "200mp-above",
    },

    "front-camera": {
      "8 mp & below": "8mp-above",
      "12 mp": "12mp-above",
      "16 mp": "16mp-above",
      "32 mp": "32mp-above",
      "50 mp": "50mp-above",
    },

    cpu: {
      snapdragon: "qualcomm",
      mediatek: "mediatek",
      exynos: "samsung",
      apple: "apple",
      tensor: "google",
      unisoc: "unisoc",
    },

    ram: {
      "2 gb": "2gb-above",
      "3 gb": "3gb-above",
      "4 gb": "4gb-above",
      "6 gb": "6gb-above",
      "8 gb": "8gb-above",
      "12 gb": "12gb-above",
      "16 gb": "16gb-above",
      "24 gb": "24gb-above",
    },

    "battery-size": {
      "below 4000 mah": "below-4000",
      "4000 - 4500 mah": "4000-4500",
      "4500 - 5000 mah": "4500-5000",
      "5000 - 6000 mah": "5000-6000",
      "6000 mah & above": "6000-above",
    },

    connectivity: {
      "5g": "5g",
      "4g": "4g",
      volte: "volte",
      "wi-fi 6": "wifi-6",
      "wi-fi 7": "wifi-7",
      nfc: "nfc",
    },

    features: {
      "fast charging": "fast-charging",
      "wireless charging": "wireless-charging",
      "water resistant": "water-resistant",
      "stereo speakers": "stereo-speakers",
      "ir blaster": "ir-blaster",
      "fm radio": "fm-radio",
    },

    "operating-system": {
      android: "android",
      ios: "ios",
    },

    "android-version": {
      "android 13": "android-13",
      "android 14": "android-14",
      "android 15": "android-15",
      "android 16": "android-16",
    },

    "inbuilt-memory": {
      "32 gb": "32gb-above",
      "64 gb": "64gb-above",
      "128 gb": "128gb-above",
      "256 gb": "256gb-above",
      "512 gb": "512gb-above",
      "1 tb": "1tb-above",
    },

    "price-drop": {
      "price dropped recently": "recent",
      "biggest price drops": "biggest",
    },

    "aspect-ratio": {
      "19:9": "19:9",
      "20:9": "20:9",
      "20.5:9": "20.5:9",
      "21:9": "21:9",
      "22:9": "22:9",
    },

    "refresh-rate": {
      "60 hz": "60hz",
      "90 hz": "90hz",
      "120 hz": "120hz",
      "144 hz": "144hz",
      "165 hz": "165hz",
    },

    "cpu-manufacturer": {
      qualcomm: "qualcomm",
      mediatek: "mediatek",
      samsung: "samsung",
      apple: "apple",
      google: "google",
      unisoc: "unisoc",
    },

    "gpu-manufacturer": {
      adreno: "adreno",
      mali: "mali",
      "apple gpu": "apple-gpu",
      immortalis: "immortalis",
      xclipse: "xclipse",
    },

    "ip-rating": {
      ip53: "ip53",
      ip54: "ip54",
      ip55: "ip55",
      ip67: "ip67",
      ip68: "ip68",
      ip69: "ip69",
    },
  };

  return (
    mappings[group]?.[normalized] ??
    normalized.replace(/\s+/g, "-")
  );
}


interface MobileListProps {
  search: string;
  brands: string[];
  minPrice: string;
  maxPrice: string;
  displays: string[];
  filterValues: Record<string, string[]>;
  sortBy: string;
  page: number;
  onPageChange: (page: number) => void;
  onSortChange: (sort: string) => void;
  onBrandCounts?: (counts: Record<string, number>) => void;
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

  const specifications = product.specifications;

  if (Array.isArray(specifications)) {
    for (const item of specifications) {
      const slug = item.specification?.slug
        ?.trim()
        .toLowerCase();

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

  if (
    specifications &&
    typeof specifications === "object"
  ) {
    for (const [key, rawValue] of Object.entries(
      specifications,
    )) {
      const slug = key.trim().toLowerCase();

      if (!slug) continue;

      if (
        typeof rawValue === "string" ||
        typeof rawValue === "number"
      ) {
        const cleanedValue = cleanText(
          String(rawValue),
        );

        if (cleanedValue) {
          result[slug] = cleanedValue;
        }

        continue;
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
          "";

        if (
          typeof value === "string" ||
          typeof value === "number"
        ) {
          const cleanedValue = cleanText(
            String(value),
          );

          if (cleanedValue) {
            result[slug] = cleanedValue;
          }
        }
      }
    }
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
  search,
  brands,
  minPrice,
  maxPrice,
  displays,
  filterValues,
  sortBy,
  page,
  onPageChange,
  onSortChange,
  onBrandCounts,
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
  let isActive = true;

  async function fetchProducts() {
    try {
      if (isActive) {
        setLoading(true);
        setError(null);
      }

      const params = new URLSearchParams();

      params.set("page", String(page));
      params.set("limit", String(limit));

      /* -----------------------------------------------
         SEARCH
      ------------------------------------------------ */
      if (search.trim()) {
        params.set("search", search.trim());
      }

      /* -----------------------------------------------
         BRANDS
      ------------------------------------------------ */
      if (brands.length > 0) {
        params.set("brands", brands.join(","));
      }

      /* -----------------------------------------------
         PRICE
      ------------------------------------------------ */
      if (minPrice.trim()) {
        params.set("minPrice", minPrice.trim());
      }

      if (
        maxPrice.trim() &&
        maxPrice.trim() !== "30000+"
      ) {
        params.set("maxPrice", maxPrice.trim());
      }

      /* -----------------------------------------------
         DISPLAY
      ------------------------------------------------ */
      if (displays.length > 0) {
        params.set("displays", displays.join(","));
      }

      /* -----------------------------------------------
         OTHER FILTERS
      ------------------------------------------------ */
      Object.entries(filterValues).forEach(
        ([group, values]) => {
          if (!values || values.length === 0) {
            return;
          }

          const mappedValues = values.map((value) =>
            mapFilterValue(group, value),
          );

          if (mappedValues.length > 0) {
            params.set(
              group,
              mappedValues.join(","),
            );
          }
        },
      );

      /* -----------------------------------------------
         SORT
      ------------------------------------------------ */
      if (sortBy) {
        params.set("sortBy", sortBy);
      }

      const requestUrl =
        `${API_URL}/products?${params.toString()}`;

      const response = await fetch(requestUrl, {
        cache: "no-store",
      });

      /* -----------------------------------------------
         COMPONENT UNMOUNTED / NEW REQUEST STARTED
      ------------------------------------------------ */
      if (!isActive) {
        return;
      }

      if (!response.ok) {
        throw new Error(
          `Failed to fetch products (${response.status})`,
        );
      }

      const result: ProductsResponse =
        await response.json();

      if (!isActive) {
        return;
      }

      if (!result.success) {
        throw new Error(
          "Failed to load products",
        );
      }

      /* -----------------------------------------------
         CONVERT PRODUCTS
      ------------------------------------------------ */
      const convertedProducts =
        (result.data?.products ?? []).map(
          convertProduct,
        );

      if (!isActive) {
        return;
      }

      setProducts(convertedProducts);

      setTotalPages(
        result.data?.pagination?.totalPages ?? 1,
      );

      setTotalResults(
        result.data?.pagination?.total ?? 0,
      );

      /* -----------------------------------------------
         BRAND COUNTS
      ------------------------------------------------ */
      if (result.data?.brandCounts) {
        onBrandCounts?.(
          result.data.brandCounts,
        );
      }
    } catch (err) {
      /*
       * If this effect has already been cleaned up,
       * ignore the result completely.
       */
      if (!isActive) {
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
      setTotalResults(0);
      setTotalPages(1);
    } finally {
      if (isActive) {
        setLoading(false);
      }
    }
  }

  void fetchProducts();

  /*
   * IMPORTANT:
   * We intentionally do NOT call controller.abort().
   *
   * When search/filter/page changes, the previous request
   * is simply ignored when it finishes.
   */
  return () => {
    isActive = false;
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
  onBrandCounts,
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
      {products.map((mobile) => (
  <MobileCard
    key={mobile.id}
    mobile={mobile}
  />
))}

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