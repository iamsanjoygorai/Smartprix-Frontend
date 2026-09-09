import { apiFetch } from "./client";
import type { ApiResponse } from "@/types/api";


export interface AdminSpecification {
  id: string;
  name: string;
  slug: string;
  unit?: string | null;
  dataType: string;
  group: string;
  createdAt?: string;
  updatedAt?: string;

  _count?: {
    products: number;
    values: number;
  };
}

export interface AdminSpecificationValue {
  id: string;
  value: string;
  _count?: {
    products: number;
  };
}

export interface AdminSpecificationProduct {
  id: string;
  customValue?: string | null;
  product: {
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
  };
  value?: {
    id: string;
    value: string;
  } | null;
}

export interface AdminSpecificationDetails
  extends AdminSpecification {
  values: AdminSpecificationValue[];
  products: AdminSpecificationProduct[];
}

/**
 * Admin: get all specifications
 */
export async function getAdminSpecifications(
  params?: {
    search?: string;
    group?: string;
  },
): Promise<ApiResponse<AdminSpecification[]>> {
  const searchParams = new URLSearchParams();

  if (params?.search?.trim()) {
    searchParams.set("search", params.search.trim());
  }

  if (params?.group?.trim()) {
    searchParams.set("group", params.group.trim());
  }

  const query = searchParams.toString();

  return apiFetch<ApiResponse<AdminSpecification[]>>(
    query
      ? `/admin/specifications?${query}`
      : "/admin/specifications",
  );
}

/**
 * Admin: get a single specification
 */
export async function getAdminSpecification(
  id: string,
): Promise<ApiResponse<AdminSpecificationDetails>> {
  return apiFetch<ApiResponse<AdminSpecificationDetails>>(
    `/admin/specifications/${id}`,
  );
}

/**
 * Admin: create specification
 */
export async function createAdminSpecification(
  data: {
    name: string;
    unit?: string;
    dataType?: string;
    group?: string;
  },
): Promise<ApiResponse<AdminSpecification>> {
  return apiFetch<ApiResponse<AdminSpecification>>(
    "/admin/specifications",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}

/**
 * Admin: update specification
 */
export async function updateAdminSpecification(
  id: string,
  data: {
    name?: string;
    unit?: string;
    dataType?: string;
    group?: string;
  },
): Promise<ApiResponse<AdminSpecification>> {
  return apiFetch<ApiResponse<AdminSpecification>>(
    `/admin/specifications/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
  );
}

/**
 * Admin: delete specification
 */
export async function deleteAdminSpecification(
  id: string,
): Promise<ApiResponse<unknown>> {
  return apiFetch<ApiResponse<unknown>>(
    `/admin/specifications/${id}`,
    {
      method: "DELETE",
    },
  );
}


/**
 * Public: get product specifications
 */
export async function getProductSpecifications(
  slug: string,
): Promise<ApiResponse<unknown>> {
  return apiFetch<ApiResponse<unknown>>(
    `/products/${slug}/specifications`,
  );
}