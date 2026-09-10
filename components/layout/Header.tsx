"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { usePathname, useRouter } from "next/navigation";

/* =========================================================
   TYPES
========================================================= */

interface SearchProductImage {
  id?: string;
  url?: string;
  altText?: string | null;
  sortOrder?: number | null;
  isPrimary?: boolean;
}

interface SearchProductPrice {
  amount?: number | string | null;
  currency?: string;
  inStock?: boolean;
}

interface SearchProduct {
  id?: string;
  slug?: string;
  name?: string;
  brand?: {
    id?: string;
    name?: string;
    slug?: string;
  } | null;
  images?: SearchProductImage[];
  prices?: SearchProductPrice[];
}

/* =========================================================
   CONSTANTS
========================================================= */

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

const SEARCH_HISTORY_KEY = "smartprix_search_history";

const MAX_HISTORY = 8;

const CATEGORIES = [
  {
    label: "All",
    value: "all",
  },
  {
    label: "Mobiles",
    value: "mobiles",
  },
  {
    label: "Laptops",
    value: "laptops",
  },
  {
    label: "TVs",
    value: "tvs",
  },
] as const;

const POPULAR_SEARCHES = [
  "Samsung Galaxy S26 Ultra",
  "iPhone 17 Pro Max",
  "OnePlus 13",
  "Samsung Galaxy S25 Ultra",
  "Best 5G mobiles",
  "Best camera phones",
];

/* =========================================================
   HELPERS
========================================================= */

function getProductImage(product: SearchProduct) {
  const primaryImage = product.images?.find(
    (image) => image.isPrimary === true,
  );

  return (
    primaryImage?.url ??
    product.images?.[0]?.url ??
    null
  );
}

function getImageUrl(url: string | null) {
  if (!url) return null;

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  if (url.startsWith("/")) {
    return `${API_URL.replace(/\/api\/?$/, "")}${url}`;
  }

  return `${API_URL.replace(/\/api\/?$/, "")}/${url}`;
}

function formatPrice(product: SearchProduct) {
  const price =
    product.prices?.find((item) => item.inStock)?.amount ??
    product.prices?.[0]?.amount;

  if (
    price === null ||
    price === undefined ||
    price === ""
  ) {
    return "";
  }

  const numericPrice = Number(price);

  if (Number.isNaN(numericPrice)) {
    return String(price);
  }

  return `₹${numericPrice.toLocaleString("en-IN")}`;
}

function highlightText(
  text: string,
  query: string,
) {
  if (!query.trim()) {
    return text;
  }

  const escaped = query.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&",
  );

  const parts = text.split(
    new RegExp(`(${escaped})`, "gi"),
  );

  return parts.map((part, index) => {
    const matches =
      part.toLowerCase() === query.trim().toLowerCase();

    return matches ? (
      <mark
        key={`${part}-${index}`}
        className="rounded bg-yellow-200 px-0.5 text-slate-900"
      >
        {part}
      </mark>
    ) : (
      <span key={`${part}-${index}`}>{part}</span>
    );
  });
}

