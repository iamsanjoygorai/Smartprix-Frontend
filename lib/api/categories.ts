import { apiFetch } from "./client";

import type { ApiResponse } from "@/types/api";

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;

  parentId?: string | null;

  parent?: {
    id: string;
    name: string;
    slug: string;
  } | null;

  children?: AdminCategory[];

  _count?: {
    products: number;
    children: number;
  };

  createdAt?: string;
  updatedAt?: string;
}

/**
 * Public categories
 */
export async function getCategories(): Promise<
  ApiResponse<AdminCategory[]>
> {
  return apiFetch<ApiResponse<AdminCategory[]>>(
    "/categories",
  );
}

/**
 * Admin: get all categories
 */
export async function getAdminCategories(): Promise<
  ApiResponse<AdminCategory[]>
> {
  return apiFetch<ApiResponse<AdminCategory[]>>(
    "/admin/categories",
  );
}

/**
 * Admin: get a single category
 */
export async function getAdminCategory(
  id: string,
): Promise<ApiResponse<AdminCategory>> {
  return apiFetch<ApiResponse<AdminCategory>>(
    `/admin/categories/${id}`,
  );
}

/**
 * Admin: create category
 */
export async function createAdminCategory(data: {
  name: string;
  description?: string;
  imageUrl?: string;
  parentId?: string | null;
}): Promise<ApiResponse<AdminCategory>> {
  return apiFetch<ApiResponse<AdminCategory>>(
    "/admin/categories",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}

/**
 * Admin: update category
 */
export async function updateAdminCategory(
  id: string,
  data: {
    name?: string;
    description?: string;
    imageUrl?: string;
    parentId?: string | null;
  },
): Promise<ApiResponse<AdminCategory>> {
  return apiFetch<ApiResponse<AdminCategory>>(
    `/admin/categories/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
  );
}

/**
 * Admin: delete category
 */
export async function deleteAdminCategory(
  id: string,
): Promise<ApiResponse<unknown>> {
  return apiFetch<ApiResponse<unknown>>(
    `/admin/categories/${id}`,
    {
      method: "DELETE",
    },
  );
}