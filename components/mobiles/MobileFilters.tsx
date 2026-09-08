"use client";

import {
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface MobileFiltersProps {
  search: string;
  brands: string[];
  minPrice: string;
  maxPrice: string;
  displays: string[];
  filterValues: Record<string, string[]>;
  brandCounts: Record<string, number>;

  onSearchChange: (value: string) => void;
  onBrandChange: (value: string) => void;
  onDisplayChange: (value: string) => void;
  onPriceChange: (min: string, max: string) => void;
  onFilterChange: (group: string, value: string) => void;
}

const brands = [
  "vivo",
  "samsung",
  "motorola",
  "realme",
  "oppo",
  "poco",
  "xiaomi",
  "oneplus",
  "apple",
  "nothing",
  "boltt",
];

const displayOptions = [
  "AMOLED",
  "OLED",
  "LCD",
  "IPS LCD",
  "P-OLED",
  "LTPO AMOLED",
];

const stores = [
  "Amazon",
  "Flipkart",
  "Croma",
  "Reliance Digital",
];

const minPriceOptions = [
  { label: "Any Price", value: "" },
  { label: "₹5,000", value: "5000" },
  { label: "₹10,000", value: "10000" },
  { label: "₹15,000", value: "15000" },
  { label: "₹20,000", value: "20000" },
  { label: "₹30,000", value: "30000" },
  { label: "₹40,000", value: "40000" },
  { label: "₹50,000", value: "50000" },
  { label: "₹75,000", value: "75000" },
  { label: "₹1,00,000", value: "100000" },
];

const maxPriceOptions = [
  { label: "₹10,000", value: "10000" },
  { label: "₹15,000", value: "15000" },
  { label: "₹20,000", value: "20000" },
  { label: "₹30,000", value: "30000" },
  { label: "₹40,000", value: "40000" },
  { label: "₹50,000", value: "50000" },
  { label: "₹75,000", value: "75000" },
  { label: "₹1,00,000", value: "100000" },
  { label: "₹1,50,000", value: "150000" },
  { label: "₹2,00,000", value: "200000" },
  { label: "₹3,00,000+", value: "30000+" },
];


const filterGroups = [
  {
    key: "availability",
    title: "Availability",
    icon: "◉",
    options: [
      "In Stock",
      "Out of Stock",
    ],
  },
  {
    key: "types",
    title: "Phone Type",
    icon: "▣",
    options: [
      "Smartphones",
      "Foldable Phones",
      "Gaming Phones",
      "Rugged Phones",
    ],
  },
  {
    key: "launched-within",
    title: "Launched Within",
    icon: "◷",
    options: [
      "Last 1 Month",
      "Last 3 Months",
      "Last 6 Months",
      "Last 1 Year",
    ],
  },
  {
    key: "design",
    title: "Design",
    icon: "◇",
    options: [
      "Water Drop Notch",
      "Punch Hole",
      "Bezel-less",
      "Curved Display",
      "Flat Display",
    ],
  },
  {
    key: "screen-sizes",
    title: "Screen Size",
    icon: "▤",
    options: [
      "Below 6 inch",
      "6 - 6.4 inch",
      "6.4 - 6.7 inch",
      "Above 6.7 inch",
    ],
  },
  {
    key: "screen-resolution",
    title: "Screen Resolution",
    icon: "▦",
    options: [
      "HD+",
      "Full HD+",
      "1.5K",
      "2K",
      "QHD+",
    ],
  },
  {
    key: "rear-camera",
    title: "Rear Camera",
    icon: "◎",
    options: [
      "12 MP & Below",
      "13 - 32 MP",
      "33 - 49 MP",
      "50 MP",
      "64 MP",
      "108 MP",
      "200 MP",
    ],
  },
  {
    key: "front-camera",
    title: "Front Camera",
    icon: "◉",
    options: [
      "8 MP & Below",
      "12 MP",
      "16 MP",
      "32 MP",
      "50 MP",
    ],
  },
  {
    key: "cpu",
    title: "Processor",
    icon: "▥",
    options: [
      "Snapdragon",
      "MediaTek",
      "Exynos",
      "Apple",
      "Tensor",
      "Unisoc",
    ],
  },
  {
    key: "ram",
    title: "RAM",
    icon: "▤",
    options: [
      "2 GB",
      "3 GB",
      "4 GB",
      "6 GB",
      "8 GB",
      "12 GB",
      "16 GB",
      "24 GB",
    ],
  },
  {
    key: "battery-size",
    title: "Battery Size",
    icon: "▰",
    options: [
      "Below 4000 mAh",
      "4000 - 4500 mAh",
      "4500 - 5000 mAh",
      "5000 - 6000 mAh",
      "6000 mAh & Above",
    ],
  },
  {
    key: "connectivity",
    title: "Connectivity",
    icon: "⌁",
    options: [
      "5G",
      "4G",
      "VoLTE",
      "Wi-Fi 6",
      "Wi-Fi 7",
      "NFC",
    ],
  },
  {
    key: "features",
    title: "Features",
    icon: "✦",
    options: [
      "Fast Charging",
      "Wireless Charging",
      "Water Resistant",
      "Stereo Speakers",
      "IR Blaster",
      "FM Radio",
    ],
  },
  {
    key: "operating-system",
    title: "Operating System",
    icon: "▣",
    options: [
      "Android",
      "iOS",
    ],
  },
  {
    key: "android-version",
    title: "Android Version",
    icon: "◈",
    options: [
      "Android 13",
      "Android 14",
      "Android 15",
      "Android 16",
    ],
  },
  {
    key: "inbuilt-memory",
    title: "Inbuilt Memory",
    icon: "▤",
    options: [
      "32 GB",
      "64 GB",
      "128 GB",
      "256 GB",
      "512 GB",
      "1 TB",
    ],
  },
  {
    key: "price-drop",
    title: "Price Drop",
    icon: "↘",
    options: [
      "Price Dropped Recently",
      "Biggest Price Drops",
    ],
  },
  {
    key: "aspect-ratio",
    title: "Aspect Ratio",
    icon: "▥",
    options: [
      "19:9",
      "20:9",
      "20.5:9",
      "21:9",
      "22:9",
    ],
  },
  {
    key: "refresh-rate",
    title: "Refresh Rate",
    icon: "↻",
    options: [
      "60 Hz",
      "90 Hz",
      "120 Hz",
      "144 Hz",
      "165 Hz",
    ],
  },
  {
    key: "cpu-manufacturer",
    title: "CPU Manufacturer",
    icon: "▦",
    options: [
      "Qualcomm",
      "MediaTek",
      "Samsung",
      "Apple",
      "Google",
      "Unisoc",
    ],
  },
  {
    key: "gpu-manufacturer",
    title: "GPU Manufacturer",
    icon: "◫",
    options: [
      "Adreno",
      "Mali",
      "Apple GPU",
      "Immortalis",
      "Xclipse",
    ],
  },
  {
    key: "ip-rating",
    title: "IP Rating",
    icon: "◉",
    options: [
      "IP53",
      "IP54",
      "IP55",
      "IP67",
      "IP68",
      "IP69",
    ],
  },
];

function sortSelectedFirst(
  options: string[],
  selectedOptions: string[],
) {
  return [...options].sort((a, b) => {
    const aIndex = selectedOptions.indexOf(a);
    const bIndex = selectedOptions.indexOf(b);

    // Both selected → preserve selection order
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }

    // Selected comes first
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;

    // Both unselected → keep existing order
    return 0;
  });
}

