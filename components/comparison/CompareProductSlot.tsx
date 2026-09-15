"use client";

import { Plus, X, Smartphone } from "lucide-react";

import type { CompareProduct } from "./compare.mapper";

/* =========================================================
   TYPES
========================================================= */

interface CompareProductSlotProps {
  product?: CompareProduct | null;
  isPrimary?: boolean;
  onRemove?: (productId: string) => void;
  onAdd?: () => void;
  disabled?: boolean;
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

  return image.startsWith("/")
    ? `${baseUrl}${image}`
    : `${baseUrl}/${image}`;
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

export default function CompareProductSlot({
  product = null,
  isPrimary = false,
  onRemove,
  onAdd,
  disabled = false,
}: CompareProductSlotProps) {
  /* =======================================================
     EMPTY SLOT
  ======================================================= */

  if (!product) {
    return (
      <button
        type="button"
        onClick={onAdd}
        disabled={disabled}
        className={[
          "group flex min-h-[170px] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed p-4 text-center transition",
          disabled
            ? "cursor-not-allowed border-slate-200 bg-slate-50 opacity-50"
            : "border-slate-200 bg-slate-50/70 hover:border-blue-400 hover:bg-blue-50/60",
        ].join(" ")}
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm transition group-hover:bg-blue-600 group-hover:text-white">
          <Plus size={21} strokeWidth={2.5} />
        </span>

        <span className="mt-3 text-sm font-extrabold text-slate-700 group-hover:text-blue-700">
          Add Product
        </span>

        <span className="mt-1 text-[11px] font-medium text-slate-400">
          Choose another phone
        </span>
      </button>
    );
  }

  /* =======================================================
     PRODUCT SLOT
  ======================================================= */

  const imageUrl = getImageUrl(product.image);

  return (
    <div
      className={[
        "relative flex min-h-[170px] w-full flex-col overflow-hidden rounded-2xl border bg-white p-4 transition",
        isPrimary
          ? "border-blue-300 shadow-md shadow-blue-500/10"
          : "border-slate-200 shadow-sm",
      ].join(" ")}
    >
      {/* ===================================================
          PRIMARY BADGE
      =================================================== */}

      {isPrimary && (
        <div className="absolute left-3 top-3 rounded-full bg-blue-600 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wide text-white shadow-sm">
          Primary
        </div>
      )}

      {/* ===================================================
          REMOVE
      =================================================== */}

      {onRemove && (
        <button
          type="button"
          onClick={() => onRemove(product.id)}
          aria-label={`Remove ${product.name}`}
          className="absolute right-2.5 top-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm ring-1 ring-slate-200 transition hover:bg-red-50 hover:text-red-600"
        >
          <X size={16} strokeWidth={2.5} />
        </button>
      )}

      {/* ===================================================
          PRODUCT IMAGE
      =================================================== */}

      <div className="mt-4 flex h-20 items-center justify-center">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full max-w-[90px] object-contain"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-100 text-slate-300">
            <Smartphone size={27} />
          </div>
        )}
      </div>

      {/* ===================================================
          PRODUCT INFO
      =================================================== */}

      <div className="mt-3 min-w-0 text-center">
        <p className="truncate text-[10px] font-extrabold uppercase tracking-wide text-blue-600">
          {product.brand}
        </p>

        <p className="mt-1 line-clamp-2 min-h-[36px] text-xs font-extrabold leading-[18px] text-slate-900">
          {product.name}
        </p>

        <p className="mt-2 text-sm font-black text-slate-950">
          {formatPrice(product.price)}
        </p>
      </div>
    </div>
  );
}
