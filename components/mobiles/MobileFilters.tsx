"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

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
  ["Nothing", "nothing"],
  ["Boltt", "boltt"],
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

interface FilterGroup {
  key: string;
  title: string;
  options: [string, string][];
}

const filterGroups: FilterGroup[] = [
  {
    key: "availability",
    title: "Availability",
    options: [
      ["Exclude Out Of Stock", "exclude-out-of-stock"],
      ["Exclude Upcoming", "exclude-upcoming"],
      ["Upcoming", "upcoming"],
      ["Exclude Global", "exclude-global"],
    ],
  },

  {
    key: "types",
    title: "Types",
    options: [
      ["Smartphone", "smartphone"],
      ["Feature Phone", "feature-phone"],
      ["Budget Phone", "budget-phone"],
      ["Dual Sim", "dual-sim"],
      ["Triple Sim", "triple-sim"],
    ],
  },

  {
    key: "launched-within",
    title: "Launched Within",
    options: [
      ["3 months", "3-months"],
      ["6 months", "6-months"],
      ["12 months", "12-months"],
    ],
  },

  {
    key: "design",
    title: "Design",
    options: [
      ["Qwerty", "qwerty"],
      ["Slim", "slim"],
      ["Light Weight", "light-weight"],
    ],
  },

  {
    key: "screen-sizes",
    title: "Screen Sizes",
    options: [
      ["4 inch & Below", "4-inch-below"],
      ["4 inch - 4.7 inch", "4-4.7-inch"],
      ["5 inch - 5.5 inch", "5-5.5-inch"],
      ["5 inch - 6 inch", "5-6-inch"],
      ["6 inch - 6.5 inch", "6-6.5-inch"],
      ["6.5 inch & Above", "6.5-inch-above"],
    ],
  },

  {
    key: "screen-resolution",
    title: "Screen Resolution",
    options: [
      ["High PPI Display", "high-ppi"],
      ["4096 x 2160 (4K)", "4096x2160"],
      ["2048 x 1536 (2K)", "2048x1536"],
      ["1920 x 1080 (Full HD)", "1920x1080"],
      ["1280 x 720 (HD)", "1280x720"],
    ],
  },

  {
    key: "rear-camera",
    title: "Rear Camera",
    options: [
      ["Rear Camera", "rear-camera"],
      ["Dual Camera", "dual-camera"],
      ["Triple Camera", "triple-camera"],
      ["Quad Camera", "quad-camera"],
      ["No Rear Camera", "no-rear-camera"],
      ["5 MP & Above", "5mp-above"],
      ["13 MP & Above", "13mp-above"],
      ["16 MP & Above", "16mp-above"],
      ["20 MP & Above", "20mp-above"],
      ["48 MP & Above", "48mp-above"],
      ["64 MP & Above", "64mp-above"],
      ["108 MP & Above", "108mp-above"],
      ["200 MP & Above", "200mp-above"],
      ["Autofocus", "autofocus"],
      ["Flash", "flash"],
      ["OIS", "ois"],
    ],
  },

  {
    key: "front-camera",
    title: "Front Camera",
    options: [
      ["Front Camera", "front-camera"],
      ["Dual Front Camera", "dual-front-camera"],
      ["5 MP & Above", "front-5mp-above"],
      ["8 MP & Above", "front-8mp-above"],
      ["12 MP & Above", "front-12mp-above"],
      ["16 MP & Above", "front-16mp-above"],
      ["32 MP & Above", "front-32mp-above"],
      ["Front Camera Flash", "front-camera-flash"],
      ["Front Camera Autofocus", "front-camera-autofocus"],
    ],
  },

  {
    key: "cpu",
    title: "CPU",
    options: [
      ["Quad Core", "quad-core"],
      ["Octa Core", "octa-core"],
      ["Deca Core", "deca-core"],
      ["1.4 GHz & Above", "1.4ghz-above"],
      ["2 GHz & Above", "2ghz-above"],
      ["2.3 GHz & Above", "2.3ghz-above"],
      ["3 GHz & Above", "3ghz-above"],
    ],
  },

  {
  key: "ram",
  title: "RAM",
  options: [
    ["1 GB and Below", "1gb-below"],
    ["2 GB", "2gb"],
    ["3 GB", "3gb"],
    ["4 GB", "4gb"],
    ["6 GB", "6gb"],
    ["8 GB and Above", "8gb-above"],
  ],
},

  {
    key: "battery-size",
    title: "Battery Size",
    options: [
      ["Removable Battery", "removable-battery"],
      ["Fast Charging", "fast-charging"],
      ["Long Battery Backup", "long-battery-backup"],
      ["4000 mAh & Above", "4000mah-above"],
      ["5000 mAh & Above", "5000mah-above"],
      ["6000 mAh & Above", "6000mah-above"],
      ["7000 mAh & Above", "7000mah-above"],
    ],
  },

  {
    key: "connectivity",
    title: "Connectivity",
    options: [
      ["5G", "5g"],
      ["Wireless Charging", "wireless-charging"],
      ["NFC", "nfc"],
      ["Supports Reliance Jio", "reliance-jio"],
      ["VoLTE", "volte"],
      ["Wi-Fi", "wifi"],
      ["3G", "3g"],
      ["4G", "4g"],
      ["USB-C", "usb-c"],
      ["USB OTG", "usb-otg"],
      ["3.5mm Jack", "3.5mm-jack"],
      ["IR Blaster", "ir-blaster"],
    ],
  },

  {
    key: "features",
    title: "Features",
    options: [
      ["Memory Card Support", "memory-card-support"],
      ["Torch", "torch"],
      ["Face Unlock", "face-unlock"],
      ["FM Radio", "fm-radio"],
      ["Fingerprint", "fingerprint"],
      ["GPS", "gps"],
      ["WaterProof", "waterproof"],
      ["Expandable RAM", "expandable-ram"],
      ["Dedicated Memory Card Slot", "dedicated-memory-card"],
      ["In-display Fingerprint", "in-display-fingerprint"],
      ["UFS 3 Storage", "ufs-3"],
      ["UFS 4 Storage", "ufs-4"],
    ],
  },

  {
    key: "operating-system",
    title: "Operating System",
    options: [
      ["Android", "android"],
      ["Windows Phone", "windows-phone"],
      ["iOS", "ios"],
    ],
  },

  {
    key: "android-version",
    title: "Android Version",
    options: [
      ["Android 14 & Above", "android-14"],
      ["Android 15 & Above", "android-15"],
      ["Android 16 & Above", "android-16"],
      ["Android 17 & Above", "android-17"],
    ],
  },

  {
    key: "inbuilt-memory",
    title: "Inbuilt Memory",
    options: [
      ["32 GB & Above", "32gb-above"],
      ["64 GB & Above", "64gb-above"],
      ["128 GB & Above", "128gb-above"],
      ["256 GB & Above", "256gb-above"],
      ["512 GB & Above", "512gb-above"],
    ],
  },

  {
    key: "price-drop",
    title: "Price Drop",
    options: [
      ["5% & Above", "5-percent"],
      ["10% & Above", "10-percent"],
      ["20% & Above", "20-percent"],
      ["30% & Above", "30-percent"],
    ],
  },

  {
    key: "aspect-ratio",
    title: "Aspect Ratio",
    options: [
      ["16:9", "16-9"],
      ["18:9", "18-9"],
      ["19:9", "19-9"],
      ["20:9", "20-9"],
    ],
  },

  {
    key: "refresh-rate",
    title: "Refresh Rate",
    options: [
      ["90 Hz", "90hz"],
      ["120 Hz", "120hz"],
      ["144 Hz", "144hz"],
    ],
  },

  {
    key: "cpu-manufacturer",
    title: "CPU Manufacturer",
    options: [
      ["Apple", "apple"],
      ["HiSilicon", "hisilicon"],
      ["MediaTek", "mediatek"],
      ["Others", "others"],
      ["Qualcomm", "qualcomm"],
      ["Samsung", "samsung"],
    ],
  },

  {
    key: "gpu-manufacturer",
    title: "GPU Manufacturer",
    options: [
      ["Apple", "apple"],
      ["Arm Mali", "arm-mali"],
      ["Imagination PowerVR", "imagination-powervr"],
      ["Nvidia GeForce", "nvidia-geforce"],
      ["Others", "others"],
      ["Qualcomm Adreno", "qualcomm-adreno"],
    ],
  },

  {
    key: "ip-rating",
    title: "IP Rating",
    options: [
      ["IP53", "ip53"],
      ["IP54", "ip54"],
      ["IP64", "ip64"],
      ["IPX8", "ipx8"],
      ["IP48", "ip48"],
      ["IP67", "ip67"],
      ["IP68", "ip68"],
      ["IP69K", "ip69k"],
    ],
  },
];

