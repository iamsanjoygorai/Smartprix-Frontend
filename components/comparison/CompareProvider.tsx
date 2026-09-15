"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { CompareProduct } from "./compare.mapper";

const DEFAULT_MAX_PRODUCTS = 4;

interface CompareContextValue {
  /* Product catalog */
  availableProducts: CompareProduct[];
  setAvailableProducts: (products: CompareProduct[]) => void;

  /* Queue */
  products: CompareProduct[];
  primaryProduct: CompareProduct | null;
  selectedProductIds: string[];

  /* Limits */
  maxProducts: number;
  canAddProduct: boolean;
  canCompare: boolean;

  /* Queue actions */
  addProduct: (product: CompareProduct) => boolean;
  removeProduct: (productId: string) => void;
  clearProducts: () => void;
  setPrimaryProduct: (product: CompareProduct) => void;

  /* Queue sheet */
  isCompareSheetOpen: boolean;
  openCompareSheet: (product?: CompareProduct) => void;
  closeCompareSheet: () => void;

 /* Global product picker — used by CompareBottomSheet */
isProductPickerOpen: boolean;
openProductPicker: () => void;
closeProductPicker: () => void;

/* Compare page product picker — used ONLY by /compare */
isComparePagePickerOpen: boolean;
openComparePagePicker: () => void;
closeComparePagePicker: () => void;

  /* Navigation */
  getCompareUrl: () => string;
  compareNow: () => void;
}

const CompareContext =
  createContext<CompareContextValue | null>(null);

interface CompareProviderProps {
  children: ReactNode;
  maxProducts?: number;
}

