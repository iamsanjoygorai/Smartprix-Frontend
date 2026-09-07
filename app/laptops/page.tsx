"use client";

import { useEffect, useState } from "react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import { apiFetch } from "@/lib/api/api";

import LaptopFilters from "@/components/laptops/LaptopFilters";
import LaptopList from "@/components/laptops/LaptopList";

import type { Laptop } from "@/components/laptops/LaptopCard";

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

function getSpecification(
  product: Product,
  keywords: string[],
): string | null {
  const specification =
    product.specifications?.find((item) => {
      const name =
        `${item.specification.name} ${item.specification.slug}`
          .toLowerCase();

      return keywords.some((keyword) =>
        name.includes(keyword.toLowerCase()),
      );
    });

  if (!specification) {
    return null;
  }

  return (
    specification.customValue ??
    specification.value?.value ??
    null
  );
}

function getPrimaryImage(
  product: Product,
): string {
  return (
    product.images?.find(
      (image) => image.isPrimary,
    )?.url ??
    product.images?.[0]?.url ??
    ""
  );
}

function convertProduct(
  product: Product,
): Laptop {
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

export default function LaptopsPage() {
  const router = useRouter();

  const searchParams =
    useSearchParams();

  /*
   * URL SEARCH
   */
  const urlSearch =
    searchParams.get("search") ?? "";

  /*
   * FILTER STATE
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
   * PRODUCT STATE
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
   * PAGINATION
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
   * SORT
   */
  const [sortBy, setSortBy] =
    useState("relevance");

  /*
   * BRAND COUNTS
   */
  const [brandCounts, setBrandCounts] =
    useState<Record<string, number>>(
      {},
    );

  /*
   * ─────────────────────────────────────
   * LOAD SEARCH FROM URL
   * ─────────────────────────────────────
   */
  useEffect(() => {
    setSearch(urlSearch);
  }, [urlSearch]);

  /*
   * ─────────────────────────────────────
   * SEARCH
   * ─────────────────────────────────────
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
  };

  /*
   * ─────────────────────────────────────
   * BRAND
   * ─────────────────────────────────────
   */
  const handleBrandChange = (
    brand: string,
  ) => {
    setBrands((current) =>
      current.includes(brand)
        ? current.filter(
            (item) =>
              item !== brand,
          )
        : [...current, brand],
    );

    setPage(1);
  };

  /*
   * ─────────────────────────────────────
   * PROCESSOR
   * ─────────────────────────────────────
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
   * ─────────────────────────────────────
   * RAM
   * ─────────────────────────────────────
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
   * ─────────────────────────────────────
   * STORAGE
   * ─────────────────────────────────────
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
   * ─────────────────────────────────────
   * GPU
   * ─────────────────────────────────────
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
   * ─────────────────────────────────────
   * DISPLAY
   * ─────────────────────────────────────
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
   * ─────────────────────────────────────
   * PRICE
   * ─────────────────────────────────────
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
   * ─────────────────────────────────────
   * CLEAR ALL
   * ─────────────────────────────────────
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

    const params =
      new URLSearchParams(
        searchParams.toString(),
      );

    params.delete("search");

    router.replace(
      "/laptops",
      {
        scroll: false,
      },
    );
  };

  /*
   * ─────────────────────────────────────
   * FETCH LAPTOPS
   * ─────────────────────────────────────
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
          if (
            brands.length > 0
          ) {
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
     * Debounce search/filter requests
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

  return (
    <div className="min-h-screen bg-[#f1f3f6]">
      <div className="mx-auto flex w-full max-w-[1200px] gap-3 px-2 py-3">

        {/* LEFT FILTER SIDEBAR */}
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

        {/* MAIN CONTENT */}
        <main className="min-w-0 flex-1">
          {/* PAGE HEADER */}
          <section className="mb-3 rounded-sm border border-gray-200 bg-white px-4 py-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Laptops
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  {loading
                    ? "Finding laptops..."
                    : `${total.toLocaleString(
                        "en-IN",
                      )} laptops`}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  Sort By
                </span>

                <select
                  value={sortBy}
                  onChange={(event) => {
                    setSortBy(
                      event.target.value,
                    );
                    setPage(1);
                  }}
                  className="rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-500"
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
          </section>

          {/* SEARCH SUMMARY */}
          {search.trim() && (
            <div className="mb-3 rounded-sm border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
              Showing results for{" "}
              <span className="font-semibold">
                "{search.trim()}"
              </span>
            </div>
          )}

          {/* ERROR */}
          {!loading && error && (
            <div className="mb-3 rounded-sm border border-red-200 bg-white px-4 py-10 text-center">
              <p className="text-sm text-red-600">
                {error}
              </p>

              <button
                type="button"
                onClick={() =>
                  window.location.reload()
                }
                className="mt-3 rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Try Again
              </button>
            </div>
          )}

          {/* LAPTOP LIST */}
          {!error && (
            <LaptopList
              laptops={laptops}
              loading={loading}
            />
          )}

          {/* PAGINATION */}
          {!loading &&
            !error &&
            totalPages > 1 && (
              <div className="mt-3 flex items-center justify-center gap-3 rounded-sm border border-gray-200 bg-white px-4 py-4">
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
                          current - 1,
                        ),
                    )
                  }
                  className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                <span className="text-sm text-gray-600">
                  Page{" "}
                  <strong>
                    {page}
                  </strong>{" "}
                  of{" "}
                  <strong>
                    {totalPages}
                  </strong>
                </span>

                <button
                  type="button"
                  disabled={
                    !hasNextPage
                  }
                  onClick={() =>
                    setPage(
                      (current) =>
                        current + 1,
                    )
                  }
                  className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
        </main>
      </div>
    </div>
  );
}