"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";

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
  blue: "bg-blue-50 text-blue-600",
  green: "bg-emerald-50 text-emerald-600",
  orange: "bg-orange-50 text-orange-600",
  purple: "bg-violet-50 text-violet-600",
  red: "bg-red-50 text-red-600",
};

function formatPrice(price?: number | null) {
  if (price === null || price === undefined) {
    return "Price unavailable";
  }

  return `₹${price.toLocaleString("en-IN")}`;
}

export default function ProductCard({ product }: ProductCardProps) {
  const rating =
    product.rating !== null && product.rating !== undefined
      ? product.rating.toFixed(1)
      : null;

  return (
    <Link
      href={`/mobiles/${product.slug}`}
      className="group block min-w-[190px] rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg sm:min-w-0"
    >
      {/* Image */}
      <div className="relative flex h-[180px] items-center justify-center overflow-hidden rounded-xl bg-slate-50">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            width={180}
            height={180}
            className="h-full w-full object-contain p-3 transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center px-4 text-center text-xs font-medium text-slate-400">
            No image available
          </div>
        )}

        {product.badge && (
          <span
            className={`absolute left-2.5 top-2.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${
              badgeStyles[product.badgeTone ?? "blue"]
            }`}
          >
            {product.badge}
          </span>
        )}
      </div>

      {/* Product information */}
      <div className="mt-3">
        <h3 className="line-clamp-2 min-h-[40px] text-sm font-bold leading-5 text-slate-900 transition-colors group-hover:text-blue-600">
          {product.name}
        </h3>

        {/* Price + Rating */}
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="text-base font-extrabold text-slate-900">
            {formatPrice(product.price)}
          </span>

          {rating && (
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-1 text-[11px] font-bold text-emerald-600">
              <Star className="h-3 w-3 fill-current" />
              {rating}
            </span>
          )}
        </div>

        {/* Bottom action */}
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
          <span className="text-[11px] font-medium text-slate-400">
            View details
          </span>

          <ArrowRight className="h-3.5 w-3.5 text-slate-400 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-blue-600" />
        </div>
      </div>
    </Link>
  );
}
