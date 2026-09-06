"use client";

import { useEffect, useState } from "react";
import MobileCard from "./MobileCard";
import { apiFetch } from "@/lib/api/api";

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
  url: string;
  altText?: string | null;
  isPrimary?: boolean;
}

interface ProductPrice {
  amount: string | number;
  seller?: {
    name: string;
    slug: string;
  } | null;
}

interface ProductVariant {
  storage?: string | null;
  ram?: string | null;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  brand?: {
    name: string;
    slug: string;
  } | null;
  images: ProductImage[];
  prices: ProductPrice[];
  variants?: ProductVariant[];
  specifications?: ProductSpecification[];
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
  };
}

interface MobileListProps {
  search: string;
  brands: string[];
  minPrice: string;
  maxPrice: string;
}

function getSpecification(
  product: Product,
  slugs: string[],
) {
  const specification = product.specifications?.find((item) =>
    slugs.includes(item.specification.slug),
  );

  if (!specification) {
    return null;
  }

  return (
    specification.customValue ??
    specification.value?.value ??
    null
  );
}

function getPrimaryImage(product: Product) {
  const primary =
    product.images?.find((image) => image.isPrimary);

  return (
    primary?.url ??
    product.images?.[0]?.url ??
    "/placeholder-mobile.png"
  );
}

function getLowestPrice(product: Product) {
  if (!product.prices?.length) {
    return null;
  }

  return product.prices.reduce((lowest, current) =>
    Number(current.amount) < Number(lowest.amount)
      ? current
      : lowest,
  );
}

function formatPrice(amount: string | number | null) {
  if (amount === null) {
    return "Price unavailable";
  }

  return `₹${Number(amount).toLocaleString("en-IN")}`;
}

function convertProduct(product: Product) {
  const lowestPrice = getLowestPrice(product);

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: formatPrice(
      lowestPrice ? lowestPrice.amount : null,
    ),
    score: 0,
    rating: 0,
    image: getPrimaryImage(product),

    display:
      getSpecification(product, [
        "display",
        "display-type",
        "screen-size",
      ]) ?? "Display information unavailable",

    battery:
      getSpecification(product, [
        "battery",
        "battery-capacity",
      ]) ?? "Battery information unavailable",

    camera:
      getSpecification(product, [
        "camera",
        "rear-camera",
        "main-camera",
      ]) ?? "Camera information unavailable",

    storage:
      getSpecification(product, [
        "storage",
        "internal-storage",
      ]) ??
      product.variants?.[0]?.storage ??
      "Storage information unavailable",

    ram:
      getSpecification(product, ["ram"]) ??
      product.variants?.[0]?.ram ??
      null,
  };
}

export default function MobileList({
  search,
  brands,
  minPrice,
  maxPrice,
}: MobileListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] =
    useState<ProductsResponse["data"]["pagination"] | null>(
      null,
    );

  const [sort, setSort] = useState("relevance");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams();

        params.set("category", "mobiles");
        params.set("page", String(page));
        params.set("limit", "20");

        if (search.trim()) {
          params.set("search", search.trim());
        }

        if (brands.length > 0) {
  params.set("brands", brands.join(","));
}

        if (minPrice) {
          params.set("minPrice", minPrice);
        }

        if (maxPrice) {
          params.set("maxPrice", maxPrice);
        }

        if (sort !== "relevance") {
          params.set("sort", sort);
        }

        const response = await apiFetch<ProductsResponse>(
          `/products?${params.toString()}`,
          {
            signal: controller.signal,
          },
        );

        if (!response.success) {
          throw new Error("Failed to load mobile phones.");
        }

        setProducts(response.data.products);
        setPagination(response.data.pagination);
      } catch (err) {
        if (
          err instanceof DOMException &&
          err.name === "AbortError"
        ) {
          return;
        }

        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load mobile phones.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadProducts();

    return () => controller.abort();
  }, [
  search,
  brands,
  minPrice,
  maxPrice,
  page,
]);

  // Reset to page 1 whenever filters change.
 useEffect(() => {
  setPage(1);
}, [search, brands, minPrice, maxPrice]);

  return (
    <section className="overflow-hidden rounded-sm border border-gray-300 bg-white">
      {/* HEADER */}
      <div className="flex flex-col gap-3 border-b bg-white px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-medium text-gray-800">
          {loading
            ? "Loading Mobile Phones..."
            : `${pagination?.total ?? 0} Mobile Phones`}
        </h2>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">
            ☷
          </span>

          <span className="text-sm text-gray-700">
            Sort By
          </span>

          <select
            value={sort}
            onChange={(event) => {
              setSort(event.target.value);
              setPage(1);
            }}
            className="rounded border border-gray-300 bg-white px-3 py-2 text-sm"
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
          </select>
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="px-4 py-12 text-center text-sm text-gray-500">
          Loading mobile phones...
        </div>
      )}

      {/* ERROR */}
      {!loading && error && (
        <div className="px-4 py-12 text-center">
          <p className="text-sm text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-3 rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Try Again
          </button>
        </div>
      )}

      {/* EMPTY */}
      {!loading &&
        !error &&
        products.length === 0 && (
          <div className="px-4 py-12 text-center text-sm text-gray-500">
            No mobile phones found.
          </div>
        )}

      {/* PRODUCTS */}
      {!loading &&
        !error &&
        products.length > 0 && (
          <div>
            {products.map((product) => (
              <MobileCard
                key={product.id}
                mobile={convertProduct(product)}
              />
            ))}
          </div>
        )}

      {/* PAGINATION */}
      {!loading &&
        !error &&
        pagination &&
        pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 border-t px-4 py-4">
            <button
              type="button"
              disabled={!pagination.hasPreviousPage}
              onClick={() =>
                setPage((current) =>
                  Math.max(1, current - 1),
                )
              }
              className="rounded border border-gray-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            <span className="px-3 text-sm text-gray-600">
              Page {pagination.page} of{" "}
              {pagination.totalPages}
            </span>

            <button
              type="button"
              disabled={!pagination.hasNextPage}
              onClick={() =>
                setPage((current) => current + 1)
              }
              className="rounded border border-gray-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
    </section>
  );
}