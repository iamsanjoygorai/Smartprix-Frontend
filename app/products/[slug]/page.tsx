import { getProduct } from "@/lib/api/products";
import { getProductSpecifications } from "@/lib/api/specifications";
import { getProductPriceHistory } from "@/lib/api/priceHistory";
import ProductImageGallery from "@/components/products/ProductImageGallery";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { slug } = await params;

  const [
  productResponse,
  specificationsResponse,
  priceHistoryResponse,
] = await Promise.all([
  getProduct(slug),
  getProductSpecifications(slug),
  getProductPriceHistory(slug),
]);

const product = productResponse.data;
const specifications = specificationsResponse.data;
const priceHistory = priceHistoryResponse.data.history;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Product information + starting price */}
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl bg-white p-6 shadow-sm lg:col-span-2">
          <ProductImageGallery
  images={product.images}
  productName={product.name}
/>
          <p className="text-sm font-medium text-gray-500">
            {product.brand.name} · {product.category.name}
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            {product.name}
          </h1>

          {product.description && (
            <p className="mt-4 leading-7 text-gray-600">
              {product.description}
            </p>
          )}

          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900">
              Product details
            </h2>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-xs text-gray-500">
                  Brand
                </p>

                <p className="mt-1 font-semibold text-gray-900">
                  {product.brand.name}
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-xs text-gray-500">
                  Category
                </p>

                <p className="mt-1 font-semibold text-gray-900">
                  {product.category.name}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Starting price
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            ₹
            {product.prices[0]?.amount
              ? Number(product.prices[0].amount).toLocaleString(
                  "en-IN",
                )
              : "N/A"}
          </p>

          <p className="mt-2 text-sm text-gray-500">
            Compare prices from different sellers below.
          </p>
        </section>
      </div>

      {/* Specifications */}
      <section className="mt-6 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900">
          Specifications
        </h2>

        {specifications.length === 0 ? (
          <p className="mt-4 text-gray-600">
            No specifications available.
          </p>
        ) : (
          <div className="mt-4 divide-y">
            {specifications.map((specification) => (
              <div
  key={specification.id}
  className="grid gap-2 py-4 sm:grid-cols-3"
>
  <p className="font-medium text-gray-700">
    {specification.key}
  </p>

  <p className="text-gray-900 sm:col-span-2">
    {specification.value?.value ?? "N/A"}
  </p>
</div>
            ))}
          </div>
        )}
      </section>

      {/* Price history */}
<section className="mt-6 rounded-xl bg-white p-6 shadow-sm">
  <h2 className="text-2xl font-bold text-gray-900">
    Price History
  </h2>

  {priceHistory.length === 0 ? (
    <p className="mt-4 text-gray-600">
      No price history available.
    </p>
  ) : (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full min-w-[500px] text-left">
        <thead>
          <tr className="border-b text-sm text-gray-500">
            <th className="px-4 py-3">
              Date
            </th>

            <th className="px-4 py-3">
              Price
            </th>
          </tr>
        </thead>

        <tbody>
          {priceHistory.map((item) => (
            <tr
              key={item.id}
              className="border-b last:border-0"
            >
              <td className="px-4 py-4 text-gray-700">
                {new Date(item.recordedAt).toLocaleDateString(
                  "en-IN",
                )}
              </td>

              <td className="px-4 py-4 font-bold text-gray-900">
                ₹
                {Number(item.price).toLocaleString(
                  "en-IN",
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</section>

      {/* Price comparison */}
      <section className="mt-6 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900">
          Price comparison
        </h2>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[600px] text-left">
            <thead>
              <tr className="border-b text-sm text-gray-500">
                <th className="px-4 py-3">
                  Seller
                </th>

                <th className="px-4 py-3">
                  Price
                </th>

                <th className="px-4 py-3">
                  Stock
                </th>
              </tr>
            </thead>

            <tbody>
              {product.prices.map((price) => (
                <tr
                  key={price.id}
                  className="border-b last:border-0"
                >
                  <td className="px-4 py-4 font-medium text-gray-900">
                    {price.seller.name}
                  </td>

                  <td className="px-4 py-4 font-bold text-gray-900">
                    ₹
                    {Number(price.amount).toLocaleString(
                      "en-IN",
                    )}
                  </td>

                  <td className="px-4 py-4">
                    {price.inStock ? (
                      <span className="font-medium text-green-600">
                        In Stock
                      </span>
                    ) : (
                      <span className="font-medium text-red-600">
                        Out of Stock
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}