export interface Brand {
  id: string;
  name: string;
  slug: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Seller {
  id: string;
  name: string;
  slug: string;
}

export interface ProductImage {
  id: string;
  url: string;
  altText?: string | null;
}

export interface Variant {
  id: string;
  name: string;
  sku?: string | null;
}

export interface Price {
  id: string;
  amount: string;
  inStock: boolean;
  seller: Seller;
  variant?: Variant | null;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  isActive: boolean;
  brand: Brand;
  category: Category;
  images: ProductImage[];
  prices: Price[];
  /** Optional catalogue values returned by the product API. */
  averageRating?: number | null;
  rating?: number | null;
  reviewCount?: number | null;
}
