import ProductCard from "@/components/products/ProductCard";
import { getProducts } from "@/lib/api/products";
import type { Product } from "@/types/product";

interface ProductsPageProps {
  searchParams: Promise<{
    search?: string;
  }>;
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;

  let products: Product[] = [];

  try {
    const response = await getProducts({
      search: params.search,
    });

    products = response.data;
  } catch {
    products = [];
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {params.search
            ? `Search results for "${params.search}"`
            : "Products"}
        </h1>

        <p className="mt-2 text-gray-600">
          Compare products and find the best prices.
        </p>
      </div>

      {products.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <p className="text-gray-600">
            No products found.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      )}
    </div>
  );
}