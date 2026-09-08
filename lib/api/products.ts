import { apiFetch } from "./client";
import type { ApiResponse } from "@/types/api";
import type { Product } from "@/types/product";

export interface CreateProductInput {
  name: string;
  description?: string;
  brandSlug: string;
  categorySlug: string;
  images?: string[];
  price: number;
  sellerSlug: string;
  specifications?: Record<string, string>;
}

export async function getProducts(): Promise<
  ApiResponse<{ products: Product[] }>
> {
  return apiFetch<ApiResponse<{ products: Product[] }>>(
    "/products",
  );
}

export async function getProduct(
  slug: string,
): Promise<ApiResponse<Product>> {
  return apiFetch<ApiResponse<Product>>(
    `/products/${slug}`,
  );
}

export async function createProduct(
  data: CreateProductInput,
): Promise<ApiResponse<Product>> {
  return apiFetch<ApiResponse<Product>>(
    "/admin/products",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}