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
  originalName?: string;
  sortOrder?: number;
  isPrimary?: boolean;
}

interface SelectedImage {
  id: string;
  file: File;
  previewUrl: string;
  uploadedUrl: string;
  uploading: boolean;
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

  const [images, setImages] = useState<SelectedImage[]>([]);

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
  const [uploadingImages, setUploadingImages] = useState(false);
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

  async function uploadImages(files: File[]) {
    setMessage("");
    setError("");

    if (files.length === 0) {
      return;
    }

    if (images.length + files.length > 10) {
      setError("You can upload a maximum of 10 images.");
      return;
    }

    const validFiles: File[] = [];

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        setError(
          `"${file.name}" is not a valid image file.`,
        );
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError(
          `"${file.name}" is larger than 5 MB.`,
        );
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) {
      return;
    }

    const selectedImages: SelectedImage[] =
      validFiles.map((file) => ({
        id: `${file.name}-${file.lastModified}-${Math.random()}`,
        file,
        previewUrl: URL.createObjectURL(file),
        uploadedUrl: "",
        uploading: true,
      }));

    setImages((current) => [
      ...current,
      ...selectedImages,
    ]);

    setUploadingImages(true);

    try {
      const formData = new FormData();

      for (const file of validFiles) {
        formData.append("images", file);
      }

      const response = await apiFetch<
        ApiResponse<UploadResponse[]>
      >("/admin/products/upload-images", {
        method: "POST",
        body: formData,
      });

      const uploadedImages = response.data;

      setImages((current) => {
        const updated = [...current];

        selectedImages.forEach(
          (selectedImage, index) => {
            const uploadedImage =
              uploadedImages[index];

            const currentIndex = updated.findIndex(
              (image) =>
                image.id === selectedImage.id,
            );

            if (
              currentIndex !== -1 &&
              uploadedImage
            ) {
              const uploadedUrl =
                uploadedImage.url.startsWith("http")
                  ? uploadedImage.url
                  : `${API_SERVER_URL}${uploadedImage.url}`;

              updated[currentIndex] = {
                ...updated[currentIndex],
                uploadedUrl,
                uploading: false,
              };
            }
          },
        );

        return updated;
      });

      setMessage(
        `${uploadedImages.length} image${
          uploadedImages.length > 1 ? "s" : ""
        } uploaded successfully.`,
      );
    } catch (err) {
      setImages((current) =>
        current.filter(
          (image) =>
            !selectedImages.some(
              (selected) =>
                selected.id === image.id,
            ),
        ),
      );

      for (const image of selectedImages) {
        URL.revokeObjectURL(image.previewUrl);
      }

      setError(
        err instanceof Error
          ? err.message
          : "Failed to upload images.",
      );
    } finally {
      setUploadingImages(false);
    }
  }

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const files = Array.from(
      event.target.files ?? [],
    );

    if (files.length > 0) {
      uploadImages(files);
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

    const files = Array.from(
      event.dataTransfer.files ?? [],
    );

    if (files.length > 0) {
      uploadImages(files);
    }
  }

  function removeImage(id: string) {
    setImages((current) => {
      const image = current.find(
        (item) => item.id === id,
      );

      if (image) {
        URL.revokeObjectURL(image.previewUrl);
      }

      return current.filter(
        (item) => item.id !== id,
      );
    });

    setMessage("");
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setMessage("");
    setError("");

    if (uploadingImages) {
      setError(
        "Please wait for the image uploads to finish.",
      );
      return;
    }

    const uploadedImageUrls = images
      .filter(
        (image) =>
          image.uploadedUrl &&
          !image.uploading,
      )
      .map((image) => image.uploadedUrl);

    if (images.length > 0 && uploadedImageUrls.length !== images.length) {
      setError(
        "Please make sure all selected images are uploaded successfully.",
      );
      return;
    }

    setLoading(true);

    try {
      const specifications: Record<
        string,
        string
      > = {};

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

      const response = await apiFetch<
        ApiResponse<Product>
      >("/admin/products", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          brandSlug,
          categorySlug,
          images:
            uploadedImageUrls.length > 0
              ? uploadedImageUrls
              : undefined,
          price: Number(price),
          sellerSlug,
          specifications,
        }),
      });

      setMessage(
        response.message ??
          "Product created successfully.",
      );

      setName("");
      setDescription("");
      setBrandSlug("");
      setCategorySlug("");
      setSellerSlug("");
      setPrice("");

      setRam("");
      setStorage("");
      setProcessor("");

      images.forEach((image) => {
        URL.revokeObjectURL(image.previewUrl);
      });

      setImages([]);
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
          Create a new product for the Smartprix
          website.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl bg-white p-6 shadow-sm"
      >
        <div className="grid gap-6">
          {/* Product Name */}
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

          {/* Description */}
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
                setDescription(
                  event.target.value,
                )
              }
              placeholder="Enter product description..."
              rows={5}
              required
              minLength={10}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />
          </div>

          {/* Brand / Category / Seller */}
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
                  setBrandSlug(
                    event.target.value,
                  )
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
                  setCategorySlug(
                    event.target.value,
                  )
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
                className="mb-2 block text-sm font-medium text-gray-700"
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

          {/* Price */}
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

          {/* Multiple Product Images */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Product Images
                </label>

                <p className="mt-1 text-xs text-gray-500">
                  Upload up to 10 images. JPG, PNG,
                  WebP, AVIF, HEIC or HEIF. Maximum
                  5 MB per image.
                </p>
              </div>

              <span className="text-xs font-medium text-gray-500">
                {images.length}/10
              </span>
            </div>

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
                multiple
                accept="image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif"
                onChange={handleFileChange}
                className="hidden"
                disabled={images.length >= 10}
              />

              <div className="text-4xl">
                🖼️
              </div>

              <p className="mt-3 text-sm font-medium text-gray-800">
                {draggingImage
                  ? "Drop your images here"
                  : "Drag & drop your product images here"}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                or click to select multiple files
              </p>

              <button
                type="button"
                disabled={images.length >= 10}
                onClick={(event) => {
                  event.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="mt-4 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Select Images
              </button>
            </div>

            {/* Image previews */}
            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {images.map((image, index) => (
                  <div
                    key={image.id}
                    className="relative overflow-hidden rounded-xl border border-gray-200 bg-white"
                  >
                    <div className="relative flex h-40 items-center justify-center bg-gray-50 p-3">
                      <img
                        src={image.previewUrl}
                        alt={`Product image ${
                          index + 1
                        }`}
                        className="h-full w-full object-contain"
                      />

                      {image.uploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <div className="rounded-lg bg-white px-3 py-2 text-xs font-medium text-gray-800">
                            Uploading...
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between border-t px-3 py-2">
                      <div>
                        {index === 0 ? (
                          <span className="text-xs font-semibold text-blue-600">
                            Primary
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500">
                            Image {index + 1}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removeImage(image.id)
                        }
                        disabled={image.uploading}
                        className="text-xs font-medium text-red-600 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Specifications */}
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
                  setProcessor(
                    event.target.value,
                  )
                }
                placeholder="Processor: Snapdragon"
                className="rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
              />
            </div>
          </div>

          {/* Messages */}
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

          {/* Buttons */}
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
                uploadingImages
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
