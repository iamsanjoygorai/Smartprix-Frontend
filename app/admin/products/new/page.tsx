"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { apiFetch } from "@/lib/api/client";
import { getCategories } from "@/lib/api/categories";
import { getBrands } from "@/lib/api/brands";
import { getSellers } from "@/lib/api/sellers";

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

interface UploadResponse {
  url: string;
  filename: string;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5000/api";

const API_SERVER_URL = API_URL.replace(/\/api\/?$/, "");

export default function NewProductPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [brandSlug, setBrandSlug] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [sellerSlug, setSellerSlug] = useState("");

  const [image, setImage] = useState("");
  const [imagePreview, setImagePreview] = useState("");

  const [price, setPrice] = useState("");

  const [ram, setRam] = useState("");
  const [storage, setStorage] = useState("");
  const [processor, setProcessor] = useState("");

  const [options, setOptions] = useState<FormOptions>({
    categories: [],
    brands: [],
    sellers: [],
  });

  const [loadingOptions, setLoadingOptions] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [draggingImage, setDraggingImage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadOptions() {
      try {
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
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load product options.",
        );
      } finally {
        setLoadingOptions(false);
      }
    }

    loadOptions();
  }, []);

  async function uploadImage(file: File) {
    setMessage("");
    setError("");

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be 5 MB or less.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    setImagePreview(previewUrl);
    setUploadingImage(true);

    try {
      const formData = new FormData();

      formData.append("image", file);

      const response = await apiFetch<
        ApiResponse<UploadResponse>
      >("/admin/products/upload-image", {
        method: "POST",
        body: formData,
      });

      const uploadedUrl = response.data.url;

      const fullImageUrl = uploadedUrl.startsWith("http")
        ? uploadedUrl
        : `${API_SERVER_URL}${uploadedUrl}`;

      setImage(fullImageUrl);

      setMessage("Image uploaded successfully.");
    } catch (err) {
      setImage("");
      setImagePreview("");

      setError(
        err instanceof Error
          ? err.message
          : "Failed to upload image.",
      );
    } finally {
      setUploadingImage(false);
    }
  }

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (file) {
      uploadImage(file);
    }

    event.target.value = "";
  }

  function handleDragOver(
    event: React.DragEvent<HTMLDivElement>,
  ) {
    event.preventDefault();
    setDraggingImage(true);
  }

  function handleDragLeave(
    event: React.DragEvent<HTMLDivElement>,
  ) {
    event.preventDefault();
    setDraggingImage(false);
  }

  function handleDrop(
    event: React.DragEvent<HTMLDivElement>,
  ) {
    event.preventDefault();
    setDraggingImage(false);

    const file = event.dataTransfer.files?.[0];

    if (file) {
      uploadImage(file);
    }
  }

  function removeImage() {
    setImage("");
    setImagePreview("");
    setMessage("");
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setMessage("");
    setError("");

    if (uploadingImage) {
      setError("Please wait for the image upload to finish.");
      return;
    }

    setLoading(true);

    try {
      const specifications: Record<string, string> = {};

      if (ram.trim()) {
        specifications.ram = ram.trim();
      }

      if (storage.trim()) {
        specifications.storage = storage.trim();
      }

      if (processor.trim()) {
        specifications.processor = processor.trim();
      }

      const response = await apiFetch<ApiResponse<Product>>(
        "/admin/products",
        {
          method: "POST",
          body: JSON.stringify({
            name: name.trim(),
            description: description.trim(),
            brandSlug,
            categorySlug,
            image: image.trim() || undefined,
            price: Number(price),
            sellerSlug,
            specifications,
          }),
        },
      );

      setMessage(
        response.message ?? "Product created successfully.",
      );

      setName("");
      setDescription("");
      setBrandSlug("");
      setCategorySlug("");
      setSellerSlug("");
      setImage("");
      setImagePreview("");
      setPrice("");
      setRam("");
      setStorage("");
      setProcessor("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create product.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <Link
          href="/admin/products"
          className="text-sm font-medium text-gray-600 hover:text-black"
        >
          ← Back to Products
        </Link>

        <h2 className="mt-4 text-3xl font-bold text-gray-900">
          Add Product
        </h2>

        <p className="mt-2 text-gray-600">
          Create a new product for the Smartprix website.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl bg-white p-6 shadow-sm"
      >
        <div className="grid gap-6">
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-gray-700"
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
              placeholder="e.g. Samsung Galaxy S25"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Description
            </label>

            <textarea
              id="description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Enter product description..."
              rows={5}
              required
              minLength={10}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <label
                htmlFor="brand"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Brand
              </label>

              <select
                id="brand"
                value={brandSlug}
                onChange={(event) =>
                  setBrandSlug(event.target.value)
                }
                required
                disabled={loadingOptions}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-black disabled:bg-gray-100"
              >
                <option value="">
                  {loadingOptions
                    ? "Loading brands..."
                    : "Select brand"}
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

            <div>
              <label
                htmlFor="category"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Category
              </label>

              <select
                id="category"
                value={categorySlug}
                onChange={(event) =>
                  setCategorySlug(event.target.value)
                }
                required
                disabled={loadingOptions}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-black disabled:bg-gray-100"
              >
                <option value="">
                  {loadingOptions
                    ? "Loading categories..."
                    : "Select category"}
                </option>

                {options.categories.map((category) => (
                  <option
                    key={category.id}
                    value={category.slug}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="seller"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Seller
              </label>

              <select
                id="seller"
                value={sellerSlug}
                onChange={(event) =>
                  setSellerSlug(event.target.value)
                }
                required
                disabled={loadingOptions}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-black disabled:bg-gray-100"
              >
                <option value="">
                  {loadingOptions
                    ? "Loading sellers..."
                    : "Select seller"}
                </option>

                {options.sellers.map((seller) => (
                  <option
                    key={seller.id}
                    value={seller.slug}
                  >
                    {seller.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="price"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Price (INR)
            </label>

            <input
              id="price"
              type="number"
              min="1"
              step="0.01"
              value={price}
              onChange={(event) =>
                setPrice(event.target.value)
              }
              placeholder="e.g. 74999"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Product Image
                </label>

                <p className="mt-1 text-xs text-gray-500">
                  JPG, PNG, WebP, AVIF, HEIC or HEIF. Maximum 5 MB.
                </p>
              </div>
            </div>

            {!imagePreview ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() =>
                  fileInputRef.current?.click()
                }
                className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition ${
                  draggingImage
                    ? "border-black bg-gray-100"
                    : "border-gray-300 hover:border-gray-500 hover:bg-gray-50"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="text-4xl">🖼️</div>

                <p className="mt-3 text-sm font-medium text-gray-800">
                  {draggingImage
                    ? "Drop your image here"
                    : "Drag & drop your product image here"}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  or click to select a file
                </p>

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="mt-4 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
                >
                  Select File
                </button>
              </div>
            ) : (
              <div className="rounded-xl border border-gray-200 p-4">
                <div className="relative overflow-hidden rounded-lg bg-gray-100">
                  <img
                    src={imagePreview}
                    alt="Product preview"
                    className="mx-auto max-h-80 object-contain"
                  />

                  {uploadingImage && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <div className="rounded-lg bg-white px-5 py-3 text-sm font-medium text-gray-800">
                        Uploading image...
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-green-600">
                    {uploadingImage
                      ? "Uploading..."
                      : "✓ Image uploaded"}
                  </span>

                  <button
                    type="button"
                    onClick={removeImage}
                    disabled={uploadingImage}
                    className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Specifications
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Add specifications if available.
            </p>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <input
                type="text"
                value={ram}
                onChange={(event) =>
                  setRam(event.target.value)
                }
                placeholder="RAM: 8GB"
                className="rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
              />

              <input
                type="text"
                value={storage}
                onChange={(event) =>
                  setStorage(event.target.value)
                }
                placeholder="Storage: 128GB"
                className="rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
              />

              <input
                type="text"
                value={processor}
                onChange={(event) =>
                  setProcessor(event.target.value)
                }
                placeholder="Processor: Snapdragon"
                className="rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
              />
            </div>
          </div>

          {message && (
            <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700">
              {message}
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 border-t pt-6">
            <Link
              href="/admin/products"
              className="rounded-lg border px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={
                loading ||
                loadingOptions ||
                uploadingImage
              }
              className="rounded-lg bg-black px-5 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Creating..."
                : "Create Product"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}