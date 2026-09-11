import { create } from "zustand";
import { persist } from "zustand/middleware";

const MAX_RECENT_PRODUCTS = 10;

interface RecentlyViewedStore {
  productIds: string[];

  addProduct: (productId: string) => void;
  removeProduct: (productId: string) => void;
  clearProducts: () => void;
}

export const useRecentlyViewedStore =
  create<RecentlyViewedStore>()(
    persist(
      (set) => ({
        productIds: [],

        addProduct: (productId) => {
          set((state) => {
            const filtered =
              state.productIds.filter(
                (id) => id !== productId,
              );

            return {
              productIds: [
                productId,
                ...filtered,
              ].slice(0, MAX_RECENT_PRODUCTS),
            };
          });
        },

        removeProduct: (productId) => {
          set((state) => ({
            productIds:
              state.productIds.filter(
                (id) => id !== productId,
              ),
          }));
        },

        clearProducts: () => {
          set({
            productIds: [],
          });
        },
      }),
      {
        name: "smartprix_recently_viewed",
      },
    ),
  );