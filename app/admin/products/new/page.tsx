"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import ProductEditor from "@/components/admin/products/ProductEditor";
import MobileSpecifications from "@/components/admin/products/MobileSpecifications";

import { getCategories } from "@/lib/api/categories";
import { getBrands } from "@/lib/api/brands";
import { getSellers } from "@/lib/api/sellers";
import { createProduct } from "@/lib/api/adminProducts";

import type { AdminCategory } from "@/lib/api/categories";
import type { AdminBrand } from "@/lib/api/brands";
import type { AdminSeller } from "@/lib/api/sellers";

interface FormOptions {
  categories: AdminCategory[];
  brands: AdminBrand[];
  sellers: AdminSeller[];
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5000/api";

const getFullImageUrl = (url: string) => {
  if (!url) return "";

  if (
    url.startsWith("http://") ||
    url.startsWith("https://")
  ) {
    return url;
  }

  const backendUrl = API_URL.replace(/\/api\/?$/, "");

  if (url.startsWith("/")) {
    return `${backendUrl}${url}`;
  }

  return `${backendUrl}/${url}`;
};

export default function NewProductPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [brandSlug, setBrandSlug] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [sellerSlug, setSellerSlug] = useState("");
  const [price, setPrice] = useState("");

  const [images, setImages] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState("");

  const [specifications, setSpecifications] =
    useState<Record<string, string>>({});

