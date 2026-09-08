"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

import ProductEditor from "@/components/admin/products/ProductEditor";
import MobileSpecifications from "@/components/admin/products/MobileSpecifications";

import {
  createProduct,
  type CreateProductInput,
} from "@/lib/api/products";

import {
  getBrands,
  type AdminBrand,
} from "@/lib/api/brands";

import {
  getCategories,
  type AdminCategory,
} from "@/lib/api/categories";

import {
  getSellers,
  type AdminSeller,
} from "@/lib/api/sellers";

import AdminPermissionGuard from "@/components/admin/AdminPermissionGuard";

interface ProductForm {
  name: string;
  description: string;
  brandSlug: string;
  categorySlug: string;
  price: string;
  sellerSlug: string;
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
  const [form, setForm] = useState<ProductForm>({
    name: "",
    description: "",
    brandSlug: "",
    categorySlug: "",
    price: "",
    sellerSlug: "",
  });

  const [brands, setBrands] = useState<AdminBrand[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [sellers, setSellers] = useState<AdminSeller[]>([]);

  const [images, setImages] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState("");

  const [specifications, setSpecifications] =
    useState<Record<string, string>>({});

  const [loadingOptions, setLoadingOptions] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadOptions = async () => {
      try {
        setLoadingOptions(true);
        setError("");

        const [
          brandsResponse,
          categoriesResponse,
          sellersResponse,
        ] = await Promise.all([
          getBrands(),
          getCategories(),
          getSellers(),
        ]);

        setBrands(
          Array.isArray(brandsResponse.data)
            ? brandsResponse.data
            : [],
        );

        setCategories(
          Array.isArray(categoriesResponse.data)
            ? categoriesResponse.data
            : [],
        );

        setSellers(
          Array.isArray(sellersResponse.data)
            ? sellersResponse.data
            : [],
        );
      } catch (err) {
        console.error(
          "Failed to load product options:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load brands, categories and sellers.",
        );
      } finally {
        setLoadingOptions(false);
      }
    };

    loadOptions();
  }, []);

  const updateForm = (
    field: keyof ProductForm,
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const addImageUrl = () => {
    const trimmed = imageUrl.trim();

    if (!trimmed) {
      return;
    }

    if (images.length >= 10) {
      setError("Maximum 10 product images are allowed.");
      return;
    }

    setImages((current) => [
      ...current,
      trimmed,
    ]);

    setImageUrl("");
    setError("");
  };

  const removeImage = (index: number) => {
    setImages((current) =>
      current.filter(
        (_, imageIndex) => imageIndex !== index,
      ),
    );
  };

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

  const uploadImage = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (images.length >= 10) {
      setError("Maximum 10 product images are allowed.");
      event.target.value = "";
      return;
    }

    try {
      setUploadingImage(true);
      setError("");

      const token =
        localStorage.getItem("smartprix_token");

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

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const productName = form.name.trim();
    const price = Number(form.price);

    if (!productName) {
      setError("Product name is required.");
      return;
    }

    if (!form.brandSlug) {
      setError("Please select a brand.");
      return;
    }

    if (!form.categorySlug) {
      setError("Please select a category.");
      return;
    }

    if (!form.sellerSlug) {
      setError("Please select a seller.");
      return;
    }

    if (!form.price || !Number.isFinite(price)) {
      setError("Please enter a valid price.");
      return;
    }

    if (price <= 0) {
      setError("Price must be greater than 0.");
      return;
    }

    try {
      setSaving(true);

      const payload: CreateProductInput = {
        name: productName,
        description: form.description,
        brandSlug: form.brandSlug,
        categorySlug: form.categorySlug,
        images,
        price,
        sellerSlug: form.sellerSlug,
        specifications,
      };

      const response = await createProduct(
        payload,
      );

      if (!response.success) {
        throw new Error(
          response.message ||
            "Failed to create product.",
        );
      }

      setSuccess(
        "Product created successfully.",
      );

      const createdProduct = response.data;

      if (createdProduct?.slug) {
        window.location.href = `/admin/products`;
        return;
      }
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

  return (
    <AdminPermissionGuard permission="products.create">
      <div className="mx-auto max-w-7xl pb-12">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/admin/products"
              className="mb-3 inline-flex text-sm font-medium text-gray-500 hover:text-gray-900"
            >
              ← Back to Products
            </Link>

            <h1 className="text-3xl font-bold text-gray-900">
              Add Product
            </h1>

            <p className="mt-2 text-sm text-gray-600">
              Create a new product with images,
              description, pricing and specifications.
            </p>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Basic Information */}
          <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-5 py-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Basic Information
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Enter the basic product information.
              </p>
            </div>

            <div className="grid gap-5 p-5 md:grid-cols-2">
              {/* Product Name */}
              <div className="md:col-span-2">
                <label
                  htmlFor="product-name"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Product Name
                </label>

                <input
                  id="product-name"
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    updateForm(
                      "name",
                      event.target.value,
                    )
                  }
                  placeholder="e.g. Realme 15 Pro 5G"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                />
              </div>

              {/* Brand */}
              <div>
                <label
                  htmlFor="brand"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Brand
                </label>

                <select
                  id="brand"
                  value={form.brandSlug}
                  onChange={(event) =>
                    updateForm(
                      "brandSlug",
                      event.target.value,
                    )
                  }
                  disabled={loadingOptions}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black disabled:bg-gray-100"
                >
                  <option value="">
                    {loadingOptions
                      ? "Loading brands..."
                      : "Select brand"}
                  </option>

                  {brands.map((brand) => (
                    <option
                      key={brand.id}
                      value={brand.slug}
                    >
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label
                  htmlFor="category"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Category
                </label>

                <select
                  id="category"
                  value={form.categorySlug}
                  onChange={(event) =>
                    updateForm(
                      "categorySlug",
                      event.target.value,
                    )
                  }
                  disabled={loadingOptions}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black disabled:bg-gray-100"
                >
                  <option value="">
                    {loadingOptions
                      ? "Loading categories..."
                      : "Select category"}
                  </option>

                  {categories.map((category) => (
                    <option
                      key={category.id}
                      value={category.slug}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-5 py-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Pricing
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Set the initial seller and product price.
              </p>
            </div>

            <div className="grid gap-5 p-5 md:grid-cols-2">
              {/* Seller */}
              <div>
                <label
                  htmlFor="seller"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Seller
                </label>

                <select
                  id="seller"
                  value={form.sellerSlug}
                  onChange={(event) =>
                    updateForm(
                      "sellerSlug",
                      event.target.value,
                    )
                  }
                  disabled={loadingOptions}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black disabled:bg-gray-100"
                >
                  <option value="">
                    {loadingOptions
                      ? "Loading sellers..."
                      : "Select seller"}
                  </option>

                  {sellers.map((seller) => (
                    <option
                      key={seller.id}
                      value={seller.slug}
                    >
                      {seller.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price */}
              <div>
                <label
                  htmlFor="price"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Price (INR)
                </label>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                    ₹
                  </span>

                  <input
                    id="price"
                    type="number"
                    min="1"
                    step="0.01"
                    value={form.price}
                    onChange={(event) =>
                      updateForm(
                        "price",
                        event.target.value,
                      )
                    }
                    placeholder="e.g. 34999"
                    className="w-full rounded-lg border border-gray-300 py-3 pl-9 pr-4 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Images */}
          <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-5 py-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Product Images
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Add up to 10 product images. The first image
                becomes the primary image.
              </p>
            </div>

            <div className="space-y-5 p-5">
              {/* Upload */}
              <div>
                <label
                  htmlFor="product-image-upload"
                  className={`inline-flex cursor-pointer items-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 ${
                    uploadingImage
                      ? "pointer-events-none opacity-50"
                      : ""
                  }`}
                >
                  {uploadingImage
                    ? "Uploading..."
                    : "Upload Image"}
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
              <div>
                <label
                  htmlFor="image-url"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Or add image URL
                </label>

                <div className="flex gap-2">
                  <input
                    id="image-url"
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
                    placeholder="https://example.com/product-image.jpg"
                    className="min-w-0 flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                  />

                  <button
                    type="button"
                    onClick={addImageUrl}
                    disabled={
                      images.length >= 10
                    }
                    className="rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Image Preview */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {images.map((image, index) => (
                    <div
                      key={`${image}-${index}`}
                      className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
                    >
                      <div className="aspect-square">
                        <img
                          src={image}
                          alt={`Product image ${
                            index + 1
                          }`}
                          className="h-full w-full object-contain p-3"
                        />
                      </div>

                      {index === 0 && (
                        <div className="absolute left-2 top-2 rounded-md bg-black px-2 py-1 text-[10px] font-semibold text-white">
                          PRIMARY
                        </div>
                      )}

                      <div className="flex items-center justify-between border-t bg-white p-2">
                        <button
                          type="button"
                          onClick={() =>
                            moveImage(
                              index,
                              "up",
                            )
                          }
                          disabled={index === 0}
                          className="rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 disabled:opacity-30"
                        >
                          ←
                        </button>

                        <span className="text-xs text-gray-400">
                          {index + 1}
                        </span>

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
                          className="rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 disabled:opacity-30"
                        >
                          →
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            removeImage(index)
                          }
                          className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {images.length === 0 && (
                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-5 py-10 text-center">
                  <p className="text-sm font-medium text-gray-600">
                    No product images added
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    Upload an image or add an image URL above.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Description */}
          <ProductEditor
            value={form.description}
            onChange={(value) =>
              updateForm(
                "description",
                value,
              )
            }
          />

          {/* Specifications */}
          <MobileSpecifications
  value={specifications ?? {}}
  onChange={setSpecifications}
/>

          {/* Submit */}
          <div className="sticky bottom-4 z-20 flex flex-col gap-3 rounded-xl border border-gray-200 bg-white/95 p-4 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Ready to create this product?
              </p>

              <p className="text-xs text-gray-500">
                The product will be added to your catalog.
              </p>
            </div>

            <div className="flex gap-3">
              <Link
                href="/admin/products"
                className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={
                  saving ||
                  loadingOptions ||
                  uploadingImage
                }
                className="rounded-lg bg-black px-6 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Creating Product..."
                  : "Create Product"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </AdminPermissionGuard>
  );
}