"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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

export default function NewProductPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [brandSlug, setBrandSlug] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [sellerSlug, setSellerSlug] = useState("");

  const [image, setImage] = useState("");
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

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setMessage("");
    setError("");
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
      setImage("");
      setPrice("");
      setSellerSlug("");
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
              onChange={(event) => setName(event.target.value)}
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
                  <option key={brand.id} value={brand.slug}>
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
                  <option key={seller.id} value={seller.slug}>
                    {seller.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
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
                onChange={(event) => setPrice(event.target.value)}
                placeholder="e.g. 74999"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
              />
            </div>

            <div>
              <label
                htmlFor="image"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Image URL
              </label>

              <input
                id="image"
                type="url"
                value={image}
                onChange={(event) => setImage(event.target.value)}
                placeholder="https://example.com/product-image.jpg"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
              />

              <p className="mt-1 text-xs text-gray-500">
                Optional.
              </p>
            </div>
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
                onChange={(event) => setRam(event.target.value)}
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
              disabled={loading || loadingOptions}
              className="rounded-lg bg-black px-5 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Product"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}