  const [options, setOptions] = useState<FormOptions>({
    categories: [],
    brands: [],
    sellers: [],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] =
    useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  /*
   * Load only the data required to create a product.
   *
   * IMPORTANT:
   * This page is /admin/products/new, so there is no
   * product ID and therefore no product GET request.
   */
  useEffect(() => {
    async function loadOptions() {
      try {
        setLoading(true);
        setError("");

        const [
          categoriesResponse,
          brandsResponse,
          sellersResponse,
        ] = await Promise.all([
          getCategories(),
          getBrands(),
          getSellers(),
        ]);

        setOptions({
          categories: categoriesResponse.data,
          brands: brandsResponse.data,
          sellers: sellersResponse.data,
        });
      } catch (err) {
        console.error(
          "Failed to load form options:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load form options.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadOptions();
  }, []);

  /*
   * Add image URL
   */
  const addImageUrl = () => {
    const trimmed = imageUrl.trim();

    if (!trimmed) return;

    if (images.length >= 10) {
      setError(
        "Maximum 10 product images are allowed.",
      );
      return;
    }

    setImages((current) => [
      ...current,
      trimmed,
    ]);

    setImageUrl("");
    setError("");
  };

  /*
   * Remove image
   */
  const removeImage = (index: number) => {
    setImages((current) =>
      current.filter(
        (_, imageIndex) =>
          imageIndex !== index,
      ),
    );
  };

  /*
   * Move image up/down
   */
  const moveImage = (
    index: number,
    direction: "up" | "down",
  ) => {
    setImages((current) => {
      const next = [...current];

      const targetIndex =
        direction === "up"
          ? index - 1
          : index + 1;

      if (
        targetIndex < 0 ||
        targetIndex >= next.length
      ) {
        return current;
      }

      [
        next[index],
        next[targetIndex],
      ] = [
        next[targetIndex],
        next[index],
      ];

      return next;
    });
  };

  /*
   * Upload image
   */
  const uploadImage = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (images.length >= 10) {
      setError(
        "Maximum 10 product images are allowed.",
      );

      event.target.value = "";
      return;
    }

    try {
      setUploadingImage(true);
      setError("");

      const token =
        localStorage.getItem(
          "smartprix_token",
        );

      const formData = new FormData();

      formData.append("file", file);

      const response = await fetch(
        `${API_URL}/admin/media/upload`,
        {
          method: "POST",
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : undefined,
          body: formData,
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Image upload failed.",
        );
      }

      const uploadedUrl =
        data?.data?.url;

      if (!uploadedUrl) {
        throw new Error(
          "Upload succeeded but no image URL was returned.",
        );
      }

      setImages((current) => [
        ...current,
        getFullImageUrl(uploadedUrl),
      ]);
    } catch (err) {
      console.error(
        "Product image upload failed:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Image upload failed.",
      );
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  };

  /*
   * Create product
   */
  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setMessage("");
    setError("");

    const trimmedName = name.trim();
    const numericPrice = Number(price);

    if (!trimmedName) {
      setError(
        "Product name is required.",
      );
      return;
    }

    if (!brandSlug) {
      setError(
        "Please select a brand.",
      );
      return;
    }

    if (!categorySlug) {
      setError(
        "Please select a category.",
      );
      return;
    }

    if (
      !price ||
      !Number.isFinite(numericPrice) ||
      numericPrice <= 0
    ) {
      setError(
        "Please enter a valid price.",
      );
      return;
    }

    setSaving(true);

    try {
      const response =
        await createProduct({
          name: trimmedName,
          description:
            description.trim(),
          brandSlug,
          categorySlug,
          images,
          price: numericPrice,
          sellerSlug:
            sellerSlug || undefined,
          specifications,
        });

      if (!response.success) {
        throw new Error(
          response.message ||
            "Failed to create product.",
        );
      }

      setMessage(
        response.message ??
          "Product created successfully.",
      );

      setTimeout(() => {
        router.push("/admin/products");
      }, 900);
    } catch (err) {
      console.error(
        "Failed to create product:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to create product.",
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * Loading state
   */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/50">
        <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse overflow-hidden rounded-3xl border border-indigo-100 bg-white shadow-xl">
            <div className="h-52 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200" />

            <div className="space-y-6 p-8">
              <div className="h-8 w-64 rounded-xl bg-slate-200" />

              <div className="h-14 rounded-2xl bg-slate-100" />

              <div className="grid gap-5 md:grid-cols-2">
                <div className="h-14 rounded-2xl bg-slate-100" />
                <div className="h-14 rounded-2xl bg-slate-100" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /*
   * Error state while loading form options
   */
  if (
    error &&
    options.categories.length === 0 &&
    options.brands.length === 0
  ) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50/50">
        <div className="mx-auto max-w-4xl px-4 py-12">
          <div className="rounded-3xl border border-red-200 bg-white p-8 shadow-xl">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-2xl">
              ⚠️
            </div>

            <h2 className="mt-5 text-2xl font-black text-slate-900">
              Unable to load product form
            </h2>

            <p className="mt-2 text-sm text-red-600">
              {error}
            </p>

            <Link
              href="/admin/products"
              className="mt-6 inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              ← Back to Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/50 pb-28">
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">

        {/* HERO */}
        <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-6 shadow-2xl shadow-indigo-200/40 sm:p-8">
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

          <div className="absolute -bottom-32 left-1/3 h-96 w-96 rounded-full bg-pink-300/20 blur-3xl" />

          <div className="relative">
            <Link
              href="/admin/products"
              className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold text-white backdrop-blur transition hover:bg-white/25"
            >
              ← Back to Products
            </Link>

            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur">
                  <span className="h-2 w-2 rounded-full bg-emerald-300" />
                  Product Catalogue
                </div>

                <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                  Add New Product
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-indigo-100 sm:text-base">
                  Create a new product with pricing,
                  images, description and technical
                  specifications.
                </p>
              </div>

              <div className="rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-white backdrop-blur">
                <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-100">
                  Product Images
                </p>

                <p className="mt-1 text-2xl font-black">
                  {images.length}

                  <span className="text-sm font-medium text-indigo-200">
                    {" "}
                    / 10
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* MESSAGES */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-rose-50 p-4 shadow-sm">
            <div className="flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 font-black text-red-600">
                !
              </div>

              <div>
                <p className="text-sm font-bold text-red-800">
                  Something went wrong
                </p>

                <p className="mt-1 text-xs text-red-600">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {message && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-4 shadow-sm">
            <div className="flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 font-black text-emerald-600">
                ✓
              </div>

              <div>
                <p className="text-sm font-bold text-emerald-800">
                  Product created
                </p>

                <p className="mt-1 text-xs text-emerald-600">
                  {message}
                </p>
              </div>
            </div>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* BASIC INFORMATION */}

          <section className="overflow-hidden rounded-3xl border border-indigo-100 bg-white shadow-sm transition hover:shadow-md">
            <div className="border-b border-indigo-100 bg-gradient-to-r from-indigo-50 via-white to-purple-50 px-5 py-5 sm:px-7">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-xl text-white shadow-lg shadow-indigo-200">
                  ✦
                </div>

                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    Basic Information
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Add the identity and classification
                    of your product.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-5 p-5 sm:p-7 md:grid-cols-2">

              {/* NAME */}

              <div className="md:col-span-2">
                <label
                  htmlFor="product-name"
                  className="mb-2 flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-600"
                >
                  <span>
                    Product Name
                    <span className="ml-1 text-rose-500">
                      *
                    </span>
                  </span>

                  <span className="font-medium normal-case tracking-normal text-slate-400">
                    {name.length}/150
                  </span>
                </label>

                <input
                  id="product-name"
                  type="text"
                  maxLength={150}
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-indigo-200 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              {/* BRAND */}

              <div>
                <label
                  htmlFor="brand"
                  className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-600"
                >
                  Brand
                  <span className="ml-1 text-rose-500">
                    *
                  </span>
                </label>

                <select
                  id="brand"
                  value={brandSlug}
                  onChange={(event) =>
                    setBrandSlug(event.target.value)
                  }
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-semibold text-slate-700 outline-none transition hover:border-indigo-200 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                >
                  <option value="">
                    Select brand
                  </option>

                  {options.brands.map((brand) => (
                    <option
                      key={brand.id}
                      value={brand.slug}
                    >
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* CATEGORY */}

              <div>
                <label
                  htmlFor="category"
                  className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-600"
                >
                  Category
                  <span className="ml-1 text-rose-500">
                    *
                  </span>
                </label>

                <select
                  id="category"
                  value={categorySlug}
                  onChange={(event) =>
                    setCategorySlug(event.target.value)
                  }
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-semibold text-slate-700 outline-none transition hover:border-purple-200 focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-100"
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
            </div>
          </section>

          {/* PRICING */}

          <section className="overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm transition hover:shadow-md">
            <div className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-teal-50 px-5 py-5 sm:px-7">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-xl font-black text-white shadow-lg shadow-emerald-200">
                  ₹
                </div>

                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    Pricing & Seller
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Add the selling price and marketplace
                    seller.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-5 p-5 sm:p-7 md:grid-cols-2">

              {/* SELLER */}

              <div>
                <label
                  htmlFor="seller"
                  className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-600"
                >
                  Seller
                </label>

                <select
                  id="seller"
                  value={sellerSlug}
                  onChange={(event) =>
                    setSellerSlug(event.target.value)
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-semibold text-slate-700 outline-none transition hover:border-emerald-200 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
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

              {/* PRICE */}

              <div>
                <label
                  htmlFor="price"
                  className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-600"
                >
                  Price (INR)
                  <span className="ml-1 text-rose-500">
                    *
                  </span>
                </label>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-black text-emerald-600">
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
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-10 pr-4 text-sm font-bold text-slate-900 outline-none transition hover:border-emerald-200 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* IMAGES */}

          <section className="overflow-hidden rounded-3xl border border-pink-100 bg-white shadow-sm transition hover:shadow-md">
            <div className="border-b border-pink-100 bg-gradient-to-r from-pink-50 via-white to-rose-50 px-5 py-5 sm:px-7">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 text-xl text-white shadow-lg shadow-pink-200">
                    🖼
                  </div>

                  <div>
                    <h2 className="text-lg font-black text-slate-900">
                      Product Images
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      The first image is treated as the
                      primary image.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl bg-pink-100 px-3 py-2 text-xs font-black text-pink-700">
                  {images.length}/10
                </div>
              </div>
            </div>

            <div className="space-y-6 p-5 sm:p-7">

              {/* UPLOAD / URL */}

              <div className="grid gap-4 md:grid-cols-2">

                {/* UPLOAD */}

                <div className="rounded-2xl border border-dashed border-pink-200 bg-gradient-to-br from-pink-50/70 to-white p-5">
                  <p className="text-xs font-black uppercase tracking-wider text-slate-600">
                    Upload from device
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Add a new product image.
                  </p>

                  <label
                    htmlFor="product-image-upload"
                    className={`mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-pink-200 transition hover:-translate-y-0.5 hover:shadow-xl ${
                      uploadingImage
                        ? "pointer-events-none opacity-50"
                        : ""
                    }`}
                  >
                    <span>＋</span>

                    {uploadingImage
                      ? "Uploading..."
                      : "Choose Image"}
                  </label>

                  <input
                    id="product-image-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif"
                    onChange={uploadImage}
                    className="hidden"
                    disabled={
                      uploadingImage ||
                      images.length >= 10
                    }
                  />
                </div>

                {/* URL */}

                <div className="rounded-2xl border border-dashed border-indigo-200 bg-gradient-to-br from-indigo-50/70 to-white p-5">
                  <p className="text-xs font-black uppercase tracking-wider text-slate-600">
                    Add image URL
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Use a publicly accessible image URL.
                  </p>

                  <div className="mt-4 flex gap-2">
                    <input
                      type="text"
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
                      placeholder="https://example.com/image.jpg"
                      className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs font-medium outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    />

                    <button
                      type="button"
                      onClick={addImageUrl}
                      disabled={
                        images.length >= 10
                      }
                      className="rounded-xl bg-slate-900 px-4 py-3 text-xs font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* GALLERY */}

              {images.length > 0 ? (
                <div>
                  <div className="mb-4">
                    <h3 className="text-sm font-black text-slate-800">
                      Image Gallery
                    </h3>

                    <p className="mt-1 text-xs text-slate-400">
                      Reorder images using the arrows.
                      The first image is primary.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {images.map(
                      (image, index) => (
                        <div
                          key={`${image}-${index}`}
                          className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-pink-200 hover:shadow-xl"
                        >
                          <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-slate-50 to-pink-50">
                            <img
                              src={image}
                              alt={`${name || "Product"} product image ${
                                index + 1
                              }`}
                              className="h-full w-full object-contain p-4 transition duration-300 group-hover:scale-105"
                              onError={(event) => {
                                event.currentTarget.style.opacity =
                                  "0.25";
                              }}
                            />

                            {index === 0 && (
                              <div className="absolute left-2 top-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-2.5 py-1 text-[9px] font-black tracking-wider text-white shadow-lg">
                                PRIMARY
                              </div>
                            )}

                            <div className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-1 text-[10px] font-black text-slate-600 shadow-sm backdrop-blur">
                              #{index + 1}
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-1 border-t border-slate-100 bg-white p-2">
                            <button
                              type="button"
                              onClick={() =>
                                moveImage(
                                  index,
                                  "up",
                                )
                              }
                              disabled={index === 0}
                              title="Move left"
                              className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-sm font-bold text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-25"
                            >
                              ←
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                moveImage(
                                  index,
                                  "down",
                                )
                              }
                              disabled={
                                index ===
                                images.length - 1
                              }
                              title="Move right"
                              className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-sm font-bold text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-25"
                            >
                              →
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                removeImage(index)
                              }
                              className="flex h-8 flex-1 items-center justify-center rounded-lg bg-rose-50 text-[10px] font-bold text-rose-600 transition hover:bg-rose-100"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-indigo-50/40 px-5 py-14 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm">
                    🖼️
                  </div>

                  <h3 className="mt-4 text-sm font-black text-slate-700">
                    No product images
                  </h3>

                  <p className="mx-auto mt-1 max-w-md text-xs text-slate-400">
                    Upload an image or add an image URL.
                    You can add up to 10 images.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* DESCRIPTION */}

          <section className="overflow-hidden rounded-3xl border border-amber-100 bg-white shadow-sm">
            <div className="border-b border-amber-100 bg-gradient-to-r from-amber-50 via-white to-orange-50 px-5 py-5 sm:px-7">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-xl text-white shadow-lg shadow-amber-200">
                  ✎
                </div>

                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    Product Description
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Add detailed product content.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-7">
              <ProductEditor
                value={description}
                onChange={setDescription}
              />
            </div>
          </section>

          {/* SPECIFICATIONS */}

          <section className="overflow-hidden rounded-3xl border border-purple-100 bg-white shadow-sm">
            <div className="border-b border-purple-100 bg-gradient-to-r from-purple-50 via-white to-fuchsia-50 px-5 py-5 sm:px-7">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-600 text-xl text-white shadow-lg shadow-purple-200">
                  ⚙
                </div>

                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    Specifications
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Add the technical specifications.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-7">
              <MobileSpecifications
                value={specifications}
                onChange={setSpecifications}
              />
            </div>
          </section>

          {/* SUBMIT BAR */}

          <div className="sticky bottom-4 z-30 overflow-hidden rounded-3xl border border-indigo-100 bg-white/95 shadow-2xl shadow-slate-300/40 backdrop-blur-xl">
            <div className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">

              <div className="flex items-center gap-3">
                <div className="hidden h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-lg text-white shadow-lg shadow-indigo-200 sm:flex">
                  ✓
                </div>

                <div>
                  <p className="text-sm font-black text-slate-900">
                    Ready to create your product?
                  </p>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Your first image will become the
                    primary image.
                  </p>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <Link
                  href="/admin/products"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={
                    saving ||
                    uploadingImage
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {saving ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Creating Product...
                    </>
                  ) : (
                    <>
                      Create Product
                      <span>→</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}