"use client";

import Image from "next/image";
import Link from "next/link";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

const SEARCH_HISTORY_KEY = "smartprix-search-history";
const MAX_SEARCH_HISTORY = 8;

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlSearch = searchParams.get("search") ?? "";

  const [search, setSearch] = useState(urlSearch);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const suggestionTimerRef = useRef<NodeJS.Timeout | null>(null);
const [suggestions, setSuggestions] = useState<any[]>([]);
const [showSuggestions, setShowSuggestions] = useState(false);
const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);
  
  /*
   * Keep Header search synchronized with the URL.
   */
  useEffect(() => {
    setSearch(urlSearch);
  }, [urlSearch]);

  /*
   * Load search history from localStorage.
   */
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(
        SEARCH_HISTORY_KEY,
      );

      if (!savedHistory) return;

      const parsedHistory = JSON.parse(savedHistory);

      if (Array.isArray(parsedHistory)) {
        setSearchHistory(
          parsedHistory.filter(
            (item): item is string =>
              typeof item === "string" &&
              item.trim().length > 0,
          ),
        );
      }
    } catch {
      localStorage.removeItem(SEARCH_HISTORY_KEY);
    }
  }, []);

  /*
   * Save search history to localStorage.
   */
  const saveSearchHistory = (value: string) => {
    const trimmedValue = value.trim();

    if (!trimmedValue) return;

    setSearchHistory((currentHistory) => {
      const updatedHistory = [
        trimmedValue,
        ...currentHistory.filter(
          (item) =>
            item.toLowerCase() !==
            trimmedValue.toLowerCase(),
        ),
      ].slice(0, MAX_SEARCH_HISTORY);

      localStorage.setItem(
        SEARCH_HISTORY_KEY,
        JSON.stringify(updatedHistory),
      );

      return updatedHistory;
    });
  };


  const fetchSearchSuggestions = (value: string) => {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    setSearchSuggestions([]);
    setShowSearchHistory(true);
    return;
  }

  if (suggestionTimerRef.current) {
    clearTimeout(suggestionTimerRef.current);
  }

  suggestionTimerRef.current = setTimeout(async () => {
    try {

      const params = new URLSearchParams();

      params.set("category", "mobiles");
      params.set("search", trimmedValue);
      params.set("page", "1");
      params.set("limit", "5");
      params.set("sort", "relevance");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products?${params.toString()}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch suggestions");
      }

      const result = await response.json();

      const products =
        result?.data?.products ?? [];

      setSearchSuggestions(products);
      setShowSearchHistory(true);
    } catch (error) {
      console.error(
        "Failed to fetch search suggestions:",
        error,
      );

      setSearchSuggestions([]);
    } finally {
    }
  }, 250);
};


  /*
   * Perform search.
   */
  const handleSearch = (value?: string) => {
    const searchValue =
      value !== undefined ? value : search;

    const trimmedSearch = searchValue.trim();

    if (!trimmedSearch) {
      router.push("/mobiles");
      setShowSearchHistory(false);
      return;
    }

    saveSearchHistory(trimmedSearch);

    router.push(
      `/mobiles?search=${encodeURIComponent(
        trimmedSearch,
      )}`,
    );

    setShowSearchHistory(false);
  };

  /*
   * Enter key.
   */
  const handleKeyDown = (
  event: React.KeyboardEvent<HTMLInputElement>,
) => {
  if (event.key === "Escape") {
    setShowSuggestions(false);
    setShowSearchHistory(false);
    return;
  }

  if (event.key === "Enter") {
    event.preventDefault();

    setShowSuggestions(false);
    setShowSearchHistory(false);

    handleSearch();
  }
};

  /*
   * Delete one search-history item.
   */
  const handleDeleteHistory = (
    event: React.MouseEvent,
    historyItem: string,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    setSearchHistory((currentHistory) => {
      const updatedHistory = currentHistory.filter(
        (item) => item !== historyItem,
      );

      localStorage.setItem(
        SEARCH_HISTORY_KEY,
        JSON.stringify(updatedHistory),
      );

      return updatedHistory;
    });
  };

  /*
   * Clear all search history.
   */
  const handleClearHistory = () => {
    localStorage.removeItem(SEARCH_HISTORY_KEY);
    setSearchHistory([]);
  };

  /*
   * Close search history when clicking outside.
   */
