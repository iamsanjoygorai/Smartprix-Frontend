import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CompareStore {
  productIds: string[];

  addProduct: (productId: string) => void;
  removeProduct: (productId: string) => void;
  clearProducts: () => void;
  hasProduct: (productId: string) => boolean;
}

export const useCompareStore = create<CompareStore>()(
  persist(
    (set, get) => ({
      productIds: [],

      addProduct: (productId) => {
        const current = get().productIds;

        if (current.includes(productId)) {
          return;
        }

        set({
          productIds: [...current, productId],
        });
      },

      removeProduct: (productId) => {
        set((state) => ({
          productIds: state.productIds.filter(
            (id) => id !== productId,
          ),
        }));
      },

      clearProducts: () => {
        set({
          productIds: [],
        });
      },

      hasProduct: (productId) => {
        return get().productIds.includes(productId);
      },
    }),
    {
      name: "smartprix_compare",
    },
  ),
);