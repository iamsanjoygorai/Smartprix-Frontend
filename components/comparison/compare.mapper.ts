import type { Product } from "@/types/product";

/* =========================================================
   TYPES
========================================================= */

export interface CompareSpecification {
  key: string;
  label: string;
  value: string;
  group?: string;
}

export interface CompareProduct {
  id: string;
  name: string;
  slug: string;
  href: string;
  image: string | null;
  brand: string;
  brandSlug: string;
  price: number | null;
  rating: number | null;
  reviewCount: number;
  specifications: CompareSpecification[];
}

/* =========================================================
   HELPERS
========================================================= */

function getLowestPrice(product: Product): number | null {
  const prices = (product.prices ?? [])
    .filter((price) => price.inStock)
    .map((price) => Number(price.amount))
    .filter(
      (price) =>
        Number.isFinite(price) && price >= 0,
    );

  if (prices.length === 0) {
    return null;
  }

  return Math.min(...prices);
}

function getProductImage(product: Product): string | null {
  const primaryImage =
    product.images?.find(
      (image) =>
        image.altText?.toLowerCase().includes("primary"),
    ) ?? product.images?.[0];

  return primaryImage?.url ?? null;
}

function getProductRating(product: Product): number | null {
  const rating =
    product.averageRating ??
    product.rating ??
    null;

  return typeof rating === "number"
    ? rating
    : null;
}

function getReviewCount(product: Product): number {
  return typeof product.reviewCount === "number"
    ? product.reviewCount
    : 0;
}

function getBrandSlug(product: Product): string {
  const slug = product.brand?.slug;

  if (slug?.trim()) {
    return slug.trim();
  }

  return (
    product.brand?.name
      ?.toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") ?? ""
  );
}

/* =========================================================
   VALUE NORMALIZER
========================================================= */

export function normalizeCompareValue(
  value: unknown,
): string {
  if (value === null || value === undefined) {
    return "—";
  }

  if (typeof value === "string") {
    return value.trim() || "—";
  }

  if (
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }

  if (Array.isArray(value)) {
    const values = value
      .map((item) => normalizeCompareValue(item))
      .filter((item) => item !== "—");

    return values.length > 0
      ? values.join(", ")
      : "—";
  }

  if (typeof value === "object") {
    const objectValue =
      value as Record<string, unknown>;

    /*
     * Common specification object shapes.
     */

    const preferredKeys = [
      "name",
      "value",
      "label",
      "text",
      "title",
    ];

    for (const key of preferredKeys) {
      if (objectValue[key] !== undefined) {
        const normalized = normalizeCompareValue(
          objectValue[key],
        );

        if (normalized !== "—") {
          return normalized;
        }
      }
    }

    /*
     * If the object contains multiple primitive
     * values, join them safely instead of rendering
     * "[object Object]".
     */

    const parts = Object.entries(objectValue)
      .map(([key, item]) => {
        const normalized = normalizeCompareValue(item);

        if (normalized === "—") {
          return null;
        }

        return `${key}: ${normalized}`;
      })
      .filter(
        (item): item is string => Boolean(item),
      );

    return parts.length > 0
      ? parts.join(" • ")
      : "—";
  }

  return "—";
}

/* =========================================================
   SPECIFICATION EXTRACTION
========================================================= */

function extractSpecifications(
  product: Product,
): CompareSpecification[] {
  /*
   * The current Product type does not expose a
   * specifications field, so this mapper intentionally
   * reads it only when the API response provides it.
   */

  const productWithSpecs = product as Product & {
    specifications?: unknown;
  };

  const rawSpecifications =
    productWithSpecs.specifications;

  if (!rawSpecifications) {
    return [];
  }

  const specifications: CompareSpecification[] = [];

  if (Array.isArray(rawSpecifications)) {
    for (const item of rawSpecifications) {
      if (!item || typeof item !== "object") {
        continue;
      }

      const spec =
        item as Record<string, unknown>;

      const key = normalizeCompareValue(
        spec.key ??
          spec.slug ??
          spec.name ??
          spec.label,
      );

      const label = normalizeCompareValue(
        spec.name ??
          spec.label ??
          spec.key ??
          spec.slug,
      );

      const value = normalizeCompareValue(
        spec.value ??
          spec.data ??
          spec.text,
      );

      if (
        key === "—" ||
        label === "—" ||
        value === "—"
      ) {
        continue;
      }

      specifications.push({
        key: key.toLowerCase(),
        label,
        value,
        group:
          typeof spec.group === "string"
            ? spec.group
            : undefined,
      });
    }

    return specifications;
  }

  if (typeof rawSpecifications === "object") {
    const specificationObject =
      rawSpecifications as Record<string, unknown>;

    for (const [key, value] of Object.entries(
      specificationObject,
    )) {
      const normalizedValue =
        normalizeCompareValue(value);

      if (normalizedValue === "—") {
        continue;
      }

      specifications.push({
        key: key.toLowerCase(),
        label: key,
        value: normalizedValue,
      });
    }
  }

  return specifications;
}

/* =========================================================
   PRODUCT → COMPARE PRODUCT
========================================================= */

export function mapProductToCompareProduct(
  product: Product,
): CompareProduct {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    href: `/mobiles/${product.slug}`,
    image: getProductImage(product),
    brand: product.brand?.name ?? "Unknown Brand",
    brandSlug: getBrandSlug(product),
    price: getLowestPrice(product),
    rating: getProductRating(product),
    reviewCount: getReviewCount(product),
    specifications:
      extractSpecifications(product),
  };
}

/* =========================================================
   PRODUCTS → COMPARE PRODUCTS
========================================================= */

export function mapProductsToCompareProducts(
  products: Product[],
): CompareProduct[] {
  return (products ?? [])
    .filter((product) => Boolean(product?.id))
    .map(mapProductToCompareProduct);
}

/* =========================================================
   COMPARE SPECIFICATION ROWS
========================================================= */

export interface CompareSpecificationRow {
  key: string;
  label: string;
  group?: string;
  values: Record<string, string>;
}

export function buildCompareSpecificationRows(
  products: CompareProduct[],
): CompareSpecificationRow[] {
  const rows = new Map<
    string,
    CompareSpecificationRow
  >();

  for (const product of products) {
    for (const specification of product.specifications) {
      const key = specification.key;

      if (!rows.has(key)) {
        rows.set(key, {
          key,
          label: specification.label,
          group: specification.group,
          values: {},
        });
      }

      const row = rows.get(key);

      if (!row) {
        continue;
      }

      row.values[product.id] =
        specification.value;
    }
  }

  return Array.from(rows.values());
}
