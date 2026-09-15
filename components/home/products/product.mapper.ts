import type { Product } from "@/types/product";

import type { HomeProduct } from "./ProductCard";



function getProductHref(product: Product) {
  const category = product.category?.slug?.toLowerCase() ?? "";

  if (
    category.includes("laptop") ||
    category.includes("computer")
  ) {
    return `/products/${product.slug}`;
  }

  return `/mobiles/${product.slug}`;
}

/**
 * Converts the backend Product model into the
 * lightweight model required by homepage product cards.
 */
export function mapProductToHomeProduct(
  product: Product,
  badge?: HomeProduct["badge"],
  badgeTone?: HomeProduct["badgeTone"],
  isUpcoming = false,
): HomeProduct {
  const primaryImage = product.images[0]?.url ?? null;

  const availablePrices = product.prices
    .filter((price) => price.inStock)
    .map((price) => Number(price.amount))
    .filter((price) => Number.isFinite(price) && price >= 0);

  const lowestPrice =
    availablePrices.length > 0
      ? Math.min(...availablePrices)
      : null;

  const rating =
    product.averageRating ??
    product.rating ??
    null;

 return {
  id: product.id,
  name: product.name,
  slug: product.slug,
  href: getProductHref(product),
  image: primaryImage,
  price: lowestPrice,
  rating,
  badge,
  badgeTone,
  isUpcoming,
};
}