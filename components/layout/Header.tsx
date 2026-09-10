  "use client";

import Link from "next/link";
import {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

/* =========================================================
   TYPES
========================================================= */

interface SearchProduct {
  id?: string;
  slug?: string;
  name?: string;

  brand?: {
    name?: string;
    slug?: string;
  } | null;

  images?: Array<{
    id?: string;
    url?: string;
    altText?: string | null;
    sortOrder?: number | null;
    isPrimary?: boolean;
  }>;
}

/* =========================================================
   CONSTANTS
========================================================= */

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5000/api";

const RECENT_SEARCH_KEY =
  "smartprix_recent_searches";

const MAX_RECENT_SEARCHES = 8;

/* =========================================================
   HELPERS
========================================================= */

function getProductImage(product: SearchProduct) {
  const primaryImage = product.images?.find(
    (image) => image.isPrimary,
  );

  return (
    primaryImage?.url ??
    product.images?.[0]?.url ??
    null
  );
}

function getImageUrl(
  url?: string | null,
) {
  if (!url) return null;

  if (
    url.startsWith("http://") ||
    url.startsWith("https://")
  ) {
    return url;
  }

  const baseUrl = API_URL.replace(
    /\/api\/?$/,
    "",
  );

  if (url.startsWith("/")) {
    return `${baseUrl}${url}`;
  }

  return `${baseUrl}/${url}`;
}

/* =========================================================
   SHORT PRODUCT NAME
========================================================= */

function getShortProductName(
  name?: string,
) {
  if (!name) return "Product";

  let cleanName = name
    .replace(/\s+/g, " ")
    .trim();

  /*
   * Remove common technical/variant information
   * from the autocomplete display.
   */

  cleanName = cleanName
    .replace(
      /\b\d+\s*(GB|TB)\b/gi,
      "",
    )
    .replace(
      /\b\d+\s*GB\s*RAM\b/gi,
      "",
    )
    .replace(
      /\b\d+\s*MP\b/gi,
      "",
    )
    .replace(
      /\b\d+\s*Hz\b/gi,
      "",
    )
    .replace(
      /\b\d+\s*W\b/gi,
      "",
    )
    .replace(
      /\b(5G|4G|LTE)\b/gi,
      "",
    )
    .replace(
      /\b(RAM|ROM)\b/gi,
      "",
    )
    .replace(
      /\b(Black|White|Blue|Green|Red|Silver|Gold|Grey|Gray|Purple|Orange|Yellow)\b/gi,
      "",
    )
    .replace(
      /\b\d+\s*GB\s*\/\s*\d+\s*GB\b/gi,
      "",
    )
    .replace(/\s+/g, " ")
    .trim();

  /*
   * Keep autocomplete compact.
   * Example:
   *
   * Samsung Galaxy S25 Ultra 5G White 256 GB
   *
   * becomes:
   *
   * Samsung Galaxy S25 Ultra
   */

  const words = cleanName.split(" ");

  if (words.length > 5) {
    cleanName = words
      .slice(0, 5)
      .join(" ");
  }

  return cleanName;
}

/* =========================================================
   COMPONENT
========================================================= */

export default function Header() {
  const router = useRouter();

  const searchRef =
    useRef<HTMLInputElement>(null);

  const dropdownRef =
    useRef<HTMLDivElement>(null);

  const abortControllerRef =
    useRef<AbortController | null>(null);

  const debounceRef =
    useRef<ReturnType<
      typeof setTimeout
    > | null>(null);

  const [
    products,
    setProducts,
  ] = useState<SearchProduct[]>([]);

  const [
    recentSearches,
    setRecentSearches,
  ] = useState<string[]>([]);

  const [
    showDropdown,
    setShowDropdown,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    selectedSuggestion,
    setSelectedSuggestion,
  ] = useState(-1);

 

const searchParams = useSearchParams();


const [search, setSearch] = useState(() => {
  return searchParams.get("search") || "";
});
useEffect(() => {
  const urlSearch = searchParams.get("search") || "";

  setSearch(urlSearch);
}, [searchParams]);


  /* =========================================================
     LOAD RECENT SEARCHES
  ========================================================= */

  useEffect(() => {
    try {
      const stored =
        localStorage.getItem(
          RECENT_SEARCH_KEY,
        );

      if (!stored) return;

      const parsed = JSON.parse(
        stored,
      );

      if (Array.isArray(parsed)) {
        setRecentSearches(
          parsed.filter(
            (item): item is string =>
              typeof item === "string",
          ),
        );
      }
    } catch {
      // Ignore invalid localStorage data.
    }
  }, []);

  /* =========================================================
     SAVE RECENT SEARCH
  ========================================================= */

  function saveSearchHistory(
    value: string,
  ) {
    const cleanValue =
      value.trim();

    if (!cleanValue) return;

    setRecentSearches(
      (current) => {
        const updated = [
          cleanValue,
          ...current.filter(
            (item) =>
              item.toLowerCase() !==
              cleanValue.toLowerCase(),
          ),
        ].slice(
          0,
          MAX_RECENT_SEARCHES,
        );

        try {
          localStorage.setItem(
            RECENT_SEARCH_KEY,
            JSON.stringify(updated),
          );
        } catch {
          // Ignore storage errors.
        }

        return updated;
      },
    );
  }

  /* =========================================================
     REMOVE RECENT SEARCH
  ========================================================= */

  function removeRecentSearch(
    value: string,
  ) {
    setRecentSearches(
      (current) => {
        const updated =
          current.filter(
            (item) =>
              item !== value,
          );

        try {
          localStorage.setItem(
            RECENT_SEARCH_KEY,
            JSON.stringify(updated),
          );
        } catch {
          // Ignore storage errors.
        }

        return updated;
      },
    );

    /*
     * Keep keyboard selection valid
     * after removing an item.
     */

    setSelectedSuggestion(
      (current) => {
        if (current < 0) {
          return -1;
        }

        if (
          current >=
          recentSearches.length - 1
        ) {
          return Math.max(
            0,
            recentSearches.length - 2,
          );
        }

        return current;
      },
    );
  }

  /* =========================================================
     SEARCH API
  ========================================================= */

useEffect(() => {
  const query = search.trim();

  if (!query) {
    setProducts([]);
    setLoading(false);
    return;
  }

  let cancelled = false;

  const timer = setTimeout(async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/products?search=${encodeURIComponent(query)}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const result = await response.json();

      // Ignore an outdated request
      if (cancelled) return;

      console.log("SEARCH API RESULT:", result);

      /*
       * Backend response:
       *
       * {
       *   success: true,
       *   data: {
       *     products: [...]
       *   }
       * }
       */

      const searchResults: SearchProduct[] =
        Array.isArray(result?.data?.products)
          ? result.data.products
          : Array.isArray(result?.data)
            ? result.data
            : [];

      setProducts(searchResults);
    } catch (error) {
      if (cancelled) return;

      console.error("Search suggestions error:", error);
      setProducts([]);
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

  /* =========================================================
     OUTSIDE CLICK
  ========================================================= */

  useEffect(() => {
    function handleOutsideClick(
      event: MouseEvent,
    ) {
      const target =
        event.target as Node;

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          target,
        ) &&
        !searchRef.current?.contains(
          target,
        )
      ) {
        setShowDropdown(false);
        setSelectedSuggestion(-1);
      }
    }

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

  /* =========================================================
     ESC KEY
  ========================================================= */

  useEffect(() => {
    function handleEscape(
      event: globalThis.KeyboardEvent,
    ) {
      if (
        event.key === "Escape"
      ) {
        setShowDropdown(false);
        setSelectedSuggestion(-1);

        searchRef.current?.blur();
      }
    }

    document.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, []);

  /* =========================================================
     SUBMIT SEARCH
  ========================================================= */

  function submitSearch(
    value = search,
  ) {
    const query =
      value.trim();

    if (!query) return;

    saveSearchHistory(query);

    setSearch(query);
    setShowDropdown(false);
    setSelectedSuggestion(-1);

    router.push(
      `/mobiles?search=${encodeURIComponent(
        query,
      )}`,
    );
  }

  /* =========================================================
     PRODUCT CLICK
  ========================================================= */

  function handleSuggestionClick(
    product: SearchProduct,
  ) {
    const name =
      product.name?.trim();

    const slug =
      product.slug?.trim();

    if (!name) return;

    saveSearchHistory(name);

    setSearch(name);
    setShowDropdown(false);
    setSelectedSuggestion(-1);

    if (slug) {
      router.push(
        `/mobiles/${encodeURIComponent(
          slug,
        )}`,
      );

      return;
    }

    router.push(
      `/mobiles?search=${encodeURIComponent(
        name,
      )}`,
    );
  }

  /* =========================================================
     RECENT SEARCH CLICK
  ========================================================= */

  function handleRecentSearchClick(
    value: string,
  ) {
    submitSearch(value);
  }

  /* =========================================================
     CLEAR SEARCH
  ========================================================= */

  function clearSearch() {
    setSearch("");
    setProducts([]);
    setSelectedSuggestion(-1);
    setLoading(false);

    setShowDropdown(true);

    searchRef.current?.focus();
  }

  /* =========================================================
     KEYBOARD NAVIGATION
  ========================================================= */

  function handleSearchKeyDown(
    event: KeyboardEvent<HTMLInputElement>,
  ) {
    const query =
      search.trim();

    /* =====================================================
       RECENT SEARCHES
    ===================================================== */

    if (
      !query &&
      recentSearches.length > 0
    ) {
      if (
        event.key === "ArrowDown"
      ) {
        event.preventDefault();

        setShowDropdown(true);

        setSelectedSuggestion(
          (current) =>
            current <
            recentSearches.length - 1
              ? current + 1
              : 0,
        );

        return;
      }

      if (
        event.key === "ArrowUp"
      ) {
        event.preventDefault();

        setShowDropdown(true);

        setSelectedSuggestion(
          (current) =>
            current > 0
              ? current - 1
              : recentSearches.length -
                1,
        );

        return;
      }

      if (
        event.key === "Enter"
      ) {
        event.preventDefault();

        if (
          selectedSuggestion >=
            0 &&
          recentSearches[
            selectedSuggestion
          ]
        ) {
          handleRecentSearchClick(
            recentSearches[
              selectedSuggestion
            ],
          );
        }

        return;
      }

      return;
    }

    /* =====================================================
       PRODUCT RESULTS
    ===================================================== */

    if (
      !query ||
      products.length === 0
    ) {
      if (
        event.key === "Enter"
      ) {
        event.preventDefault();

        submitSearch();
      }

      return;
    }

    if (
      event.key === "ArrowDown"
    ) {
      event.preventDefault();

      setSelectedSuggestion(
        (current) =>
          current <
          products.length - 1
            ? current + 1
            : 0,
      );

      return;
    }

    if (
      event.key === "ArrowUp"
    ) {
      event.preventDefault();

      setSelectedSuggestion(
        (current) =>
          current > 0
            ? current - 1
            : products.length - 1,
      );

      return;
    }

    if (
      event.key === "Enter"
    ) {
      event.preventDefault();

      if (
        selectedSuggestion >=
          0 &&
        products[
          selectedSuggestion
        ]
      ) {
        handleSuggestionClick(
          products[
            selectedSuggestion
          ],
        );
      } else {
        submitSearch();
      }
    }
  }

  /* =========================================================
     FORM SUBMIT
  ========================================================= */

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      search.trim() &&
      selectedSuggestion >= 0 &&
      products[
        selectedSuggestion
      ]
    ) {
      handleSuggestionClick(
        products[
          selectedSuggestion
        ],
      );

      return;
    }

    if (
      !search.trim() &&
      selectedSuggestion >= 0 &&
      recentSearches[
        selectedSuggestion
      ]
    ) {
      handleRecentSearchClick(
        recentSearches[
          selectedSuggestion
        ],
      );

      return;
    }

    submitSearch();
  }

  /* =========================================================
     VISIBILITY
  ========================================================= */

  const showRecent =
    showDropdown &&
    !search.trim() &&
    recentSearches.length > 0;

  const showResults =
    showDropdown &&
    search.trim().length > 0;

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <header className="sticky top-0 z-[100] w-full bg-white shadow-sm">
      <div className="mx-auto flex h-[64px] w-full max-w-[1280px] items-center gap-4 px-4 sm:px-6 lg:px-8">

        {/* =================================================
            LOGO
        ================================================= */}

        <Link
          href="/"
          className="flex shrink-0 items-center"
        >
          <div className="text-[26px] font-black tracking-tight text-[#2874f0]">
            Smartprix
          </div>
        </Link>

        {/* =================================================
            SEARCH
        ================================================= */}

        <div className="relative flex-1">
          <form
            onSubmit={
              handleSubmit
            }
            className="relative w-full"
          >
            <div
              className={`
                flex
                h-[44px]
                w-full
                overflow-hidden
                border
                bg-white
                transition-all
                duration-150
                ${
                  showDropdown
                    ? "rounded-t-[3px] border-[#2874f0] shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
                    : "rounded-[3px] border-[#d5d5d5] hover:border-[#2874f0]"
                }
              `}
            >

              {/* INPUT */}

              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(event) => {
                  setSearch(
                    event.target.value,
                  );

                  setShowDropdown(
                    true,
                  );
                }}
                onFocus={() =>
                  setShowDropdown(
                    true,
                  )
                }
                onKeyDown={
                  handleSearchKeyDown
                }
                placeholder="Search for Products, Brands and More"
                autoComplete="off"
                className="
                  min-w-0
                  flex-1
                  bg-transparent
                  px-4
                  text-[14px]
                  text-[#212121]
                  outline-none
                  placeholder:text-[#777]
                "
              />

              {/* CLEAR */}

              {search && (
                <button
                  type="button"
                  onClick={
                    clearSearch
                  }
                  aria-label="Clear search"
                  className="
                    flex
                    w-[42px]
                    shrink-0
                    items-center
                    justify-center
                    text-[#777]
                    transition
                    hover:text-[#212121]
                  "
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
              )}

              {/* SEARCH BUTTON */}

              <button
                type="submit"
                aria-label="Search"
                className="
                  flex
                  h-full
                  w-[52px]
                  shrink-0
                  items-center
                  justify-center
                  bg-[#2874f0]
                  text-white
                  transition
                  hover:bg-[#1d63d6]
                  active:bg-[#1557c0]
                "
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.3"
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
          </form>

          {/* =================================================
              DROPDOWN
          ================================================= */}

          {(showRecent ||
            showResults) && (
            <div
              ref={dropdownRef}
              className="
                absolute
                left-0
                right-0
                top-[44px]
                overflow-hidden
                rounded-b-[3px]
                border
                border-t-0
                border-[#d5d5d5]
                bg-white
                shadow-[0_6px_14px_rgba(0,0,0,0.15)]
              "
            >

              {/* =================================================
                  RECENT SEARCHES
              ================================================= */}

              {showRecent && (
                <div className="py-1">
                  {recentSearches.map(
                    (
                      item,
                      index,
                    ) => {
                      const isSelected =
                        selectedSuggestion ===
                        index;

                      return (
                        <div
                          key={item}
                          className={`
                            group
                            flex
                            items-center
                            px-4
                            py-2.5
                            transition
                            ${
                              isSelected
                                ? "bg-[#f5f7fa]"
                                : "bg-white hover:bg-[#f8f9fb]"
                            }
                          `}
                        >
                          <button
                            type="button"
                            onMouseEnter={() =>
                              setSelectedSuggestion(
                                index,
                              )
                            }
                            onClick={() =>
                              handleRecentSearchClick(
                                item,
                              )
                            }
                            className="
                              flex
                              min-w-0
                              flex-1
                              items-center
                              gap-3
                              text-left
                            "
                          >
                            <svg
                              width="17"
                              height="17"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              className="shrink-0 text-[#999]"
                            >
                              <circle
                                cx="12"
                                cy="12"
                                r="9"
                              />
                              <path d="M12 7v5l3 2" />
                            </svg>

                            <span className="truncate text-[14px] text-[#333]">
                              {item}
                            </span>
                          </button>

                          <button
                            type="button"
                            aria-label={`Remove ${item}`}
                            onClick={() =>
                              removeRecentSearch(
                                item,
                              )
                            }
                            className="
                              ml-3
                              flex
                              h-7
                              w-7
                              shrink-0
                              items-center
                              justify-center
                              rounded-full
                              text-[#999]
                              transition
                              hover:bg-[#eeeeee]
                              hover:text-[#333]
                            "
                          >
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M18 6 6 18" />
                              <path d="m6 6 12 12" />
                            </svg>
                          </button>
                        </div>
                      );
                    },
                  )}
                </div>
              )}

              {/* =================================================
                  SEARCH RESULTS
              ================================================= */}

              {showResults && (
                <>
                  {loading && (
                    <div className="flex items-center gap-3 px-4 py-5">
                      <div
                        className="
                          h-5
                          w-5
                          animate-spin
                          rounded-full
                          border-2
                          border-[#d8e6ff]
                          border-t-[#2874f0]
                        "
                      />

                      <span className="text-[13px] text-[#777]">
                        Searching...
                      </span>
                    </div>
                  )}

                  {!loading &&
                    products.length >
                      0 && (
                      <div className="py-1">
                        {products
                          .slice(
                            0,
                            6,
                          )
                          .map(
                            (
                              product,
                              index,
                            ) => {
                              const image =
                                getImageUrl(
                                  getProductImage(
                                    product,
                                  ),
                                );

                              const displayName =
                                getShortProductName(
                                  product.name,
                                );

                              const isSelected =
                                selectedSuggestion ===
                                index;

                              return (
                                <button
                                  key={
                                    product.id ??
                                    product.slug ??
                                    index
                                  }
                                  type="button"
                                  onMouseEnter={() =>
                                    setSelectedSuggestion(
                                      index,
                                    )
                                  }
                                  onClick={() =>
                                    handleSuggestionClick(
                                      product,
                                    )
                                  }
                                  className={`
                                    flex
                                    w-full
                                    items-center
                                    gap-3
                                    px-4
                                    py-2.5
                                    text-left
                                    transition
                                    ${
                                      isSelected
                                        ? "bg-[#f5f7fa]"
                                        : "bg-white hover:bg-[#f8f9fb]"
                                    }
                                  `}
                                >

                                  {/* PRODUCT IMAGE */}

                                  <div
                                    className="
                                      flex
                                      h-[46px]
                                      w-[40px]
                                      shrink-0
                                      items-center
                                      justify-center
                                      overflow-hidden
                                      rounded-[2px]
                                      bg-white
                                    "
                                  >
                                    {image ? (
                                      <img
                                        src={
                                          image
                                        }
                                        alt={
                                          displayName
                                        }
                                        className="
                                          h-full
                                          w-full
                                          object-contain
                                        "
                                      />
                                    ) : (
                                      <svg
                                        width="22"
                                        height="22"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        className="text-[#bbb]"
                                      >
                                        <rect
                                          x="3"
                                          y="3"
                                          width="18"
                                          height="18"
                                          rx="2"
                                        />
                                        <circle
                                          cx="8.5"
                                          cy="8.5"
                                          r="1.5"
                                        />
                                        <path d="m21 15-5-5L5 21" />
                                      </svg>
                                    )}
                                  </div>

                                  {/* PRODUCT TEXT */}

                                  <div className="min-w-0 flex-1">
                                    <div className="truncate text-[14px] font-medium text-[#212121]">
                                      {
                                        displayName
                                      }
                                    </div>
                                  </div>

                                  {/* RIGHT ARROW */}

                                  <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    className="shrink-0 text-[#aaa]"
                                  >
                                    <path d="m9 18 6-6-6-6" />
                                  </svg>
                                </button>
                              );
                            },
                          )}
                      </div>
                    )}

                  {!loading &&
                    products.length ===
                      0 && (
                      <div className="px-4 py-6 text-center">
                        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#f5f7fa]">
                          <svg
                            width="20"
                            height="20"
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

                        <p className="text-[13px] font-medium text-[#333]">
                          No products found
                        </p>

                        <p className="mt-1 text-[12px] text-[#999]">
                          Try another
                          keyword.
                        </p>
                      </div>
                    )}
                </>
              )}
            </div>
          )}
        </div>

        {/* =================================================
            LOGIN
        ================================================= */}

        <Link
          href="/login"
          className="
            hidden
            shrink-0
            items-center
            justify-center
            rounded-[3px]
            border
            border-[#2874f0]
            px-5
            py-2
            text-[14px]
            font-semibold
            text-[#2874f0]
            transition
            hover:bg-[#f0f6ff]
            sm:flex
          "
        >
          Login
        </Link>

        {/* =================================================
            MORE
        ================================================= */}

        <button
          type="button"
          className="
            hidden
            shrink-0
            items-center
            gap-1
            text-[14px]
            font-medium
            text-[#333]
            lg:flex
          "
        >
          More

          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </div>
    </header>
  );
}