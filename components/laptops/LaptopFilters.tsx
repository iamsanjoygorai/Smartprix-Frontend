"use client";

import { useState } from "react";

interface LaptopFiltersProps {
  search: string;
  brands: string[];
  processors: string[];
  rams: string[];
  storages: string[];
  gpus: string[];
  displays: string[];
  minPrice: string;
  maxPrice: string;

  onSearchChange: (value: string) => void;
  onBrandChange: (brand: string) => void;
  onProcessorChange: (processor: string) => void;
  onRamChange: (ram: string) => void;
  onStorageChange: (storage: string) => void;
  onGpuChange: (gpu: string) => void;
  onDisplayChange: (display: string) => void;
  onPriceChange: (min: string, max: string) => void;

  onClearAll: () => void;
}

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-4 w-4 text-gray-500 transition-transform ${
        open ? "rotate-180" : ""
      }`}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        d="m5 7.5 5 5 5-5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      className="h-4 w-4 text-gray-400"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="11" cy="11" r="7" />
      <path
        d="m20 20-4-4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: FilterSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between px-4 py-4 text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-gray-900">
          {title}
        </span>

        <ChevronIcon open={open} />
      </button>

      {open && (
        <div className="px-4 pb-4">
          {children}
        </div>
      )}
    </div>
  );
}

interface CheckboxItemProps {
  label: string;
  checked: boolean;
  onChange: () => void;
}

function CheckboxItem({
  label,
  checked,
  onChange,
}: CheckboxItemProps) {
  return (
    <label className="flex cursor-pointer items-center gap-3 py-1.5 text-sm text-gray-700 hover:text-gray-900">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />

      <span className="leading-5">
        {label}
      </span>
    </label>
  );
}

export default function LaptopFilters({
  search,
  brands,
  processors,
  rams,
  storages,
  gpus,
  displays,
  minPrice,
  maxPrice,
  onSearchChange,
  onBrandChange,
  onProcessorChange,
  onRamChange,
  onStorageChange,
  onGpuChange,
  onDisplayChange,
  onPriceChange,
  onClearAll,
}: LaptopFiltersProps) {
  const brandOptions = [
    "ASUS",
    "HP",
    "Lenovo",
    "Dell",
    "Acer",
    "MSI",
    "Apple",
    "Samsung",
  ];

  const processorOptions = [
    "Intel Core i3",
    "Intel Core i5",
    "Intel Core i7",
    "Intel Core i9",
    "AMD Ryzen 3",
    "AMD Ryzen 5",
    "AMD Ryzen 7",
    "AMD Ryzen 9",
    "Apple M1",
    "Apple M2",
    "Apple M3",
    "Apple M4",
  ];

  const ramOptions = [
    "4 GB",
    "8 GB",
    "16 GB",
    "32 GB",
    "64 GB",
  ];

  const storageOptions = [
    "256 GB SSD",
    "512 GB SSD",
    "1 TB SSD",
    "2 TB SSD",
  ];

  const gpuOptions = [
    "Integrated",
    "RTX 2050",
    "RTX 3050",
    "RTX 4050",
    "RTX 4060",
    "RTX 4070",
    "RTX 4080",
    "RTX 4090",
  ];

  const displayOptions = [
    '13 - 14"',
    '15 - 15.6"',
    '16"',
    '17" and above',
  ];

  const priceRanges = [
    {
      label: "Under ₹30K",
      min: "",
      max: "30000",
    },
    {
      label: "₹30K – ₹50K",
      min: "30000",
      max: "50000",
    },
    {
      label: "₹50K – ₹75K",
      min: "50000",
      max: "75000",
    },
    {
      label: "₹75K – ₹1L",
      min: "75000",
      max: "100000",
    },
    {
      label: "Above ₹1L",
      min: "100000",
      max: "",
    },
  ];

  return (
    <aside className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
        <h2 className="text-base font-bold text-gray-900">
          Filters
        </h2>

        <button
          type="button"
          onClick={onClearAll}
          className="text-xs font-semibold tracking-wide text-blue-600 hover:text-blue-800"
        >
          CLEAR ALL
        </button>
      </div>

      {/* Search */}
      <div className="border-b border-gray-200 p-4">
        <label
          htmlFor="laptop-filter-search"
          className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500"
        >
          Search
        </label>

        <div className="relative">
          <input
            id="laptop-filter-search"
            type="text"
            value={search}
            onChange={(event) =>
              onSearchChange(event.target.value)
            }
            placeholder="Search laptops..."
            className="h-10 w-full rounded border border-gray-300 bg-white px-3 pr-9 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />

          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
            <SearchIcon />
          </div>
        </div>
      </div>

      {/* Brand */}
      <FilterSection title="Brand">
        <div className="space-y-0.5">
          {brandOptions.map((brand) => {
            const value = brand.toLowerCase();

            return (
              <CheckboxItem
                key={brand}
                label={brand}
                checked={brands.includes(value)}
                onChange={() => onBrandChange(value)}
              />
            );
          })}
        </div>
      </FilterSection>

      {/* Price */}
      <FilterSection title="Price">
        <div className="flex items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">
              ₹
            </span>

            <input
              type="number"
              min="0"
              value={minPrice}
              onChange={(event) =>
                onPriceChange(
                  event.target.value,
                  maxPrice,
                )
              }
              placeholder="Min"
              className="h-9 w-full rounded border border-gray-300 pl-6 pr-2 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <span className="shrink-0 text-gray-400">
            –
          </span>

          <div className="relative min-w-0 flex-1">
            <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">
              ₹
            </span>

            <input
              type="number"
              min="0"
              value={maxPrice}
              onChange={(event) =>
                onPriceChange(
                  minPrice,
                  event.target.value,
                )
              }
              placeholder="Max"
              className="h-9 w-full rounded border border-gray-300 pl-6 pr-2 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {priceRanges.map((range) => {
            const isActive =
              minPrice === range.min &&
              maxPrice === range.max;

            return (
              <button
                key={range.label}
                type="button"
                onClick={() =>
                  onPriceChange(
                    range.min,
                    range.max,
                  )
                }
                className={`rounded border px-2 py-1 text-xs transition ${
                  isActive
                    ? "border-blue-500 bg-blue-50 font-medium text-blue-600"
                    : "border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600"
                }`}
              >
                {range.label}
              </button>
            );
          })}
        </div>
      </FilterSection>

      {/* Processor */}
      <FilterSection title="Processor">
        <div className="space-y-0.5">
          {processorOptions.map((processor) => {
            const value =
              processor.toLowerCase();

            return (
              <CheckboxItem
                key={processor}
                label={processor}
                checked={processors.includes(value)}
                onChange={() =>
                  onProcessorChange(value)
                }
              />
            );
          })}
        </div>
      </FilterSection>

      {/* RAM */}
      <FilterSection title="RAM">
        <div className="space-y-0.5">
          {ramOptions.map((ram) => {
            const value = ram.toLowerCase();

            return (
              <CheckboxItem
                key={ram}
                label={ram}
                checked={rams.includes(value)}
                onChange={() =>
                  onRamChange(value)
                }
              />
            );
          })}
        </div>
      </FilterSection>

      {/* Storage */}
      <FilterSection title="Storage">
        <div className="space-y-0.5">
          {storageOptions.map((storage) => {
            const value =
              storage.toLowerCase();

            return (
              <CheckboxItem
                key={storage}
                label={storage}
                checked={storages.includes(value)}
                onChange={() =>
                  onStorageChange(value)
                }
              />
            );
          })}
        </div>
      </FilterSection>

      {/* Graphics */}
      <FilterSection title="Graphics">
        <div className="space-y-0.5">
          {gpuOptions.map((gpu) => {
            const value = gpu.toLowerCase();

            return (
              <CheckboxItem
                key={gpu}
                label={gpu}
                checked={gpus.includes(value)}
                onChange={() =>
                  onGpuChange(value)
                }
              />
            );
          })}
        </div>
      </FilterSection>

      {/* Display */}
      <FilterSection title="Display">
        <div className="space-y-0.5">
          {displayOptions.map((display) => {
            const value =
              display.toLowerCase();

            return (
              <CheckboxItem
                key={display}
                label={display}
                checked={displays.includes(value)}
                onChange={() =>
                  onDisplayChange(value)
                }
              />
            );
          })}
        </div>
      </FilterSection>
    </aside>
  );
}