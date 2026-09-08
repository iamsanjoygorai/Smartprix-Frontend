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

  rating?: number | null;
  reviewCount?: number;
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
        `${item.specification.name} ${item.specification.slug}`.toLowerCase();

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

const formatPrice = (
  value: number | string,
): string => {
  const amount =
    typeof value === "string"
      ? Number(value)
      : value;

  if (!Number.isFinite(amount)) {
    return "Price unavailable";
  }

  return `₹${amount.toLocaleString("en-IN")}`;
};

function HeartIcon({
  filled = false,
}: {
  filled?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="h-3.5 w-3.5"
      fill="currentColor"
    >
      <path d="m10 1.5 2.63 5.33 5.87.85-4.25 4.14 1 5.85L10 14.91l-5.25 2.76 1-5.85L1.5 7.68l5.87-.85L10 1.5Z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        d="m4 10 4 4 8-8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function LaptopCard({
  laptop,
  onCompareChange,
  isCompared = false,
}: LaptopCardProps) {
  const [imageError, setImageError] =
    useState(false);

  const [isWishlisted, setIsWishlisted] =
    useState(false);

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

  const seller = useMemo(() => {
    const availablePrice =
      laptop.prices?.find(
        (price) =>
          price.inStock &&
          typeof price.amount === "string"
            ? Number(price.amount) ===
              lowestPrice
            : price.amount === lowestPrice,
      );

    return availablePrice?.seller ?? null;
  }, [laptop.prices, lowestPrice]);

  const processor = getSpecification(
    laptop,
    ["processor", "cpu", "chipset"],
  );

  const ram = getSpecification(
    laptop,
    ["ram", "memory"],
  );

  const storage = getSpecification(
    laptop,
    ["storage", "internal-storage"],
  );

  const storageType = getSpecification(
    laptop,
    ["storage-type", "storage type"],
  );

  const screenSize = getSpecification(
    laptop,
    [
      "screen-size",
      "screen size",
      "display-size",
      "display size",
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
      "graphics processor",
    ],
  );

  const operatingSystem = getSpecification(
    laptop,
    [
      "operating system",
      "operating-system",
      "os",
    ],
  );

  const imageUrl =
    primaryImage?.url && !imageError
      ? primaryImage.url
      : "/placeholder-product.png";

  const handleWishlist = () => {
    setIsWishlisted((current) => !current);
  };

  return (
    <article className="group border-b border-gray-200 bg-white px-4 py-5 transition hover:bg-gray-50 sm:px-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:gap-7">
        {/* ================================================== */}
        {/* PRODUCT IMAGE */}
        {/* ================================================== */}

        <div className="relative w-full shrink-0 lg:w-56">
          <div className="relative flex h-52 w-full items-center justify-center sm:h-56">
            <Link
              href={`/laptops/${laptop.slug}`}
              className="relative h-full w-full"
            >
              <Image
                src={imageUrl}
                alt={
                  primaryImage?.altText ||
                  laptop.name
                }
                fill
                sizes="(max-width: 1024px) 100vw, 224px"
                className="object-contain p-3 transition duration-200 group-hover:scale-[1.03]"
                onError={() =>
                  setImageError(true)
                }
              />
            </Link>
          </div>

          {/* Wishlist */}
          <button
            type="button"
            onClick={handleWishlist}
            className={`absolute right-1 top-1 flex h-9 w-9 items-center justify-center rounded-full border bg-white shadow-sm transition ${
              isWishlisted
                ? "border-red-200 text-red-500"
                : "border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-500"
            }`}
            aria-label={
              isWishlisted
                ? `Remove ${laptop.name} from wishlist`
                : `Add ${laptop.name} to wishlist`
            }
          >
            <HeartIcon
              filled={isWishlisted}
            />
          </button>

          {/* Compare */}
          <label className="mt-2 flex cursor-pointer items-center justify-center gap-2 text-sm text-gray-600">
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

            <span>Compare</span>
          </label>
        </div>

        {/* ================================================== */}
        {/* PRODUCT INFORMATION */}
        {/* ================================================== */}

        <div className="min-w-0 flex-1">
          {/* Brand */}
          {laptop.brand?.name && (
            <div className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
              {laptop.brand.name}
            </div>
          )}

          {/* Product name */}
          <Link
            href={`/laptops/${laptop.slug}`}
            className="block text-base font-semibold leading-6 text-gray-900 transition hover:text-blue-600 sm:text-lg"
          >
            {laptop.name}
          </Link>

          {/* Rating */}
          {laptop.rating !== null &&
  laptop.rating !== undefined &&
  (laptop.reviewCount ?? 0) > 0 && (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1 rounded bg-green-600 px-2 py-1 text-xs font-semibold text-white">
        <span aria-hidden="true">★</span>
        {laptop.rating.toFixed(1)}
      </span>

      <span className="text-xs text-gray-500">
        {laptop.reviewCount}{" "}
        {laptop.reviewCount === 1
          ? "Review"
          : "Reviews"}
      </span>
    </div>
  )}

          {/* ================================================== */}
          {/* SPECIFICATIONS */}
          {/* ================================================== */}

          <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
            {processor && (
              <div className="flex min-w-0 gap-2">
                <span className="shrink-0 font-medium text-gray-600">
                  Processor
                </span>

                <span className="truncate text-gray-700">
                  {processor}
                </span>
              </div>
            )}

            {ram && (
              <div className="flex min-w-0 gap-2">
                <span className="shrink-0 font-medium text-gray-600">
                  RAM
                </span>

                <span className="truncate text-gray-700">
                  {ram}
                </span>
              </div>
            )}

            {storage && (
              <div className="flex min-w-0 gap-2">
                <span className="shrink-0 font-medium text-gray-600">
                  Storage
                </span>

                <span className="truncate text-gray-700">
                  {storage}
                  {storageType
                    ? ` ${storageType}`
                    : ""}
                </span>
              </div>
            )}

            {screenSize && (
              <div className="flex min-w-0 gap-2">
                <span className="shrink-0 font-medium text-gray-600">
                  Screen
                </span>

                <span className="truncate text-gray-700">
                  {screenSize}"
                </span>
              </div>
            )}

            {!screenSize && display && (
              <div className="flex min-w-0 gap-2">
                <span className="shrink-0 font-medium text-gray-600">
                  Display
                </span>

                <span className="truncate text-gray-700">
                  {display}
                </span>
              </div>
            )}

            {graphics && (
              <div className="flex min-w-0 gap-2">
                <span className="shrink-0 font-medium text-gray-600">
                  Graphics
                </span>

                <span className="truncate text-gray-700">
                  {graphics}
                </span>
              </div>
            )}

            {operatingSystem && (
              <div className="flex min-w-0 gap-2">
                <span className="shrink-0 font-medium text-gray-600">
                  OS
                </span>

                <span className="truncate text-gray-700">
                  {operatingSystem}
                </span>
              </div>
            )}
          </div>

          {/* Variant chips */}
          {laptop.variants?.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {laptop.variants
                .slice(0, 3)
                .map((variant) => {
                  const variantText = [
                    variant.ram,
                    variant.storage,
                    variant.color,
                  ]
                    .filter(Boolean)
                    .join(" • ");

                  if (!variantText) {
                    return null;
                  }

                  return (
                    <span
                      key={variant.id}
                      className="rounded border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-600"
                    >
                      {variantText}
                    </span>
                  );
                })}
            </div>
          ) : null}

          {/* Short description */}
          {laptop.shortDescription && (
            <p className="mt-4 line-clamp-2 text-xs leading-5 text-gray-500">
              {laptop.shortDescription}
            </p>
          )}

          {/* Mobile actions */}
          <div className="mt-5 flex flex-wrap items-center gap-4 lg:hidden">
            <Link
              href={`/laptops/${laptop.slug}`}
              className="text-sm font-semibold text-blue-600 hover:text-blue-800"
            >
              View Details →
            </Link>

            {seller?.name && (
              <span className="text-xs text-gray-500">
                Available on{" "}
                <span className="font-medium text-gray-700">
                  {seller.name}
                </span>
              </span>
            )}
          </div>
        </div>

        {/* ================================================== */}
        {/* PRICE */}
        {/* ================================================== */}

        <div className="flex w-full shrink-0 flex-col border-t border-gray-100 pt-4 lg:w-48 lg:border-t-0 lg:border-l lg:pl-6 lg:pt-0">
          {lowestPrice !== null ? (
            <>
              <div className="text-2xl font-bold tracking-tight text-gray-900">
                {formatPrice(
                  lowestPrice,
                )}
              </div>

              <div className="mt-1 text-xs text-gray-500">
                Lowest price
              </div>

              {seller?.name && (
                <div className="mt-3 text-xs text-gray-500">
                  Buy from{" "}
                  <span className="font-semibold text-gray-700">
                    {seller.name}
                  </span>
                </div>
              )}

              <div className="mt-4 flex items-center gap-2 rounded-md bg-green-50 px-3 py-2 text-xs font-medium text-green-700">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-white">
                  <CheckIcon />
                </span>

                Best available price
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

          <Link
            href={`/laptops/${laptop.slug}`}
            className="mt-3 hidden text-center text-xs font-medium text-gray-500 hover:text-blue-600 lg:block"
          >
            Compare prices from sellers
          </Link>
        </div>
      </div>
    </article>
  );
}
