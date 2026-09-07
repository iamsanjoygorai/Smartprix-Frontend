"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";

interface MobileFiltersProps {
  search: string;
  brands: string[];
  minPrice: string;
  maxPrice: string;
  displays: string[];
  brandCounts: Record<string, number>;
  onSearchChange: (value: string) => void;
  onBrandChange: (value: string) => void;
  onDisplayChange: (value: string) => void;
  onPriceChange: (min: string, max: string) => void;
}

const brands: [string, string][] = [
  ["Vivo", "vivo"],
  ["Samsung", "samsung"],
  ["Motorola", "motorola"],
  ["Realme", "realme"],
  ["OPPO", "oppo"],
  ["Poco", "poco"],
  ["Xiaomi", "xiaomi"],
  ["OnePlus", "oneplus"],
  ["Apple", "apple"],
];

const displayOptions: [string, string][] = [
  ["No Notch", "no-notch"],
  ["No Touch", "no-touch"],
  ["Notch", "notch"],
  ["Touch Screen", "touch-screen"],
  ["AMOLED", "amoled"],
  ["IPS LCD", "ips-lcd"],
  ["Super AMOLED", "super-amoled"],
  ["Dual Display", "dual-display"],
  ["Foldable Display", "foldable-display"],
  ["Curved Display", "curved-display"],
];

const stores = [
  "Amazon",
  "Flipkart",
  "Croma",
  "Reliance Digital",
];

