"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Star,
} from "lucide-react";

export interface HomeProduct {
  id: string;
  name: string;
  slug: string;
  href?: string;
  image?: string | null;
  price?: number | null;
  rating?: number | null;
  badge?: string | null;
  badgeTone?: "blue" | "green" | "orange" | "purple" | "red";
  isUpcoming?: boolean;
}

interface ProductCardProps {
  product: HomeProduct;
}

const badgeStyles: Record<
  NonNullable<HomeProduct["badgeTone"]>,
  string
> = {
  blue: "bg-blue-50 text-blue-600 border-blue-100",
  green: "bg-emerald-50 text-emerald-600 border-emerald-100",
  orange: "bg-orange-50 text-orange-600 border-orange-100",
  purple: "bg-violet-50 text-violet-600 border-violet-100",
  red: "bg-red-50 text-red-600 border-red-100",
};

function formatPrice(price?: number | null) {
  if (price === null || price === undefined) {
    return "Price unavailable";
  }

  return `₹${price.toLocaleString("en-IN")}`;
}

export default function ProductCard({
  product,
}: ProductCardProps) {
  const rating =
    product.rating !== null &&
    product.rating !== undefined
      ? product.rating.toFixed(1)
      : null;

  return (
    <Link
      href={product.href ?? `/mobiles/${product.slug}`}
      className="group relative block min-w-[195px] overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl sm:min-w-0"
    >
      {/* Subtle decorative glow */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-blue-50 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />

      {/* Product Image */}
      <div className="relative flex h-[185px] items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-slate-50 via-white to-blue-50/50">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            width={180}
            height={180}
            className="h-full w-full object-contain p-3 transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center px-4 text-center text-xs font-medium text-slate-400">
            No image available
          </div>
        )}

        {product.badge && (
          <span
            className={`absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wide shadow-sm ${
              badgeStyles[product.badgeTone ?? "blue"]
            }`}
          >
            <BadgeCheck className="h-3 w-3" />
            {product.badge}
          </span>
        )}
      </div>

      {/* Product Information */}
      <div className="relative mt-3">
        <h3 className="line-clamp-2 min-h-[40px] text-sm font-extrabold leading-5 text-slate-900 transition-colors group-hover:text-blue-600">
          {product.name}
        </h3>

        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="text-base font-black text-slate-900">
            {formatPrice(product.price)}
          </span>

          {rating && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-[10px] font-extrabold text-emerald-600">
              <Star className="h-3 w-3 fill-current" />
              {rating}
            </span>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
          <span className="text-[10px] font-bold text-slate-400 transition-colors group-hover:text-slate-500">
            View details
          </span>

          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-50 text-slate-400 transition-all duration-200 group-hover:bg-blue-50 group-hover:text-blue-600">
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>
      </div>
    </Link>
  );
}