useEffect(() => {
  const handleOutsideClick = (
    event: MouseEvent,
  ) => {
    if (
      searchContainerRef.current &&
      !searchContainerRef.current.contains(
        event.target as Node,
      )
    ) {
      setShowSearchHistory(false);
      setShowSearchHistory(false);
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

useEffect(() => {
  const trimmedSearch = search.trim();

  if (!trimmedSearch) {
    setSuggestions([]);
    setShowSuggestions(false);
    setIsSearchingSuggestions(false);
    return;
  }

  let cancelled = false;

  const fetchSuggestions = async () => {
    try {
      setIsSearchingSuggestions(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products?search=${encodeURIComponent(
          trimmedSearch,
        )}&limit=6&sort=relevance`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch suggestions");
      }

      const result = await response.json();

      if (cancelled) return;

      setSuggestions(result?.data?.products ?? result?.data ?? []);
      setShowSuggestions(true);
    } catch (error) {
      if (cancelled) return;

      console.error("Search suggestions failed:", error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      if (!cancelled) {
        setIsSearchingSuggestions(false);
      }
    }
  };

  const timer = setTimeout(fetchSuggestions, 250);

  return () => {
    cancelled = true;
    clearTimeout(timer);
  };
}, [search]);


const handleSuggestionClick = (product: any) => {
  const value = product.name?.trim();

  if (!value) return;

  saveSearchHistory(value);
  setSearch(value);
  setShowSuggestions(false);
  setShowSearchHistory(false);

  router.push(
    `/mobiles?search=${encodeURIComponent(value)}`,
  );
};

  return (
    <header className="border-b border-blue-950 bg-[#08366f]">
      <div className="mx-auto flex h-16 max-w-7xl items-center px-4">

        {/* Logo - Left */}
        <Link
          href="/"
          className="flex shrink-0 items-center"
        >
          <Image
            src="/logo.png"
            alt="Smartprix"
            width={150}
            height={40}
            priority
            className="h-10 w-auto object-contain"
          />
        </Link>

        {/* Search - Center */}
        <div className="mx-auto w-full max-w-xl px-8">
          <div
            ref={searchContainerRef}
            className="relative"
          >
            <input
              type="text"
              value={search}
             onChange={(event) => {
  const value = event.target.value;

  setSearch(value);

  if (value.trim()) {
    setShowSearchHistory(false);
    setShowSuggestions(true);
  } else {
    setShowSuggestions(false);

    if (searchHistory.length > 0) {
      setShowSearchHistory(true);
    }
  }
}}
              onFocus={() => {
  if (search.trim()) {
    setShowSuggestions(true);
  } else if (searchHistory.length > 0) {
    setShowSearchHistory(true);
  }
}}
              onKeyDown={handleKeyDown}
              placeholder="Search for products, brands and more..."
              className="h-10 w-full rounded-full border border-gray-300 bg-white pl-5 pr-12 text-sm text-gray-800 outline-none transition focus:border-gray-500"
            />

            {/* Search Button */}
            <button
              type="button"
              onClick={() => handleSearch()}
              className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
              aria-label="Search"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
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
                  r="8"
                />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </button>

{showSuggestions && (
  <div className="absolute left-0 right-0 top-12 z-[200] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
    {isSearchingSuggestions ? (
      <div className="px-4 py-5 text-center text-sm text-gray-500">
        Searching...
      </div>
    ) : suggestions.length > 0 ? (
      <div className="py-2">
        <div className="border-b border-gray-100 px-4 py-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Search Suggestions
          </span>
        </div>

        {suggestions.map((product) => (
          <button
            key={product.id}
            type="button"
            onClick={() => handleSuggestionClick(product)}
            className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-gray-50"
          >
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="h-10 w-10 shrink-0 object-contain"
              />
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-400"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-800">
                {product.name}
              </p>

              {product.brand?.name && (
                <p className="text-xs text-gray-500">
                  {product.brand.name}
                </p>
              )}
            </div>

            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0 text-gray-400"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        ))}

        <button
          type="button"
          onClick={handleSearch}
          className="w-full border-t border-gray-100 px-4 py-3 text-left text-sm font-medium text-blue-600 hover:bg-gray-50"
        >
          Search for "{search.trim()}"
        </button>
      </div>
    ) : (
      <div className="px-4 py-4 text-sm text-gray-500">
        No products found
      </div>
    )}
  </div>
)}


            {/* Search Suggestions */}
{showSearchHistory  &&
  search.trim() &&
  (isSearchingSuggestions ||
    searchSuggestions.length > 0) && (
    <div className="absolute left-0 right-0 top-full z-[200] mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl">

      <div className="border-b border-gray-100 px-4 py-3">
        <span className="text-sm font-semibold text-gray-700">
          Search suggestions
        </span>
      </div>

      {isSearchingSuggestions ? (
        <div className="px-4 py-5 text-center text-sm text-gray-500">
          Searching...
        </div>
      ) : (
        <div className="py-1">
          {searchSuggestions.map((product) => {
            const image =
              product.images?.find(
                (item: any) =>
                  item.isPrimary,
              )?.url ??
              product.images?.[0]?.url;

            return (
              <button
                key={product.id}
                type="button"
                onClick={() => {
                  handleSearch(product.name);
                }}
                className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gray-50"
              >
                {/* Product Image */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-gray-100">
                  {image ? (
                    <Image
                      src={image}
                      alt={product.name}
                      width={40}
                      height={40}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-gray-400"
                    >
                      <rect
                        width="14"
                        height="20"
                        x="5"
                        y="2"
                        rx="2"
                        ry="2"
                      />
                      <path d="M12 18h.01" />
                    </svg>
                  )}
                </div>

                {/* Product Information */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-800">
                    {product.name}
                  </p>

                  {product.brand?.name && (
                    <p className="mt-0.5 text-xs text-gray-500">
                      {product.brand.name}
                    </p>
                  )}
                </div>

                {/* Arrow */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0 text-gray-400"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            );
          })}
        </div>
      )}
    </div>
  )}

{/* Recent Search History */}
{showSearchHistory &&
  !search.trim() &&
  searchHistory.length > 0 && (
    <div className="absolute left-0 right-0 top-full z-[200] mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <span className="text-sm font-semibold text-gray-700">
          Recent searches
        </span>

        <button
          type="button"
          onClick={handleClearHistory}
          className="text-xs font-medium text-blue-600 hover:text-blue-800"
        >
          Clear history
        </button>
      </div>

      {/* History */}
      <div className="py-1">
        {searchHistory.map(
          (historyItem) => (
            <div
              key={historyItem}
              className="group flex items-center"
            >
              <button
                type="button"
                onClick={() =>
                  handleSearch(historyItem)
                }
                className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0 text-gray-400"
                >
                  <path d="M3 12a9 9 0 1 0 3-6.7" />
                  <path d="M3 4v5h5" />
                  <path d="M12 7v5l3 2" />
                </svg>

                <span className="truncate">
                  {historyItem}
                </span>
              </button>

              <button
                type="button"
                onClick={(event) =>
                  handleDeleteHistory(
                    event,
                    historyItem,
                  )
                }
                className="mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 opacity-0 transition hover:bg-gray-100 hover:text-gray-700 group-hover:opacity-100"
                aria-label={`Remove ${historyItem} from search history`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 6h18" />
                  <path d="M8 6V4h8v2" />
                  <path d="M19 6l-1 14H6L5 6" />
                  <path d="M10 11v5" />
                  <path d="M14 11v5" />
                </svg>
              </button>
            </div>
          ),
        )}
      </div>
    </div>
  )}
          </div>
        </div>

        {/* Right Side */}
        <div className="flex shrink-0 items-center gap-5">

          {/* Login + Profile */}
          <Link
            href="/login"
            className="flex items-center gap-2 text-sm font-bold text-white transition hover:text-gray-200"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/30">
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
                <circle
                  cx="12"
                  cy="8"
                  r="4"
                />
                <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" />
              </svg>
            </span>

            <span>Login</span>
          </Link>

          {/* More Dropdown */}
          <div className="group relative">
            <button
              type="button"
              className="flex items-center gap-1 text-sm font-bold text-white transition hover:text-gray-200"
            >
              <span>More</span>

              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform duration-200 group-hover:rotate-180"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {/* Dropdown */}
            <div
              className="
                invisible absolute right-0 top-full z-[100]
                mt-3 w-52 rounded-lg border border-gray-200
                bg-white py-2 opacity-0 shadow-xl
                transition-all duration-200
                group-hover:visible group-hover:opacity-100
              "
            >
              <Link
                href="#"
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
              >
                <span>▶️</span>
                <span>YouTube</span>
              </Link>

              <Link
                href="#"
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
              >
                <span>𝕏</span>
                <span>Twitter / X</span>
              </Link>

              <Link
                href="#"
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
              >
                <span>📷</span>
                <span>Instagram</span>
              </Link>

              <Link
                href="#"
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
              >
                <span>f</span>
                <span>Facebook</span>
              </Link>

              <Link
                href="#"
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
              >
                <span>✈️</span>
                <span>Telegram</span>
              </Link>

              <Link
                href="#"
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
              >
                <span>💬</span>
                <span>WhatsApp</span>
              </Link>

              <Link
                href="#"
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
              >
                <span>in</span>
                <span>LinkedIn</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}