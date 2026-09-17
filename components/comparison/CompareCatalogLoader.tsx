"use client";

import { useEffect } from "react";

import { getProducts } from "@/lib/api/products";
import { mapProductsToCompareProducts } from "./compare.mapper";
import { useCompare } from "./CompareProvider";

export default function CompareCatalogLoader() {
  const { setAvailableProducts } = useCompare();

  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      try {
        const response = await getProducts();

        if (cancelled) {
          return;
        }

        const products = Array.isArray(response?.data?.products)
          ? response.data.products
          : [];

        const compareProducts =
          mapProductsToCompareProducts(products);

        setAvailableProducts(compareProducts);
      } catch {
        // Backend unavailable or network request failed.
        // Keep the comparison catalog empty without
        // producing a runtime/console error.
        if (!cancelled) {
          setAvailableProducts([]);
        }
      }
    };

    void loadProducts();

    return () => {
      cancelled = true;
    };
  }, [setAvailableProducts]);

  return null;
}