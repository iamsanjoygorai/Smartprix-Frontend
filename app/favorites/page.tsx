"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import {
  getFavorites,
  removeFavorite,
  type Favorite,
} from "@/lib/api/favorites";

const PLACEHOLDER_IMAGE =
  "/images/mobile-placeholder.png";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5000/api";

const BACKEND_URL = API_URL.replace(
  /\/api\/?$/,
  "",
);

/* =========================================================
   HELPERS
========================================================= */

function getImageUrl(
  value?: string | null,
): string {
  if (!value) {
    return PLACEHOLDER_IMAGE;
  }

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:")
  ) {
    return value;
  }

  if (value.startsWith("/")) {
    if (value.startsWith("/uploads/")) {
      return `${BACKEND_URL}${value}`;
    }

    return value;
  }

  return `${BACKEND_URL}/${value.replace(/^\/+/, "")}`;
}

function getProductImage(
  favorite: Favorite,
): string {
  const images =
    favorite.product.images ?? [];

  const primary =
    images.find(
      (image) => image.isPrimary,
    ) ?? images[0];

  return getImageUrl(primary?.url);
}

function formatPrice(
  value: unknown,
): string {
  const price = Number(value);

  if (!Number.isFinite(price) || price <= 0) {
    return "Price unavailable";
  }

  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    },
  ).format(price);
}

function getLowestPrice(
  favorite: Favorite,
): number | null {
  const prices =
    favorite.product.prices ?? [];

  const validPrices = prices
    .map((price) => Number(price.price))
    .filter(
      (price) =>
        Number.isFinite(price) &&
        price > 0,
    );

  if (!validPrices.length) {
    return null;
  }

  return Math.min(...validPrices);
}

function getSellerName(
  favorite: Favorite,
): string | null {
  const prices =
    favorite.product.prices ?? [];

  const lowest = prices
    .filter((price) => {
      const value = Number(price.price);

      return (
        Number.isFinite(value) &&
        value > 0
      );
    })
    .sort(
      (a, b) =>
        Number(a.price) -
        Number(b.price),
    )[0];

  return (
    lowest?.seller?.name ??
    null
  );
}

function formatDate(
  value: string,
): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  ).format(date);
}

/* =========================================================
   ICON
========================================================= */