export default function MobileFilters({
  search,
  brands: selectedBrands,
  minPrice,
  maxPrice,
  displays,
  brandCounts,
  onSearchChange,
  onBrandChange,
  onDisplayChange,
  onPriceChange,
}: MobileFiltersProps) {
  const [brandSearch, setBrandSearch] = useState("");
  const [showAllAppliedFilters, setShowAllAppliedFilters] =
  useState(false);

  // ─────────────────────────────────────────────
  // FILTER + SORT BRANDS
  // ─────────────────────────────────────────────

  const filteredBrands = useMemo(() => {
    const query = brandSearch.trim().toLowerCase();

    const matchingBrands = query
      ? brands.filter(([brandName]) =>
          brandName.toLowerCase().includes(query),
        )
      : brands;

    return [...matchingBrands].sort(
      ([brandNameA, slugA], [brandNameB, slugB]) => {
        const selectedA = selectedBrands.includes(slugA);
        const selectedB = selectedBrands.includes(slugB);

        if (selectedA !== selectedB) {
          return selectedA ? -1 : 1;
        }

        const countA = brandCounts[slugA] ?? 0;
        const countB = brandCounts[slugB] ?? 0;

        if (countA !== countB) {
          return countB - countA;
        }

        return brandNameA.localeCompare(brandNameB);
      },
    );
  }, [brandSearch, selectedBrands, brandCounts]);

  // ─────────────────────────────────────────────
  // DISPLAY NAME
  // ─────────────────────────────────────────────

  const getDisplayName = (slug: string) => {
    return (
      displayOptions.find(([, optionSlug]) => optionSlug === slug)?.[0] ??
      slug
    );
  };

  // ─────────────────────────────────────────────
  // HAS APPLIED FILTERS
  // ─────────────────────────────────────────────

  const hasAppliedFilters =
    Boolean(search) ||
    selectedBrands.length > 0 ||
    Boolean(minPrice) ||
    Boolean(maxPrice) ||
    displays.length > 0;

  // ─────────────────────────────────────────────
  // CLEAR ALL
  // ─────────────────────────────────────────────

  const clearAllFilters = () => {
    onSearchChange("");
    onPriceChange("", "");

    selectedBrands.forEach((brand) => {
      onBrandChange(brand);
    });

    displays.forEach((display) => {
      onDisplayChange(display);
    });
  };

  return (
    <div className="overflow-hidden rounded-sm border border-gray-300 bg-[#e3f6c9]">
      {/* HEADER */}

      <div className="border-b border-gray-300 px-3 py-3">
        <h2 className="text-[17px] font-semibold text-gray-700">
          Filters
        </h2>

        {/* SEARCH FOR FILTERS */}

        <input
          type="text"
          value={search}
          onChange={(event) =>
            onSearchChange(event.target.value)
          }
          placeholder="Search For Filters"
          className="mt-3 w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400"
        />

        {/* APPLIED FILTERS */}

        {/* APPLIED FILTERS */}

<div className="mt-3">
  {!hasAppliedFilters ? (
    <div className="flex min-h-[90px] items-center justify-center text-center text-sm text-gray-600">
      Search for filters or apply some filters from below
    </div>
  ) : (
    <div>
      {/* HEADER */}

      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">
          Applied Filters
        </h3>

        <button
          type="button"
          onClick={clearAllFilters}
          className="text-xs font-medium text-blue-600 hover:underline"
        >
          Clear All
        </button>
      </div>

      {/* SINGLE FILTER GROUP */}

      <div className="overflow-hidden rounded border border-gray-300 bg-white">
        {(() => {
          const appliedFilters: {
            title: string;
            values: string[];
            onRemove: () => void;
          }[] = [];

          // SEARCH

          if (search) {
            appliedFilters.push({
              title: "Search",
              values: [search],
              onRemove: () => onSearchChange(""),
            });
          }

          // BRANDS

          if (selectedBrands.length > 0) {
            appliedFilters.push({
              title: "Brands",
              values: selectedBrands.map((brandSlug) => {
                const brand = brands.find(
                  ([, slug]) => slug === brandSlug,
                );

                return brand?.[0] ?? brandSlug;
              }),
              onRemove: () => {
                selectedBrands.forEach((brand) => {
                  onBrandChange(brand);
                });
              },
            });
          }

          // DISPLAY

          if (displays.length > 0) {
            appliedFilters.push({
              title: "Display",
              values: displays.map(getDisplayName),
              onRemove: () => {
                displays.forEach((display) => {
                  onDisplayChange(display);
                });
              },
            });
          }

          // PRICE

          if (minPrice || maxPrice) {
            appliedFilters.push({
              title: "Price",
              values: [
                `${minPrice ? `₹${minPrice}` : "Any"} – ${
                  maxPrice ? `₹${maxPrice}` : "Any"
                }`,
              ],
              onRemove: () => onPriceChange("", ""),
            });
          }

          const visibleFilters = showAllAppliedFilters
            ? appliedFilters
            : appliedFilters.slice(0, 2);

          return (
            <>
              {visibleFilters.map((filter) => (
                <div
  key={filter.title}
  className="border-b border-gray-200 px-3 py-2 last:border-b-0"
>
  <div className="flex items-center justify-between">
    <span className="text-xs font-semibold text-gray-700">
      {filter.title}
    </span>

    <button
      type="button"
      onClick={filter.onRemove}
      aria-label={`Clear ${filter.title}`}
      className="flex h-5 w-5 items-center justify-center rounded-full text-base leading-none text-gray-400 hover:bg-gray-100 hover:text-red-500"
    >
      ×
    </button>
  </div>

  <div className="mt-1 text-xs leading-5 text-gray-600">
    {filter.values.join(" • ")}
  </div>
</div>            
 ))}

              {/* SHOW MORE / SHOW LESS */}

              {appliedFilters.length > 2 && (
                <button
                  type="button"
                  onClick={() =>
                    setShowAllAppliedFilters(
                      (current) => !current,
                    )
                  }
                  className="w-full border-t border-gray-200 px-3 py-2 text-xs font-medium text-blue-600 hover:bg-gray-50 hover:underline"
                >
                  {showAllAppliedFilters
                    ? "Show Less"
                    : `Show More (${appliedFilters.length - 2})`}
                </button>
              )}
            </>
          );
        })()}
      </div>
    </div>
  )}
</div>
      </div>

      {/* PRICE */}

      <FilterSection title="Price">
        <div className="flex items-center gap-2">
          <select
            value={minPrice}
            onChange={(event) =>
              onPriceChange(
                event.target.value,
                maxPrice,
              )
            }
            className="w-full rounded border border-gray-300 bg-white px-2 py-2 text-sm outline-none focus:border-blue-400"
          >
            <option value="">Min</option>
            <option value="5000">₹5,000</option>
            <option value="10000">₹10,000</option>
            <option value="15000">₹15,000</option>
            <option value="20000">₹20,000</option>
            <option value="30000">₹30,000</option>
            <option value="50000">₹50,000</option>
            <option value="75000">₹75,000</option>
            <option value="100000">₹1,00,000</option>
          </select>

          <span className="shrink-0 text-sm text-gray-600">
            to
          </span>

          <select
            value={maxPrice}
            onChange={(event) =>
              onPriceChange(
                minPrice,
                event.target.value,
              )
            }
            className="w-full rounded border border-gray-300 bg-white px-2 py-2 text-sm outline-none focus:border-blue-400"
          >
            <option value="">Max</option>
            <option value="5000">₹5,000</option>
            <option value="10000">₹10,000</option>
            <option value="15000">₹15,000</option>
            <option value="20000">₹20,000</option>
            <option value="30000">₹30,000</option>
            <option value="50000">₹50,000</option>
            <option value="75000">₹75,000</option>
            <option value="100000">₹1,00,000</option>
            <option value="150000">₹1,50,000</option>
          </select>
        </div>
      </FilterSection>

      {/* BRANDS */}

      <FilterSection title="Brands">
        <input
          type="text"
          value={brandSearch}
          onChange={(event) =>
            setBrandSearch(event.target.value)
          }
          placeholder="Search Brands"
          className="mb-2 w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400"
        />

        <div className="space-y-2">
          {filteredBrands.map(
            ([brandName, brandSlug]) => {
              const isSelected =
                selectedBrands.includes(brandSlug);

              const count =
                brandCounts[brandSlug] ?? 0;

              return (
                <label
                  key={brandSlug}
                  className="flex cursor-pointer items-center justify-between text-sm"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() =>
                        onBrandChange(brandSlug)
                      }
                      className="h-4 w-4 shrink-0 cursor-pointer"
                    />

                    <span
                      className={
                        isSelected
                          ? "font-semibold text-blue-600"
                          : "text-gray-700"
                      }
                    >
                      {brandName}
                    </span>
                  </span>

                  <span className="ml-2 shrink-0 text-xs text-gray-500">
                    {count}
                  </span>
                </label>
              );
            },
          )}
        </div>

        {selectedBrands.length > 0 && (
          <button
            type="button"
            onClick={() => {
              selectedBrands.forEach((brand) =>
                onBrandChange(brand),
              );
            }}
            className="mt-3 text-xs font-medium text-blue-600 hover:underline"
          >
            Clear selected brands
          </button>
        )}
      </FilterSection>

      {/* DISPLAY */}

      <FilterSection title="Display">
        <div className="space-y-2">
          {displayOptions.map(
            ([displayName, displaySlug]) => {
              const isSelected =
                displays.includes(displaySlug);

              return (
                <label
                  key={displaySlug}
                  className="flex cursor-pointer items-center justify-between text-sm"
                >
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() =>
                        onDisplayChange(displaySlug)
                      }
                      className="h-4 w-4 cursor-pointer"
                    />

                    <span
                      className={
                        isSelected
                          ? "font-semibold text-blue-600"
                          : "text-gray-700"
                      }
                    >
                      {displayName}
                    </span>
                  </span>
                </label>
              );
            },
          )}
        </div>

        {displays.length > 0 && (
          <button
            type="button"
            onClick={() => {
              displays.forEach((display) =>
                onDisplayChange(display),
              );
            }}
            className="mt-3 text-xs font-medium text-blue-600 hover:underline"
          >
            Clear display
          </button>
        )}
      </FilterSection>

      {/* STORES */}

      <FilterSection title="Stores">
        <div className="space-y-2">
          {stores.map((store) => (
            <label
              key={store}
              className="flex items-center justify-between text-sm"
            >
              <span className="flex items-center gap-2">
                <input
                  type="checkbox"
                  disabled
                  className="h-4 w-4"
                />

                <span className="text-gray-400">
                  {store}
                </span>
              </span>
            </label>
          ))}
        </div>

        <p className="mt-2 text-[11px] leading-4 text-gray-500">
          Store filtering will be connected to the
          public API next.
        </p>
      </FilterSection>
    </div>
  );
}

