"use client";

import { useEffect, useState } from "react";

import MobilePageHeader from "@/components/mobiles/MobilePageHeader";
import PopularBrands from "@/components/mobiles/PopularBrands";
import PriceRanges from "@/components/mobiles/PriceRanges";
import PopularFeatures from "@/components/mobiles/PopularFeatures";
import MobileFilters from "@/components/mobiles/MobileFilters";
import MobileList from "@/components/mobiles/MobileList";

export default function MobilesPage() {
  const [search, setSearch] = useState("");
  const [brands, setBrands] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [displays, setDisplays] = useState<string[]>([]);

  // Brand counts returned by the backend
  const [brandCounts, setBrandCounts] = useState<Record<string, number>>(
    {},
  );

  const [hydrated, setHydrated] = useState(false);

  // ─────────────────────────────────────────────
  // LOAD SAVED FILTERS
  // ─────────────────────────────────────────────

  useEffect(() => {
    const savedSearch = localStorage.getItem("mobiles-filter-search");
    const savedBrands = localStorage.getItem("mobiles-filter-brands");
    const savedMinPrice = localStorage.getItem(
      "mobiles-filter-min-price",
    );
    const savedMaxPrice = localStorage.getItem(
      "mobiles-filter-max-price",
    );
    const savedDisplays = localStorage.getItem(
      "mobiles-filter-displays",
    );

    if (savedSearch !== null) {
      setSearch(savedSearch);
    }

    if (savedBrands !== null) {
      try {
        const parsedBrands = JSON.parse(savedBrands);

        if (Array.isArray(parsedBrands)) {
          setBrands(parsedBrands);
        }
      } catch {
        setBrands([]);
      }
    }

    if (savedMinPrice !== null) {
      setMinPrice(savedMinPrice);
    }

    if (savedMaxPrice !== null) {
      setMaxPrice(savedMaxPrice);
    }

    if (savedDisplays !== null) {
      try {
        const parsedDisplays = JSON.parse(savedDisplays);

        if (Array.isArray(parsedDisplays)) {
          setDisplays(parsedDisplays);
        }
      } catch {
        setDisplays([]);
      }
    }

    setHydrated(true);
  }, []);

  // ─────────────────────────────────────────────
  // SAVE SEARCH
  // ─────────────────────────────────────────────

  useEffect(() => {
    if (!hydrated) return;

    localStorage.setItem(
      "mobiles-filter-search",
      search,
    );
  }, [search, hydrated]);

  // ─────────────────────────────────────────────
  // SAVE BRANDS
  // ─────────────────────────────────────────────

  useEffect(() => {
    if (!hydrated) return;

    localStorage.setItem(
      "mobiles-filter-brands",
      JSON.stringify(brands),
    );
  }, [brands, hydrated]);

  // ─────────────────────────────────────────────
  // SAVE MIN PRICE
  // ─────────────────────────────────────────────

  useEffect(() => {
    if (!hydrated) return;

    localStorage.setItem(
      "mobiles-filter-min-price",
      minPrice,
    );
  }, [minPrice, hydrated]);

  // ─────────────────────────────────────────────
  // SAVE MAX PRICE
  // ─────────────────────────────────────────────

  useEffect(() => {
    if (!hydrated) return;

    localStorage.setItem(
      "mobiles-filter-max-price",
      maxPrice,
    );
  }, [maxPrice, hydrated]);

  // ─────────────────────────────────────────────
  // SAVE DISPLAY FILTERS
  // ─────────────────────────────────────────────

  useEffect(() => {
    if (!hydrated) return;

    localStorage.setItem(
      "mobiles-filter-displays",
      JSON.stringify(displays),
    );
  }, [displays, hydrated]);

  // ─────────────────────────────────────────────
  // PRICE FILTER
  // ─────────────────────────────────────────────

  const handlePriceChange = (
    min: string,
    max: string,
  ) => {
    setMinPrice(min);
    setMaxPrice(max);
  };

  // ─────────────────────────────────────────────
  // BRAND FILTER
  // ─────────────────────────────────────────────

  const handleBrandChange = (brand: string) => {
    setBrands((current) =>
      current.includes(brand)
        ? current.filter((item) => item !== brand)
        : [...current, brand],
    );
  };

  // ─────────────────────────────────────────────
  // DISPLAY FILTER
  // ─────────────────────────────────────────────

  const handleDisplayChange = (display: string) => {
    setDisplays((current) =>
      current.includes(display)
        ? current.filter((item) => item !== display)
        : [...current, display],
    );
  };

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#f1f3f6]">
      <div className="mx-auto flex w-full max-w-[1030px] gap-3 px-2 py-3">
        {/* LEFT FILTER SIDEBAR */}

        <aside className="hidden w-[275px] shrink-0 lg:block">
          <MobileFilters
            search={search}
            brands={brands}
            minPrice={minPrice}
            maxPrice={maxPrice}
            displays={displays}
            brandCounts={brandCounts}
            onSearchChange={setSearch}
            onBrandChange={handleBrandChange}
            onDisplayChange={handleDisplayChange}
            onPriceChange={handlePriceChange}
          />
        </aside>

        {/* MAIN CONTENT */}

        <main className="min-w-0 flex-1 space-y-3">
          <MobilePageHeader />

          <PopularBrands
            selectedBrands={brands}
            onBrandChange={handleBrandChange}
          />

          <PriceRanges
            minPrice={minPrice}
            maxPrice={maxPrice}
            onPriceChange={handlePriceChange}
          />

          <PopularFeatures />

          <MobileList
            search={search}
            brands={brands}
            minPrice={minPrice}
            maxPrice={maxPrice}
            displays={displays}
            onBrandCountsChange={setBrandCounts}
          />
        </main>
      </div>
    </div>
  );
}