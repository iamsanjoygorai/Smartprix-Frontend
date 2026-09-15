"use client";

import {
  Battery,
  Camera,
  Check,
  ChevronDown,
  Cpu,
  HardDrive,
  Heart,
  MessageSquare,
  MonitorSmartphone,
  Network,
  Plus,
  Share2,
  Star,
  Zap,
} from "lucide-react";

import { useMemo, useState, type ComponentType } from "react";


import type {
  CompareProduct,
  CompareSpecificationRow,
} from "./compare.mapper";

import { buildCompareSpecificationRows } from "./compare.mapper";
import CompareProductPicker from "./CompareProductPicker";

import { useCompare } from "./CompareProvider";

interface CompareTableProps {
  products: CompareProduct[];
  onRemoveProduct?: (productId: string) => void;
}

interface SpecificationGroup {
  name: string;
  icon: ComponentType<{
    className?: string;
    strokeWidth?: number;
  }>;
  keys: string[];
}

interface ExtendedCompareProduct extends CompareProduct   {
  specsScore?: number | null;
  score?: number | null;
  rating: number | null;
}

/* =========================================================
   SPECIFICATION GROUPS
========================================================= */

const specificationGroups: SpecificationGroup[] = [
  {
    name: "Display",
    icon: MonitorSmartphone,
    keys: [
      "display",
      "screen",
      "screen size",
      "resolution",
      "refresh rate",
      "display type",
      "panel",
      "aspect ratio",
      "screen to body",
      "brightness",
      "hdr",
      "touchscreen",
    ],
  },
  {
    name: "Performance",
    icon: Cpu,
    keys: [
      "processor",
      "cpu",
      "chipset",
      "gpu",
      "processor manufacturer",
      "cpu manufacturer",
      "clock speed",
      "cores",
      "performance",
    ],
  },
  {
    name: "Memory & Storage",
    icon: HardDrive,
    keys: [
      "ram",
      "memory",
      "internal storage",
      "storage",
      "rom",
      "expandable storage",
      "card slot",
      "memory card",
    ],
  },
  {
    name: "Camera",
    icon: Camera,
    keys: [
      "camera",
      "rear camera",
      "front camera",
      "main camera",
      "selfie camera",
      "primary camera",
      "secondary camera",
      "ultrawide",
      "telephoto",
      "macro",
      "video recording",
    ],
  },
  {
    name: "Battery",
    icon: Battery,
    keys: [
      "battery",
      "battery capacity",
      "charging",
      "fast charging",
      "wireless charging",
      "reverse charging",
      "battery type",
    ],
  },
  {
    name: "Connectivity",
    icon: Network,
    keys: [
      "5g",
      "4g",
      "network",
      "sim",
      "wifi",
      "bluetooth",
      "nfc",
      "usb",
      "usb type",
      "gps",
      "infrared",
      "ir blaster",
    ],
  },
  {
    name: "Software",
    icon: Zap,
    keys: [
      "os",
      "operating system",
      "android",
      "ios",
      "version",
      "ui",
      "user interface",
      "software",
    ],
  },
  {
    name: "Features",
    icon: Check,
    keys: [
      "fingerprint",
      "face unlock",
      "water resistance",
      "dust resistance",
      "ip rating",
      "sensors",
      "speaker",
      "audio",
      "stereo",
      "features",
    ],
  },
];

/* =========================================================
   HELPERS
========================================================= */