/* =========================================================
   COMPONENT
========================================================= */

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();

  const searchRef = useRef<HTMLInputElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const [products, setProducts] = useState<SearchProduct[]>([]);
  const [loading, setLoading] = useState(false);

  const [showDropdown, setShowDropdown] = useState(false);

  const [history, setHistory] = useState<string[]>([]);

  const [selectedSuggestion, setSelectedSuggestion] =
    useState(-1);

  const [showCategoryMenu, setShowCategoryMenu] =
    useState(false);

  const [showMoreMenu, setShowMoreMenu] =
    useState(false);

  /* =======================================================
     LOAD SEARCH HISTORY
  ======================================================= */

  useEffect(() => {
    try {
      const saved = localStorage.getItem(
        SEARCH_HISTORY_KEY,
      );

      if (!saved) return;

      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        setHistory(
          parsed
            .filter(
              (item): item is string =>
                typeof item === "string",
            )
            .slice(0, MAX_HISTORY),
        );
      }
    } catch {
      // Ignore invalid localStorage data.
    }
  }, []);

  /* =======================================================
     SAVE SEARCH HISTORY
  ======================================================= */

  const saveSearchHistory = (value: string) => {
    const cleanValue = value.trim();

    if (!cleanValue) return;

    setHistory((previous) => {
      const next = [
        cleanValue,
        ...previous.filter(
          (item) =>
            item.toLowerCase() !==
            cleanValue.toLowerCase(),
        ),
      ].slice(0, MAX_HISTORY);

      try {
        localStorage.setItem(
          SEARCH_HISTORY_KEY,
          JSON.stringify(next),
        );
      } catch {
        // Ignore storage errors.
      }

      return next;
    });
  };

  /* =======================================================
     REMOVE HISTORY ITEM
  ======================================================= */

  const removeHistoryItem = (value: string) => {
    setHistory((previous) => {
      const next = previous.filter(
        (item) => item !== value,
      );

      try {
        localStorage.setItem(
          SEARCH_HISTORY_KEY,
          JSON.stringify(next),
        );
      } catch {
        // Ignore storage errors.
      }

      return next;
    });
  };

  /* =======================================================
     CLEAR HISTORY
  ======================================================= */

  const clearHistory = () => {
    setHistory([]);

    try {
      localStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch {
      // Ignore storage errors.
    }
  };

  /* =======================================================
     FETCH SEARCH RESULTS
  ======================================================= */

  useEffect(() => {
    const query = search.trim();

    if (!query) {
      setProducts([]);
      setLoading(false);
      return;
    }

    abortRef.current?.abort();

    const controller = new AbortController();

    abortRef.current = controller;

    const timer = window.setTimeout(async () => {
      try {
        setLoading(true);

        const params = new URLSearchParams();

        params.set("search", query);

        const response = await fetch(
          `${API_URL}/products?${params.toString()}`,
          {
            method: "GET",
            signal: controller.signal,
            headers: {
              Accept: "application/json",
            },
            cache: "no-store",
          },
        );

        if (!response.ok) {
          throw new Error(
            `Search request failed: ${response.status}`,
          );
        }

        const result = await response.json();

        const nextProducts = Array.isArray(
          result?.data,
        )
          ? result.data
          : Array.isArray(result?.data?.products)
            ? result.data.products
            : [];

        setProducts(nextProducts);
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return;
        }

        console.error(
          "Header search failed:",
          error,
        );

        setProducts([]);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 300);

    return () => {
      window.clearTimeout(timer);
      controller.abort();

      if (abortRef.current === controller) {
        abortRef.current = null;
      }
    };
  }, [search]);

  /* =======================================================
     FILTER PRODUCTS BY CATEGORY
  ======================================================= */

  const filteredProducts = useMemo(() => {
    if (category === "all") {
      return products;
    }

    return products.filter((product) => {
      const slug = product.slug?.toLowerCase() ?? "";

      /*
       * Current backend product response does not expose
       * category directly in the shown response.
       *
       * Therefore, for now:
       * - mobiles uses mobile-looking product URLs
       * - laptops/tvs remain available for future backend
       *   category integration.
       *
       * Once category is returned by the API, replace this
       * with product.category.slug.
       */

      if (category === "mobiles") {
        return (
          slug.includes("galaxy") ||
          slug.includes("iphone") ||
          slug.includes("oneplus") ||
          slug.includes("pixel") ||
          slug.includes("realme") ||
          slug.includes("vivo") ||
          slug.includes("oppo") ||
          slug.includes("xiaomi") ||
          slug.includes("redmi") ||
          slug.includes("poco") ||
          slug.includes("motorola")
        );
      }

      if (category === "laptops") {
        return (
          slug.includes("laptop") ||
          slug.includes("notebook") ||
          slug.includes("ideapad") ||
          slug.includes("thinkpad") ||
          slug.includes("vivobook") ||
          slug.includes("zenbook") ||
          slug.includes("macbook")
        );
      }

      if (category === "tvs") {
        return (
          slug.includes("tv") ||
          slug.includes("television")
        );
      }

      return true;
    });
  }, [products, category]);

  /* =======================================================
     SUGGESTION LIST
  ======================================================= */

  const suggestionItems = useMemo(() => {
    return filteredProducts.slice(0, 7);
  }, [filteredProducts]);

  const totalKeyboardItems = suggestionItems.length;

  /* =======================================================
     OUTSIDE CLICK
  ======================================================= */

  useEffect(() => {
    const handleOutsideClick = (
      event: MouseEvent,
    ) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(
          event.target as Node,
        )
      ) {
        setShowDropdown(false);
        setShowCategoryMenu(false);
        setShowMoreMenu(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick,
      );
    };
  }, []);

  /* =======================================================
     ESCAPE KEY
  ======================================================= */

  useEffect(() => {
    const handleEscape = (
      event: KeyboardEvent,
    ) => {
      if (event.key === "Escape") {
        setShowDropdown(false);
        setShowCategoryMenu(false);
        setShowMoreMenu(false);
        setSelectedSuggestion(-1);
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape as unknown as EventListener,
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape as unknown as EventListener,
      );
    };
  }, []);

  /* =======================================================
     SEARCH SUBMIT
  ======================================================= */

  const submitSearch = (
    value = search,
  ) => {
    const cleanValue = value.trim();

    if (!cleanValue) {
      searchRef.current?.focus();
      return;
    }

    saveSearchHistory(cleanValue);

    setSearch(cleanValue);
    setShowDropdown(false);
    setSelectedSuggestion(-1);

    const params = new URLSearchParams();

    params.set("search", cleanValue);

    if (category !== "all") {
      params.set("category", category);
    }

    router.push(
      `/mobiles?${params.toString()}`,
    );
  };

  /* =======================================================
     PRODUCT CLICK
  ======================================================= */

  const handleSuggestionClick = (
    product: SearchProduct,
  ) => {
    const name = product.name?.trim();
    const slug = product.slug?.trim();

    if (!name) return;

    saveSearchHistory(name);

    setSearch(name);
    setShowDropdown(false);
    setSelectedSuggestion(-1);

    if (slug) {
      router.push(
        `/mobiles/${encodeURIComponent(slug)}`,
      );
      return;
    }

    router.push(
      `/mobiles?search=${encodeURIComponent(name)}`,
    );
  };

  /* =======================================================
     KEYBOARD NAVIGATION
  ======================================================= */

  const handleSearchKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();

      if (!showDropdown) {
        setShowDropdown(true);
      }

      setSelectedSuggestion((current) =>
        Math.min(
          current + 1,
          Math.max(totalKeyboardItems - 1, 0),
        ),
      );

      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();

      setSelectedSuggestion((current) =>
        Math.max(current - 1, -1),
      );

      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();

      if (
        selectedSuggestion >= 0 &&
        suggestionItems[selectedSuggestion]
      ) {
        handleSuggestionClick(
          suggestionItems[selectedSuggestion],
        );
        return;
      }

      submitSearch();
    }

    if (event.key === "Escape") {
      setShowDropdown(false);
      setSelectedSuggestion(-1);
    }
  };

  /* =======================================================
     CATEGORY
  ======================================================= */

  const selectedCategory =
    CATEGORIES.find(
      (item) => item.value === category,
    ) ?? CATEGORIES[0];

  const handleCategoryChange = (
    value: string,
  ) => {
    setCategory(value);
    setShowCategoryMenu(false);
    setSelectedSuggestion(-1);

    searchRef.current?.focus();

    if (search.trim()) {
      setShowDropdown(true);
    }
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <header className="relative z-50 w-full bg-white">
      {/* ===================================================
          TOP HEADER
      =================================================== */}

      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-[70px] max-w-[1400px] items-center gap-4 px-4 lg:px-6">
          {/* LOGO */}

          <Link
            href="/"
            className="group flex shrink-0 items-center"
          >
            <div className="flex items-center">
              <span className="text-[27px] font-black tracking-[-1.5px] text-blue-600">
                smart
              </span>

              <span className="text-[27px] font-black tracking-[-1.5px] text-orange-500">
                prix
              </span>
            </div>
          </Link>

          {/* SEARCH */}

          <div
            ref={wrapperRef}
            className="relative min-w-0 flex-1"
          >
            <div
              className={[
                "flex h-[46px] w-full overflow-visible rounded-xl border bg-white shadow-sm transition",
                showDropdown
                  ? "border-blue-500 shadow-[0_0_0_3px_rgba(37,99,235,0.10)]"
                  : "border-slate-300 hover:border-slate-400",
              ].join(" ")}
            >
              {/* CATEGORY SELECTOR */}

              <div className="relative hidden shrink-0 sm:block">
                <button
                  type="button"
                  onClick={() =>
                    setShowCategoryMenu(
                      (value) => !value,
                    )
                  }
                  className="flex h-full min-w-[105px] items-center justify-center gap-1.5 border-r border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  <span>
                    {selectedCategory.label}
                  </span>

                  <svg
                    className={`h-4 w-4 transition ${
                      showCategoryMenu
                        ? "rotate-180"
                        : ""
                    }`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {showCategoryMenu && (
                  <div className="absolute left-0 top-[50px] z-[80] w-48 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xl">
                    {CATEGORIES.map(
                      (item) => (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() =>
                            handleCategoryChange(
                              item.value,
                            )
                          }
                          className={[
                            "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition",
                            category ===
                            item.value
                              ? "bg-blue-50 font-bold text-blue-600"
                              : "text-slate-700 hover:bg-slate-50",
                          ].join(" ")}
                        >
                          <span>
                            {item.label}
                          </span>

                          {category ===
                            item.value && (
                            <svg
                              className="h-4 w-4"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.704 5.29a1 1 0 010 1.42l-7.2 7.2a1 1 0 01-1.414 0l-3.2-3.2a1 1 0 111.414-1.42l2.493 2.494 6.493-6.494a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </button>
                      ),
                    )}
                  </div>
                )}
              </div>

              {/* MOBILE CATEGORY ICON */}

              <div className="flex items-center px-2 sm:hidden">
                <button
                  type="button"
                  onClick={() =>
                    setShowCategoryMenu(
                      (value) => !value,
                    )
                  }
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                  aria-label="Select category"
                >
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M4 6h16M7 12h10M10 18h4" />
                  </svg>
                </button>
              </div>

              {/* INPUT */}

              <div className="flex min-w-0 flex-1 items-center">
                <svg
                  className="ml-3 h-5 w-5 shrink-0 text-slate-400"
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
                  <path d="m20 20-4-4" />
                </svg>

                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  placeholder="Search mobiles, laptops, TVs & more..."
                  onChange={(event) => {
                    setSearch(
                      event.target.value,
                    );
                    setSelectedSuggestion(-1);
                    setShowDropdown(true);
                  }}
                  onFocus={() =>
                    setShowDropdown(true)
                  }
                  onKeyDown={
                    handleSearchKeyDown
                  }
                  className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 sm:text-[15px]"
                  autoComplete="off"
                  spellCheck={false}
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setProducts([]);
                      setSelectedSuggestion(-1);
                      searchRef.current?.focus();
                    }}
                    className="mr-1 rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    aria-label="Clear search"
                  >
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M5.28 4.22a.75.75 0 00-1.06 1.06L8.94 10l-4.72 4.72a.75.75 0 101.06 1.06L10 11.06l4.72 4.72a.75.75 0 101.06-1.06L11.06 10l4.72-4.72a.75.75 0 00-1.06-1.06L10 8.94 5.28 4.22z" />
                    </svg>
                  </button>
                )}
              </div>

              {/* SEARCH BUTTON */}

              <button
                type="button"
                onClick={() =>
                  submitSearch()
                }
                className="flex h-full w-[50px] shrink-0 items-center justify-center rounded-r-[10px] bg-orange-500 text-white transition hover:bg-orange-600 active:bg-orange-700 sm:w-[58px]"
                aria-label="Search"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <circle
                    cx="11"
                    cy="11"
                    r="7"
                  />
                  <path d="m20 20-4-4" />
                </svg>
              </button>
            </div>

            {/* =================================================
                SEARCH DROPDOWN
            ================================================= */}

            {showDropdown && (
              <div className="absolute left-0 right-0 top-[54px] z-[70] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.16)]">
                {/* EMPTY SEARCH */}

                {!search.trim() ? (
                  <div className="max-h-[480px] overflow-y-auto">
                    {/* RECENT SEARCHES */}

                    {history.length > 0 && (
                      <div className="border-b border-slate-100 p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <svg
                              className="h-4 w-4 text-slate-400"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <circle
                                cx="12"
                                cy="12"
                                r="9"
                              />
                              <path d="M12 7v5l3 2" />
                            </svg>

                            <span className="text-sm font-bold text-slate-800">
                              Recent searches
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={
                              clearHistory
                            }
                            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                          >
                            Clear all
                          </button>
                        </div>

                        <div className="space-y-1">
                          {history
                            .slice(0, 5)
                            .map(
                              (item) => (
                                <div
                                  key={item}
                                  className="group flex items-center"
                                >
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSearch(
                                        item,
                                      );
                                      setShowDropdown(
                                        true,
                                      );
                                    }}
                                    className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                                  >
                                    <svg
                                      className="h-4 w-4 shrink-0 text-slate-400"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                    >
                                      <path d="M3 12a9 9 0 1 0 3-6.7" />
                                      <path d="M3 4v5h5" />
                                    </svg>

                                    <span className="truncate">
                                      {item}
                                    </span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeHistoryItem(
                                        item,
                                      )
                                    }
                                    className="mr-1 hidden rounded-full p-1.5 text-slate-300 transition hover:bg-slate-100 hover:text-slate-600 group-hover:block"
                                    aria-label={`Remove ${item}`}
                                  >
                                    <svg
                                      className="h-3.5 w-3.5"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                    >
                                      <path d="M5.28 4.22a.75.75 0 00-1.06 1.06L8.94 10l-4.72 4.72a.75.75 0 101.06 1.06L10 11.06l4.72 4.72a.75.75 0 101.06-1.06L11.06 10l4.72-4.72a.75.75 0 00-1.06-1.06L10 8.94 5.28 4.22z" />
                                    </svg>
                                  </button>
                                </div>
                              ),
                            )}
                        </div>
                      </div>
                    )}

                    {/* POPULAR SEARCHES */}

                    <div className="p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-50 text-orange-500">
                          <svg
                            className="h-3.5 w-3.5"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M12 2c.4 4.2 2.1 6.1 4.3 8.3 1.8 1.8 3.2 3.6 3.2 6.1a7.5 7.5 0 11-15 0c0-2.9 1.7-5.3 4.1-7.2.2 2.1 1 3.2 2 4 .2-3.5.6-6.8 1.4-11.2z" />
                          </svg>
                        </span>

                        <span className="text-sm font-bold text-slate-800">
                          Popular searches
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {POPULAR_SEARCHES.map(
                          (item) => (
                            <button
                              key={item}
                              type="button"
                              onClick={() => {
                                setSearch(item);
                                setShowDropdown(
                                  true,
                                );
                                searchRef.current?.focus();
                              }}
                              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                            >
                              {item}
                            </button>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                ) : loading ? (
                  /* LOADING */

                  <div className="p-6">
                    <div className="flex items-center justify-center gap-3 text-sm text-slate-500">
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
                      Searching products...
                    </div>
                  </div>
                ) : suggestionItems.length > 0 ? (
                  /* RESULTS */

                  <div>
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Products
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          submitSearch()
                        }
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                      >
                        View all results
                      </button>
                    </div>

                    <div className="max-h-[430px] overflow-y-auto p-1.5">
                      {suggestionItems.map(
                        (
                          product,
                          index,
                        ) => {
                          const image = getImageUrl(
                            getProductImage(
                              product,
                            ),
                          );

                          const price =
                            formatPrice(
                              product,
                            );

                          const brand =
                            product.brand
                              ?.name;

                          const name =
                            product.name ??
                            "Unnamed product";

                          return (
                            <button
                              key={
                                product.id ??
                                product.slug ??
                                `${name}-${index}`
                              }
                              type="button"
                              onClick={() =>
                                handleSuggestionClick(
                                  product,
                                )
                              }
                              className={[
                                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition",
                                selectedSuggestion ===
                                index
                                  ? "bg-blue-50"
                                  : "hover:bg-slate-50",
                              ].join(" ")}
                            >
                              {/* IMAGE */}

                              <div className="flex h-[58px] w-[48px] shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-100 bg-white">
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
                                    className="h-6 w-6 text-slate-300"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                  >
                                    <rect
                                      x="4"
                                      y="3"
                                      width="16"
                                      height="18"
                                      rx="2"
                                    />
                                    <path d="M9 18h6" />
                                  </svg>
                                )}
                              </div>

                              {/* INFO */}

                              <div className="min-w-0 flex-1">
                                <div className="truncate text-sm font-bold text-slate-800">
                                  {highlightText(
                                    name,
                                    search,
                                  )}
                                </div>

                                <div className="mt-1 flex items-center gap-2">
                                  {brand && (
                                    <span className="truncate text-xs text-slate-500">
                                      {brand}
                                    </span>
                                  )}

                                  {brand &&
                                    price && (
                                      <span className="text-slate-300">
                                        •
                                      </span>
                                    )}

                                  {price && (
                                    <span className="text-xs font-bold text-slate-700">
                                      {price}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* ARROW */}

                              <svg
                                className="h-4 w-4 shrink-0 text-slate-300"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M7.21 14.77a.75.75 0 01.02-1.06L10.94 10 7.23 6.29a.75.75 0 111.06-1.06l4.24 4.24a.75.75 0 010 1.06l-4.24 4.24a.75.75 0 01-1.06-.02z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          );
                        },
                      )}
                    </div>

                    {/* SEARCH FOOTER */}

                    <div className="border-t border-slate-100 bg-slate-50 px-4 py-2.5">
                      <button
                        type="button"
                        onClick={() =>
                          submitSearch()
                        }
                        className="flex w-full items-center justify-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
                      >
                        Search for "
                        <span className="max-w-[220px] truncate">
                          {search}
                        </span>
                        "
                        <svg
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.21 14.77a.75.75 0 01.02-1.06L10.94 10 7.23 6.29a.75.75 0 111.06-1.06l4.24 4.24a.75.75 0 010 1.06l-4.24 4.24a.75.75 0 01-1.06-.02z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* NO RESULTS */

                  <div className="p-7 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                      <svg
                        className="h-6 w-6 text-slate-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <circle
                          cx="11"
                          cy="11"
                          r="7"
                        />
                        <path d="m20 20-4-4" />
                      </svg>
                    </div>

                    <p className="text-sm font-semibold text-slate-700">
                      No products found
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Try another product name,
                      brand or keyword.
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        submitSearch()
                      }
                      className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-700"
                    >
                      Search anyway
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* LOGIN */}

          <Link
            href="/login"
            className="hidden shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 md:flex"
          >
            <svg
              className="h-5 w-5 text-slate-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle
                cx="12"
                cy="8"
                r="4"
              />
              <path d="M4 21a8 8 0 0116 0" />
            </svg>

            Login
          </Link>

          {/* MORE */}

          <div className="relative hidden lg:block">
            <button
              type="button"
              onClick={() =>
                setShowMoreMenu(
                  (value) => !value,
                )
              }
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              More

              <svg
                className={`h-4 w-4 transition ${
                  showMoreMenu
                    ? "rotate-180"
                    : ""
                }`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06l-4.25-4.51a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {showMoreMenu && (
              <div className="absolute right-0 top-[46px] z-[80] w-52 rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xl">
                <Link
                  href="/compare"
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  onClick={() =>
                    setShowMoreMenu(false)
                  }
                >
                  Compare Products
                </Link>

                <Link
                  href="/deals"
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  onClick={() =>
                    setShowMoreMenu(false)
                  }
                >
                  Best Deals
                </Link>

                <Link
                  href="/news"
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  onClick={() =>
                    setShowMoreMenu(false)
                  }
                >
                  Tech News
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===================================================
          MOBILE QUICK LINKS
      =================================================== */}

      <div className="overflow-x-auto border-b border-slate-200 bg-white lg:hidden">
        <div className="mx-auto flex min-w-max items-center gap-1 px-4 py-2">
          <Link
            href="/mobiles"
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              pathname === "/mobiles" ||
              pathname.startsWith(
                "/mobiles/",
              )
                ? "bg-blue-50 text-blue-600"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            Mobiles
          </Link>

          <Link
            href="/laptops"
            className="rounded-full px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Laptops
          </Link>

          <Link
            href="/compare"
            className="rounded-full px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Compare
          </Link>

          <Link
            href="/deals"
            className="rounded-full px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Deals
          </Link>

          <Link
            href="/news"
            className="rounded-full px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            News
          </Link>
        </div>
      </div>
    </header>
  );
}