"use client";

import { useEffect } from "react";
import { getProducts } from "@/lib/api/products";
import {
  mapProductsToCompareProducts,
} from "./compare.mapper";
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
      } catch (error) {
        console.error(
          "Failed to load comparison product catalog:",
          error,
        );

        if (!cancelled) {
          setAvailableProducts([]);
        }
      }
    };

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, [setAvailableProducts]);

  return null;
}