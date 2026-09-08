import { apiFetch } from "./client";

import type { ApiResponse } from "@/types/api";

export interface AdminBrand {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;

  _count?: {
    products: number;
  };

  createdAt?: string;
  updatedAt?: string;
}

/**
 * Public brands
 */
export async function getBrands(): Promise<
  ApiResponse<AdminBrand[]>
> {
  return apiFetch<ApiResponse<AdminBrand[]>>(
    "/brands",
  );
}

/**
 * Admin: get all brands
 */
export async function getAdminBrands(): Promise<
  ApiResponse<AdminBrand[]>
> {
  return apiFetch<ApiResponse<AdminBrand[]>>(
    "/admin/brands",
  );
}

/**
 * Admin: get a single brand
 */
export async function getAdminBrand(
  id: string,
): Promise<ApiResponse<AdminBrand>> {
  return apiFetch<ApiResponse<AdminBrand>>(
    `/admin/brands/${id}`,
  );
}

/**
 * Admin: create brand
 */
export async function createAdminBrand(data: {
  name: string;
  description?: string;
  logoUrl?: string;
}): Promise<ApiResponse<AdminBrand>> {
  return apiFetch<ApiResponse<AdminBrand>>(
    "/admin/brands",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}

/**
 * Admin: update brand
 */
export async function updateAdminBrand(
  id: string,
  data: {
    name?: string;
    description?: string;
    logoUrl?: string;
  },
): Promise<ApiResponse<AdminBrand>> {
  return apiFetch<ApiResponse<AdminBrand>>(
    `/admin/brands/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
  );
}

/**
 * Admin: delete brand
 */
export async function deleteAdminBrand(
  id: string,
): Promise<ApiResponse<unknown>> {
  return apiFetch<ApiResponse<unknown>>(
    `/admin/brands/${id}`,
    {
      method: "DELETE",
    },
  );
}