function formatPrice(price: number | null): string {
  if (price === null || !Number.isFinite(price)) {
    return "—";
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

  return `${backendUrl}${image.startsWith("/") ? image : `/${image}`}`;
}

function normalizeKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getGroupForSpecification(
  row: CompareSpecificationRow,
): string {
  const normalizedKey = normalizeKey(row.key);
  const normalizedLabel = normalizeKey(row.label);

  for (const group of specificationGroups) {
    const matches = group.keys.some((key) => {
      const normalizedGroupKey = normalizeKey(key);

      return (
        normalizedKey.includes(normalizedGroupKey) ||
        normalizedLabel.includes(normalizedGroupKey) ||
        normalizedGroupKey.includes(normalizedKey) ||
        normalizedGroupKey.includes(normalizedLabel)
      );
    });

    if (matches) {
      return group.name;
    }
  }

  if (row.group?.trim()) {
    return row.group.trim();
  }

  return "Other Specifications";
}

function getGroupIcon(groupName: string) {
  const group = specificationGroups.find(
    (item) => item.name === groupName,
  );

  return group?.icon ?? Zap;
}

function valuesAreDifferent(
  row: CompareSpecificationRow,
  products: CompareProduct[],
): boolean {
  const values = products.map(
    (product) => row.values[product.id] ?? "—",
  );

  const normalizedValues = values.map((value) =>
    value.trim().toLowerCase(),
  );

  return new Set(normalizedValues).size > 1;
}

function findNumericValue(value: string): number | null {
  const match = value
    .replace(/,/g, "")
    .match(/-?\d+(?:\.\d+)?/);

  if (!match) {
    return null;
  }

  const number = Number(match[0]);

  return Number.isFinite(number) ? number : null;
}

/**
 * Numeric comparison.
 *
 * This intentionally follows the existing behaviour:
 * higher numeric value = better.
 */
function getBetterValueIndexes(
  row: CompareSpecificationRow,
  products: CompareProduct[],
): Set<string> {
  const entries = products
    .map((product) => {
      const value = row.values[product.id];

      if (!value || value === "—") {
        return null;
      }

      const numericValue = findNumericValue(value);

      if (numericValue === null) {
        return null;
      }

      return {
        id: product.id,
        value: numericValue,
      };
    })
    .filter(
      (
        item,
      ): item is {
        id: string;
        value: number;
      } => Boolean(item),
    );

  if (entries.length < 2) {
    return new Set();
  }

  const max = Math.max(
    ...entries.map((entry) => entry.value),
  );

  return new Set(
    entries
      .filter((entry) => entry.value === max)
      .map((entry) => entry.id),
  );
}

/* =========================================================
   SPECS SCORE
========================================================= */

function getProductScore(
  product: CompareProduct,
  rows: CompareSpecificationRow[],
  products: CompareProduct[],
): number {
  const extended = product as ExtendedCompareProduct;

  const existingScore =
    extended.specsScore ?? extended.score;

  if (
    typeof existingScore === "number" &&
    Number.isFinite(existingScore)
  ) {
    return Math.max(0, Math.min(100, Math.round(existingScore)));
  }

  let comparableRows = 0;
  let wins = 0;

  for (const row of rows) {
    const better = getBetterValueIndexes(row, products);

    if (better.size === 0) {
      continue;
    }

    comparableRows += 1;

    if (better.has(product.id)) {
      wins += 1;
    }
  }

  if (comparableRows === 0) {
    return 0;
  }

  return Math.round((wins / comparableRows) * 100);
}

/* =========================================================
   VS DIVIDER
========================================================= */

function VsDivider() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 left-0 z-20 flex w-0 items-center justify-center"
    >
      <span className="absolute inset-y-0 w-px bg-slate-200" />

      <span className="relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-[10px] font-black text-slate-600 shadow-sm ring-4 ring-white">
        VS
      </span>
    </div>
  );
}

/* =========================================================
   SOCIAL RAIL
========================================================= */

function SocialRail() {

 const [liked, setLiked] = useState(false);

async function handleShare() {
  try {
    const url = window.location.href;

    if (navigator.share) {
      await navigator.share({
        title: "Smartphone Comparison",
        text: "Check out this smartphone comparison on Smartprix.",
        url,
      });
      return;
    }

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      window.alert("Comparison link copied!");
    }
  } catch {
    // User cancelled sharing.
  }
}

