import Link from "next/link";

import type { Product } from "@/types/product";

type PopularMobilesProps = {
  products: Product[];
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
const API_SERVER_URL = API_URL.replace(/\/api\/?$/, "");

function getImageUrl(product: Product) {
  const imageUrl = product.images[0]?.url;

  if (!imageUrl) return null;
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) return imageUrl;

  return `${API_SERVER_URL}${imageUrl}`;
}

function isMobile(product: Product) {
  const category = `${product.category.name} ${product.category.slug}`.toLowerCase();
  return category.includes("mobile") || category.includes("phone");
}

function getLowestPrice(product: Product) {
  const prices = product.prices
    .filter((price) => price.inStock)
    .map((price) => Number(price.amount))
    .filter((price) => Number.isFinite(price));

  return prices.length ? Math.min(...prices) : null;
}

function getRating(product: Product) {
  const rating = product.averageRating ?? product.rating;
  return typeof rating === "number" && rating >= 0 && rating <= 5 ? rating : null;
}

export default function PopularMobiles({ products }: PopularMobilesProps) {
  const mobiles = products.filter((product) => product.isActive && isMobile(product)).slice(0, 8);

  return (
    <section className="rounded-md border border-slate-200 bg-white" aria-labelledby="popular-mobiles-heading">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <h2 id="popular-mobiles-heading" className="text-lg font-semibold text-slate-800">Popular Mobiles</h2>
        <Link href="/products?category=mobile" className="text-sm font-medium text-blue-600">View All&nbsp; →</Link>
      </div>

      {mobiles.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-slate-500">Popular mobile phones will appear here when they are available in the catalogue.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {mobiles.map((product) => {
            const imageUrl = getImageUrl(product);
            const lowestPrice = getLowestPrice(product);
            const rating = getRating(product);

            return (
              <article key={product.id} className="border-b border-r border-slate-200 p-4 last:border-r-0">
                <Link href={`/products/${product.slug}`} className="group block">
                  <div className="flex h-48 items-center justify-center">
                    {imageUrl ? <img src={imageUrl} alt={product.images[0]?.altText ?? product.name} className="max-h-full max-w-full object-contain transition group-hover:scale-105" /> : <span className="text-sm text-slate-400">No image</span>}
                  </div>
                  <h3 className="mt-4 line-clamp-2 min-h-10 text-sm leading-5 text-slate-800 group-hover:text-blue-600">{product.name}</h3>
                </Link>
                <p className="mt-2 text-base font-bold text-emerald-700">{lowestPrice === null ? "Price unavailable" : `₹${lowestPrice.toLocaleString("en-IN")}`}</p>
                {rating !== null && (
                  <div className="mt-1 flex items-center gap-1" aria-label={`${rating} out of 5 stars`}>
                    <span className="text-base tracking-tight text-amber-400" aria-hidden="true">{"★".repeat(Math.round(rating))}{"☆".repeat(5 - Math.round(rating))}</span>
                    <span className="text-xs text-slate-500">{rating.toFixed(1)}{product.reviewCount ? ` (${product.reviewCount})` : ""}</span>
                  </div>
                )}
                <Link href={`/products/${product.slug}`} className="mt-3 inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-600"><span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">+</span> Compare</Link>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