function Icon({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="flex h-5 w-5 items-center justify-center">
      {children}
    </span>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function FavoritesPage() {
  const router = useRouter();

  const [favorites, setFavorites] =
    useState<Favorite[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [removingId, setRemovingId] =
    useState<string | null>(null);

  const [error, setError] =
    useState("");

  /* =======================================================
     LOAD FAVORITES
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    async function loadFavorites() {
      try {
        const token =
          localStorage.getItem(
            "smartprix_token",
          );

        if (!token) {
          router.replace("/login");
          return;
        }

        const result =
          await getFavorites();

        if (!mounted) {
          return;
        }

        if (!result.success) {
          if (
            /authentication|required|unauthorized|token|login/i.test(
              result.message ?? "",
            )
          ) {
            localStorage.removeItem(
              "smartprix_token",
            );

            localStorage.removeItem(
              "smartprix_user",
            );

            router.replace("/login");
            return;
          }

          setError(
            result.message ??
              "Failed to load favorites",
          );

          return;
        }

        setFavorites(
          result.data ?? [],
        );
      } catch (err) {
        console.error(
          "Favorites page error:",
          err,
        );

        if (mounted) {
          setError(
            "Unable to load your favorites. Please try again.",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadFavorites();

    return () => {
      mounted = false;
    };
  }, [router]);

  /* =======================================================
     REMOVE FAVORITE
  ======================================================= */

  async function handleRemove(
    productId: string,
  ) {
    if (removingId) {
      return;
    }

    setRemovingId(productId);
    setError("");

    try {
      const result =
        await removeFavorite(
          productId,
        );

      if (!result.success) {
        setError(
          result.message ??
            "Failed to remove favorite",
        );

        return;
      }

      setFavorites((current) =>
        current.filter(
          (favorite) =>
            favorite.productId !==
            productId,
        ),
      );

      /*
       * Keep local profile data in sync
       * where possible.
       *
       * The actual /profile count is
       * always refreshed from the backend.
       */
    } catch (err) {
      console.error(
        "Remove favorite error:",
        err,
      );

      setError(
        "Unable to remove this favorite.",
      );
    } finally {
      setRemovingId(null);
    }
  }

  const favoriteCount =
    favorites.length;

  const subtitle = useMemo(() => {
    if (favoriteCount === 0) {
      return "Products you save will appear here.";
    }

    if (favoriteCount === 1) {
      return "1 product saved to your favorites.";
    }

    return `${favoriteCount} products saved to your favorites.`;
  }, [favoriteCount]);

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f1f3f6]">
        <div className="mx-auto max-w-[1100px] px-4 py-6 sm:px-6 lg:px-8">
          {/* Header skeleton */}
          <div className="mb-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />

            <div className="mt-3 h-8 w-56 animate-pulse rounded-lg bg-slate-200" />

            <div className="mt-3 h-4 w-72 animate-pulse rounded bg-slate-100" />
          </div>

          {/* Card skeletons */}
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100"
              >
                <div className="flex gap-5">
                  <div className="h-[190px] w-[150px] shrink-0 animate-pulse rounded-2xl bg-slate-100" />

                  <div className="flex-1">
                    <div className="h-3 w-20 animate-pulse rounded bg-slate-100" />

                    <div className="mt-3 h-6 w-64 animate-pulse rounded bg-slate-200" />

                    <div className="mt-5 h-7 w-32 animate-pulse rounded bg-slate-200" />

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="h-10 animate-pulse rounded-xl bg-slate-100" />
                      <div className="h-10 animate-pulse rounded-xl bg-slate-100" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <main className="min-h-screen bg-[#f1f3f6]">
      <div className="mx-auto max-w-[1100px] px-4 py-6 sm:px-6 lg:px-8">
        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <section
          className="
            relative mb-6 overflow-hidden
            rounded-3xl
            bg-white
            shadow-sm
            ring-1 ring-slate-100
          "
        >
          {/* Decorative background */}
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-pink-100/60 blur-3xl" />

          <div className="pointer-events-none absolute -left-20 bottom-0 h-48 w-48 rounded-full bg-indigo-100/50 blur-3xl" />

          <div className="relative p-6 sm:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className="
                      flex h-9 w-9
                      items-center justify-center
                      rounded-xl
                      bg-pink-50
                      text-pink-500
                      ring-1 ring-pink-100
                    "
                  >
                    <Icon>
                      <svg
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
                    </Icon>
                  </span>

                  <span className="text-[10px] font-black uppercase tracking-[0.18em] text-pink-500">
                    Your Collection
                  </span>
                </div>

                <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                  My Favorites
                </h1>

                <p className="mt-1.5 text-sm text-slate-500">
                  {subtitle}
                </p>
              </div>

              <Link
                href="/mobiles"
                className="
                  inline-flex h-11
                  items-center justify-center
                  gap-2
                  rounded-xl
                  bg-indigo-600
                  px-5
                  text-sm font-bold
                  text-white
                  shadow-sm shadow-indigo-200
                  transition-all duration-200
                  hover:-translate-y-0.5
                  hover:bg-indigo-700
                  hover:shadow-md
                "
              >
                <span>Explore Mobiles</span>

                <span className="text-base">
                  →
                </span>
              </Link>
            </div>

            {/* Count strip */}
            <div className="mt-6 flex items-center gap-3">
              <div className="rounded-full bg-pink-50 px-3 py-1.5 text-[11px] font-extrabold text-pink-600 ring-1 ring-pink-100">
                {favoriteCount}{" "}
                {favoriteCount === 1
                  ? "Saved Product"
                  : "Saved Products"}
              </div>

              <div className="h-px flex-1 bg-gradient-to-r from-pink-100 via-slate-100 to-transparent" />
            </div>
          </div>
        </section>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div
            className="
              mb-5 flex items-start gap-3
              rounded-2xl
              border border-red-100
              bg-red-50
              px-4 py-3
              text-sm text-red-600
            "
          >
            <span className="font-black">
              !
            </span>

            <span>{error}</span>
          </div>
        )}

        {/* =================================================
            EMPTY STATE
        ================================================= */}

        {!favorites.length && (
          <section
            className="
              overflow-hidden
              rounded-3xl
              border border-slate-100
              bg-white
              shadow-sm
            "
          >
            <div className="relative px-6 py-16 text-center sm:px-10">
              {/* Decorative circles */}
              <div className="pointer-events-none absolute left-1/2 top-0 h-44 w-44 -translate-x-1/2 rounded-full bg-pink-50 blur-3xl" />

              <div
                className="
                  relative mx-auto
                  flex h-20 w-20
                  items-center justify-center
                  rounded-[24px]
                  bg-gradient-to-br
                  from-pink-50
                  to-rose-100
                  text-pink-500
                  shadow-sm
                  ring-1 ring-pink-100
                "
              >
                <svg
                  width="34"
                  height="34"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </div>

              <h2 className="relative mt-6 text-xl font-black text-slate-900">
                Your favorites are empty
              </h2>

              <p className="relative mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Found a phone you love?
                Save it here and easily
                compare prices whenever
                you want.
              </p>

              <Link
                href="/mobiles"
                className="
                  relative mt-7
                  inline-flex h-11
                  items-center justify-center
                  gap-2
                  rounded-xl
                  bg-indigo-600
                  px-6
                  text-sm font-bold
                  text-white
                  shadow-md shadow-indigo-200
                  transition-all duration-200
                  hover:-translate-y-0.5
                  hover:bg-indigo-700
                "
              >
                Browse Mobiles
                <span>→</span>
              </Link>
            </div>
          </section>
        )}

        {/* =================================================
            FAVORITE LIST
        ================================================= */}

        {favorites.length > 0 && (
          <div className="space-y-4">
            {favorites.map(
              (favorite) => {
                const product =
                  favorite.product;

                const image =
                  getProductImage(
                    favorite,
                  );

                const lowestPrice =
                  getLowestPrice(
                    favorite,
                  );

                const seller =
                  getSellerName(
                    favorite,
                  );

                const isRemoving =
                  removingId ===
                  favorite.productId;

                return (
                  <article
                    key={favorite.id}
                    className="
                      group relative
                      overflow-hidden
                      rounded-3xl
                      border border-slate-100
                      bg-white
                      shadow-sm
                      transition-all duration-300
                      hover:-translate-y-0.5
                      hover:shadow-xl
                      hover:shadow-slate-200/50
                    "
                  >
                    <div className="p-4 sm:p-5 lg:p-6">
                      <div className="flex flex-col gap-5 md:flex-row">
                        {/* =================================
                            IMAGE
                        ================================= */}

                        <div className="relative flex shrink-0 justify-center md:w-[185px]">
                          <div
                            className="
                              relative
                              flex h-[210px] w-[165px]
                              items-center justify-center
                              overflow-hidden
                              rounded-2xl
                              bg-gradient-to-b
                              from-slate-50
                              via-white
                              to-slate-50
                              ring-1 ring-slate-100
                              transition-all duration-300
                              group-hover:ring-indigo-100
                            "
                          >
                            {/* Mobile label */}
                            <div className="absolute left-3 top-3 z-20 rounded-full bg-white px-2.5 py-1 text-[8px] font-black uppercase tracking-wider text-slate-400 shadow-sm ring-1 ring-slate-100">
                              Mobile
                            </div>

                            {/* Image */}
                            <div className="absolute inset-x-5 bottom-5 h-8 rounded-full bg-slate-300/25 blur-2xl" />

                            <Link
                              href={`/mobiles/${product.slug}`}
                              className="relative z-10 flex h-full w-full items-center justify-center"
                            >
                              <img
                                src={image}
                                alt={
                                  product.name
                                }
                                className="
                                  h-[175px]
                                  w-[140px]
                                  object-contain
                                  drop-shadow-[0_16px_18px_rgba(15,23,42,0.15)]
                                  transition-transform duration-500
                                  group-hover:scale-[1.06]
                                "
                                onError={(
                                  event,
                                ) => {
                                  const target =
                                    event.currentTarget;

                                  if (
                                    target.src.endsWith(
                                      PLACEHOLDER_IMAGE,
                                    )
                                  ) {
                                    return;
                                  }

                                  target.src =
                                    PLACEHOLDER_IMAGE;
                                }}
                              />
                            </Link>

                            {/* Remove favorite */}
                            <button
                              type="button"
                              onClick={() =>
                                handleRemove(
                                  favorite.productId,
                                )
                              }
                              disabled={
                                isRemoving
                              }
                              aria-label={`Remove ${product.name} from favorites`}
                              className="
                                absolute right-2 top-2 z-30
                                flex h-9 w-9
                                items-center justify-center
                                rounded-full
                                border border-pink-100
                                bg-white/95
                                text-pink-500
                                shadow-sm
                                backdrop-blur
                                transition-all duration-200
                                hover:border-pink-200
                                hover:bg-pink-50
                                hover:text-pink-600
                                disabled:cursor-wait
                                disabled:opacity-60
                              "
                            >
                              {isRemoving ? (
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-pink-200 border-t-pink-500" />
                              ) : (
                                <svg
                                  width="18"
                                  height="18"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                >
                                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* =================================
                            CONTENT
                        ================================= */}

                        <div className="min-w-0 flex-1">
                          {/* Brand */}
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <p className="mb-1 text-[10px] font-black uppercase tracking-[0.16em] text-indigo-500">
                                {product.brand?.name ??
                                  product.category?.name ??
                                  "Smartphone"}
                              </p>

                              <Link
                                href={`/mobiles/${product.slug}`}
                                className="group/title"
                              >
                                <h2
                                  className="
                                    text-[19px]
                                    font-extrabold
                                    leading-6
                                    text-slate-900
                                    transition-colors
                                    group-hover/title:text-indigo-600
                                    sm:text-[21px]
                                  "
                                >
                                  {
                                    product.name
                                  }
                                </h2>
                              </Link>
                            </div>

                            {/* Saved badge */}
                            <span
                              className="
                                flex shrink-0
                                items-center gap-1.5
                                self-start
                                rounded-full
                                bg-pink-50
                                px-3 py-1.5
                                text-[9px]
                                font-black
                                uppercase
                                tracking-wider
                                text-pink-600
                                ring-1 ring-pink-100
                              "
                            >
                              <span>
                                ♥
                              </span>
                              Saved
                            </span>
                          </div>

                          {/* Price */}
                          <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
                            <div>
                              <div className="flex flex-wrap items-baseline gap-2">
                                <span className="text-[24px] font-black tracking-tight text-slate-900">
                                  {lowestPrice !==
                                  null
                                    ? formatPrice(
                                        lowestPrice,
                                      )
                                    : "Price unavailable"}
                                </span>

                                {lowestPrice !==
                                  null && (
                                  <span className="text-[11px] font-semibold text-slate-400">
                                    onwards
                                  </span>
                                )}
                              </div>

                              <p className="mt-0.5 text-[11px] text-slate-400">
                                Lowest price
                                {seller
                                  ? ` on ${seller}`
                                  : ""}
                              </p>
                            </div>

                            <Link
                              href={`/mobiles/${product.slug}`}
                              className="
                                rounded-xl
                                bg-indigo-600
                                px-4 py-2
                                text-[11px]
                                font-bold
                                text-white
                                shadow-sm
                                shadow-indigo-200
                                transition-all duration-200
                                hover:bg-indigo-700
                                hover:shadow-md
                              "
                            >
                              View Prices
                            </Link>
                          </div>

                          {/* Actions */}
                          <div className="mt-5 flex flex-wrap items-center gap-2 border-y border-slate-100 py-2.5">
                            <button
                              type="button"
                              onClick={() =>
                                handleRemove(
                                  favorite.productId,
                                )
                              }
                              disabled={
                                isRemoving
                              }
                              className="
                                rounded-lg
                                px-2.5 py-1.5
                                text-[11px]
                                font-bold
                                text-pink-600
                                transition
                                hover:bg-pink-50
                                disabled:opacity-50
                              "
                            >
                              {isRemoving
                                ? "Removing..."
                                : "♥ Remove"}
                            </button>

                            <Link
                              href={`/mobiles/${product.slug}`}
                              className="
                                rounded-lg
                                px-2.5 py-1.5
                                text-[11px]
                                font-bold
                                text-indigo-600
                                transition
                                hover:bg-indigo-50
                              "
                            >
                              View Details →
                            </Link>

                            <span className="ml-auto text-[10px] font-medium text-slate-400">
                              Saved{" "}
                              {formatDate(
                                favorite.createdAt,
                              )}
                            </span>
                          </div>

                          {/* Product details */}
                          <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                            {product.brand?.name && (
                              <FavoriteDetail
                                icon="◆"
                                label="Brand"
                                value={
                                  product
                                    .brand
                                    .name
                                }
                              />
                            )}

                            {product.category?.name && (
                              <FavoriteDetail
                                icon="▣"
                                label="Category"
                                value={
                                  product
                                    .category
                                    .name
                                }
                              />
                            )}

                            {product.prices &&
                              product.prices
                                .length >
                                0 && (
                                <FavoriteDetail
                                  icon="₹"
                                  label="Offers"
                                  value={`${product.prices.length} price${
                                    product.prices.length ===
                                    1
                                      ? ""
                                      : "s"
                                  }`}
                                />
                              )}
                          </div>

                          {/* Description */}
                          {product.shortDescription && (
                            <p className="mt-4 line-clamp-2 text-[11px] leading-5 text-slate-400">
                              {
                                product.shortDescription
                              }
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Premium bottom line */}
                    <div
                      className="
                        absolute bottom-0 left-0
                        h-[3px] w-0
                        bg-gradient-to-r
                        from-indigo-500
                        via-purple-500
                        to-pink-500
                        transition-all duration-500
                        group-hover:w-full
                      "
                    />
                  </article>
                );
              },
            )}
          </div>
        )}

        {/* =================================================
            FOOTER NAVIGATION
        ================================================= */}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-sm">
          <Link
            href="/account"
            className="text-[11px] font-bold text-slate-500 transition hover:text-indigo-600"
          >
            ← Back to My Account
          </Link>

          <Link
            href="/mobiles"
            className="text-[11px] font-bold text-indigo-600 transition hover:text-indigo-700"
          >
            Continue Shopping →
          </Link>
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   FAVORITE DETAIL
========================================================= */

function FavoriteDetail({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-2.5 ring-1 ring-slate-100">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-[11px] font-black text-slate-500 shadow-sm ring-1 ring-slate-100">
        {icon}
      </span>

      <div className="min-w-0">
        <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p
          className="truncate text-[11px] font-bold text-slate-700"
          title={value}
        >
          {value}
        </p>
      </div>
    </div>
  );
}