function handleComment() {
  document
    .getElementById("comparison-comments")
    ?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
}


  return (
    <div className="hidden w-[112px] shrink-0 border-r border-slate-200 bg-white md:block">
      <div className="sticky top-0 flex flex-col">
        <button
          type="button"
          onClick={() => setLiked((value) => !value)}
          className={`flex h-14 items-center gap-2 px-4 text-left text-xs font-semibold transition ${
            liked
              ? "bg-pink-50 text-pink-600"
              : "text-pink-500 hover:bg-pink-50"
          }`}
        >
          <Heart
            className="h-4 w-4"
            fill={liked ? "currentColor" : "none"}
            strokeWidth={2}
          />
          {liked ? "Liked" : "Like"}
        </button>

        <button
          type="button"
          onClick={handleComment}
          className="flex h-14 items-center gap-2 px-4 text-left text-xs font-semibold text-pink-500 transition hover:bg-pink-50"
        >
          <MessageSquare className="h-4 w-4" />
          Comment
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="flex h-14 items-center gap-2 px-4 text-left text-xs font-semibold text-pink-500 transition hover:bg-pink-50"
        >
          <Share2 className="h-4 w-4" />
          Share
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   PRODUCT HEADER
========================================================= */

function ProductHeader({
  product,
  rank,
  onRemove,
}: {
  product: CompareProduct;
  rank: number;
  onRemove?: (id: string) => void;
}) {
  const image = getImageUrl(product.image);

  return (
    <div className="relative h-full bg-white">
      {/* Rank */}
      <div
        className={`absolute left-0 top-0 z-10 flex h-8 min-w-11 items-center justify-center px-2 text-sm font-black text-white ${
          rank === 1
            ? "bg-green-600"
            : "bg-lime-500"
        }`}
      >
        #{rank}
      </div>

      {/* Remove */}
      {onRemove && (
        <button
          type="button"
          onClick={() => onRemove(product.id)}
          aria-label={`Remove ${product.name}`}
          className="absolute right-2 top-2 z-20 flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          ×
        </button>
      )}

      <div className="px-3 pb-4 pt-10 sm:px-4">
        {/* Product image */}
        <div className="flex h-36 items-center justify-center sm:h-44">
          {image ? (
            <img
              src={image}
              alt={product.name}
              className="h-full w-full object-contain"
            />
          ) : (
            <MonitorSmartphone className="h-16 w-16 text-slate-200" />
          )}
        </div>

        {/* Brand */}
        <p className="mt-3 text-[10px] font-semibold text-slate-400">
          {product.brand}
        </p>

        {/* Name */}
        <h3 className="mt-1 min-h-[40px] text-sm font-semibold leading-5 text-slate-800">
          {product.name}
        </h3>

        {/* Price */}
        <div className="mt-2 flex items-center gap-1">
          <span className="text-sm font-black text-green-600">
            {formatPrice(product.price)}
          </span>

          <span className="text-[9px] font-bold text-green-500">
            ▼1%
          </span>
        </div>

        {/* Rating */}
        <div className="mt-1 flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className="h-3.5 w-3.5 text-yellow-500"
              fill="currentColor"
              strokeWidth={1.5}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   ADD PRODUCT
========================================================= */

function AddProductCell() {
  const { openProductPicker } = useCompare();

  return (
    <button
      type="button"
      onClick={openProductPicker}
      className="group flex min-h-[244px] w-full flex-col items-center justify-center bg-white transition hover:bg-blue-50/50"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500 text-white shadow-sm transition group-hover:scale-105">
        <Plus
          className="h-6 w-6"
          strokeWidth={3}
        />
      </span>

      <span className="mt-3 text-sm font-medium text-slate-700">
        Add Product
      </span>

      <span className="mt-1 text-[10px] text-slate-400">
        Add another phone
      </span>
    </button>
  );
}
/* =========================================================
   SPEC SCORE
========================================================= */

function ScoreCell({
  score,
  better,
}: {
  score: number;
  better: boolean;
}) {
  return (
    <div
      className={`flex min-h-[76px] flex-col justify-center px-3 sm:px-4 ${
        better
          ? "bg-green-200"
          : "bg-blue-100"
      }`}
    >
      <span
        className={`inline-flex w-fit items-center px-2 py-1 text-xl font-black text-white ${
          better
            ? "bg-green-600"
            : "bg-lime-500"
        }`}
      >
        {score} / 100
      </span>

      {better && (
        <span className="mt-1 text-[10px] font-medium text-green-700">
          Better Specs
        </span>
      )}
    </div>
  );
}

/* =========================================================
   OVERVIEW ROW
========================================================= */

function OverviewRow({
  row,
  products,
  highlightDifferences,
}: {
  row: CompareSpecificationRow;
  products: CompareProduct[];
  highlightDifferences: boolean;
}) {
  const different = valuesAreDifferent(row, products);
  const betterIndexes = getBetterValueIndexes(
    row,
    products,
  );

  return (
    <div
      className={`grid border-b border-white ${
        different && highlightDifferences
          ? "bg-green-50"
          : "bg-white"
      }`}
      style={{
        gridTemplateColumns: `145px repeat(${products.length}, minmax(0, 1fr))`,
      }}
    >
      {/* Label */}
      <div className="flex min-h-[54px] items-center justify-end border-r border-white bg-lime-100 px-3 text-right sm:px-4">
        <span className="text-[10px] font-bold text-slate-600 sm:text-xs">
          {row.label}
        </span>
      </div>

      {products.map((product, index) => {
        const value = row.values[product.id] ?? "—";
        const isBetter = betterIndexes.has(product.id);

        return (
          <div
            key={product.id}
            className={`relative flex min-h-[54px] items-center px-3 sm:px-4 ${
              index > 0
                ? "border-l border-white"
                : ""
            } ${
              isBetter
                ? "bg-green-200"
                : "bg-blue-100"
            }`}
          >
            {index > 0 && <VsDivider />}

            <div>
              <p
                className={`text-xs leading-5 sm:text-sm ${
                  value === "—"
                    ? "text-slate-400"
                    : isBetter
                      ? "font-medium text-slate-700"
                      : "text-slate-700"
                }`}
              >
                {value}
              </p>

              {isBetter && (
                <p className="text-[10px] font-medium text-green-600">
                  {row.label === "Display Size"
                    ? "Bigger Display"
                    : row.label ===
                        "Display Resolution"
                      ? "Better Resolution"
                      : row.label ===
                          "Screen To Body Ratio"
                        ? "Less Bezels"
                        : ""}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* =========================================================
   SPECIFICATION ROW
========================================================= */

function SpecificationRow({
  row,
  products,
  highlightDifferences,
}: {
  row: CompareSpecificationRow;
  products: CompareProduct[];
  highlightDifferences: boolean;
}) {
  const different = valuesAreDifferent(row, products);
  const betterIndexes = getBetterValueIndexes(
    row,
    products,
  );

  return (
    <div
      className={`grid border-b border-slate-100 ${
        different && highlightDifferences
          ? "bg-amber-50/40"
          : "bg-white"
      }`}
      style={{
        gridTemplateColumns: `145px repeat(${products.length}, minmax(0, 1fr))`,
      }}
    >
      {/* Specification name */}
      <div className="flex min-h-[58px] items-center justify-end border-r border-slate-100 bg-slate-50 px-3 text-right sm:px-4">
        <span className="text-[10px] font-bold leading-4 text-slate-600 sm:text-xs">
          {row.label}
        </span>
      </div>

      {products.map((product, index) => {
        const value = row.values[product.id] ?? "—";
        const isBetter = betterIndexes.has(product.id);

        return (
          <div
            key={product.id}
            className={`relative flex min-h-[58px] items-center px-3 sm:px-4 ${
              index > 0
                ? "border-l border-slate-100"
                : ""
            } ${
              isBetter
                ? "bg-green-50"
                : ""
            }`}
          >
            {index > 0 && <VsDivider />}

            <div className="flex min-w-0 items-center gap-2">
              <span
                className={`break-words text-xs leading-5 sm:text-sm ${
                  value === "—"
                    ? "font-medium text-slate-300"
                    : isBetter
                      ? "font-bold text-green-700"
                      : "font-medium text-slate-700"
                }`}
              >
                {value}
              </span>

              {isBetter && (
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <Check
                    className="h-3 w-3"
                    strokeWidth={3}
                  />
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function CompareTable({
  products,
  onRemoveProduct,
}: CompareTableProps) {

const {
  availableProducts,
  selectedProductIds,
  isComparePagePickerOpen,
  openComparePagePicker,
  closeComparePagePicker,
  addProduct,
  removeProduct,
  maxProducts,
} = useCompare();
    const [highlightDifferences, setHighlightDifferences] =
  useState(true);

const [isDescriptionExpanded, setIsDescriptionExpanded] =
  useState(false);

const [openGroups, setOpenGroups] =
  useState<Record<string, boolean>>({});

  const rows = useMemo(
    () => buildCompareSpecificationRows(products),
    [products],
  );

  const groupedRows = useMemo(() => {
    const groups = new Map<
      string,
      CompareSpecificationRow[]
    >();

    for (const row of rows) {
      const groupName =
        getGroupForSpecification(row);

      const existing = groups.get(groupName);

      if (existing) {
        existing.push(row);
      } else {
        groups.set(groupName, [row]);
      }
    }

    return Array.from(groups.entries()).sort(
      ([groupA], [groupB]) => {
        const indexA =
          specificationGroups.findIndex(
            (group) => group.name === groupA,
          );

        const indexB =
          specificationGroups.findIndex(
            (group) => group.name === groupB,
          );

        if (indexA === -1 && indexB === -1) {
          return 0;
        }

        if (indexA === -1) {
          return 1;
        }

        if (indexB === -1) {
          return -1;
        }

        return indexA - indexB;
      },
    );
  }, [rows]);

  const scores = useMemo(
    () =>
      products.map((product) =>
        getProductScore(
          product,
          rows,
          products,
        ),
      ),
    [products, rows],
  );

  const bestScore =
    scores.length > 0
      ? Math.max(...scores)
      : 0;

    function handleAddProduct() {
  openComparePagePicker();
}

function handleProductSelect(product: CompareProduct) {
  const added = addProduct(product);

  if (added) {
    closeComparePagePicker();
  }
}

function handleRemoveProduct(productId: string) {
  if (onRemoveProduct) {
    onRemoveProduct(productId);
    return;
  }

  removeProduct(productId);
}


  function toggleGroup(groupName: string) {
    setOpenGroups((current) => ({
      ...current,
      [groupName]:
        current[groupName] === undefined
          ? false
          : !current[groupName],
    }));
  }

  function isGroupOpen(groupName: string): boolean {
    return openGroups[groupName] ?? true;
  }

  /*
   * Keep four comparison columns like the reference design.
   *
   * Example:
   * Product 1 | Product 2 | Add Product | Add Product
   */
  const visibleProducts = products.slice(0, 4);

  const emptySlots = Math.max(
    0,
    4 - visibleProducts.length,
  );
  

  return (
    <section className="w-full overflow-hidden rounded-sm border border-slate-200 bg-white shadow-sm">
      {/* =====================================================
          PAGE INTRO
      ===================================================== */}

      <div className="border-b border-slate-200 bg-white px-4 pb-3 pt-4 sm:px-5">
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
          {visibleProducts
            .slice(0, 2)
            .map((product) => product.name)
            .join(" vs ")}
        </h1>

        <p
  className={`mt-2 max-w-5xl text-[11px] leading-5 text-slate-500 sm:text-xs ${
    isDescriptionExpanded ? "" : "line-clamp-2"
  }`}
>
  Here you can compare{" "}
  {visibleProducts
    .map((product) => product.name)
    .join(" vs ")}{" "}
  and check their respective specifications, scores
  and unique features. Compare the smartphones
  side-by-side to understand which device offers
  better specifications and value.
</p>

<div className="mt-1 flex items-center justify-between">
  <span className="text-[10px] text-slate-400">
    Compare specifications, price and features
    side-by-side.
  </span>

  <button
    type="button"
    onClick={() =>
      setIsDescriptionExpanded((value) => !value)
    }
    className="text-[11px] font-medium text-blue-500 hover:underline"
  >
    {isDescriptionExpanded ? "Read Less" : "Read More"}
  </button>
</div>
      </div>

      {/* =====================================================
          PRODUCT COMPARISON AREA
      ===================================================== */}

      <div className="flex w-full border-b border-slate-200">
        <SocialRail />

        <div className="min-w-0 flex-1">
          <div
            className="grid w-full"
            style={{
              gridTemplateColumns: `repeat(${visibleProducts.length + emptySlots}, minmax(0, 1fr))`,
            }}
          >

           {Array.from({ length: 4 }).map((_, index) => {
  const product = visibleProducts[index];

  if (!product) {
    return (
      <div
        key={`empty-${index}`}
        className="border-r border-slate-200"
      >
        <AddProductCell />
      </div>
    );
  }

  return (
    <div
      key={product.id}
      className="relative border-r border-slate-200"
    >
      {index > 0 && <VsDivider />}

      <ProductHeader
        product={product}
        rank={
          scores[index] === bestScore
            ? 1
            : 2
        }
        onRemove={handleRemoveProduct}
      />
    </div>
  );
})}
          </div>
        </div>
      </div>

      {/* =====================================================
          MOBILE SOCIAL ACTIONS
      ===================================================== */}

      <div className="flex border-b border-slate-200 md:hidden">
        <button
          type="button"
          className="flex flex-1 items-center justify-center gap-2 py-3 text-xs font-semibold text-pink-500"
        >
          <Heart className="h-4 w-4" />
          Like
        </button>

        <button
          type="button"
          className="flex flex-1 items-center justify-center gap-2 border-l border-slate-100 py-3 text-xs font-semibold text-pink-500"
        >
          <MessageSquare className="h-4 w-4" />
          Comment
        </button>

        <button
          type="button"
          className="flex flex-1 items-center justify-center gap-2 border-l border-slate-100 py-3 text-xs font-semibold text-pink-500"
        >
          <Share2 className="h-4 w-4" />
          Share
        </button>
      </div>

      {/* =====================================================
          OVERVIEW
      ===================================================== */}

      <div className="bg-white">
        <div className="flex items-center justify-between bg-blue-50 px-4 py-3">
          <h2 className="text-base font-medium text-slate-700">
            Overview
          </h2>

          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={highlightDifferences}
              onChange={(event) =>
                setHighlightDifferences(
                  event.target.checked,
                )
              }
              className="h-3.5 w-3.5 accent-green-600"
            />

            <span className="text-[10px] font-semibold text-slate-500">
              Highlight differences
            </span>
          </label>
        </div>

        {/* ===================================================
            SPECS SCORE
        =================================================== */}

        <div
          className="grid border-b border-white"
          style={{
            gridTemplateColumns: `145px repeat(${visibleProducts.length}, minmax(0, 1fr))`,
          }}
        >
          <div className="flex min-h-[76px] items-center justify-end bg-lime-100 px-3 text-right sm:px-4">
            <span className="text-[10px] font-bold text-slate-600 sm:text-xs">
              Specs Score
            </span>
          </div>

          {visibleProducts.map(
            (product, index) => {
              const score = scores[index];
              const better =
                score === bestScore;

              return (
                <div
                  key={product.id}
                  className={
                    index > 0
                      ? "border-l border-white"
                      : ""
                  }
                >
                  <ScoreCell
                    score={score}
                    better={better}
                  />
                </div>
              );
            },
          )}
        </div>

        {/* ===================================================
            OVERVIEW ROWS
        =================================================== */}

        {groupedRows
          .filter(
            ([groupName]) =>
              groupName === "Display" ||
              groupName === "Performance" ||
              groupName === "Memory & Storage",
          )
          .flatMap(([, groupRows]) => groupRows.slice(0, 3))
          .map((row) => (
            <OverviewRow
              key={`overview-${row.key}`}
              row={row}
              products={visibleProducts}
              highlightDifferences={
                highlightDifferences
              }
            />
          ))}
      </div>

      {/* =====================================================
          FULL SPECIFICATION GROUPS
      ===================================================== */}

      <div className="border-t border-slate-200">
        {groupedRows.map(
          ([groupName, groupRows]) => {
            const Icon =
              getGroupIcon(groupName);

            const open =
              isGroupOpen(groupName);

            return (
              <div
                key={groupName}
                className="border-b border-slate-200 last:border-b-0"
              >
                {/* Group header */}
                <button
                  type="button"
                  onClick={() =>
                    toggleGroup(groupName)
                  }
                  className="flex w-full items-center gap-3 bg-blue-50 px-4 py-3 text-left transition hover:bg-blue-100"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-white">
                    <Icon
                      className="h-4 w-4"
                      strokeWidth={2.3}
                    />
                  </span>

                  <span className="text-sm font-bold text-slate-700">
                    {groupName}
                  </span>

                  <span className="ml-auto text-[10px] font-medium text-slate-400">
                    {groupRows.length} specs
                  </span>

                  <ChevronDown
                    className={`h-4 w-4 text-slate-500 transition-transform ${
                      open
                        ? "rotate-180"
                        : ""
                    }`}
                  />
                </button>

                {/* Rows */}
                {open &&
                  groupRows.map((row) => (
                    <SpecificationRow
                      key={`${groupName}-${row.key}`}
                      row={row}
                      products={visibleProducts}
                      highlightDifferences={
                        highlightDifferences
                      }
                    />
                  ))}
              </div>
            );
          },
        )}

        {groupedRows.length === 0 && (
          <div className="px-6 py-12 text-center">
            <Zap className="mx-auto h-8 w-8 text-slate-300" />

            <p className="mt-2 text-sm font-bold text-slate-500">
              No specifications available.
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Specification data will appear here
              when available.
            </p>
          </div>
        )}
      </div>

      {/* =====================================================
          COMMENTS ANCHOR
      ===================================================== */}

      <div
        id="comparison-comments"
        className="h-1"
      />

{isComparePagePickerOpen  && (
 <CompareProductPicker
  open={isComparePagePickerOpen}
  products={availableProducts}
  selectedProductIds={selectedProductIds}
  onSelect={handleProductSelect}
  onClose={closeComparePagePicker}
  maxProducts={maxProducts}
/>
)}

    </section>
  );
}
