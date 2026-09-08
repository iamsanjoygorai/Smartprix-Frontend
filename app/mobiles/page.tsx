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

  const [search, setSearch] = useState("");
  const [brands, setBrands] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("30000+");
  const [displays, setDisplays] = useState<string[]>([]);
  const [filterValues, setFilterValues] = useState<
    Record<string, string[]>
  >({});
  const [sortBy, setSortBy] = useState("relevance");

  const [brandCounts, setBrandCounts] = useState<
    Record<string, number>
  >({});

  const [hydrated, setHydrated] = useState(false);

  // ─────────────────────────────────────────────
  // SEARCH → BRAND MATCHING
  // ─────────────────────────────────────────────

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

  // ─────────────────────────────────────────────
  // AUTO SELECT BRAND FROM URL SEARCH
  // ─────────────────────────────────────────────

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

    // Restore saved brands
    if (savedBrands) {
      try {
        setBrands(JSON.parse(savedBrands));
      } catch {
        setBrands([]);
      }
    }

    // Restore minimum price
    if (savedMinPrice !== null) {
      setMinPrice(savedMinPrice);
    }

    // Restore maximum price
    if (savedMaxPrice !== null) {
      setMaxPrice(savedMaxPrice);
    }

    // Restore display filters
    if (savedDisplays) {
      try {
        setDisplays(JSON.parse(savedDisplays));
      } catch {
        setDisplays([]);
      }
    }

    // Restore other filters
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
        ? currentValues.filter((item) => item !== value)
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
  // KEEP SEARCH STATE IN SYNC
  // ─────────────────────────────────────────────

  useEffect(() => {
    setSearch(urlSearch);
  }, [urlSearch]);

  // ─────────────────────────────────────────────
  // FEATURE FILTER
  // ─────────────────────────────────────────────

  const handleFeatureChange = (feature: string) => {
    const featureMap: Record<string, [string, string]> = {
      "5G Mobiles": ["connectivity", "5G"],
      "Android Phones": ["operating-system", "Android"],
      "256GB Storage": ["inbuilt-memory", "256GB"],
      "Foldable Phones": ["types", "Foldable"],
      "Best Camera": ["rear-camera", "50MP"],
      "Upcoming Mobiles": ["availability", "Upcoming"],
      "Latest Mobiles": ["availability", "Latest"],
    };

    const mappedFilter = featureMap[feature];

    if (!mappedFilter) {
      return;
    }

    const [group, value] = mappedFilter;

    handleFilterChange(group, value);
  };

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#f3f5f9]">
      <div className="mx-auto w-full max-w-[1320px] px-2 py-3 sm:px-4 lg:px-5">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[275px_minmax(0,1fr)]">
          {/* ═══════════════════════════════════════
              LEFT FILTER SIDEBAR
          ═══════════════════════════════════════ */}

          <aside className="hidden lg:block">
            <div className="sticky top-4">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_4px_20px_rgba(15,23,42,0.05)]">
                {/* Sidebar heading */}
                <div className="border-b border-slate-100 bg-gradient-to-r from-white via-white to-indigo-50/40 px-5 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-indigo-500">
                        Refine
                      </p>

                      <h2 className="mt-0.5 text-[18px] font-black tracking-tight text-slate-900">
                        Filters
                      </h2>
                    </div>

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <svg
                        width="17"
                        height="17"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M4 5h16" />
                        <path d="M7 12h10" />
                        <path d="M10 19h4" />
                      </svg>
                    </div>
                  </div>

                  {(brands.length > 0 ||
                    minPrice ||
                    displays.length > 0 ||
                    Object.values(filterValues).some(
                      (values) => values.length > 0,
                    )) && (
                    <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold text-indigo-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                      Filters applied
                    </div>
                  )}
                </div>

                {/* Filters */}
                <div className="p-2">
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
                </div>
              </div>
            </div>
          </aside>

          {/* ═══════════════════════════════════════
              MAIN CONTENT
          ═══════════════════════════════════════ */}

          <main className="min-w-0 space-y-4">
            {/* Page Header */}
            <MobilePageHeader />

            {/* Popular Brands */}
            <PopularBrands
              selectedBrands={brands}
  onBrandChange={handleBrandChange}

            />

            {/* Price Ranges */}
            <PriceRanges
              minPrice={minPrice}
              maxPrice={maxPrice}
              onPriceChange={handlePriceChange}
            />

            {/* Popular Features */}
            <PopularFeatures
              onFeatureChange={handleFeatureChange}
            />

            {/* Product List */}
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
    </div>
  );
}