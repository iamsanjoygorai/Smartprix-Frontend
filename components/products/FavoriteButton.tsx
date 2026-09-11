"use client";

import { useFavoritesStore } from "@/stores/favoritesStore";

interface FavoriteButtonProps {
  productId: string;
}

export default function FavoriteButton({
  productId,
}: FavoriteButtonProps) {
  const isFavorite = useFavoritesStore((state) =>
    state.isFavorite(productId),
  );

  const toggleFavorite = useFavoritesStore(
    (state) => state.toggleFavorite,
  );

  return (
    <button
      type="button"
      onClick={() => toggleFavorite(productId)}
      aria-label={
        isFavorite
          ? "Remove from favorites"
          : "Add to favorites"
      }
      className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white text-xl transition-all duration-200 hover:scale-105 hover:border-blue-200 hover:bg-blue-50"
    >
      {isFavorite ? "♥" : "♡"}
    </button>
  );
}