const stores: [string, string][] = [
  ["Amazon", "amazon"],
  ["Flipkart", "flipkart"],
  ["Croma", "croma"],
  ["Reliance Digital", "reliance-digital"],
];


const minPriceOptions: [string, string][] = [
  ["Min", ""],
  ["₹10,000", "10000"],
  ["₹15,000", "15000"],
  ["₹20,000", "20000"],
  ["₹25,000", "25000"],
  ["₹30,000", "30000"],
];

const maxPriceOptions: [string, string][] = [
  ["₹10,000", "10000"],
  ["₹15,000", "15000"],
  ["₹20,000", "20000"],
  ["₹25,000", "25000"],
  ["₹30,000", "30000"],
  ["₹30,000+", "30000+"],
];


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
  const [showAllAppliedFilters, setShowAllAppliedFilters] = useState(false);

  const filteredBrands = useMemo(() => {
    const query = brandSearch.trim().toLowerCase();

    const matchingBrands = query
      ? brands.filter(([name]) =>
          name.toLowerCase().includes(query),
        )
      : brands;

    return [...matchingBrands].sort(
      ([nameA, slugA], [nameB, slugB]) => {
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

        return nameA.localeCompare(nameB);
      },
    );
  }, [brandSearch, selectedBrands, brandCounts]);

  const getDisplayName = (slug: string) => {
    return (
      displayOptions.find(([, value]) => value === slug)?.[0] ??
      slug
    );
  };

  const getFilterName = (groupKey: string, value: string) => {
    const group = filterGroups.find(
      (item) => item.key === groupKey,
    );

    return (
      group?.options.find(([, optionValue]) => optionValue === value)?.[0] ??
      value
    );
  };

  const hasAppliedFilters =
  Boolean(search) ||
  selectedBrands.length > 0 ||
  Boolean(minPrice) ||
  (Boolean(maxPrice) && maxPrice !== "30000+") ||
  displays.length > 0 ||
  Object.values(filterValues).some(
    (values) => values.length > 0,
  );

  const clearAllFilters = () => {
  onSearchChange("");
  onPriceChange("", "30000+");

  selectedBrands.forEach((brand) => {
    onBrandChange(brand);
  });

  displays.forEach((display) => {
    onDisplayChange(display);
  });

  Object.entries(filterValues).forEach(([groupKey, values]) => {
    values.forEach((value) => {
      onFilterChange(groupKey, value);
    });
  });

  setShowAllAppliedFilters(false);
};

  const appliedFilters: {
    title: string;
    values: string[];
    onRemove: () => void;
  }[] = [];

  if (selectedBrands.length > 0) {
    appliedFilters.push({
      title: "Brands",
      values: selectedBrands.map((slug) => {
        return (
          brands.find(([, brandSlug]) => brandSlug === slug)?.[0] ??
          slug
        );
      }),
      onRemove: () => {
        selectedBrands.forEach((brand) => {
          onBrandChange(brand);
        });
      },
    });
  }

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

 const filteredMinPriceOptions = minPriceOptions.filter(([, value]) => {
  if (value === "") {
    return true;
  }

  if (!maxPrice || maxPrice === "30000+") {
    return true;
  }

  return Number(value) < Number(maxPrice);
});

