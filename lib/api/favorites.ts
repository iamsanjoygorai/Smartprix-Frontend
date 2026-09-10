import { apiFetch } from "./client";

/* =========================================================
   TYPES
========================================================= */

export interface FavoriteImage {
  id: string;
  url: string;
  altText?: string | null;
  sortOrder?: number;
  isPrimary?: boolean;
}

export interface FavoriteBrand {
  id: string;
  name: string;
  slug: string;
}

export interface FavoriteCategory {
  id: string;
  name: string;
  slug: string;
}

export interface FavoriteSeller {
  id: string;
  name: string;
  slug?: string;
}

export interface FavoritePrice {
  id: string;
  amount: number | string;
  currency?: string;
  productUrl?: string | null;
  inStock?: boolean;
  seller?: FavoriteSeller | null;
}

export interface FavoriteProduct {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  shortDescription?: string | null;

  brand?: FavoriteBrand | null;
  category?: FavoriteCategory | null;

  images?: FavoriteImage[];
  prices?: FavoritePrice[];
}

export interface Favorite {
  id: string;
  userId: string;
  productId: string;
  createdAt: string;
  product: FavoriteProduct;
}

/* =========================================================
   GET FAVORITES
========================================================= */

export async function getFavorites() {
  return apiFetch<{
    success: boolean;
    message?: string;
    data?: Favorite[];
  }>("/favorites", {
    method: "GET",
  });
}

/* =========================================================
   ADD FAVORITE
========================================================= */

export async function addFavorite(
  productId: string,
) {
  return apiFetch<{
    success: boolean;
    message?: string;
    data?: Favorite;
  }>(`/favorites/${productId}`, {
    method: "POST",
  });
}

/* =========================================================
   REMOVE FAVORITE
========================================================= */

export async function removeFavorite(
  productId: string,
) {
  return apiFetch<{
    success: boolean;
    message?: string;
  }>(`/favorites/${productId}`, {
    method: "DELETE",
  });
}

/* =========================================================
   CHECK FAVORITE
========================================================= */

export async function checkFavorite(
  productId: string,
) {
  return apiFetch<{
    success: boolean;
    message?: string;
    data?: {
      isFavorite: boolean;
    };
  }>(`/favorites/${productId}`, {
    method: "GET",
  });
}