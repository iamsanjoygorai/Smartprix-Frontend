import { apiFetch } from "@/lib/api/client";

/* =========================================================
   API RESPONSE
========================================================= */

interface AnalyticsResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/* =========================================================
   TYPES
========================================================= */

export interface AnalyticsOverview {
  users: {
    total: number;
    active: number;
  };
  products: {
    total: number;
    active: number;
  };
  reviews: {
    total: number;
    published: number;
  };
}

export interface AnalyticsUsers {
  total: number;
  active: number;
  disabled: number;
  deleted: number;
}

export interface AnalyticsUserGrowthPoint {
  date: string;
  count: number;
}

export interface AnalyticsUserGrowth {
  range: string;
  total: number;
  series: AnalyticsUserGrowthPoint[];
}

export interface AnalyticsProducts {
  total: number;
  active: number;
  inactive: number;
}

export interface AnalyticsProductGrowthPoint {
  date: string;
  count: number;
}

export interface AnalyticsProductGrowth {
  range: string;
  total: number;
  series: AnalyticsProductGrowthPoint[];
}

export interface AnalyticsTopProduct {
  productId: string;
  productName: string;
  slug: string;
  eventCount: number;
}

export interface AnalyticsTopProducts {
  range: string;
  totalEvents: number;
  products: AnalyticsTopProduct[];
}

export interface AnalyticsSearchTerm {
  query: string;
  count: number;
}

export interface AnalyticsSearches {
  range: string;
  totalSearches: number;
  uniqueSearches: number;
  topSearches: AnalyticsSearchTerm[];
}

export interface AnalyticsEngagementEvent {
  eventType: string;
  count: number;
}

export interface AnalyticsEngagement {
  range: string;
  totalEvents: number;
  uniqueProductsViewed: number;
  events: AnalyticsEngagementEvent[];
}

export interface AnalyticsActivityItem {
  action: string;
  count: number;
}

export interface AnalyticsActivity {
  range: string;
  totalActivities: number;
  activities: AnalyticsActivityItem[];
}

/* =========================================================
   REQUEST HELPER
========================================================= */

async function analyticsRequest<T>(
  endpoint: string,
): Promise<T> {
  const response =
    await apiFetch<AnalyticsResponse<T>>(endpoint);

  if (!response.success) {
    throw new Error(
      response.message ??
        "Failed to fetch analytics data",
    );
  }

  return response.data;
}

/* =========================================================
   OVERVIEW
========================================================= */

export async function getAnalyticsOverview(): Promise<AnalyticsOverview> {
  return analyticsRequest<AnalyticsOverview>(
    "/admin/analytics/overview",
  );
}

/* =========================================================
   USERS
========================================================= */

export async function getAnalyticsUsers(): Promise<AnalyticsUsers> {
  return analyticsRequest<AnalyticsUsers>(
    "/admin/analytics/users",
  );
}

/* =========================================================
   USER GROWTH
========================================================= */

export async function getAnalyticsUserGrowth(
  days = 30,
): Promise<AnalyticsUserGrowth> {
  return analyticsRequest<AnalyticsUserGrowth>(
    `/admin/analytics/users/growth?days=${days}`,
  );
}

/* =========================================================
   PRODUCTS
========================================================= */

export async function getAnalyticsProducts(): Promise<AnalyticsProducts> {
  return analyticsRequest<AnalyticsProducts>(
    "/admin/analytics/products",
  );
}

/* =========================================================
   PRODUCT GROWTH
========================================================= */

export async function getAnalyticsProductGrowth(
  days = 30,
): Promise<AnalyticsProductGrowth> {
  return analyticsRequest<AnalyticsProductGrowth>(
    `/admin/analytics/products/growth?days=${days}`,
  );
}

/* =========================================================
   TOP PRODUCTS
========================================================= */

export async function getAnalyticsTopProducts(
  days = 30,
): Promise<AnalyticsTopProducts> {
  return analyticsRequest<AnalyticsTopProducts>(
    `/admin/analytics/products/top?days=${days}`,
  );
}

/* =========================================================
   SEARCH ANALYTICS
========================================================= */

export async function getAnalyticsSearches(
  days = 30,
): Promise<AnalyticsSearches> {
  return analyticsRequest<AnalyticsSearches>(
    `/admin/analytics/searches?days=${days}`,
  );
}

/* =========================================================
   ENGAGEMENT ANALYTICS
========================================================= */

export async function getAnalyticsEngagement(
  days = 30,
): Promise<AnalyticsEngagement> {
  return analyticsRequest<AnalyticsEngagement>(
    `/admin/analytics/engagement?days=${days}`,
  );
}

/* =========================================================
   ACTIVITY ANALYTICS
========================================================= */

export async function getAnalyticsActivity(
  days = 30,
): Promise<AnalyticsActivity> {
  return analyticsRequest<AnalyticsActivity>(
    `/admin/analytics/activity?days=${days}`,
  );
}