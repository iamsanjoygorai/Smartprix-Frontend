import { apiFetch } from "./client";
import type { ApiResponse } from "@/types/api";

export interface DashboardProduct {
  id: string;
  name: string;
  slug: string;
  createdAt: string;

  brand: {
    name: string;
  };

  images: {
    url: string;
  }[];

  prices: {
    amount: string | number;
    currency: string;
  }[];
}

export interface DashboardNews {
  id: string;
  title: string;
  slug: string;
  status: string;
  featuredImage: string | null;
  createdAt: string;
  publishedAt: string | null;
}

export interface AdminDashboard {
  overview: {
    products: number;
    news: number;
    users: number;
    brands: number;
  };

  recentProducts: DashboardProduct[];

  recentNews: DashboardNews[];

  contentHealth: {
    missingImages: number;
    missingPrices: number;
    missingSpecifications: number;
    draftArticles: number;
  };
}

export async function getAdminDashboard(): Promise<
  ApiResponse<AdminDashboard>
> {
  return apiFetch<ApiResponse<AdminDashboard>>(
    "/admin/dashboard",
  );
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export async function changeAdminPassword(
  input: ChangePasswordInput,
) {
  return apiFetch<{
    success: boolean;
    message: string;
  }>("/admin/password", {
    method: "PUT",
    body: JSON.stringify(input),
  });
}