export default function CompareProvider({
  children,
  maxProducts = DEFAULT_MAX_PRODUCTS,
}: CompareProviderProps) {
  /* =======================================================
     AVAILABLE PRODUCTS
  ======================================================= */

  const [isComparePagePickerOpen, setIsComparePagePickerOpen] =
  useState(false);

  const [availableProducts, setAvailableProductsState] =
    useState<CompareProduct[]>([]);

  const setAvailableProducts = useCallback(
    (nextProducts: CompareProduct[]) => {
      setAvailableProductsState(
        Array.isArray(nextProducts)
          ? nextProducts
          : [],
      );
    },
    [],
  );

  /* =======================================================
     COMPARISON QUEUE
  ======================================================= */

  const [products, setProducts] = useState<CompareProduct[]>(
    [],
  );

  const [isCompareSheetOpen, setIsCompareSheetOpen] =
    useState(false);

  const [isProductPickerOpen, setIsProductPickerOpen] =
    useState(false);



const closeComparePagePicker = useCallback(() => {
  setIsComparePagePickerOpen(false);
}, []);

  /* =======================================================
     LIMIT
  ======================================================= */

  const productLimit = Math.max(
    2,
    Math.min(maxProducts, DEFAULT_MAX_PRODUCTS),
  );

      const openComparePagePicker = useCallback(() => {
  if (products.length >= productLimit) {
    return;
  }

  setIsComparePagePickerOpen(true);
}, [products.length, productLimit]);

  /* =======================================================
     DERIVED STATE
  ======================================================= */

  const primaryProduct = products[0] ?? null;

  const selectedProductIds = useMemo(
    () => products.map((product) => product.id),
    [products],
  );

  const canAddProduct = products.length < productLimit;

  const canCompare = products.length >= 2;

  /* =======================================================
     ADD PRODUCT
  ======================================================= */

  const addProduct = useCallback(
    (product: CompareProduct): boolean => {
      if (!product?.id) {
        return false;
      }

      if (products.some(
        (currentProduct) =>
          currentProduct.id === product.id,
      )) {
        return false;
      }

      if (products.length >= productLimit) {
        return false;
      }

      setProducts((currentProducts) => {
        if (
          currentProducts.some(
            (currentProduct) =>
              currentProduct.id === product.id,
          )
        ) {
          return currentProducts;
        }

        if (currentProducts.length >= productLimit) {
          return currentProducts;
        }

        return [...currentProducts, product];
      });

      return true;
    },
    [products, productLimit],
  );

  /* =======================================================
     REMOVE PRODUCT
  ======================================================= */

  const removeProduct = useCallback((productId: string) => {
    if (!productId) {
      return;
    }

    setProducts((currentProducts) =>
      currentProducts.filter(
        (product) => product.id !== productId,
      ),
    );
  }, []);

  /* =======================================================
     CLEAR
  ======================================================= */

  const clearProducts = useCallback(() => {
    setProducts([]);
    setIsProductPickerOpen(false);
  }, []);

  /* =======================================================
     SET PRIMARY
  ======================================================= */

  const setPrimaryProduct = useCallback(
    (product: CompareProduct) => {
      if (!product?.id) {
        return;
      }

      setProducts((currentProducts) => {
        const remainingProducts =
          currentProducts.filter(
            (currentProduct) =>
              currentProduct.id !== product.id,
          );

        return [
          product,
          ...remainingProducts,
        ].slice(0, productLimit);
      });
    },
    [productLimit],
  );

  /* =======================================================
     OPEN COMPARISON
  ======================================================= */

  const openCompareSheet = useCallback(
    (product?: CompareProduct) => {
      if (product) {
        setProducts((currentProducts) => {
          const existingProduct =
            currentProducts.find(
              (currentProduct) =>
                currentProduct.id === product.id,
            );

          if (existingProduct) {
            return [
              existingProduct,
              ...currentProducts.filter(
                (currentProduct) =>
                  currentProduct.id !== product.id,
              ),
            ].slice(0, productLimit);
          }

          return [
            product,
            ...currentProducts,
          ].slice(0, productLimit);
        });
      }

      setIsCompareSheetOpen(true);
    },
    [productLimit],
  );

  /* =======================================================
     CLOSE COMPARISON
  ======================================================= */

  const closeCompareSheet = useCallback(() => {
    setIsCompareSheetOpen(false);
    setIsProductPickerOpen(false);
  }, []);

  /* =======================================================
     OPEN PICKER
  ======================================================= */

 /* =======================================================
   OPEN PICKER
======================================================= */

const openProductPicker = useCallback(() => {
  if (products.length >= productLimit) {
    return;
  }

  setIsProductPickerOpen(true);
}, [products.length, productLimit]);

  /* =======================================================
     CLOSE PICKER
  ======================================================= */

  const closeProductPicker = useCallback(() => {
    setIsProductPickerOpen(false);
  }, []);

  /* =======================================================
     COMPARE URL
  ======================================================= */

  const getCompareUrl = useCallback(() => {
    if (products.length === 0) {
      return "/compare";
    }

    const ids = products
      .map((product) => product.id)
      .filter(Boolean);

    if (ids.length === 0) {
      return "/compare";
    }

    const params = new URLSearchParams();

    params.set("products", ids.join(","));

    return `/compare?${params.toString()}`;
  }, [products]);

  /* =======================================================
     COMPARE NOW
  ======================================================= */

  const compareNow = useCallback(() => {
    if (products.length < 2) {
      return;
    }

    const url = getCompareUrl();

    setIsCompareSheetOpen(false);
    setIsProductPickerOpen(false);

    window.location.href = url;
  }, [getCompareUrl, products.length]);

  /* =======================================================
     CONTEXT
  ======================================================= */

const value = useMemo<CompareContextValue>(
  () => ({
    availableProducts,
    setAvailableProducts,

    products,
    primaryProduct,
    selectedProductIds,

    maxProducts: productLimit,
    canAddProduct,
    canCompare,

    addProduct,
    removeProduct,
    clearProducts,
    setPrimaryProduct,

    isCompareSheetOpen,
    openCompareSheet,
    closeCompareSheet,

    // Global picker — used by CompareBottomSheet
    isProductPickerOpen,
    openProductPicker,
    closeProductPicker,

    // Compare page picker — used only by /compare
    isComparePagePickerOpen,
    openComparePagePicker,
    closeComparePagePicker,

    getCompareUrl,
    compareNow,
  }),
  [
    availableProducts,
    setAvailableProducts,

    products,
    primaryProduct,
    selectedProductIds,

    productLimit,
    canAddProduct,
    canCompare,

    addProduct,
    removeProduct,
    clearProducts,
    setPrimaryProduct,

    isCompareSheetOpen,
    openCompareSheet,
    closeCompareSheet,

    isProductPickerOpen,
    openProductPicker,
    closeProductPicker,

    isComparePagePickerOpen,
    openComparePagePicker,
    closeComparePagePicker,

    getCompareUrl,
    compareNow,
  ],
);

  return (
    <CompareContext.Provider value={value}>
      {children}
    </CompareContext.Provider>
  );
}

/* =========================================================
   HOOK
========================================================= */

export function useCompare(): CompareContextValue {
  const context = useContext(CompareContext);

  if (!context) {
    throw new Error(
      "useCompare must be used inside CompareProvider.",
    );
  }

  return context;
}