function getFilterIcon(key: string) {
  const group = filterGroups.find(
    (item) => item.key === key,
  );

  return group?.icon ?? "•";
}

function getFilterAccent(key: string) {
  const accents: Record<string, string> = {
    availability: "emerald",
    types: "indigo",
    "launched-within": "violet",
    design: "pink",
    "screen-sizes": "sky",
    "screen-resolution": "blue",
    "rear-camera": "amber",
    "front-camera": "orange",
    cpu: "purple",
    ram: "cyan",
    "battery-size": "rose",
    connectivity: "teal",
    features: "yellow",
    "operating-system": "slate",
    "android-version": "green",
    "inbuilt-memory": "indigo",
    "price-drop": "emerald",
    "aspect-ratio": "fuchsia",
    "refresh-rate": "blue",
    "cpu-manufacturer": "violet",
    "gpu-manufacturer": "pink",
    "ip-rating": "cyan",
  };

  return accents[key] ?? "indigo";
}

function FilterSection({
  title,
  icon,
  accent = "indigo",
  badge,
  children,
}: {
  title: string;
  icon: string;
  accent?: string;
  badge?: number;
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(true);

  const accentClasses: Record<string, string> = {
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    violet: "bg-violet-50 text-violet-600",
    pink: "bg-pink-50 text-pink-600",
    sky: "bg-sky-50 text-sky-600",
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    orange: "bg-orange-50 text-orange-600",
    purple: "bg-purple-50 text-purple-600",
    cyan: "bg-cyan-50 text-cyan-600",
    rose: "bg-rose-50 text-rose-600",
    teal: "bg-teal-50 text-teal-600",
    yellow: "bg-yellow-50 text-yellow-600",
    slate: "bg-slate-100 text-slate-600",
    green: "bg-green-50 text-green-600",
    fuchsia: "bg-fuchsia-50 text-fuchsia-600",
  };

  return (
    <section className="border-b border-slate-100 last:border-b-0">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-slate-50"
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black ${
              accentClasses[accent] ??
              accentClasses.indigo
            }`}
          >
            {icon}
          </span>

          <span className="truncate text-[13px] font-extrabold text-slate-800">
            {title}
          </span>

          {typeof badge === "number" && badge > 0 && (
            <span className="rounded-full bg-indigo-100 px-1.5 py-0.5 text-[10px] font-black text-indigo-600">
              {badge}
            </span>
          )}
        </div>

        <span
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs text-slate-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          ↓
        </span>
      </button>

      {isOpen && (
        <div className="px-4 pb-4">
          {children}
        </div>
      )}
    </section>
  );
}

function Checkbox({
  checked,
}: {
  checked: boolean;
}) {
  return (
    <span
      className={`flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-[5px] border transition-all ${
        checked
          ? "border-indigo-600 bg-indigo-600 text-white shadow-sm shadow-indigo-100"
          : "border-slate-300 bg-white"
      }`}
    >
      {checked && (
        <svg
          viewBox="0 0 20 20"
          fill="none"
          className="h-3 w-3"
        >
          <path
            d="M5 10.5L8.5 14L15.5 6.5"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </span>
  );
}

function FilterOption({
  label,
  checked,
  onClick,
  count,
}: {
  label: string;
  checked: boolean;
  onClick: () => void;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex w-full items-center justify-between gap-2 rounded-lg px-2 py-2 text-left transition-colors ${
        checked
          ? "bg-indigo-50/80"
          : "hover:bg-slate-50"
      }`}
    >
      <span className="flex min-w-0 items-center gap-2.5">
        <Checkbox checked={checked} />

        <span
          className={`truncate text-[12px] ${
            checked
              ? "font-bold text-indigo-700"
              : "font-medium text-slate-600 group-hover:text-slate-900"
          }`}
        >
          {label}
        </span>
      </span>

      {typeof count === "number" && (
        <span className="shrink-0 text-[10px] font-semibold text-slate-400">
          {count}
        </span>
      )}
    </button>
  );
}

