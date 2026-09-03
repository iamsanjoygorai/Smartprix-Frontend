import Link from "next/link";

import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({
  product,
}: ProductCardProps) {
  const lowestPrice = product.prices[0]?.amount;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group rounded-xl bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
    >
      <div className="flex h-52 items-center justify-center rounded-lg bg-gray-50">
        {product.images[0]?.url ? (
          <img
            src={product.images[0].url}
            alt={product.images[0].altText ?? product.name}
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <span className="text-sm text-gray-400">
            No image
          </span>
        )}
      </div>

      <div className="mt-4">
        <p className="text-sm text-gray-500">
          {product.brand.name}
        </p>

        <h2 className="mt-1 line-clamp-2 font-semibold text-gray-900 group-hover:text-blue-600">
          {product.name}
        </h2>

        <div className="mt-3">
          <p className="text-xs text-gray-500">
            Starting from
          </p>

          <p className="text-xl font-bold text-gray-900">
            {lowestPrice
              ? `₹${Number(lowestPrice).toLocaleString("en-IN")}`
              : "Price unavailable"}
          </p>
        </div>
      </div>
    </Link>
  );
}