const filteredMaxPriceOptions = maxPriceOptions.filter(([, value]) => {
  if (!minPrice) {
    return true;
  }

  if (value === "30000+") {
    return true;
  }

  return Number(value) > Number(minPrice);
});

  if (search) {
    appliedFilters.push({
      title: "Search",
      values: [search],
      onRemove: () => onSearchChange(""),
    });
  }

  if (minPrice || (maxPrice && maxPrice !== "30000+")) {
  appliedFilters.push({
    title: "Price",
    values: [
      `${minPrice
        ? `₹${Number(minPrice).toLocaleString("en-IN")}`
        : "Min"} to ${
        maxPrice === "30000+"
          ? "₹30,000+"
          : maxPrice
            ? `₹${Number(maxPrice).toLocaleString("en-IN")}`
            : "Max"
      }`,
    ],
    onRemove: () => onPriceChange("", "30000+"),
  });
}

  filterGroups.forEach((group) => {
    const selectedValues = filterValues[group.key] ?? [];

    if (selectedValues.length === 0) {
      return;
    }

    appliedFilters.push({
      title: group.title,
      values: selectedValues.map((value) =>
        getFilterName(group.key, value),
      ),
      onRemove: () => {
        selectedValues.forEach((value) => {
          onFilterChange(group.key, value);
        });
      },
    });
  });

  const visibleFilters = showAllAppliedFilters
    ? appliedFilters
    : appliedFilters.slice(0, 2);

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

      {/* APPLIED FILTERS */}
      <div className="border-b border-gray-300 px-3 py-3">
        {!hasAppliedFilters ? (
          <div className="flex min-h-[90px] items-center justify-center text-center text-sm text-gray-600">
            Search for filters or apply some filters from below
          </div>
        ) : (
          <>
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

            <div className="overflow-hidden rounded border border-gray-300 bg-white">
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

                  <div className="mt-1 break-words text-xs leading-5 text-gray-600">
                    {filter.values.join(" • ")}
                  </div>
                </div>
              ))}

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
            </div>
          </>
        )}
      </div>

    
  <FilterSection title="Price">
  <div className="flex items-center gap-2 px-3 py-3">
    {/* Min Price */}
    <select
      value={minPrice}
      onChange={(e) => {
        const newMin = e.target.value;

        // If selected Min is not smaller than current Max,
        // clear Max so the range always remains valid.
        if (
          maxPrice &&
          maxPrice !== "30000+" &&
          newMin &&
          Number(newMin) >= Number(maxPrice)
        ) {
          onPriceChange(newMin, "");
          return;
        }

        onPriceChange(newMin, maxPrice);
      }}
      className="h-9 min-w-0 flex-1 rounded border border-gray-300 bg-white px-2 text-sm text-gray-700 outline-none focus:border-green-500"
    >
      {filteredMinPriceOptions.map(([label, value]) => (
        <option key={value || "min"} value={value}>
          {label}
        </option>
      ))}
    </select>

    <span className="shrink-0 text-sm text-gray-500">
      to
    </span>

    {/* Max Price */}
    <select
      value={maxPrice}
      onChange={(e) => {
        const newMax = e.target.value;

        // If selected Max is not greater than current Min,
        // clear Min so the range always remains valid.
        if (
          minPrice &&
          newMax !== "30000+" &&
          Number(newMax) <= Number(minPrice)
        ) {
          onPriceChange("", newMax);
          return;
        }

        onPriceChange(minPrice, newMax);
      }}
      className="h-9 min-w-0 flex-1 rounded border border-gray-300 bg-white px-2 text-sm text-gray-700 outline-none focus:border-green-500"
    >
      {filteredMaxPriceOptions.map(([label, value]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
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
          placeholder="Search brands"
          className="mb-3 w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-blue-400"
        />

        <div className="space-y-2">
          {filteredBrands.map(([brandName, brandSlug]) => {
            const isSelected =
              selectedBrands.includes(brandSlug);

            const count = brandCounts[brandSlug];

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

                {count !== undefined && (
                  <span className="text-xs text-gray-500">
                    {count}
                  </span>
                )}
              </label>
            );
          })}
        </div>
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
      </FilterSection>

      {/* STORES */}
      <FilterSection title="Stores">
        <div className="space-y-2">
          {stores.map(([storeName, storeSlug]) => {
            const isSelected =
              (filterValues.stores ?? []).includes(storeSlug);

            return (
              <label
                key={storeSlug}
                className="flex cursor-pointer items-center gap-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() =>
                    onFilterChange("stores", storeSlug)
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
                  {storeName}
                </span>
              </label>
            );
          })}
        </div>
      </FilterSection>

      {/* OTHER FILTERS */}
      {filterGroups.map((group) => (
        <FilterSection
          key={group.key}
          title={group.title}
        >
          <div className="space-y-2">
            {group.options.map(
              ([label, value]) => {
                const isSelected =
                  (filterValues[group.key] ?? []).includes(
                    value,
                  );

                return (
                  <label
                    key={value}
                    className="flex cursor-pointer items-center justify-between text-sm"
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() =>
                          onFilterChange(
                            group.key,
                            value,
                          )
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
                        {label}
                      </span>
                    </span>
                  </label>
                );
              },
            )}
          </div>
        </FilterSection>
      ))}
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
  const [isOpen, setIsOpen] = useState(true);

  return (
    <section className="border-t border-gray-300">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
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
          <div className="p-3">{children}</div>
        </div>
      </div>
    </section>
  );
}