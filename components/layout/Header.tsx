"use client";

import Link from "next/link";
import {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

const RECENT_SEARCH_KEY = "smartprix_recent_searches";
const MAX_STORED_RECENT_SEARCHES = 20;
const MAX_VISIBLE_RECENT_SEARCHES = 8;
const MAX_VISIBLE_PRODUCTS = 6;
const MAX_VISIBLE_BRANDS = 5;
const MAX_VISIBLE_CATEGORIES = 5;
const MAX_VISIBLE_POPULAR = 5;

interface SearchProduct {
  id?: string;
  slug?: string;
  name?: string;

  // Phase 2 API returns a single image string
  image?: string | null;

  // Keep this for compatibility with older API responses
  images?: Array<{
    id?: string;
    url?: string;
    altText?: string | null;
    sortOrder?: number | null;
    isPrimary?: boolean;
  }>;

  brand?: {
    id?: string;
    name?: string;
    slug?: string;
  } | null;
}

interface SearchBrand {
  id?: string;
  name?: string;
  slug?: string;
  logoUrl?: string | null;
}

interface SearchCategory {
  id?: string;
  name?: string;
  slug?: string;
  imageUrl?: string | null;
}

interface SearchSuggestionResponse {
  products: SearchProduct[];
  brands: SearchBrand[];
  categories: SearchCategory[];
  popular: unknown[];
}

type SuggestionType =
  | "product"
  | "brand"
  | "category"
  | "popular";

interface KeyboardSuggestion {
  type: SuggestionType;
  value: string;
  product?: SearchProduct;
  brand?: SearchBrand;
  category?: SearchCategory;
}

function getImageUrl(url?: string | null) {
  if (!url) return null;

  let value = url.trim();

  if (!value) return null;

  // Handle accidental markdown image syntax
  const markdownMatch = value.match(/\]\((https?:\/\/[^)]+)\)/);

  if (markdownMatch?.[1]) {
    value = markdownMatch[1];
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return `${API_URL.replace(/\/api\/?$/, "")}/${value.replace(
    /^\/+/,
    "",
  )}`;
}

function getProductImage(product: SearchProduct) {
  if (product.image) {
    return getImageUrl(product.image);
  }

  const images = [...(product.images ?? [])].sort(
    (a, b) =>
      Number(b.isPrimary) - Number(a.isPrimary) ||
      (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
  );

  return getImageUrl(images[0]?.url);
}

function getShortProductName(name?: string) {
  if (!name) return "Product";

  let value = name;

  // Remove common variant/storage/RAM information
  value = value
    .replace(/\([^)]*\)/g, " ")
    .replace(/\b\d+\s*(GB|TB)\b/gi, " ")
    .replace(/\b\d+\s*GB\s*RAM\b/gi, " ")
    .replace(
      /\b(5G|4G|LTE|WiFi|Wi-Fi|Dual SIM|Single SIM)\b/gi,
      " ",
    )
    .replace(/\s+/g, " ")
    .trim();

  const words = value.split(" ").filter(Boolean);

  if (words.length > 5) {
    return `${words.slice(0, 5).join(" ")}…`;
  }

  return value;
}

function getPopularText(item: unknown) {
  if (typeof item === "string") {
    return item.trim();
  }

  if (
    item &&
    typeof item === "object"
  ) {
    const record =
      item as Record<string, unknown>;

    return String(
      record.query ??
        record.name ??
        record.title ??
        record.text ??
        "",
    ).trim();
  }

  return "";
}

const recordSearch = async (query: string) => {
  try {
    await fetch(`${API_URL}/search/record`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query,
      }),
    });
  } catch (error) {
    /*
     * Analytics must never prevent the actual search.
     */
    console.error(
      "Failed to record search:",
      error,
    );
  }
};




