"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { apiFetch } from "@/lib/api/client";
import { getCategories } from "@/lib/api/categories";
import { getBrands } from "@/lib/api/brands";
import { getSellers } from "@/lib/api/sellers";
import { updateProduct } from "@/lib/api/adminProducts";

import type { ApiResponse } from "@/types/api";
import type { Product } from "@/types/product";
import type { AdminCategory } from "@/lib/api/categories";
import type { AdminBrand } from "@/lib/api/brands";
import type { AdminSeller } from "@/lib/api/sellers";

interface FormOptions {
  categories: AdminCategory[];
  brands: AdminBrand[];
  sellers: AdminSeller[];
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

function getFullImageUrl(url: string) {
  if (!url) return "";

  // Already a complete URL
  if (
    url.startsWith("http://") ||
    url.startsWith("https://")
  ) {
    return url;
  }

  // NEXT_PUBLIC_API_URL is likely:
  // http://localhost:5000/api
  // Static uploads are served from:
  // http://localhost:5000/uploads/...
  const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

  if (url.startsWith("/")) {
    return `${API_ORIGIN}${url}`;
  }

  return `${API_ORIGIN}/${url}`;
}

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();

  const productId = String(params.id);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [brandSlug, setBrandSlug] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [sellerSlug, setSellerSlug] = useState("");
  const [price, setPrice] = useState("");

  const [images, setImages] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState("");

  const [ram, setRam] = useState("");
  const [storage, setStorage] = useState("");
  const [processor, setProcessor] = useState("");

