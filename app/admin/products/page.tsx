import Link from "next/link";

import { getProducts } from "@/lib/api/products";
import ProductDeleteButton from "@/components/admin/ProductDeleteButton";
import ProductRestoreButton from "@/components/admin/ProductRestoreButton";

import type { Product } from "@/types/product";

export default async function AdminProductsPage() {
  let products: Product[] = [];
  let error = "";

  try {
    const response = await getProducts();
    products = response.data;
  } catch (err) {
    error =
      err instanceof Error
        ? err.message
        : "Failed to load products.";
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            Products
          </h2>

          <p className="mt-2 text-gray-600">
            Manage all products on your website.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="rounded-lg bg-black px-5 py-3 text-sm font-medium text-white hover:bg-gray-800"
        >
          + Add Product
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                  Product
                </th>

                <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                  Brand
                </th>

                <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                  Category
                </th>

                <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                  Price
                </th>

                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {products.map((product) => {
                const lowestPrice = product.prices[0]?.amount;

                return (
                  <tr
                    key={product.id}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {product.name}
                      </div>

                      <div className="mt-1 text-xs text-gray-500">
                        {product.slug}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {product.brand.name}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {product.category.name}
                    </td>

                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {lowestPrice
                        ? `₹${Number(
                            lowestPrice,
                          ).toLocaleString("en-IN")}`
                        : "N/A"}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="rounded-md border px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Edit
                        </Link>

                        {product.isActive ? (
                          <ProductDeleteButton
                            productId={product.id}
                            productName={product.name}
                          />
                        ) : (
                          <ProductRestoreButton
                            productId={product.id}
                            productName={product.name}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {products.length === 0 && !error && (
          <div className="p-8 text-center text-sm text-gray-500">
            No products found.
          </div>
        )}
      </div>
    </div>
  );
}