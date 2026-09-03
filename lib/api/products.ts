import { apiFetch } from "./client";
import type { ApiResponse } from "@/types/api";
import type { Product } from "@/types/product";

export async function getProducts(): Promise<ApiResponse<Product[]>> {
  return apiFetch<ApiResponse<Product[]>>("/products");
}

export async function getProduct(
  slug: string,
): Promise<ApiResponse<Product>> {
  return apiFetch<ApiResponse<Product>>(`/products/${slug}`);
}