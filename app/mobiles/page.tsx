"use client";

import { useState } from "react";

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

  const handlePriceChange = (
    min: string,
    max: string,
  ) => {
    setMinPrice(min);
    setMaxPrice(max);
  };

  const handleBrandChange = (brand: string) => {
  setBrands((current) =>
    current.includes(brand)
      ? current.filter((item) => item !== brand)
      : [...current, brand],
  );
};

  return (
    <div className="min-h-screen bg-[#f1f3f6]">
      <div className="mx-auto flex w-full max-w-[1030px] gap-3 px-2 py-3">
        <aside className="hidden w-[275px] shrink-0 lg:block">
          <MobileFilters
  search={search}
  brands={brands}
  minPrice={minPrice}
  maxPrice={maxPrice}
  onSearchChange={setSearch}
  onBrandChange={handleBrandChange}
  onPriceChange={handlePriceChange}
/>
        </aside>

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
/>
        </main>
      </div>
    </div>
  );
}
