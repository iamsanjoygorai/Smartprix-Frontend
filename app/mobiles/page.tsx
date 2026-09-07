"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import MobilePageHeader from "@/components/mobiles/MobilePageHeader";
import PopularBrands from "@/components/mobiles/PopularBrands";
import PriceRanges from "@/components/mobiles/PriceRanges";
import PopularFeatures from "@/components/mobiles/PopularFeatures";
import MobileFilters from "@/components/mobiles/MobileFilters";
import MobileList from "@/components/mobiles/MobileList";

export default function MobilesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Search comes from the URL
  const urlSearch = searchParams.get("search") ?? "";

  // ─────────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────────

  // Single shared search value for Header + Filter Search
  const [search, setSearch] = useState("");

  const [brands, setBrands] = useState<string[]>([]);

  const [minPrice, setMinPrice] = useState("");

  const [maxPrice, setMaxPrice] = useState("30000+");

  const [displays, setDisplays] = useState<string[]>([]);

  const [filterValues, setFilterValues] = useState<
    Record<string, string[]>
  >({});

  const [sortBy, setSortBy] = useState("relevance");

  // Brand counts returned by backend
  const [brandCounts, setBrandCounts] = useState<
    Record<string, number>
  >({});

  const [hydrated, setHydrated] = useState(false);

  const searchBrandMap: [string, string][] = [
  ["vivo", "vivo"],
  ["samsung", "samsung"],
  ["motorola", "motorola"],
  ["realme", "realme"],
  ["oppo", "oppo"],
  ["poco", "poco"],
  ["xiaomi", "xiaomi"],
  ["oneplus", "oneplus"],
  ["apple", "apple"],
  ["nothing", "nothing"],
  ["boltt", "boltt"],
];


useEffect(() => {
  const query = urlSearch.trim().toLowerCase();

  if (!query) {
    return;
  }

  const matchedBrand = searchBrandMap.find(
    ([brandName]) =>
      query === brandName ||
      query.includes(brandName),
  );

  if (!matchedBrand) {
    return;
  }

  const [, brandSlug] = matchedBrand;

  setBrands((current) => {
    if (current.includes(brandSlug)) {
      return current;
    }

    return [...current, brandSlug];
  });
}, [urlSearch]);


  // ─────────────────────────────────────────────
  // LOAD URL SEARCH + SAVED FILTERS
  // ─────────────────────────────────────────────

  useEffect(() => {
    const savedBrands = localStorage.getItem(
      "mobiles-filter-brands",
    );

    const savedMinPrice = localStorage.getItem(
      "mobiles-filter-min-price",
    );

    const savedMaxPrice = localStorage.getItem(
      "mobiles-filter-max-price",
    );

    const savedDisplays = localStorage.getItem(
      "mobiles-filter-displays",
    );

    const savedFilterValues = localStorage.getItem(
      "mobiles-filter-values",
    );

    // URL is the source of truth for search
    setSearch(urlSearch);

    // Restore saved filters
    if (savedBrands) {
      try {
        setBrands(JSON.parse(savedBrands));
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

    if (savedDisplays) {
      try {
        setDisplays(JSON.parse(savedDisplays));
      } catch {
        setDisplays([]);
      }
    }

    if (savedFilterValues) {
      try {
        setFilterValues(JSON.parse(savedFilterValues));
      } catch {
        setFilterValues({});
      }
    }

    setHydrated(true);
  }, [urlSearch]);

  // ─────────────────────────────────────────────
  // SAVE BRANDS
  // ─────────────────────────────────────────────

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    localStorage.setItem(
      "mobiles-filter-brands",
      JSON.stringify(brands),
    );
  }, [brands, hydrated]);

  // ─────────────────────────────────────────────
  // SAVE MIN PRICE
  // ─────────────────────────────────────────────

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    localStorage.setItem(
      "mobiles-filter-min-price",
      minPrice,
    );
  }, [minPrice, hydrated]);

  // ─────────────────────────────────────────────
  // SAVE MAX PRICE
  // ─────────────────────────────────────────────

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    localStorage.setItem(
      "mobiles-filter-max-price",
      maxPrice,
    );
  }, [maxPrice, hydrated]);

  // ─────────────────────────────────────────────
  // SAVE DISPLAY FILTERS
  // ─────────────────────────────────────────────

  useEffect(() => {
    if (!hydrated) {
      return;
    }

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
  // OTHER FILTERS
  // ─────────────────────────────────────────────

  const handleFilterChange = (
    group: string,
    value: string,
  ) => {
    setFilterValues((current) => {
      const currentValues = current[group] ?? [];

      const nextValues = currentValues.includes(value)
        ? currentValues.filter(
            (item) => item !== value,
          )
        : [...currentValues, value];

      return {
        ...current,
        [group]: nextValues,
      };
    });
  };

  // ─────────────────────────────────────────────
  // SEARCH FROM MOBILE FILTERS
  // ─────────────────────────────────────────────

  const handleSearchChange = (value: string) => {
    const trimmedValue = value.trim();

    const params = new URLSearchParams(
      searchParams.toString(),
    );

    if (trimmedValue) {
      params.set("search", trimmedValue);
    } else {
      params.delete("search");
    }

    const queryString = params.toString();

    router.replace(
      queryString
        ? `/mobiles?${queryString}`
        : "/mobiles",
      {
        scroll: false,
      },
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
              filterValues={filterValues}
              brandCounts={brandCounts}
              onSearchChange={handleSearchChange}
              onBrandChange={handleBrandChange}
              onDisplayChange={handleDisplayChange}
              onPriceChange={handlePriceChange}
              onFilterChange={handleFilterChange}
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
            filterValues={filterValues}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onBrandCountsChange={setBrandCounts}
          />
        </main>
      </div>
    </div>
  );
}