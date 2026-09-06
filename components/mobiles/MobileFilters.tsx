"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";

interface MobileFiltersProps {
  search: string;
  brands: string[];
  minPrice: string;
  maxPrice: string;
  onSearchChange: (value: string) => void;
  onBrandChange: (value: string) => void;
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
  onSearchChange,
  onBrandChange,
  onPriceChange,
}: MobileFiltersProps) {
  const [brandSearch, setBrandSearch] = useState("");

  const filteredBrands = useMemo(() => {
    const query = brandSearch.trim().toLowerCase();

    if (!query) {
      return brands;
    }

    return brands.filter(([brandName]) =>
      brandName.toLowerCase().includes(query),
    );
  }, [brandSearch]);

  return (
    <div className="overflow-hidden rounded-sm border border-gray-300 bg-[#e3f6c9]">
      {/* HEADER */}
      <div className="border-b border-gray-300 px-3 py-3">
        <h2 className="text-[17px] font-semibold text-gray-700">
          Filters
        </h2>

        <input
          type="text"
          value={search}
          onChange={(event) =>
            onSearchChange(event.target.value)
          }
          placeholder="Search For Filters"
          className="mt-3 w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400"
        />
      </div>

      {/* SEARCH MESSAGE */}
      <div className="flex min-h-[180px] items-center justify-center px-5 text-center text-sm text-gray-600">
        Search for filters or apply some filters from below
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

              return (
                <label
                  key={brandSlug}
                  className="flex cursor-pointer items-center justify-between text-sm"
                >
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() =>
                        onBrandChange(brandSlug)
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
                      {brandName}
                    </span>
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

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-gray-300">
      <div className="flex items-center justify-between bg-[#d4edb5] px-3 py-2">
        <h3 className="text-sm font-semibold text-gray-700">
          {title}
        </h3>

        <span className="text-xs text-gray-500">
          ▲
        </span>
      </div>

      <div className="p-3">
        {children}
      </div>
    </section>
  );
}
