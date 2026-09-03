import Link from "next/link";

import { getProducts } from "@/lib/api/products";
import type { Product } from "@/types/product";

export default async function AdminProductsPage() {
  let products: Product[] = [];

  try {
    const response = await getProducts();
    products = response.data;
  } catch {
    products = [];
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

        <button
          type="button"
          className="rounded-lg bg-black px-5 py-3 text-sm font-medium text-white hover:bg-gray-800"
        >
          + Add Product
        </button>
      </div>

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

                <th className="px-6 py-4 text-sm font-semibold text-gray-700">
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

                    <td className="px-6 py-4 text-sm text-gray-700">
                      {product.brand.name}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-700">
                      {product.category.name}
                    </td>

                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {lowestPrice
                        ? `₹${Number(lowestPrice).toLocaleString(
                            "en-IN",
                          )}`
                        : "N/A"}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Link
                          href={`/products/${product.slug}`}
                          target="_blank"
                          className="rounded-md border px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100"
                        >
                          View
                        </Link>

                        <button
                          type="button"
                          className="rounded-md border px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="rounded-md bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {products.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No products found.
          </div>
        )}
      </div>
    </div>
  );
}