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
    if (event.key === "Enter") {
      event.preventDefault();
      handleSearch();
    }

    if (event.key === "Escape") {
      setShowSearchHistory(false);
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
              onChange={(event) =>
                setSearch(event.target.value)
              }
              onFocus={() => {
                setShowSearchHistory(true);
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

            {/* Search History Dropdown */}
            {showSearchHistory &&
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

                  {/* History Items */}
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
                              handleSearch(
                                historyItem,
                              )
                            }
                            className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50"
                          >
                            {/* History Icon */}
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

                            {/* Search Text */}
                            <span className="truncate">
                              {historyItem}
                            </span>
                          </button>

                          {/* Delete Button */}
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