export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const searchInputRef = useRef<HTMLInputElement>(null);

  const [search, setSearch] = useState(
    () => searchParams.get("search") || "",
  );

  const [suggestions, setSuggestions] =
    useState<SearchSuggestionResponse>({
      products: [],
      brands: [],
      categories: [],
      popular: [],
    });

  const [loading, setLoading] = useState(false);

  const [recentSearches, setRecentSearches] =
    useState<string[]>([]);

  const [showDropdown, setShowDropdown] = useState(false);

  const [selectedIndex, setSelectedIndex] = useState(-1);

  /*
   * =========================================================
   * LOAD RECENT SEARCHES
   * =========================================================
   */

  useEffect(() => {
    try {
      const stored = localStorage.getItem(
        RECENT_SEARCH_KEY,
      );

      if (!stored) return;

      const parsed = JSON.parse(stored);

      if (Array.isArray(parsed)) {
        setRecentSearches(
          parsed
            .filter(
              (item): item is string =>
                typeof item === "string" &&
                item.trim().length > 0,
            )
            .slice(0, MAX_STORED_RECENT_SEARCHES),
        );
      }
    } catch (error) {
      console.error(
        "Failed to load recent searches:",
        error,
      );
    }
  }, []);

  /*
   * =========================================================
   * SAVE RECENT SEARCH
   * =========================================================
   */

  const saveRecentSearch = (value: string) => {
    const query = value.trim();

    if (!query) return;

    setRecentSearches((previous) => {
      const filtered = previous.filter(
        (item) =>
          item.toLowerCase() !== query.toLowerCase(),
      );

      const updated = [
        query,
        ...filtered,
      ].slice(0, MAX_STORED_RECENT_SEARCHES);

      try {
        localStorage.setItem(
          RECENT_SEARCH_KEY,
          JSON.stringify(updated),
        );
      } catch (error) {
        console.error(
          "Failed to save recent search:",
          error,
        );
      }

      return updated;
    });
  };

  const performSearch = (query: string) => {
  const value = query.trim();

  if (!value) return;

  saveRecentSearch(value);

  // Fire analytics without blocking navigation
  void recordSearch(value);

  setShowDropdown(false);
  setSelectedIndex(-1);

  router.push(
    `/mobiles?search=${encodeURIComponent(value)}`,
  );
};

  /*
   * =========================================================
   * REMOVE ONE RECENT SEARCH
   * =========================================================
   */

  const removeRecentSearch = (value: string) => {
    setRecentSearches((previous) => {
      const updated = previous.filter(
        (item) => item !== value,
      );

      try {
        localStorage.setItem(
          RECENT_SEARCH_KEY,
          JSON.stringify(updated),
        );
      } catch (error) {
        console.error(
          "Failed to update recent searches:",
          error,
        );
      }

      return updated;
    });
  };

  /*
   * =========================================================
   * CLEAR RECENT SEARCHES
   * =========================================================
   */

  const clearRecentSearches = () => {
    setRecentSearches([]);

    try {
      localStorage.removeItem(RECENT_SEARCH_KEY);
    } catch (error) {
      console.error(
        "Failed to clear recent searches:",
        error,
      );
    }
  };

  /*
   * =========================================================
   * PHASE 2 SEARCH SUGGESTIONS
   * =========================================================
   */

  useEffect(() => {
    const query = search.trim();

    if (!query) {
      setSuggestions({
        products: [],
        brands: [],
        categories: [],
        popular: [],
      });

      setLoading(false);
      setSelectedIndex(-1);

      return;
    }

    let cancelled = false;

    const timer = setTimeout(async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `${API_URL}/search/suggestions?q=${encodeURIComponent(
            query,
          )}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          },
        );

        if (!response.ok) {
          throw new Error(
            `Search failed: ${response.status}`,
          );
        }

        const result = await response.json();

        if (cancelled) return;

        const data = result?.data;

        setSuggestions({
          products: Array.isArray(data?.products)
            ? data.products
            : [],

          brands: Array.isArray(data?.brands)
            ? data.brands
            : [],

          categories: Array.isArray(data?.categories)
            ? data.categories
            : [],

          popular: Array.isArray(data?.popular)
            ? data.popular
            : [],
        });

        setSelectedIndex(-1);
      } catch (error) {
        if (cancelled) return;

        console.error(
          "Search suggestions error:",
          error,
        );

        setSuggestions({
          products: [],
          brands: [],
          categories: [],
          popular: [],
        });

        setSelectedIndex(-1);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      cancelled = true;
    };
  }, [search]);

  /*
   * =========================================================
   * VISIBLE DATA
   * =========================================================
   */

  const visibleProducts = useMemo(
    () =>
      suggestions.products
        .filter((product) => product?.name)
        .slice(0, MAX_VISIBLE_PRODUCTS),
    [suggestions.products],
  );

  const visibleBrands = useMemo(
    () =>
      suggestions.brands
        .filter((brand) => brand?.name)
        .slice(0, MAX_VISIBLE_BRANDS),
    [suggestions.brands],
  );

  const visibleCategories = useMemo(
    () =>
      suggestions.categories
        .filter((category) => category?.name)
        .slice(0, MAX_VISIBLE_CATEGORIES),
    [suggestions.categories],
  );

  const visiblePopular = useMemo(
    () =>
      suggestions.popular
        .map(getPopularText)
        .filter(Boolean)
        .slice(0, MAX_VISIBLE_POPULAR),
    [suggestions.popular],
  );

  const visibleRecentSearches = recentSearches.slice(
    0,
    MAX_VISIBLE_RECENT_SEARCHES,
  );

  /*
   * =========================================================
   * KEYBOARD NAVIGATION ITEMS
   * =========================================================
   */

  const keyboardItems = useMemo<KeyboardSuggestion[]>(
    () => {
      const items: KeyboardSuggestion[] = [];

      visibleProducts.forEach((product) => {
        items.push({
          type: "product",
          value: product.name ?? "",
          product,
        });
      });

      visibleBrands.forEach((brand) => {
        items.push({
          type: "brand",
          value: brand.name ?? "",
          brand,
        });
      });

      visibleCategories.forEach((category) => {
        items.push({
          type: "category",
          value: category.name ?? "",
          category,
        });
      });

      visiblePopular.forEach((popular) => {
        items.push({
          type: "popular",
          value: popular,
        });
      });

      return items;
    },
    [
      visibleProducts,
      visibleBrands,
      visibleCategories,
      visiblePopular,
    ],
  );

  /*
   * =========================================================
   * NAVIGATION
   * =========================================================
   */


  const openKeyboardSuggestion = (
    item: KeyboardSuggestion,
  ) => {
    if (!item.value.trim()) return;

    saveRecentSearch(item.value);

    setShowDropdown(false);
    setSelectedIndex(-1);

    if (
      item.type === "product" &&
      item.product?.slug
    ) {
      router.push(
        `/mobiles/${encodeURIComponent(
          item.product.slug,
        )}`,
      );

      return;
    }

    if (
      item.type === "brand" &&
      item.brand?.slug
    ) {
      router.push(
        `/mobiles?brand=${encodeURIComponent(
          item.brand.slug,
        )}`,
      );

      return;
    }

    if (
      item.type === "category" &&
      item.category?.slug
    ) {
      router.push(
        `/mobiles?category=${encodeURIComponent(
          item.category.slug,
        )}`,
      );

      return;
    }

    performSearch(item.value);
  };

  /*
   * =========================================================
   * FORM SUBMIT
   * =========================================================
   */

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (
      selectedIndex >= 0 &&
      selectedIndex < keyboardItems.length
    ) {
      openKeyboardSuggestion(
        keyboardItems[selectedIndex],
      );

      return;
    }

    performSearch(search);
  };

  /*
   * =========================================================
   * KEYBOARD
   * =========================================================
   */

  const handleKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Escape") {
      setShowDropdown(false);
      setSelectedIndex(-1);

      return;
    }

    if (
      event.key === "ArrowDown" &&
      keyboardItems.length > 0
    ) {
      event.preventDefault();

      setShowDropdown(true);

      setSelectedIndex((previous) => {
        if (
          previous >=
          keyboardItems.length - 1
        ) {
          return 0;
        }

        return previous + 1;
      });

      return;
    }

    if (
      event.key === "ArrowUp" &&
      keyboardItems.length > 0
    ) {
      event.preventDefault();

      setShowDropdown(true);

      setSelectedIndex((previous) => {
        if (previous <= 0) {
          return keyboardItems.length - 1;
        }

        return previous - 1;
      });

      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();

      if (
        selectedIndex >= 0 &&
        selectedIndex < keyboardItems.length
      ) {
        openKeyboardSuggestion(
          keyboardItems[selectedIndex],
        );

        return;
      }

      performSearch(search);
    }
  };

  /*
   * =========================================================
   * CLEAR SEARCH
   * =========================================================
   */

  const clearSearch = () => {
    setSearch("");

    setSuggestions({
      products: [],
      brands: [],
      categories: [],
      popular: [],
    });

    setSelectedIndex(-1);

    searchInputRef.current?.focus();
  };

  /*
   * =========================================================
   * RECENT SEARCH CLICK
   * =========================================================
   */

  const handleRecentSearchClick = (
    value: string,
  ) => {
    setSearch(value);
    performSearch(value);
  };

  /*
   * =========================================================
   * DROPDOWN VISIBILITY
   * =========================================================
   */

  const hasSuggestionResults =
    visibleProducts.length > 0 ||
    visibleBrands.length > 0 ||
    visibleCategories.length > 0 ||
    visiblePopular.length > 0;

  const showRecent =
    !search.trim() &&
    visibleRecentSearches.length > 0;

  const showSuggestions =
    search.trim().length > 0 &&
    (loading || hasSuggestionResults);

  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (
    <header className="sticky top-0 z-[100] w-full bg-white shadow-sm">
      <div className="mx-auto flex h-[70px] max-w-[1400px] items-center gap-5 px-4 lg:px-6">
        {/* LOGO */}
        <Link
          href="/"
          className="group flex shrink-0 items-center"
          aria-label="Smartprix Home"
        >
          <div className="text-[27px] font-black tracking-[-1.5px] text-[#111827] transition group-hover:scale-[1.02]">
            Smart
            <span className="text-[#ef4444]">
              prix
            </span>
          </div>
        </Link>

        {/* SEARCH */}
        <div className="relative flex-1">
          <form
            onSubmit={handleSubmit}
            className="relative"
          >
            <div
              className={`flex h-[46px] items-center overflow-hidden rounded-[11px] border bg-white transition-all ${
                showDropdown
                  ? "border-[#2563eb] shadow-[0_0_0_3px_rgba(37,99,235,0.10)]"
                  : "border-[#d7dce3] hover:border-[#b9c1cc]"
              }`}
            >
              {/* SEARCH ICON */}
              <div className="flex w-[48px] shrink-0 items-center justify-center text-[#687386]">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle
                    cx="11"
                    cy="11"
                    r="7"
                  />
                  <path d="m20 20-3.5-3.5" />
                </svg>
              </div>

              {/* INPUT */}
              <input
                ref={searchInputRef}
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setShowDropdown(true);
                  setSelectedIndex(-1);
                }}
                onFocus={() => {
                  setShowDropdown(true);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search mobiles, laptops, brands and more..."
                className="h-full min-w-0 flex-1 bg-transparent pr-3 text-[14px] font-medium text-[#111827] outline-none placeholder:text-[#8b95a5]"
                aria-label="Search Smartprix"
                autoComplete="off"
              />

              {/* LOADING */}
              {loading && (
                <div className="mr-3 h-[18px] w-[18px] shrink-0 animate-spin rounded-full border-2 border-[#d7dce3] border-t-[#2563eb]" />
              )}

              {/* CLEAR */}
              {!loading && search && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="mr-2 flex h-8 w-8 items-center justify-center rounded-full text-[#7b8493] transition hover:bg-[#f1f3f6] hover:text-[#111827]"
                  aria-label="Clear search"
                >
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M6 6l12 12" />
                    <path d="M18 6L6 18" />
                  </svg>
                </button>
              )}

              {/* SEARCH BUTTON */}
              <button
                type="submit"
                className="mr-1.5 flex h-9 w-10 shrink-0 items-center justify-center rounded-[8px] bg-[#2563eb] text-white transition hover:bg-[#1d4ed8] active:scale-95"
                aria-label="Search"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle
                    cx="11"
                    cy="11"
                    r="7"
                  />
                  <path d="m20 20-3.5-3.5" />
                </svg>
              </button>
            </div>
          </form>

          {/* =================================================
              DROPDOWN
          ================================================= */}

          {showDropdown && (
            <div
              className="absolute left-0 right-0 top-[53px] overflow-hidden rounded-[14px] border border-[#e1e5eb] bg-white shadow-[0_18px_50px_rgba(15,23,42,0.16)]"
              onMouseDown={(event) => {
                event.preventDefault();
              }}
            >
              {/* RECENT SEARCHES */}
              {showRecent && (
                <div className="max-h-[430px] overflow-y-auto py-2">
                  <div className="flex items-center justify-end border-b border-[#f0f2f5] px-4 py-2">
                    <button
                      type="button"
                      onClick={clearRecentSearches}
                      className="text-[12px] font-semibold text-[#6b7280] transition hover:text-[#ef4444]"
                    >
                      Clear all
                    </button>
                  </div>

                  {visibleRecentSearches.map(
                    (item, index) => (
                      <button
                        key={`${item}-${index}`}
                        type="button"
                        onClick={() =>
                          handleRecentSearchClick(item)
                        }
                        className="group flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-[#f7f9fc]"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f1f3f6] text-[#697386]">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle
                              cx="12"
                              cy="12"
                              r="9"
                            />
                            <path d="M12 7v5l3 2" />
                          </svg>
                        </div>

                        <span className="min-w-0 flex-1 truncate text-[14px] font-medium text-[#374151]">
                          {item}
                        </span>

                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(event) => {
                            event.stopPropagation();
                            removeRecentSearch(item);
                          }}
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#9ca3af] opacity-0 transition group-hover:opacity-100 hover:bg-[#fee2e2] hover:text-[#ef4444]"
                          aria-label={`Remove ${item}`}
                        >
                          ×
                        </span>
                      </button>
                    ),
                  )}
                </div>
              )}

              {/* SEARCH RESULTS */}
              {showSuggestions && (
                <div className="max-h-[520px] overflow-y-auto py-2">
                  {/* PRODUCTS */}
                  {visibleProducts.length > 0 && (
                    <div className="px-2 pb-2">
                      <div className="px-3 pb-2 pt-2 text-[11px] font-bold uppercase tracking-[0.08em] text-[#8a94a6]">
                        Products
                      </div>

                      {visibleProducts.map(
                        (product) => {
                          const index =
                            keyboardItems.findIndex(
                              (item) =>
                                item.type ===
                                  "product" &&
                                item.product?.id ===
                                  product.id,
                            );

                          const image =
                            getProductImage(product);

                          const isSelected =
                            selectedIndex === index;

                          return (
                            <button
                              key={
                                product.id ??
                                product.slug ??
                                product.name
                              }
                              type="button"
                              onClick={() =>
                                openKeyboardSuggestion({
                                  type: "product",
                                  value:
                                    product.name ?? "",
                                  product,
                                })
                              }
                              className={`flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left transition ${
                                isSelected
                                  ? "bg-[#eff6ff]"
                                  : "hover:bg-[#f7f9fc]"
                              }`}
                            >
                              <div className="flex h-[46px] w-[42px] shrink-0 items-center justify-center overflow-hidden rounded-[7px] border border-[#edf0f3] bg-white">
                                {image ? (
                                  <img
                                    src={image}
                                    alt={
                                      product.name ??
                                      "Product"
                                    }
                                    className="h-full w-full object-contain p-1"
                                  />
                                ) : (
                                  <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.7"
                                  >
                                    <rect
                                      x="5"
                                      y="2"
                                      width="14"
                                      height="20"
                                      rx="2"
                                    />
                                    <path d="M10 18h4" />
                                  </svg>
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="truncate text-[14px] font-semibold text-[#202734]">
                                  {getShortProductName(
                                    product.name,
                                  )}
                                </div>

                                <div className="mt-0.5 text-[11px] text-[#8b95a5]">
                                  {product.brand?.name ??
                                    "Product"}
                                </div>
                              </div>

                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="shrink-0 text-[#a3acba]"
                              >
                                <path d="m9 18 6-6-6-6" />
                              </svg>
                            </button>
                          );
                        },
                      )}
                    </div>
                  )}

                  {/* BRANDS */}
                  {visibleBrands.length > 0 && (
                    <div className="border-t border-[#f0f2f5] px-2 py-2">
                      <div className="px-3 pb-2 pt-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#8a94a6]">
                        Brands
                      </div>

                      {visibleBrands.map((brand) => {
                        const index =
                          keyboardItems.findIndex(
                            (item) =>
                              item.type === "brand" &&
                              item.brand?.id ===
                                brand.id,
                          );

                        const isSelected =
                          selectedIndex === index;

                        const logo =
                          getImageUrl(
                            brand.logoUrl,
                          );

                        return (
                          <button
                            key={
                              brand.id ??
                              brand.slug ??
                              brand.name
                            }
                            type="button"
                            onClick={() =>
                              openKeyboardSuggestion({
                                type: "brand",
                                value:
                                  brand.name ?? "",
                                brand,
                              })
                            }
                            className={`flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left transition ${
                              isSelected
                                ? "bg-[#eff6ff]"
                                : "hover:bg-[#f7f9fc]"
                            }`}
                          >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#e6e9ee] bg-[#f8fafc]">
                              {logo ? (
                                <img
                                  src={logo}
                                  alt=""
                                  className="h-full w-full object-contain p-1.5"
                                />
                              ) : (
                                <span className="text-[13px] font-extrabold text-[#64748b]">
                                  {(
                                    brand.name ??
                                    "B"
                                  )
                                    .charAt(0)
                                    .toUpperCase()}
                                </span>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="truncate text-[14px] font-semibold text-[#202734]">
                                {brand.name}
                              </div>

                              <div className="text-[11px] text-[#8b95a5]">
                                Brand
                              </div>
                            </div>

                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              className="text-[#a3acba]"
                            >
                              <path d="m9 18 6-6-6-6" />
                            </svg>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* CATEGORIES */}
                  {visibleCategories.length > 0 && (
                    <div className="border-t border-[#f0f2f5] px-2 py-2">
                      <div className="px-3 pb-2 pt-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#8a94a6]">
                        Categories
                      </div>

                      {visibleCategories.map(
                        (category) => {
                          const index =
                            keyboardItems.findIndex(
                              (item) =>
                                item.type ===
                                  "category" &&
                                item.category?.id ===
                                  category.id,
                            );

                          const isSelected =
                            selectedIndex === index;

                          return (
                            <button
                              key={
                                category.id ??
                                category.slug ??
                                category.name
                              }
                              type="button"
                              onClick={() =>
                                openKeyboardSuggestion({
                                  type: "category",
                                  value:
                                    category.name ??
                                    "",
                                  category,
                                })
                              }
                              className={`flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left transition ${
                                isSelected
                                  ? "bg-[#eff6ff]"
                                  : "hover:bg-[#f7f9fc]"
                              }`}
                            >
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f1f5ff] text-[#4f6fd8]">
                                <svg
                                  width="17"
                                  height="17"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.8"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <rect
                                    x="3"
                                    y="3"
                                    width="7"
                                    height="7"
                                    rx="1"
                                  />
                                  <rect
                                    x="14"
                                    y="3"
                                    width="7"
                                    height="7"
                                    rx="1"
                                  />
                                  <rect
                                    x="3"
                                    y="14"
                                    width="7"
                                    height="7"
                                    rx="1"
                                  />
                                  <rect
                                    x="14"
                                    y="14"
                                    width="7"
                                    height="7"
                                    rx="1"
                                  />
                                </svg>
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="truncate text-[14px] font-semibold text-[#202734]">
                                  {category.name}
                                </div>

                                <div className="text-[11px] text-[#8b95a5]">
                                  Category
                                </div>
                              </div>

                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="text-[#a3acba]"
                              >
                                <path d="m9 18 6-6-6-6" />
                              </svg>
                            </button>
                          );
                        },
                      )}
                    </div>
                  )}

                  {/* POPULAR */}
                  {visiblePopular.length > 0 && (
                    <div className="border-t border-[#f0f2f5] px-2 py-2">
                      <div className="px-3 pb-2 pt-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#8a94a6]">
                        Popular
                      </div>

                      {visiblePopular.map(
                        (popular, index) => {
                          const keyboardIndex =
                            keyboardItems.findIndex(
                              (item) =>
                                item.type ===
                                  "popular" &&
                                item.value ===
                                  popular,
                            );

                          const isSelected =
                            selectedIndex ===
                            keyboardIndex;

                          return (
                            <button
                              key={`${popular}-${index}`}
                              type="button"
                              onClick={() =>
                                openKeyboardSuggestion({
                                  type: "popular",
                                  value: popular,
                                })
                              }
                              className={`flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left transition ${
                                isSelected
                                  ? "bg-[#eff6ff]"
                                  : "hover:bg-[#f7f9fc]"
                              }`}
                            >
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fff7ed] text-[#f97316]">
                                <svg
                                  width="17"
                                  height="17"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.8"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M12 3v18" />
                                  <path d="M5 8h10a4 4 0 1 1 0 8H5" />
                                </svg>
                              </div>

                              <span className="min-w-0 flex-1 truncate text-[14px] font-semibold text-[#374151]">
                                {popular}
                              </span>

                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="text-[#a3acba]"
                              >
                                <path d="m9 18 6-6-6-6" />
                              </svg>
                            </button>
                          );
                        },
                      )}
                    </div>
                  )}

                  {/* LOADING */}
                  {loading &&
                    !hasSuggestionResults && (
                      <div className="flex items-center justify-center gap-3 px-5 py-8">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#dbe2ea] border-t-[#2563eb]" />

                        <span className="text-[13px] font-medium text-[#7b8493]">
                          Searching...
                        </span>
                      </div>
                    )}

                  {/* NO RESULTS */}
                  {!loading &&
                    search.trim() &&
                    !hasSuggestionResults && (
                      <div className="px-5 py-8 text-center">
                        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#f3f4f6] text-[#9ca3af]">
                          <svg
                            width="19"
                            height="19"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <circle
                              cx="11"
                              cy="11"
                              r="7"
                            />
                            <path d="m20 20-3.5-3.5" />
                          </svg>
                        </div>

                        <div className="text-[14px] font-semibold text-[#374151]">
                          No suggestions found
                        </div>

                        <div className="mt-1 text-[12px] text-[#9ca3af]">
                          Press Enter to search for "
                          {search.trim()}"
                        </div>
                      </div>
                    )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* LOGIN */}
        <Link
          href="/login"
          className="hidden shrink-0 items-center gap-2 rounded-[9px] px-3 py-2 text-[14px] font-semibold text-[#374151] transition hover:bg-[#f3f4f6] lg:flex"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle
              cx="12"
              cy="8"
              r="4"
            />
            <path d="M4 21a8 8 0 0 1 16 0" />
          </svg>

          Login
        </Link>

        {/* MORE */}
        <button
          type="button"
          className="hidden shrink-0 items-center gap-2 rounded-[9px] px-3 py-2 text-[14px] font-semibold text-[#374151] transition hover:bg-[#f3f4f6] md:flex"
        >
          More

          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </div>
    </header>
  );
}