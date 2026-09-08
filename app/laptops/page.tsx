"use client";

import { useEffect, useMemo, useState } from "react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import { apiFetch } from "@/lib/api/api";

import LaptopFilters from "@/components/laptops/LaptopFilters";
import LaptopList from "@/components/laptops/LaptopList";

import type { Laptop } from "@/components/laptops/LaptopCard";

interface ProductImage {
  id?: string;
  url: string;
  altText?: string | null;
  isPrimary?: boolean;
  sortOrder?: number;
}

interface ProductPrice {
  id?: string;
  amount: string | number;
  currency: string;
  inStock: boolean;
  seller?: {
    id?: string;
    name: string;
    slug?: string;
    logoUrl?: string | null;
  } | null;
}

interface ProductVariant {
  id: string;
  name: string;
  color?: string | null;
  storage?: string | null;
  ram?: string | null;
}

interface ProductSpecification {
  specification: {
    name: string;
    slug: string;
    unit?: string | null;
  };
  value?: {
    value: string;
  } | null;
  customValue?: string | null;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string | null;
  description?: string | null;

  brand?: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string | null;
  } | null;

  images: ProductImage[];
  prices: ProductPrice[];
  variants?: ProductVariant[];
  specifications?: ProductSpecification[];
  releaseDate?: string | null;
}

interface ProductsResponse {
  success: boolean;

  data: {
    products: Product[];

    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };

    brandCounts: Record<string, number>;
  };
}