// ─────────────────────────────────────────────
// FILTER SECTION
// ─────────────────────────────────────────────

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <section className="border-t border-gray-300">
      <button
        type="button"
        onClick={() =>
          setIsOpen((open) => !open)
        }
        className="flex w-full items-center justify-between bg-[#d4edb5] px-3 py-2 text-left transition-colors hover:bg-[#c9e6a8]"
        aria-expanded={isOpen}
      >
        <h3 className="text-sm font-semibold text-gray-700">
          {title}
        </h3>

        <span
          className={`text-xs text-gray-500 transition-transform duration-200 ${
            isOpen ? "rotate-0" : "rotate-180"
          }`}
        >
          ▲
        </span>
      </button>

      <div
        className={`grid transition-all duration-200 ease-in-out ${
          isOpen
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="p-3">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// APPLIED FILTER
// ─────────────────────────────────────────────

function AppliedFilter({
  title,
  values,
  onRemove,
}: {
  title: string;
  values: string[];
  onRemove: () => void;
}) {
  return (
    <div className="relative rounded border border-gray-300 bg-white px-3 py-2.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700">
          {title}
        </span>

        <button
          type="button"
          onClick={onRemove}
          aria-label={`Clear ${title}`}
          className="flex h-5 w-5 items-center justify-center rounded-full text-base leading-none text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-500"
        >
          ×
        </button>
      </div>

      <div className="mt-1 pr-5 text-xs leading-5 text-gray-600">
        {values.join(" • ")}
      </div>
    </div>
  );
}