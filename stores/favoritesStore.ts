import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FavoritesStore {
  productIds: string[];

  addFavorite: (productId: string) => void;
  removeFavorite: (productId: string) => void;
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  clearFavorites: () => void;
}

export const useFavoritesStore =
  create<FavoritesStore>()(
    persist(
      (set, get) => ({
        productIds: [],

        addFavorite: (productId) => {
          if (get().productIds.includes(productId)) {
            return;
          }

          set((state) => ({
            productIds: [
              ...state.productIds,
              productId,
            ],
          }));
        },

        removeFavorite: (productId) => {
          set((state) => ({
            productIds: state.productIds.filter(
              (id) => id !== productId,
            ),
          }));
        },

        toggleFavorite: (productId) => {
          const exists =
            get().productIds.includes(productId);

          if (exists) {
            set((state) => ({
              productIds:
                state.productIds.filter(
                  (id) => id !== productId,
                ),
            }));
          } else {
            set((state) => ({
              productIds: [
                ...state.productIds,
                productId,
              ],
            }));
          }
        },

        isFavorite: (productId) => {
          return get().productIds.includes(productId);
        },

        clearFavorites: () => {
          set({
            productIds: [],
          });
        },
      }),
      {
        name: "smartprix_favorites",
      },
    ),
  );