function convertProduct(product: Product): Laptop {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,

    shortDescription:
      product.shortDescription,

    description:
      product.description,

    brand: product.brand,

    images: product.images,

    variants: product.variants,

    prices: product.prices,

    specifications:
      product.specifications,

    releaseDate:
      product.releaseDate,
  };
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 6h16" />
      <path d="M7 12h10" />
      <path d="M10 18h4" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export default function LaptopsPage() {
  const router = useRouter();

  const searchParams = useSearchParams();

  /*
   * ======================================================
   * URL SEARCH
   * ======================================================
   */

  const urlSearch =
    searchParams.get("search") ?? "";

  /*
   * ======================================================
   * FILTER STATE
   * ======================================================
   */

  const [search, setSearch] =
    useState("");

  const [brands, setBrands] =
    useState<string[]>([]);

  const [processors, setProcessors] =
    useState<string[]>([]);

  const [rams, setRams] =
    useState<string[]>([]);

  const [storages, setStorages] =
    useState<string[]>([]);

  const [gpus, setGpus] =
    useState<string[]>([]);

  const [displays, setDisplays] =
    useState<string[]>([]);

  const [minPrice, setMinPrice] =
    useState("");

  const [maxPrice, setMaxPrice] =
    useState("");

  /*
   * ======================================================
   * PRODUCT STATE
   * ======================================================
   */

  const [laptops, setLaptops] =
    useState<Laptop[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [total, setTotal] =
    useState(0);

  /*
   * ======================================================
   * PAGINATION
   * ======================================================
   */

  const [page, setPage] =
    useState(1);

  const [totalPages, setTotalPages] =
    useState(1);

  const [hasNextPage, setHasNextPage] =
    useState(false);

  const [
    hasPreviousPage,
    setHasPreviousPage,
  ] = useState(false);

  /*
   * ======================================================
   * SORT
   * ======================================================
   */

  const [sortBy, setSortBy] =
    useState("relevance");

  /*
   * ======================================================
   * BRAND COUNTS
   * ======================================================
   */

  const [brandCounts, setBrandCounts] =
    useState<Record<string, number>>({});

  /*
   * ======================================================
   * MOBILE FILTER VISIBILITY
   * ======================================================
   */

  const [showMobileFilters, setShowMobileFilters] =
    useState(false);

  /*
   * ======================================================
   * SYNC SEARCH FROM URL
   * ======================================================
   */

  useEffect(() => {
    setSearch(urlSearch);
  }, [urlSearch]);

  /*
   * ======================================================
   * SEARCH
   * ======================================================
   */

  const handleSearchChange = (
    value: string,
  ) => {
    const trimmedValue =
      value.trim();

    const params =
      new URLSearchParams(
        searchParams.toString(),
      );

    if (trimmedValue) {
      params.set(
        "search",
        trimmedValue,
      );
    } else {
      params.delete("search");
    }

    const queryString =
      params.toString();

    router.replace(
      queryString
        ? `/laptops?${queryString}`
        : "/laptops",
      {
        scroll: false,
      },
    );

    setPage(1);
  };

  /*
   * ======================================================
   * BRAND
   * ======================================================
   */

  const handleBrandChange = (
    brand: string,
  ) => {
    setBrands((current) =>
      current.includes(brand)
        ? current.filter(
            (item) => item !== brand,
          )
        : [...current, brand],
    );

    setPage(1);
  };

  /*
   * ======================================================
   * PROCESSOR
   * ======================================================
   */

  const handleProcessorChange = (
    processor: string,
  ) => {
    setProcessors((current) =>
      current.includes(processor)
        ? current.filter(
            (item) =>
              item !== processor,
          )
        : [
            ...current,
            processor,
          ],
    );

    setPage(1);
  };

  /*
   * ======================================================
   * RAM
   * ======================================================
   */

  const handleRamChange = (
    ram: string,
  ) => {
    setRams((current) =>
      current.includes(ram)
        ? current.filter(
            (item) => item !== ram,
          )
        : [...current, ram],
    );

    setPage(1);
  };

  /*
   * ======================================================
   * STORAGE
   * ======================================================
   */

  const handleStorageChange = (
    storage: string,
  ) => {
    setStorages((current) =>
      current.includes(storage)
        ? current.filter(
            (item) =>
              item !== storage,
          )
        : [
            ...current,
            storage,
          ],
    );

    setPage(1);
  };

  /*
   * ======================================================
   * GPU
   * ======================================================
   */

  const handleGpuChange = (
    gpu: string,
  ) => {
    setGpus((current) =>
      current.includes(gpu)
        ? current.filter(
            (item) => item !== gpu,
          )
        : [...current, gpu],
    );

    setPage(1);
  };

  /*
   * ======================================================
   * DISPLAY
   * ======================================================
   */

  const handleDisplayChange = (
    display: string,
  ) => {
    setDisplays((current) =>
      current.includes(display)
        ? current.filter(
            (item) =>
              item !== display,
          )
        : [
            ...current,
            display,
          ],
    );

    setPage(1);
  };

  /*
   * ======================================================
   * PRICE
   * ======================================================
   */

  const handlePriceChange = (
    min: string,
    max: string,
  ) => {
    setMinPrice(min);
    setMaxPrice(max);
    setPage(1);
  };

  /*
   * ======================================================
   * CLEAR ALL
   * ======================================================
   */

  const handleClearAll = () => {
    setBrands([]);
    setProcessors([]);
    setRams([]);
    setStorages([]);
    setGpus([]);
    setDisplays([]);

    setMinPrice("");
    setMaxPrice("");

    setPage(1);

    router.replace(
      "/laptops",
      {
        scroll: false,
      },
    );
  };

  /*
   * ======================================================
   * ACTIVE FILTER COUNT
   * ======================================================
   */

  const activeFilterCount = useMemo(() => {
    let count = 0;

    count += brands.length;
    count += processors.length;
    count += rams.length;
    count += storages.length;
    count += gpus.length;
    count += displays.length;

    if (minPrice || maxPrice) {
      count += 1;
    }

    return count;
  }, [
    brands,
    processors,
    rams,
    storages,
    gpus,
    displays,
    minPrice,
    maxPrice,
  ]);

  /*
   * ======================================================
   * FETCH LAPTOPS
   * ======================================================
   */

  useEffect(() => {
    let cancelled = false;

    const fetchLaptops =
      async () => {
        try {
          setLoading(true);
          setError("");

          const params =
            new URLSearchParams();

          /*
           * CATEGORY
           */

          params.set(
            "category",
            "laptops",
          );

          /*
           * PAGINATION
           */

          params.set(
            "page",
            String(page),
          );

          params.set(
            "limit",
            "20",
          );

          /*
           * SEARCH
           */

          const trimmedSearch =
            search.trim();

          if (trimmedSearch) {
            params.set(
              "search",
              trimmedSearch,
            );
          }

          /*
           * BRANDS
           */

          if (brands.length > 0) {
            params.set(
              "brands",
              brands.join(","),
            );
          }

          /*
           * PRICE
           */

          if (minPrice) {
            params.set(
              "minPrice",
              minPrice,
            );
          }

          if (maxPrice) {
            params.set(
              "maxPrice",
              maxPrice,
            );
          }

          /*
           * PROCESSOR
           */

          if (
            processors.length > 0
          ) {
            params.set(
              "processors",
              processors.join(","),
            );
          }

          /*
           * RAM
           */

          if (rams.length > 0) {
            params.set(
              "rams",
              rams.join(","),
            );
          }

          /*
           * STORAGE
           */

          if (
            storages.length > 0
          ) {
            params.set(
              "storages",
              storages.join(","),
            );
          }

          /*
           * GPU
           */

          if (gpus.length > 0) {
            params.set(
              "gpus",
              gpus.join(","),
            );
          }

          /*
           * DISPLAY
           */

          if (
            displays.length > 0
          ) {
            params.set(
              "displays",
              displays.join(","),
            );
          }

          /*
           * SORT
           */

          if (sortBy) {
            params.set(
              "sort",
              sortBy,
            );
          }

          console.log(
            "💻 LAPTOP API:",
            `/products?${params.toString()}`,
          );

          const response =
            await apiFetch<ProductsResponse>(
              `/products?${params.toString()}`,
            );

          if (cancelled) {
            return;
          }

          const data =
            response.data;

          /*
           * PRODUCTS
           */

          setLaptops(
            (data.products ?? []).map(
              convertProduct,
            ),
          );

          /*
           * PAGINATION
           */

          setTotal(
            data.pagination?.total ??
              0,
          );

          setTotalPages(
            data.pagination
              ?.totalPages ?? 1,
          );

          setHasNextPage(
            data.pagination
              ?.hasNextPage ?? false,
          );

          setHasPreviousPage(
            data.pagination
              ?.hasPreviousPage ??
              false,
          );

          /*
           * BRAND COUNTS
           */

          setBrandCounts(
            data.brandCounts ?? {},
          );
        } catch (err) {
          if (cancelled) {
            return;
          }

          console.error(
            "Failed to fetch laptops:",
            err,
          );

          setError(
            "Failed to load laptops.",
          );

          setLaptops([]);
          setTotal(0);
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      };

    /*
     * Debounce requests
     */

    const timeout =
      setTimeout(
        fetchLaptops,
        300,
      );

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [
    search,
    brands,
    processors,
    rams,
    storages,
    gpus,
    displays,
    minPrice,
    maxPrice,
    sortBy,
    page,
  ]);

  /*
   * ======================================================
   * PAGE
   * ======================================================
   */

  return (
    <div className="min-h-screen bg-[#f1f3f6]">
      <div className="mx-auto flex w-full max-w-[1280px] gap-3 px-2 py-3 sm:px-3">
        {/* ==================================================
            DESKTOP FILTER SIDEBAR
            ================================================== */}

        <aside className="hidden w-[275px] shrink-0 lg:block">
          <LaptopFilters
            search={search}
            brands={brands}
            processors={processors}
            rams={rams}
            storages={storages}
            gpus={gpus}
            displays={displays}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onSearchChange={
              handleSearchChange
            }
            onBrandChange={
              handleBrandChange
            }
            onProcessorChange={
              handleProcessorChange
            }
            onRamChange={
              handleRamChange
            }
            onStorageChange={
              handleStorageChange
            }
            onGpuChange={
              handleGpuChange
            }
            onDisplayChange={
              handleDisplayChange
            }
            onPriceChange={
              handlePriceChange
            }
            onClearAll={
              handleClearAll
            }
          />
        </aside>

        {/* ==================================================
            MAIN CONTENT
            ================================================== */}

        <main className="min-w-0 flex-1">
          {/* ==================================================
              PAGE HEADER
              ================================================== */}

          <section className="mb-3 rounded-sm border border-gray-200 bg-white">
            <div className="px-4 py-4 sm:px-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-semibold tracking-tight text-gray-900">
                      Laptops
                    </h1>

                    {!loading && (
                      <span className="text-sm text-gray-500">
                        ({total.toLocaleString(
                          "en-IN",
                        )})
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-sm text-gray-500">
                    {loading
                      ? "Finding laptops..."
                      : "Compare laptops, specifications and prices from multiple sellers."}
                  </p>
                </div>

                {/* Sort */}
                <div className="flex shrink-0 items-center gap-2">
                  <span className="hidden text-sm text-gray-500 sm:inline">
                    Sort by
                  </span>

                  <select
                    value={sortBy}
                    onChange={(event) => {
                      setSortBy(
                        event.target.value,
                      );
                      setPage(1);
                    }}
                    className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    aria-label="Sort laptops"
                  >
                    <option value="relevance">
                      Relevance
                    </option>

                    <option value="newest">
                      Newest
                    </option>

                    <option value="oldest">
                      Oldest
                    </option>

                    <option value="name_asc">
                      Name: A to Z
                    </option>

                    <option value="name_desc">
                      Name: Z to A
                    </option>

                    <option value="price_asc">
                      Price: Low to High
                    </option>

                    <option value="price_desc">
                      Price: High to Low
                    </option>

                    <option value="rating_desc">
                      Rating: High to Low
                    </option>
                  </select>
                </div>
              </div>
            </div>

            {/* Mobile filter button */}
            <div className="border-t border-gray-100 px-4 py-3 lg:hidden">
              <button
                type="button"
                onClick={() =>
                  setShowMobileFilters(
                    (current) =>
                      !current,
                  )
                }
                className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-blue-500 hover:text-blue-600"
              >
                <FilterIcon />

                Filters

                {activeFilterCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[11px] font-semibold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </section>

          {/* ==================================================
              MOBILE FILTER PANEL
              ================================================== */}

          {showMobileFilters && (
            <section className="mb-3 lg:hidden">
              <LaptopFilters
                search={search}
                brands={brands}
                processors={processors}
                rams={rams}
                storages={storages}
                gpus={gpus}
                displays={displays}
                minPrice={minPrice}
                maxPrice={maxPrice}
                onSearchChange={
                  handleSearchChange
                }
                onBrandChange={
                  handleBrandChange
                }
                onProcessorChange={
                  handleProcessorChange
                }
                onRamChange={
                  handleRamChange
                }
                onStorageChange={
                  handleStorageChange
                }
                onGpuChange={
                  handleGpuChange
                }
                onDisplayChange={
                  handleDisplayChange
                }
                onPriceChange={
                  handlePriceChange
                }
                onClearAll={
                  handleClearAll
                }
              />
            </section>
          )}

          {/* ==================================================
              SEARCH SUMMARY
              ================================================== */}

          {search.trim() && (
            <div className="mb-3 flex flex-wrap items-center gap-2 rounded-sm border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
              <span>
                Showing results for
              </span>

              <span className="font-semibold">
                "{search.trim()}"
              </span>

              <button
                type="button"
                onClick={() =>
                  handleSearchChange("")
                }
                className="ml-auto flex h-6 w-6 items-center justify-center rounded-full hover:bg-blue-100"
                aria-label="Clear search"
              >
                <CloseIcon />
              </button>
            </div>
          )}

          {/* ==================================================
              ACTIVE FILTERS
              ================================================== */}

          {activeFilterCount > 0 && (
            <div className="mb-3 rounded-sm border border-gray-200 bg-white px-4 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Active filters
                </span>

                {brands.map((brand) => (
                  <button
                    key={`brand-${brand}`}
                    type="button"
                    onClick={() =>
                      handleBrandChange(
                        brand,
                      )
                    }
                    className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
                  >
                    {brand}

                    <CloseIcon />
                  </button>
                ))}

                {processors.map(
                  (processor) => (
                    <button
                      key={`processor-${processor}`}
                      type="button"
                      onClick={() =>
                        handleProcessorChange(
                          processor,
                        )
                      }
                      className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
                    >
                      {processor}

                      <CloseIcon />
                    </button>
                  ),
                )}

                {rams.map((ram) => (
                  <button
                    key={`ram-${ram}`}
                    type="button"
                    onClick={() =>
                      handleRamChange(
                        ram,
                      )
                    }
                    className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
                  >
                    {ram}

                    <CloseIcon />
                  </button>
                ))}

                {storages.map(
                  (storage) => (
                    <button
                      key={`storage-${storage}`}
                      type="button"
                      onClick={() =>
                        handleStorageChange(
                          storage,
                        )
                      }
                      className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
                    >
                      {storage}

                      <CloseIcon />
                    </button>
                  ),
                )}

                {gpus.map((gpu) => (
                  <button
                    key={`gpu-${gpu}`}
                    type="button"
                    onClick={() =>
                      handleGpuChange(
                        gpu,
                      )
                    }
                    className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
                  >
                    {gpu}

                    <CloseIcon />
                  </button>
                ))}

                {displays.map(
                  (display) => (
                    <button
                      key={`display-${display}`}
                      type="button"
                      onClick={() =>
                        handleDisplayChange(
                          display,
                        )
                      }
                      className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
                    >
                      {display}

                      <CloseIcon />
                    </button>
                  ),
                )}

                {(minPrice ||
                  maxPrice) && (
                  <button
                    type="button"
                    onClick={() =>
                      handlePriceChange(
                        "",
                        "",
                      )
                    }
                    className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
                  >
                    {minPrice
                      ? `₹${Number(
                          minPrice,
                        ).toLocaleString(
                          "en-IN",
                        )}`
                      : "₹0"}{" "}
                    –{" "}
                    {maxPrice
                      ? `₹${Number(
                          maxPrice,
                        ).toLocaleString(
                          "en-IN",
                        )}`
                      : "Above ₹1L"}

                    <CloseIcon />
                  </button>
                )}

                <button
                  type="button"
                  onClick={
                    handleClearAll
                  }
                  className="ml-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
                >
                  Clear all
                </button>
              </div>
            </div>
          )}

          {/* ==================================================
              ERROR
              ================================================== */}

          {!loading && error && (
            <div className="mb-3 rounded-sm border border-red-200 bg-white px-6 py-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
                !
              </div>

              <p className="mt-4 text-sm font-medium text-red-600">
                {error}
              </p>

              <button
                type="button"
                onClick={() =>
                  window.location.reload()
                }
                className="mt-4 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Try Again
              </button>
            </div>
          )}

          {/* ==================================================
              LAPTOP LIST
              ================================================== */}

          {!error && (
            <LaptopList
              laptops={laptops}
              loading={loading}
            />
          )}

          {/* ==================================================
              PAGINATION
              ================================================== */}

          {!loading &&
            !error &&
            totalPages > 1 && (
              <div className="mt-3 rounded-sm border border-gray-200 bg-white px-4 py-4">
                <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                  <p className="text-xs text-gray-500">
                    Page{" "}
                    <span className="font-semibold text-gray-700">
                      {page}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-gray-700">
                      {totalPages}
                    </span>
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={
                        !hasPreviousPage
                      }
                      onClick={() =>
                        setPage(
                          (current) =>
                            Math.max(
                              1,
                              current -
                                1,
                            ),
                        )
                      }
                      className="flex items-center gap-1 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-blue-500 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeftIcon />
                      Previous
                    </button>

                    <span className="flex h-9 min-w-9 items-center justify-center rounded-md bg-blue-600 px-2 text-sm font-semibold text-white">
                      {page}
                    </span>

                    <button
                      type="button"
                      disabled={
                        !hasNextPage
                      }
                      onClick={() =>
                        setPage(
                          (current) =>
                            current +
                            1,
                        )
                      }
                      className="flex items-center gap-1 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-blue-500 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                      <ChevronRightIcon />
                    </button>
                  </div>
                </div>
              </div>
            )}

          {/* ==================================================
              BOTTOM SPACING
              ================================================== */}

          <div className="h-20" />
        </main>
      </div>
    </div>
  );
}
