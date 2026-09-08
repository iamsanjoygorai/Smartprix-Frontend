"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { getAdminProducts } from "@/lib/api/adminProducts";

import ProductDeleteButton from "@/components/admin/ProductDeleteButton";
import ProductRestoreButton from "@/components/admin/ProductRestoreButton";

import AdminPermissionGuard from "@/components/admin/AdminPermissionGuard";
import AdminPermission from "@/components/admin/AdminPermission";

import type { Product } from "@/types/product";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "inactive">(
    "all",
  );
  const [category, setCategory] = useState("all");

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        setError("");

        const response = await getAdminProducts();

        setProducts(
          Array.isArray(response.data)
            ? response.data
            : [],
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load products.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  const categories = useMemo(() => {
    const unique = new Map<string, string>();

    products.forEach((product) => {
      if (product.category?.slug) {
        unique.set(
          product.category.slug,
          product.category.name,
        );
      }
    });

    return Array.from(unique.entries()).sort((a, b) =>
      a[1].localeCompare(b[1]),
    );
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.slug.toLowerCase().includes(query) ||
        product.brand?.name
          ?.toLowerCase()
          .includes(query) ||
        product.category?.name
          ?.toLowerCase()
          .includes(query);

      const matchesStatus =
        status === "all" ||
        (status === "active" && product.isActive) ||
        (status === "inactive" && !product.isActive);

      const matchesCategory =
        category === "all" ||
        product.category?.slug === category;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory
      );
    });
  }, [products, search, status, category]);

  const totalProducts = products.length;

  const activeProducts = products.filter(
    (product) => product.isActive,
  ).length;

  const inactiveProducts = products.filter(
    (product) => !product.isActive,
  ).length;

  const inStockProducts = products.filter((product) =>
    product.prices?.some((price) => price.inStock),
  ).length;

  return (
    <AdminPermissionGuard permission="products.view">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40">
        <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">

          {/* =====================================================
              HEADER
          ====================================================== */}
          <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-6 shadow-xl shadow-indigo-200/40 sm:p-8">
            <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-pink-300/20 blur-3xl" />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
                  <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.8)]" />
                  Product Management
                </div>

                <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                  Products
                </h1>

                <p className="mt-2 max-w-2xl text-sm text-indigo-100 sm:text-base">
                  Manage your complete product catalogue,
                  pricing, inventory and product status.
                </p>
              </div>

              <AdminPermission permission="products.create">
                <Link
                  href="/admin/products/new"
                  className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-sm font-bold text-indigo-700 shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-indigo-50"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-lg leading-none text-white">
                    +
                  </span>

                  Add Product

                  <span className="transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </Link>
              </AdminPermission>
            </div>
          </div>

          {/* =====================================================
              ERROR
          ====================================================== */}
          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-rose-50 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                  !
                </div>

                <div>
                  <p className="text-sm font-bold text-red-800">
                    Unable to load products
                  </p>

                  <p className="mt-0.5 text-xs text-red-600">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================
              STATS
          ====================================================== */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

            {/* Total */}
            <div className="group relative overflow-hidden rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-100/60">
              <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-indigo-100/60 blur-2xl transition group-hover:bg-indigo-200/60" />

              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Total Products
                  </p>

                  <p className="mt-2 text-3xl font-black text-slate-900">
                    {loading ? "—" : totalProducts}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Entire catalogue
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-xl text-white shadow-lg shadow-indigo-200">
                  📦
                </div>
              </div>
            </div>

            {/* Active */}
            <div className="group relative overflow-hidden rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-100/60">
              <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-emerald-100/60 blur-2xl" />

              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Active
                  </p>

                  <p className="mt-2 text-3xl font-black text-slate-900">
                    {loading ? "—" : activeProducts}
                  </p>

                  <p className="mt-1 text-xs text-emerald-600">
                    Live products
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-xl text-white shadow-lg shadow-emerald-200">
                  ✓
                </div>
              </div>
            </div>

            {/* Inactive */}
            <div className="group relative overflow-hidden rounded-2xl border border-amber-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-amber-100/60">
              <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-amber-100/60 blur-2xl" />

              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Inactive
                  </p>

                  <p className="mt-2 text-3xl font-black text-slate-900">
                    {loading ? "—" : inactiveProducts}
                  </p>

                  <p className="mt-1 text-xs text-amber-600">
                    Archived products
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-xl text-white shadow-lg shadow-amber-200">
                  ⏸
                </div>
              </div>
            </div>

            {/* Stock */}
            <div className="group relative overflow-hidden rounded-2xl border border-pink-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-pink-100/60">
              <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-pink-100/60 blur-2xl" />

              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    In Stock
                  </p>

                  <p className="mt-2 text-3xl font-black text-slate-900">
                    {loading ? "—" : inStockProducts}
                  </p>

                  <p className="mt-1 text-xs text-pink-600">
                    Currently available
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 text-xl text-white shadow-lg shadow-pink-200">
                  🛒
                </div>
              </div>
            </div>
          </div>

          {/* =====================================================
              FILTER BAR
          ====================================================== */}
          <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center">

              {/* Search */}
              <div className="relative flex-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m21 21-4.35-4.35m2.1-5.4a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z"
                    />
                  </svg>
                </div>

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search products, brands or categories..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              {/* Status */}
              <select
                value={status}
                onChange={(event) =>
                  setStatus(
                    event.target.value as
                      | "all"
                      | "active"
                      | "inactive",
                  )
                }
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              >
                <option value="all">
                  All Status
                </option>
                <option value="active">
                  Active
                </option>
                <option value="inactive">
                  Inactive
                </option>
              </select>

              {/* Category */}
              <select
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value)
                }
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              >
                <option value="all">
                  All Categories
                </option>

                {categories.map(
                  ([slug, name]) => (
                    <option
                      key={slug}
                      value={slug}
                    >
                      {name}
                    </option>
                  ),
                )}
              </select>
            </div>

            {/* Result count */}
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
              <p className="text-xs font-medium text-slate-500">
                Showing{" "}
                <span className="font-bold text-slate-800">
                  {loading
                    ? "—"
                    : filteredProducts.length}
                </span>{" "}
                of{" "}
                <span className="font-bold text-slate-800">
                  {loading ? "—" : totalProducts}
                </span>{" "}
                products
              </p>

              {(search ||
                status !== "all" ||
                category !== "all") && (
                <button
                  onClick={() => {
                    setSearch("");
                    setStatus("all");
                    setCategory("all");
                  }}
                  className="text-xs font-bold text-indigo-600 transition hover:text-indigo-800"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {/* =====================================================
              PRODUCT TABLE
          ====================================================== */}
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">

            {/* Table Header */}
            <div className="hidden border-b border-slate-100 bg-gradient-to-r from-slate-50 to-indigo-50/40 px-6 py-4 lg:grid lg:grid-cols-[minmax(280px,2fr)_1fr_1fr_1fr_120px_150px] lg:items-center lg:gap-4">
              <div className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                Product
              </div>

              <div className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                Brand
              </div>

              <div className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                Category
              </div>

              <div className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                Price
              </div>

              <div className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                Status
              </div>

              <div className="text-right text-[11px] font-black uppercase tracking-wider text-slate-500">
                Actions
              </div>
            </div>

            {/* Loading */}
            {loading && (
              <div className="divide-y divide-slate-100">
                {Array.from({ length: 6 }).map(
                  (_, index) => (
                    <div
                      key={index}
                      className="animate-pulse p-5 lg:px-6"
                    >
                      <div className="flex gap-4">
                        <div className="h-16 w-16 rounded-2xl bg-slate-200" />

                        <div className="flex-1">
                          <div className="h-4 w-48 rounded bg-slate-200" />
                          <div className="mt-2 h-3 w-32 rounded bg-slate-100" />
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}

            {/* Products */}
            {!loading &&
              filteredProducts.length > 0 && (
                <div className="divide-y divide-slate-100">
                  {filteredProducts.map(
                    (product) => {
                      const primaryImage =
                        product.images?.[0]?.url;

                      const inStock =
                        product.prices?.some(
                          (price) =>
                            price.inStock,
                        ) ?? false;

                      const lowestPrice =
                        product.prices?.length
                          ? product.prices.reduce(
                              (
                                lowest,
                                current,
                              ) =>
                                Number(
                                  current.amount,
                                ) <
                                Number(
                                  lowest.amount,
                                )
                                  ? current
                                  : lowest,
                              product.prices[0],
                            )
                          : null;

                      const rating =
                        product.averageRating ??
                        product.rating ??
                        null;

                      return (
                        <div
                          key={product.id}
                          className="group p-5 transition hover:bg-gradient-to-r hover:from-indigo-50/30 hover:to-purple-50/20 lg:px-6"
                        >
                          <div className="grid gap-5 lg:grid-cols-[minmax(280px,2fr)_1fr_1fr_1fr_120px_150px] lg:items-center lg:gap-4">

                            {/* Product */}
                            <div className="flex min-w-0 items-center gap-4">
                              <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-indigo-50 shadow-sm">
                                {primaryImage ? (
                                  <img
                                    src={
                                      primaryImage
                                    }
                                    alt={
                                      product
                                        .images?.[0]
                                        ?.altText ??
                                      product.name
                                    }
                                    className="h-full w-full object-contain p-2 transition duration-300 group-hover:scale-110"
                                  />
                                ) : (
                                  <span className="text-2xl">
                                    📱
                                  </span>
                                )}
                              </div>

                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <h3 className="truncate text-sm font-bold text-slate-900">
                                    {product.name}
                                  </h3>

                                  {!product.isActive && (
                                    <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                                      Archived
                                    </span>
                                  )}
                                </div>

                                <p className="mt-1 truncate text-xs text-slate-400">
                                  {product.slug}
                                </p>

                                {rating !==
                                  null && (
                                  <div className="mt-1 flex items-center gap-1">
                                    <span className="text-xs text-amber-500">
                                      ★
                                    </span>

                                    <span className="text-xs font-bold text-slate-600">
                                      {Number(
                                        rating,
                                      ).toFixed(1)}
                                    </span>

                                    {product.reviewCount !=
                                      null && (
                                      <span className="text-[11px] text-slate-400">
                                        (
                                        {
                                          product.reviewCount
                                        }{" "}
                                        reviews)
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Brand */}
                            <div className="flex items-center justify-between lg:block">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 lg:hidden">
                                Brand
                              </span>

                              <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
                                {product.brand?.name ??
                                  "N/A"}
                              </span>
                            </div>

                            {/* Category */}
                            <div className="flex items-center justify-between lg:block">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 lg:hidden">
                                Category
                              </span>

                              <span className="text-sm font-semibold text-slate-600">
                                {product.category
                                  ?.name ?? "N/A"}
                              </span>
                            </div>

                            {/* Price */}
                            <div className="flex items-center justify-between lg:block">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 lg:hidden">
                                Price
                              </span>

                              <div>
                                <p className="text-sm font-black text-slate-900">
                                  {lowestPrice
                                    ? `₹${Number(
                                        lowestPrice.amount,
                                      ).toLocaleString(
                                        "en-IN",
                                      )}`
                                    : "N/A"}
                                </p>

                                {lowestPrice?.seller
                                  ?.name && (
                                  <p className="mt-0.5 text-[10px] text-slate-400">
                                    via{" "}
                                    {
                                      lowestPrice
                                        .seller
                                        .name
                                    }
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Status */}
                            <div className="flex items-center justify-between lg:block">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 lg:hidden">
                                Status
                              </span>

                              <div className="flex flex-col items-end gap-1 lg:items-start">
                                {product.isActive ? (
                                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-100">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                    Active
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                                    Inactive
                                  </span>
                                )}

                                <span
                                  className={`text-[10px] font-semibold ${
                                    inStock
                                      ? "text-emerald-600"
                                      : "text-red-500"
                                  }`}
                                >
                                  {inStock
                                    ? "● In Stock"
                                    : "● Out of Stock"}
                                </span>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 lg:border-0 lg:pt-0">
                              <AdminPermission permission="products.update">
                                <Link
                                  href={`/admin/products/${product.id}`}
                                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                                >
                                  Edit
                                </Link>
                              </AdminPermission>

                              <AdminPermission permission="products.delete">
                                {product.isActive ? (
                                  <ProductDeleteButton
                                    productId={
                                      product.id
                                    }
                                    productName={
                                      product.name
                                    }
                                  />
                                ) : (
                                  <ProductRestoreButton
                                    productId={
                                      product.id
                                    }
                                    productName={
                                      product.name
                                    }
                                  />
                                )}
                              </AdminPermission>
                            </div>
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              )}

            {/* Empty */}
            {!loading &&
              filteredProducts.length === 0 && (
                <div className="px-6 py-20 text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-100 to-purple-100 text-3xl">
                    📦
                  </div>

                  <h3 className="mt-5 text-lg font-black text-slate-900">
                    No products found
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                    {search ||
                    status !== "all" ||
                    category !== "all"
                      ? "Try changing your search or filters."
                      : "Your product catalogue is currently empty."}
                  </p>

                  {(search ||
                    status !== "all" ||
                    category !== "all") && (
                    <button
                      onClick={() => {
                        setSearch("");
                        setStatus("all");
                        setCategory("all");
                      }}
                      className="mt-5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              )}
          </div>
        </div>
      </div>
    </AdminPermissionGuard>
  );
}