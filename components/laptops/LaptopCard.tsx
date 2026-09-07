"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

interface LaptopImage {
  id: string;
  url: string;
  altText?: string | null;
  isPrimary?: boolean;
  sortOrder?: number;
}

interface LaptopBrand {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
}

interface LaptopVariant {
  id: string;
  name: string;
  storage?: string | null;
  ram?: string | null;
  color?: string | null;
}

interface LaptopPrice {
  id: string;
  amount: number | string;
  currency: string;
  inStock: boolean;
  seller?: {
    id: string;
    name: string;
    logoUrl?: string | null;
  } | null;
}

interface LaptopSpecification {
  id: string;
  customValue?: string | null;
  value?: {
    value: string;
  } | null;
  specification: {
    name: string;
    slug: string;
  };
}

export interface Laptop {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string | null;
  description?: string | null;

  brand?: LaptopBrand | null;

  images?: LaptopImage[];

  variants?: LaptopVariant[];

  prices?: LaptopPrice[];

  specifications?: LaptopSpecification[];

  releaseDate?: string | null;
}

interface LaptopCardProps {
  laptop: Laptop;
  onCompareChange?: (
    laptop: Laptop,
    selected: boolean,
  ) => void;
  isCompared?: boolean;
}

const getSpecification = (
  laptop: Laptop,
  keywords: string[],
): string | null => {
  const specification = laptop.specifications?.find(
    (item) => {
      const name =
        `${item.specification.name} ${item.specification.slug}`
          .toLowerCase();

      return keywords.some((keyword) =>
        name.includes(keyword.toLowerCase()),
      );
    },
  );

  if (!specification) {
    return null;
  }

  return (
    specification.customValue ||
    specification.value?.value ||
    null
  );
};

const formatPrice = (value: number | string): string => {
  const amount =
    typeof value === "string"
      ? Number(value)
      : value;

  if (!Number.isFinite(amount)) {
    return "Price unavailable";
  }

  return `₹${amount.toLocaleString("en-IN")}`;
};

export default function LaptopCard({
  laptop,
  onCompareChange,
  isCompared = false,
}: LaptopCardProps) {
  const [imageError, setImageError] = useState(false);

  const primaryImage = useMemo(() => {
    if (!laptop.images?.length) {
      return null;
    }

    return (
      laptop.images.find(
        (image) => image.isPrimary,
      ) ??
      [...laptop.images].sort(
        (a, b) =>
          (a.sortOrder ?? 0) -
          (b.sortOrder ?? 0),
      )[0]
    );
  }, [laptop.images]);

  const lowestPrice = useMemo(() => {
    const prices =
      laptop.prices
        ?.filter((price) => price.inStock)
        .map((price) =>
          typeof price.amount === "string"
            ? Number(price.amount)
            : price.amount,
        )
        .filter((price) =>
          Number.isFinite(price),
        ) ?? [];

    if (!prices.length) {
      return null;
    }

    return Math.min(...prices);
  }, [laptop.prices]);

  const processor = getSpecification(
    laptop,
    [
      "processor",
      "cpu",
      "chipset",
    ],
  );

  const display = getSpecification(
    laptop,
    [
      "display",
      "screen",
      "resolution",
    ],
  );

  const graphics = getSpecification(
    laptop,
    [
      "graphics",
      "gpu",
      "graphic",
    ],
  );

  const operatingSystem = getSpecification(
    laptop,
    [
      "operating system",
      "os",
    ],
  );

  const rating = getSpecification(
    laptop,
    [
      "rating",
      "user rating",
    ],
  );

  const imageUrl =
    primaryImage?.url && !imageError
      ? primaryImage.url
      : "/placeholder-product.png";

  return (
    <article className="border-b border-gray-200 bg-white px-5 py-6 transition hover:shadow-sm">
      <div className="flex gap-6">
        {/* Product Image */}
        <div className="flex w-52 shrink-0 flex-col items-center">
          <Link
            href={`/laptops/${laptop.slug}`}
            className="relative flex h-48 w-full items-center justify-center"
          >
            <Image
              src={imageUrl}
              alt={
                primaryImage?.altText ||
                laptop.name
              }
              fill
              sizes="208px"
              className="object-contain"
              onError={() =>
                setImageError(true)
              }
            />
          </Link>

          {/* Wishlist */}
          <button
            type="button"
            className="mt-4 flex items-center gap-2 text-sm text-gray-600 hover:text-red-500"
            aria-label={`Add ${laptop.name} to wishlist`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
            </svg>

            Wishlist
          </button>
        </div>

        {/* Product Information */}
        <div className="min-w-0 flex-1">
          {/* Brand */}
          {laptop.brand?.name && (
            <div className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
              {laptop.brand.name}
            </div>
          )}

          {/* Product Name */}
          <Link
            href={`/laptops/${laptop.slug}`}
            className="text-lg font-semibold text-gray-900 hover:text-blue-600"
          >
            {laptop.name}
          </Link>

          {/* Rating */}
          {rating && (
            <div className="mt-2 flex items-center gap-2">
              <span className="rounded bg-green-600 px-2 py-1 text-xs font-semibold text-white">
                ★ {rating}
              </span>

              <span className="text-xs text-gray-500">
                User rating
              </span>
            </div>
          )}

          {/* Specifications */}
          <div className="mt-4 space-y-2 text-sm text-gray-700">
            {processor && (
              <div className="flex gap-2">
                <span className="font-medium">
                  Processor:
                </span>
                <span>{processor}</span>
              </div>
            )}

            {display && (
              <div className="flex gap-2">
                <span className="font-medium">
                  Display:
                </span>
                <span>{display}</span>
              </div>
            )}

            {graphics && (
              <div className="flex gap-2">
                <span className="font-medium">
                  Graphics:
                </span>
                <span>{graphics}</span>
              </div>
            )}

            {operatingSystem && (
              <div className="flex gap-2">
                <span className="font-medium">
                  OS:
                </span>
                <span>{operatingSystem}</span>
              </div>
            )}
          </div>

          {/* Variant information */}
          {laptop.variants?.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {laptop.variants
                .slice(0, 3)
                .map((variant) => (
                  <span
                    key={variant.id}
                    className="rounded border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-600"
                  >
                    {[
                      variant.ram,
                      variant.storage,
                    ]
                      .filter(Boolean)
                      .join(" • ")}
                  </span>
                ))}
            </div>
          ) : null}

          {/* Bottom Actions */}
          <div className="mt-5 flex flex-wrap items-center gap-5">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={isCompared}
                onChange={(event) =>
                  onCompareChange?.(
                    laptop,
                    event.target.checked,
                  )
                }
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />

              Compare
            </label>

            <Link
              href={`/laptops/${laptop.slug}`}
              className="text-sm font-semibold text-blue-600 hover:text-blue-800"
            >
              View Details →
            </Link>
          </div>
        </div>

        {/* Price Section */}
        <div className="flex w-44 shrink-0 flex-col items-end">
          {lowestPrice !== null ? (
            <>
              <div className="text-2xl font-bold text-gray-900">
                {formatPrice(lowestPrice)}
              </div>

              <div className="mt-1 text-xs text-gray-500">
                Lowest price
              </div>

              <div className="mt-4 rounded-md bg-green-50 px-3 py-2 text-xs font-medium text-green-700">
                Compare prices from sellers
              </div>
            </>
          ) : (
            <div className="text-sm text-gray-500">
              Price unavailable
            </div>
          )}

          <Link
            href={`/laptops/${laptop.slug}`}
            className="mt-5 w-full rounded-md bg-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}