  const [options, setOptions] = useState<FormOptions>({
    categories: [],
    brands: [],
    sellers: [],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const primaryImage = images[0] ?? "";

  const imageCountLabel = useMemo(() => {
    if (images.length === 0) return "No images added";
    if (images.length === 1) return "1 image";
    return `${images.length} images`;
  }, [images.length]);

  useEffect(() => {
    async function loadProduct() {
      try {
        const [
          productResponse,
          categoriesResponse,
          brandsResponse,
          sellersResponse,
        ] = await Promise.all([
          apiFetch<ApiResponse<Product>>(
            `/admin/products/${productId}`,
          ),
          getCategories(),
          getBrands(),
          getSellers(),
        ]);

        const product = productResponse.data;

        setName(product.name);
        setDescription(product.description ?? "");
        setBrandSlug(product.brand.slug);
        setCategorySlug(product.category.slug);

        setImages(
  (product.images ?? []).map((image) => image.url),
);

        const cheapestPrice = product.prices?.[0];

        setPrice(cheapestPrice?.amount ?? "");
        setSellerSlug(
          cheapestPrice?.seller?.slug ?? "",
        );

        setOptions({
          categories: categoriesResponse.data,
          brands: brandsResponse.data,
          sellers: sellersResponse.data,
        });

        const specificationResponse =
          await apiFetch<
            ApiResponse<
              Array<{
                id: string;
                key: string;
                value: {
                  id: string;
                  specificationId: string;
                  value: string;
                  createdAt: string;
                } | null;
              }>
            >
          >(`/products/${productId}/specifications`);

        for (const specification of specificationResponse.data) {
          if (!specification.value) continue;

          if (specification.key === "ram") {
            setRam(specification.value.value);
          }

          if (specification.key === "storage") {
            setStorage(specification.value.value);
          }

          if (specification.key === "processor") {
            setProcessor(specification.value.value);
          }
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load product.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [productId]);

  function addImageUrl() {
    const trimmed = imageUrl.trim();

    if (!trimmed) return;

    if (images.length >= 10) {
      setError("Maximum 10 images are allowed.");
      return;
    }

    if (images.includes(trimmed)) {
      setError("This image has already been added.");
      return;
    }

    setImages((current) => [...current, trimmed]);
    setImageUrl("");
    setError("");
  }

  function removeImage(index: number) {
    setImages((current) =>
      current.filter((_, imageIndex) => imageIndex !== index),
    );
  }

  function moveImage(
    index: number,
    direction: "left" | "right",
  ) {
    setImages((current) => {
      const next = [...current];

      const targetIndex =
        direction === "left"
          ? index - 1
          : index + 1;

      if (
        targetIndex < 0 ||
        targetIndex >= next.length
      ) {
        return current;
      }

      [next[index], next[targetIndex]] = [
        next[targetIndex],
        next[index],
      ];

      return next;
    });
  }

  async function handleUpload(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const files = Array.from(event.target.files ?? []);

    if (!files.length) return;

    const remainingSlots = 10 - images.length;

    if (remainingSlots <= 0) {
      setError("Maximum 10 images are allowed.");
      event.target.value = "";
      return;
    }

    const filesToUpload = files.slice(
      0,
      remainingSlots,
    );

    setUploading(true);
    setError("");

    try {
      const token =
        localStorage.getItem("smartprix_token");

      if (!token) {
        throw new Error(
          "Authentication token not found.",
        );
      }

      const uploadedUrls: string[] = [];

      for (const file of filesToUpload) {
        const formData = new FormData();

        formData.append("file", file);

        const response = await fetch(
          `${API_URL}/admin/media/upload`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          },
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
              `Failed to upload ${file.name}`,
          );
        }

        const uploadedUrl =
          data.data?.url ||
          data.url ||
          data.data?.path ||
          data.path;

        if (!uploadedUrl) {
          throw new Error(
            `Upload succeeded but no image URL was returned for ${file.name}.`,
          );
        }

        uploadedUrls.push(uploadedUrl);
      }

      setImages((current) => [
        ...current,
        ...uploadedUrls,
      ]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to upload image.",
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!name.trim()) {
      setError("Product name is required.");
      return;
    }

    if (!brandSlug) {
      setError("Please select a brand.");
      return;
    }

    if (!categorySlug) {
      setError("Please select a category.");
      return;
    }

    if (!sellerSlug) {
      setError("Please select a seller.");
      return;
    }

    if (!price || Number(price) <= 0) {
      setError("Please enter a valid price.");
      return;
    }

    if (description.trim().length < 10) {
      setError(
        "Product description must be at least 10 characters.",
      );
      return;
    }

    setSaving(true);

    try {
      const specifications: Record<string, string> = {};

      if (ram.trim()) {
        specifications.ram = ram.trim();
      }

      if (storage.trim()) {
        specifications.storage = storage.trim();
      }

      if (processor.trim()) {
        specifications.processor =
          processor.trim();
      }

      const response = await updateProduct(
        productId,
        {
          name: name.trim(),
          description: description.trim(),
          brandSlug,
          categorySlug,
          images,
          price: Number(price),
          sellerSlug,
          specifications,
        },
      );

      setMessage(
        response.message ??
          "Product updated successfully.",
      );

      setTimeout(() => {
        router.push("/admin/products");
      }, 900);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update product.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-gradient-to-br from-slate-50 via-white to-indigo-50 px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="animate-pulse overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
            <div className="h-48 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200" />

            <div className="space-y-5 p-8">
              <div className="h-7 w-1/3 rounded-lg bg-slate-200" />
              <div className="h-12 rounded-xl bg-slate-100" />
              <div className="h-32 rounded-xl bg-slate-100" />
              <div className="grid gap-5 md:grid-cols-3">
                <div className="h-12 rounded-xl bg-slate-100" />
                <div className="h-12 rounded-xl bg-slate-100" />
                <div className="h-12 rounded-xl bg-slate-100" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !name) {
    return (
      <div className="min-h-[70vh] bg-gradient-to-br from-slate-50 via-white to-rose-50 px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-3xl border border-red-200 bg-white p-8 shadow-xl">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-2xl">
              ⚠️
            </div>

            <h2 className="text-2xl font-bold text-slate-900">
              Unable to load product
            </h2>

            <p className="mt-2 text-red-600">
              {error}
            </p>

            <Link
              href="/admin/products"
              className="mt-6 inline-flex items-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              ← Back to Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/60">
      <div className="mx-auto max-w-7xl px-4 py-6 pb-32 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="relative mb-8 overflow-hidden rounded-[2rem] bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-6 text-white shadow-2xl sm:p-8">
          <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-pink-300/20 blur-3xl" />

          <div className="relative">
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur-md transition hover:bg-white/25"
            >
              ← Back to Products
            </Link>

            <div className="mt-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                  ✨ Product Management
                </div>

                <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                  Edit Product
                </h1>

                <p className="mt-2 max-w-2xl text-sm text-white/80 sm:text-base">
                  Update product details, pricing, images
                  and specifications from one place.
                </p>
              </div>

              <div className="rounded-2xl border border-white/20 bg-white/10 px-5 py-4 backdrop-blur-md">
                <p className="text-xs font-medium text-white/70">
                  Current images
                </p>

                <p className="mt-1 text-2xl font-black">
                  {images.length}
                  <span className="ml-1 text-sm font-medium text-white/70">
                    / 10
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
            <div className="space-y-6">
              {/* Basic information */}
              <section className="overflow-hidden rounded-3xl border border-indigo-100 bg-white shadow-lg shadow-indigo-100/40">
                <div className="border-b border-indigo-100 bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-xl text-white shadow-lg shadow-indigo-200">
                      📦
                    </div>

                    <div>
                      <h2 className="font-bold text-slate-900">
                        Basic Information
                      </h2>

                      <p className="text-sm text-slate-500">
                        Core product information
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-5 p-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-2 block text-sm font-bold text-slate-700"
                    >
                      Product Name
                    </label>

                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(event) =>
                        setName(event.target.value)
                      }
                      required
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-medium text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="description"
                      className="mb-2 block text-sm font-bold text-slate-700"
                    >
                      Description
                    </label>

                    <textarea
                      id="description"
                      value={description}
                      onChange={(event) =>
                        setDescription(
                          event.target.value,
                        )
                      }
                      rows={7}
                      required
                      minLength={10}
                      className="w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm leading-6 text-slate-900 outline-none transition focus:border-purple-400 focus:bg-white focus:ring-4 focus:ring-purple-100"
                    />

                    <p className="mt-2 text-xs text-slate-400">
                      {description.length} characters
                    </p>
                  </div>

                  <div className="grid gap-5 md:grid-cols-3">
                    <div>
                      <label
                        htmlFor="brand"
                        className="mb-2 block text-sm font-bold text-slate-700"
                      >
                        Brand
                      </label>

                      <select
                        id="brand"
                        value={brandSlug}
                        onChange={(event) =>
                          setBrandSlug(
                            event.target.value,
                          )
                        }
                        required
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-medium text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                      >
                        <option value="">
                          Select brand
                        </option>

                        {options.brands.map(
                          (brand) => (
                            <option
                              key={brand.id}
                              value={brand.slug}
                            >
                              {brand.name}
                            </option>
                          ),
                        )}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="category"
                        className="mb-2 block text-sm font-bold text-slate-700"
                      >
                        Category
                      </label>

                      <select
                        id="category"
                        value={categorySlug}
                        onChange={(event) =>
                          setCategorySlug(
                            event.target.value,
                          )
                        }
                        required
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-medium text-slate-900 outline-none transition focus:border-purple-400 focus:bg-white focus:ring-4 focus:ring-purple-100"
                      >
                        <option value="">
                          Select category
                        </option>

                        {options.categories.map(
                          (category) => (
                            <option
                              key={category.id}
                              value={category.slug}
                            >
                              {category.name}
                            </option>
                          ),
                        )}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="seller"
                        className="mb-2 block text-sm font-bold text-slate-700"
                      >
                        Seller
                      </label>

                      <select
                        id="seller"
                        value={sellerSlug}
                        onChange={(event) =>
                          setSellerSlug(
                            event.target.value,
                          )
                        }
                        required
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-medium text-slate-900 outline-none transition focus:border-pink-400 focus:bg-white focus:ring-4 focus:ring-pink-100"
                      >
                        <option value="">
                          Select seller
                        </option>

                        {options.sellers.map(
                          (seller) => (
                            <option
                              key={seller.id}
                              value={seller.slug}
                            >
                              {seller.name}
                            </option>
                          ),
                        )}
                      </select>
                    </div>
                  </div>
                </div>
              </section>

              {/* Pricing */}
              <section className="overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-lg shadow-emerald-100/40">
                <div className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-cyan-50 px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 text-xl text-white shadow-lg shadow-emerald-200">
                      💰
                    </div>

                    <div>
                      <h2 className="font-bold text-slate-900">
                        Pricing & Seller
                      </h2>

                      <p className="text-sm text-slate-500">
                        Update current selling information
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <label
                    htmlFor="price"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Price (INR)
                  </label>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-emerald-600">
                      ₹
                    </span>

                    <input
                      id="price"
                      type="number"
                      min="1"
                      step="0.01"
                      value={price}
                      onChange={(event) =>
                        setPrice(event.target.value)
                      }
                      required
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-4 pl-10 pr-4 text-lg font-bold text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                    />
                  </div>
                </div>
              </section>

              {/* Images */}
              <section className="overflow-hidden rounded-3xl border border-pink-100 bg-white shadow-lg shadow-pink-100/40">
                <div className="border-b border-pink-100 bg-gradient-to-r from-pink-50 to-orange-50 px-6 py-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-pink-500 text-xl text-white shadow-lg shadow-pink-200">
                        🖼️
                      </div>

                      <div>
                        <h2 className="font-bold text-slate-900">
                          Product Images
                        </h2>

                        <p className="text-sm text-slate-500">
                          {imageCountLabel} · Maximum 10
                        </p>
                      </div>
                    </div>

                    <label className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-gradient-to-r from-pink-500 to-orange-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-pink-200 transition hover:-translate-y-0.5">
                      {uploading
                        ? "Uploading..."
                        : "＋ Upload Images"}

                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        disabled={
                          uploading ||
                          images.length >= 10
                        }
                        onChange={handleUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="p-6">
                  {/* Add URL */}
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(event) =>
                        setImageUrl(
                          event.target.value,
                        )
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          addImageUrl();
                        }
                      }}
                      placeholder="Paste image URL..."
                      disabled={images.length >= 10}
                      className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-pink-400 focus:bg-white focus:ring-4 focus:ring-pink-100"
                    />

                    <button
                      type="button"
                      onClick={addImageUrl}
                      disabled={
                        !imageUrl.trim() ||
                        images.length >= 10
                      }
                      className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Add URL
                    </button>
                  </div>

                  {images.length === 0 ? (
                    <div className="mt-6 rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-3xl shadow-sm">
                        🖼️
                      </div>

                      <h3 className="mt-4 font-bold text-slate-800">
                        No product images
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Upload images or add an image URL
                        above.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                      {images.map(
                        (image, index) => (
                          <div
                            key={`${image}-${index}`}
                            className={`group relative overflow-hidden rounded-2xl border-2 bg-slate-50 ${
                              index === 0
                                ? "border-indigo-400 ring-4 ring-indigo-100"
                                : "border-slate-200"
                            }`}
                          >
                            <div className="aspect-square">
                              <img
                                src={getFullImageUrl(
                                  image,
                                )}
                                alt={`Product image ${
                                  index + 1
                                }`}
                                className="h-full w-full object-contain p-3 transition duration-300 group-hover:scale-105"
                              />
                            </div>

                            {index === 0 && (
                              <div className="absolute left-2 top-2 rounded-full bg-indigo-600 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-white shadow-lg">
                                ★ Primary
                              </div>
                            )}

                            <div className="absolute inset-x-2 bottom-2 flex justify-between gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                              <button
                                type="button"
                                onClick={() =>
                                  moveImage(
                                    index,
                                    "left",
                                  )
                                }
                                disabled={
                                  index === 0
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/95 text-slate-700 shadow-md disabled:opacity-30"
                                title="Move left"
                              >
                                ←
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  moveImage(
                                    index,
                                    "right",
                                  )
                                }
                                disabled={
                                  index ===
                                  images.length - 1
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/95 text-slate-700 shadow-md disabled:opacity-30"
                                title="Move right"
                              >
                                →
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  removeImage(
                                    index,
                                  )
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500 text-white shadow-md"
                                title="Remove image"
                              >
                                ×
                              </button>
                            </div>

                            <div className="border-t border-slate-200 bg-white px-3 py-2">
                              <p className="truncate text-xs font-semibold text-slate-500">
                                Image {index + 1}
                              </p>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  )}

                  <p className="mt-4 text-xs text-slate-400">
                    The first image is automatically
                    saved as the primary product image.
                  </p>
                </div>
              </section>

              {/* Specifications */}
              <section className="overflow-hidden rounded-3xl border border-violet-100 bg-white shadow-lg shadow-violet-100/40">
                <div className="border-b border-violet-100 bg-gradient-to-r from-violet-50 to-fuchsia-50 px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-600 text-xl text-white shadow-lg shadow-violet-200">
                      ⚙️
                    </div>

                    <div>
                      <h2 className="font-bold text-slate-900">
                        Specifications
                      </h2>

                      <p className="text-sm text-slate-500">
                        Technical product information
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-5 p-6 md:grid-cols-3">
                  <div>
                    <label
                      htmlFor="ram"
                      className="mb-2 block text-sm font-bold text-slate-700"
                    >
                      RAM
                    </label>

                    <input
                      id="ram"
                      type="text"
                      value={ram}
                      onChange={(event) =>
                        setRam(event.target.value)
                      }
                      placeholder="e.g. 8GB"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="storage"
                      className="mb-2 block text-sm font-bold text-slate-700"
                    >
                      Storage
                    </label>

                    <input
                      id="storage"
                      type="text"
                      value={storage}
                      onChange={(event) =>
                        setStorage(
                          event.target.value,
                        )
                      }
                      placeholder="e.g. 128GB"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition focus:border-fuchsia-400 focus:bg-white focus:ring-4 focus:ring-fuchsia-100"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="processor"
                      className="mb-2 block text-sm font-bold text-slate-700"
                    >
                      Processor
                    </label>

                    <input
                      id="processor"
                      type="text"
                      value={processor}
                      onChange={(event) =>
                        setProcessor(
                          event.target.value,
                        )
                      }
                      placeholder="e.g. Snapdragon 8 Gen 3"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition focus:border-fuchsia-400 focus:bg-white focus:ring-4 focus:ring-fuchsia-100"
                    />
                  </div>
                </div>
              </section>
            </div>

            {/* Preview */}
            <aside className="xl:sticky xl:top-6 xl:h-fit">
              <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 px-6 py-5 text-white">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">👁️</span>

                    <div>
                      <h2 className="font-bold">
                        Product Preview
                      </h2>

                      <p className="text-xs text-white/60">
                        Quick visual overview
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-slate-50 to-indigo-50">
                    {primaryImage ? (
                      <img
                        src={getFullImageUrl(
                          primaryImage,
                        )}
                        alt={name || "Product"}
                        className="h-full w-full object-contain p-8"
                      />
                    ) : (
                      <div className="text-center text-slate-400">
                        <div className="text-5xl">
                          📱
                        </div>

                        <p className="mt-2 text-sm font-medium">
                          No image
                        </p>
                      </div>
                    )}

                    {images.length > 1 && (
                      <div className="absolute bottom-3 right-3 rounded-full bg-slate-900/80 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
                        +{images.length - 1} more
                      </div>
                    )}
                  </div>

                  <div className="mt-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-indigo-500">
                      {options.brands.find(
                        (brand) =>
                          brand.slug === brandSlug,
                      )?.name || "Brand"}
                    </p>

                    <h3 className="mt-1 line-clamp-2 text-xl font-black text-slate-900">
                      {name || "Product name"}
                    </h3>

                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-400">
                          Starting price
                        </p>

                        <p className="text-2xl font-black text-slate-900">
                          ₹
                          {price
                            ? Number(
                                price,
                              ).toLocaleString(
                                "en-IN",
                              )
                            : "—"}
                        </p>
                      </div>

                      <div className="rounded-xl bg-emerald-50 px-3 py-2 text-right">
                        <p className="text-[10px] font-bold uppercase text-emerald-500">
                          Images
                        </p>

                        <p className="text-sm font-black text-emerald-700">
                          {images.length}/10
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </aside>
          </div>

          {/* Messages */}
          {(message || error) && (
            <div className="mt-6">
              {message && (
                <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700 shadow-sm">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white">
                    ✓
                  </span>

                  {message}
                </div>
              )}

              {error && (
                <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 shadow-sm">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white">
                    !
                  </span>

                  {error}
                </div>
              )}
            </div>
          )}

          {/* Bottom actions */}
          <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-4 shadow-[0_-10px_40px_rgba(15,23,42,0.12)] backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
              <div className="hidden sm:block">
                <p className="text-sm font-bold text-slate-800">
                  Ready to save your changes?
                </p>

                <p className="text-xs text-slate-500">
                  {images.length} image
                  {images.length === 1
                    ? ""
                    : "s"} · ₹
                  {price
                    ? Number(price).toLocaleString(
                        "en-IN",
                      )
                    : "—"}
                </p>
              </div>

              <div className="ml-auto flex gap-3">
                <Link
                  href="/admin/products"
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 px-6 py-3 text-sm font-black text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : "✓ Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}