export default function MobileFilters({
  search,
  brands: selectedBrands,
  minPrice,
  maxPrice,
  displays,
  filterValues,
  brandCounts,
  onSearchChange,
  onBrandChange,
  onDisplayChange,
  onPriceChange,
  onFilterChange,
}: MobileFiltersProps) {
  const [brandSearch, setBrandSearch] = useState("");
  const [brandSort, setBrandSort] = useState<
    "popular" | "name"
  >("popular");
  const [showAllBrands, setShowAllBrands] =
    useState(false);
  const [showAllAppliedGroups, setShowAllAppliedGroups] =
  useState(false);

  const filteredBrands = useMemo(() => {
  const query = brandSearch.trim().toLowerCase();

  let result = brands.filter((brand) =>
    brand.toLowerCase().includes(query),
  );

  result = [...result].sort((a, b) => {
    const aIndex = selectedBrands.indexOf(a);
    const bIndex = selectedBrands.indexOf(b);

    // Selected brands first, preserving selection order
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }

    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;

    // Unselected brands
    if (brandSort === "popular") {
      const countA = brandCounts[a] ?? 0;
      const countB = brandCounts[b] ?? 0;

      if (countB !== countA) {
        return countB - countA;
      }
    }

    return a.localeCompare(b);
  });

  return result;
}, [
  brandSearch,
  brandCounts,
  brandSort,
  selectedBrands,
]);

  const visibleBrands = showAllBrands
    ? filteredBrands
    : filteredBrands.slice(0, 7);

 const appliedFilterGroups = useMemo(() => {
  const groups: Record<
    string,
    {
      label: string;
      value: string;
      key: string;
    }[]
  > = {};

  const addToGroup = (
    groupName: string,
    item: {
      label: string;
      value: string;
      key: string;
    },
  ) => {
    if (!groups[groupName]) {
      groups[groupName] = [];
    }

    groups[groupName].push(item);
  };

  if (search) {
    addToGroup("Search", {
      label: "Search",
      value: search,
      key: "search",
    });
  }

  selectedBrands.forEach((brand) => {
    addToGroup("Brand", {
      label: "Brand",
      value:
        brand.charAt(0).toUpperCase() +
        brand.slice(1),
      key: `brand:${brand}`,
    });
  });

  displays.forEach((display) => {
    addToGroup("Display", {
      label: "Display",
      value: display,
      key: `display:${display}`,
    });
  });

  if (minPrice) {
    addToGroup("Price", {
      label: "Minimum",
      value: `₹${Number(
        minPrice,
      ).toLocaleString("en-IN")}`,
      key: "price:min",
    });
  }

  if (
    maxPrice &&
    maxPrice !== "30000+"
  ) {
    addToGroup("Price", {
      label: "Maximum",
      value: `₹${Number(
        maxPrice,
      ).toLocaleString("en-IN")}`,
      key: "price:max",
    });
  }

  Object.entries(filterValues).forEach(
    ([groupKey, values]) => {
      if (!values.length) return;

      const group = filterGroups.find(
        (item) => item.key === groupKey,
      );

      const groupName =
        group?.title ?? groupKey;

      values.forEach((value) => {
        addToGroup(groupName, {
          label: groupName,
          value,
          key: `${groupKey}:${value}`,
        });
      });
    },
  );

  return groups;
}, [
  search,
  selectedBrands,
  displays,
  minPrice,
  maxPrice,
  filterValues,
]);

  const hasAppliedFilters =
    Boolean(search) ||
    selectedBrands.length > 0 ||
    Boolean(minPrice) ||
    (Boolean(maxPrice) &&
      maxPrice !== "30000+") ||
    displays.length > 0 ||
    Object.values(filterValues).some(
      (values) => values.length > 0,
    );

  const clearAllFilters = () => {
    onSearchChange("");
    onPriceChange("", "30000+");

    selectedBrands.forEach((brand) =>
      onBrandChange(brand),
    );

    displays.forEach((display) =>
      onDisplayChange(display),
    );

    Object.entries(filterValues).forEach(
      ([groupKey, values]) => {
        values.forEach((value) =>
          onFilterChange(groupKey, value),
        );
      },
    );
    setShowAllAppliedGroups(false);
  };

  const removeAppliedFilter = (
    item: {
      key: string;
      label: string;
      value: string;
    },
  ) => {
    if (item.key === "search") {
      onSearchChange("");
      return;
    }

    if (item.key === "brand") {
      onBrandChange(item.value);
      return;
    }

    if (item.key === "display") {
      onDisplayChange(item.value);
      return;
    }

    if (item.key === "price") {
      if (item.label === "Min Price") {
        onPriceChange("", maxPrice);
      } else {
        onPriceChange(minPrice, "30000+");
      }

      return;
    }

    onFilterChange(item.key, item.value);
  };

  const minPriceNumber = minPrice
    ? Number(minPrice)
    : null;

  const maxPriceNumber =
    maxPrice &&
    maxPrice !== "30000+"
      ? Number(maxPrice)
      : null;

  const invalidPriceRange =
    minPriceNumber !== null &&
    maxPriceNumber !== null &&
    minPriceNumber > maxPriceNumber;

  return (
    <aside className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* FILTER HEADER */}
      <div className="border-b border-slate-200 bg-gradient-to-br from-white via-white to-indigo-50/40 px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-100">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-5 w-5"
              >
                <path
                  d="M4 6H20M7 12H17M10 18H14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div className="min-w-0">
              <h2 className="text-lg font-extrabold text-slate-900">
                Filters
              </h2>

              <p className="mt-1 text-[11px] leading-4 text-slate-500">
                Search or select filters to refine your
                results
              </p>
            </div>
          </div>

          {hasAppliedFilters && (
            <span className="shrink-0 rounded-full bg-indigo-100 px-2 py-1 text-[10px] font-black text-indigo-700">
              {appliedFilterGroups.length}
            </span>
          )}
        </div>
      </div>

      {/* APPLIED FILTERS */}
{hasAppliedFilters && (
  <div className="border-b border-slate-100 bg-slate-50/60 p-4">
    <div className="mb-3 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-xs font-black text-emerald-600">
          ✓
        </span>

        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
          Applied Filters
        </span>
      </div>

      <button
        type="button"
        onClick={clearAllFilters}
        className="text-[10px] font-bold text-rose-500 transition-colors hover:text-rose-600"
      >
        Clear All
      </button>
    </div>

    <div className="space-y-3">
      {Object.entries(appliedFilterGroups)
        .slice(
          0,
          showAllAppliedGroups
            ? undefined
            : 2,
        )
        .map(
          ([groupName, items]) => (
            <div key={groupName}>
              <div className="mb-1.5 flex items-center gap-1.5">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                  {groupName}
                </span>

                <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-[9px] font-bold text-slate-500">
                  {items.length}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {items.map((item) => (
                  <button
                    type="button"
                    key={item.key}
                    onClick={() => {
                      if (
                        item.key ===
                        "search"
                      ) {
                        onSearchChange("");
                        return;
                      }

                      if (
                        item.key.startsWith(
                          "brand:",
                        )
                      ) {
                        const brand =
                          item.key.replace(
                            "brand:",
                            "",
                          );

                        onBrandChange(
                          brand,
                        );
                        return;
                      }

                      if (
                        item.key.startsWith(
                          "display:",
                        )
                      ) {
                        const display =
                          item.key.replace(
                            "display:",
                            "",
                          );

                        onDisplayChange(
                          display,
                        );
                        return;
                      }

                      if (
                        item.key ===
                        "price:min"
                      ) {
                        onPriceChange(
                          "",
                          maxPrice,
                        );
                        return;
                      }

                      if (
                        item.key ===
                        "price:max"
                      ) {
                        onPriceChange(
                          minPrice,
                          "30000+",
                        );
                        return;
                      }

                      const separatorIndex =
                        item.key.indexOf(
                          ":",
                        );

                      const groupKey =
                        item.key.slice(
                          0,
                          separatorIndex,
                        );

                      const value =
                        item.key.slice(
                          separatorIndex + 1,
                        );

                      onFilterChange(
                        groupKey,
                        value,
                      );
                    }}
                    className="group inline-flex max-w-full items-center gap-1.5 rounded-lg border border-indigo-100 bg-white px-2.5 py-1.5 shadow-sm transition-all hover:border-rose-200 hover:bg-rose-50"
                  >
                    <span className="max-w-[125px] truncate text-[10px] font-bold text-slate-600 group-hover:text-rose-600">
                      {item.value}
                    </span>

                    <span className="text-[10px] font-black text-slate-400 group-hover:text-rose-500">
                      ×
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ),
        )}
    </div>

    {/* SHOW MORE / LESS */}
    {Object.keys(appliedFilterGroups).length >
      2 && (
      <button
        type="button"
        onClick={() =>
          setShowAllAppliedGroups(
            (value) => !value,
          )
        }
        className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg bg-white py-2 text-[10px] font-extrabold text-indigo-600 shadow-sm transition-all hover:bg-indigo-50"
      >
        {showAllAppliedGroups ? (
          <>
            Show less
            <span className="text-xs">
              ↑
            </span>
          </>
        ) : (
          <>
            Show more
            <span className="text-xs">
              ↓
            </span>
          </>
        )}
      </button>
    )}
  </div>
)}

    {/* SEARCH */}
<div className="border-b border-slate-100 p-4">
  <label
    htmlFor="mobile-filter-search"
    className="mb-2 block text-[11px] font-extrabold uppercase tracking-wider text-slate-600"
  >
    Search
  </label>

  <div className="relative">
    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-4 w-4"
      >
        <circle
          cx="11"
          cy="11"
          r="6.5"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M16 16L21 21"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </span>

    <input
      id="mobile-filter-search"
      value={search}
      onChange={(event) =>
        onSearchChange(event.target.value)
      }
      placeholder="Search mobiles..."
      className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs font-medium text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
    />
  </div>
</div>

      {/* BRAND */}
<FilterSection
  title="Brand"
  icon="B"
  accent="indigo"
  badge={selectedBrands.length}
>
  <div className="space-y-0.5">
    {visibleBrands.map((brand) => (
      <FilterOption
        key={brand}
        label={
          brand.charAt(0).toUpperCase() +
          brand.slice(1)
        }
        checked={selectedBrands.includes(
          brand,
        )}
        count={brandCounts[brand]}
        onClick={() =>
          onBrandChange(brand)
        }
      />
    ))}
  </div>

  {filteredBrands.length > 7 && (
    <button
      type="button"
      onClick={() =>
        setShowAllBrands(
          (value) => !value,
        )
      }
      className="mt-2 w-full rounded-lg bg-slate-50 py-2 text-[10px] font-extrabold text-indigo-600 transition-colors hover:bg-indigo-50"
    >
      {showAllBrands
        ? "Show less"
        : `Show all ${filteredBrands.length} brands`}
    </button>
  )}
</FilterSection>

{/* SEARCH — BELOW BRAND */}
<div className="border-b border-slate-100 p-4">
  <div className="relative">
    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-4 w-4"
      >
        <circle
          cx="11"
          cy="11"
          r="6.5"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M16 16L21 21"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </span>

    <input
      id="mobile-filter-search"
      value={search}
      onChange={(event) =>
        onSearchChange(event.target.value)
      }
      placeholder="Search mobiles..."
      className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs font-medium text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
    />
  </div>
</div>

      {/* PRICE */}
      <FilterSection
        title="Price"
        icon="₹"
        accent="emerald"
        badge={
          (minPrice ? 1 : 0) +
          (maxPrice &&
          maxPrice !== "30000+"
            ? 1
            : 0)
        }
      >
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Minimum
            </label>

            <select
              value={minPrice}
              onChange={(event) =>
                onPriceChange(
                  event.target.value,
                  maxPrice,
                )
              }
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-2 text-[11px] font-bold text-slate-600 outline-none transition-all focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-50"
            >
              {minPriceOptions.map(
                (option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ),
              )}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Maximum
            </label>

            <select
              value={maxPrice}
              onChange={(event) =>
                onPriceChange(
                  minPrice,
                  event.target.value,
                )
              }
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-2 text-[11px] font-bold text-slate-600 outline-none transition-all focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-50"
            >
              {maxPriceOptions.map(
                (option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ),
              )}
            </select>
          </div>
        </div>

        {invalidPriceRange && (
          <div className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-[10px] font-bold text-rose-600">
            Minimum price cannot be higher than maximum
            price.
          </div>
        )}
      </FilterSection>

      {/* DISPLAY */}
      <FilterSection
        title="Display"
        icon="▣"
        accent="sky"
        badge={displays.length}
      >
        <div className="space-y-0.5">
          {sortSelectedFirst(
  displayOptions,
  displays,
).map(
  (display) => (
              <FilterOption
                key={display}
                label={display}
                checked={displays.includes(
                  display,
                )}
                onClick={() =>
                  onDisplayChange(
                    display,
                  )
                }
              />
            ),
          )}
        </div>
      </FilterSection>

      {/* STORES */}
      <FilterSection
        title="Stores"
        icon="▤"
        accent="amber"
        badge={
          filterValues.stores?.length ?? 0
        }
      >
        <div className="space-y-0.5">
          {sortSelectedFirst(
  stores,
  filterValues.stores ?? [],
).map((store) => (
            <FilterOption
              key={store}
              label={store}
              checked={Boolean(
                filterValues.stores?.includes(
                  store,
                ),
              )}
              onClick={() =>
                onFilterChange(
                  "stores",
                  store,
                )
              }
            />
          ))}
        </div>
      </FilterSection>

      {/* OTHER FILTER GROUPS */}
      {filterGroups.map((group) => {
        const selectedCount =
          filterValues[group.key]?.length ??
          0;

        return (
          <FilterSection
            key={group.key}
            title={group.title}
            icon={getFilterIcon(
              group.key,
            )}
            accent={getFilterAccent(
              group.key,
            )}
            badge={selectedCount}
          >
            <div className="space-y-0.5">
              {sortSelectedFirst(
  group.options,
  filterValues[group.key] ?? [],
).map(
  (option) => (
                  <FilterOption
                    key={option}
                    label={option}
                    checked={Boolean(
                      filterValues[
                        group.key
                      ]?.includes(
                        option,
                      ),
                    )}
                    onClick={() =>
                      onFilterChange(
                        group.key,
                        option,
                      )
                    }
                  />
                ),
              )}
            </div>
          </FilterSection>
        );
      })}

      {/* BOTTOM CLEAR */}
      {hasAppliedFilters && (
        <div className="border-t border-slate-100 bg-slate-50/70 p-4">
          <button
            type="button"
            onClick={clearAllFilters}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-[11px] font-extrabold text-slate-600 shadow-sm transition-all hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
          >
            <span className="text-sm">
              ↺
            </span>
            Clear all filters
          </button>
        </div>
      )}
    </aside>
  );
}