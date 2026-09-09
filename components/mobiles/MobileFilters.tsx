"use client";

import {
  useEffect,
  useMemo,
  useRef,
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
  "oppo",
  "realme",
  "xiaomi",
  "poco",
  "apple",
  "oneplus",
  "iqoo",
  "infinix",
  "tecno",
  "nothing",
  "honor",
  "nokia",
  "mivi",
  "google",
  "lava",
  "boltt",
  "huawei",
  "itel",
  "ai+",
  "redmagic",
  "sony",
  "nubia",
  "philips",
  "hmd",
  "jio",
  "micromax",
  "peace",
  "cmf",
  "asus",
  "htc",
  "ikall",
  "karbonn",
  "ringme",
  "lg",
  "tcl",
  "coolpad",
  "meizu",
  "lenovo",
  "intex",
  "snexian",
  "mtr",
  "unihertz",
  "blackberry",
  "alcatel",
  "bluefox",
  "generic",
  "doogee",
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

function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function getMatchScore(text: string, query: string) {
  const originalText = text.trim().toLowerCase();
  const originalQuery = query.trim().toLowerCase();

  if (!originalQuery) return 0;

  const textNormalized = normalizeSearchText(text);
  const queryNormalized = normalizeSearchText(query);

  // Exact text match
  if (originalText === originalQuery) {
    return 1000;
  }

  // Exact match after removing spaces/symbols
  // Example: "8 GB" === "8gb"
  if (textNormalized === queryNormalized) {
    return 980;
  }

  // Text starts with query
  if (originalText.startsWith(originalQuery)) {
    return 900;
  }

  // Normalized text starts with query
  if (textNormalized.startsWith(queryNormalized)) {
    return 880;
  }

  // Complete query exists inside text
  if (originalText.includes(originalQuery)) {
    return 800;
  }

  // Normalized query exists inside text
  if (textNormalized.includes(queryNormalized)) {
    return 780;
  }

  // Word-by-word matching
  const queryWords = originalQuery.split(/\s+/).filter(Boolean);
  const textWords = originalText.split(/\s+/).filter(Boolean);

  let score = 0;
  let matchedWords = 0;

  for (const queryWord of queryWords) {
    let bestWordScore = 0;

    for (const textWord of textWords) {
      if (textWord === queryWord) {
        bestWordScore = Math.max(bestWordScore, 700);
      } else if (textWord.startsWith(queryWord)) {
        bestWordScore = Math.max(bestWordScore, 600);
      } else if (textWord.includes(queryWord)) {
        bestWordScore = Math.max(bestWordScore, 500);
      }
    }

    if (bestWordScore > 0) {
      matchedWords++;
      score += bestWordScore;
    }
  }

  if (matchedWords === queryWords.length) {
    score += 300;
  }

  return score;
}

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
  defaultOpen = true,
  forceOpen = false,
  searchOpen = false,
}: {
  title: string;
  icon: string;
  accent?: string;
  badge?: number;
  children: ReactNode;
  defaultOpen?: boolean;
  forceOpen?: boolean;
  searchOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const previousForceOpen = useRef(forceOpen);

  // Automatically open when a filter becomes selected.
  // Do NOT automatically close when it becomes unselected.
  useEffect(() => {
    if (forceOpen && !previousForceOpen.current) {
      setIsOpen(true);
    }

    previousForceOpen.current = forceOpen;
  }, [forceOpen]);

  // Search opening is temporary.
  const visibleOpen = isOpen || searchOpen;

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
              accentClasses[accent] ?? accentClasses.indigo
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
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-all duration-200 ${
            visibleOpen
              ? "bg-slate-100 text-slate-700"
              : "bg-transparent text-slate-400"
          }`}
        >
          <span
            className={`text-[15px] leading-none transition-transform duration-200 ${
              visibleOpen ? "rotate-90" : ""
            }`}
          >
            ›
          </span>
        </span>
      </button>

      {visibleOpen && (
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

const [brandSort, setBrandSort] =
  useState<"popular" | "name">("popular");

const [showAllAppliedGroups, setShowAllAppliedGroups] =
  useState(false);

const [filterSearch, setFilterSearch] = useState("");


// ─────────────────────────────────────────────
// FILTERED BRANDS
// ─────────────────────────────────────────────

const filteredBrands = useMemo(() => {
  const query = brandSearch.trim().toLowerCase();

  let result = brands.filter((brand) =>
    brand.toLowerCase().includes(query)
  );

  result = [...result].sort((a, b) => {
    const aIndex = selectedBrands.indexOf(a);
    const bIndex = selectedBrands.indexOf(b);

    // Selected brands first
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }

    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;

    // Sort by popularity
    if (brandSort === "popular") {
      const countA = brandCounts[a] ?? 0;
      const countB = brandCounts[b] ?? 0;

      if (countB !== countA) {
        return countB - countA;
      }
    }

    // Alphabetical fallback
    return a.localeCompare(b);
  });

  return result;
}, [
  brandSearch,
  brandCounts,
  brandSort,
  selectedBrands,
]);

// ─────────────────────────────────────────────
// FILTER SEARCH
// ─────────────────────────────────────────────

const filterSearchQuery = filterSearch.trim().toLowerCase();

// ─────────────────────────────────────────────
// BRANDS
// ─────────────────────────────────────────────

const filteredSidebarBrands = useMemo(() => {
  if (!filterSearchQuery) {
    return filteredBrands;
  }

  // Searching "brand" should show all brands
  if (getMatchScore("Brand", filterSearchQuery) > 0) {
    return [...filteredBrands];
  }

  return brands
    .map((brand) => ({
      brand,
      score: getMatchScore(brand, filterSearchQuery),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      const aSelected = selectedBrands.includes(a.brand);
      const bSelected = selectedBrands.includes(b.brand);

      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;

      return a.brand.localeCompare(b.brand);
    })
    .map((item) => item.brand);
}, [
  filterSearchQuery,
  filteredBrands,
  selectedBrands,
]);

// ─────────────────────────────────────────────
// DISPLAY
// ─────────────────────────────────────────────

const filteredDisplays = useMemo(() => {
  if (!filterSearchQuery) {
    return sortSelectedFirst(
      displayOptions,
      displays,
    );
  }

  // Searching "display" should show all display options
  if (getMatchScore("Display", filterSearchQuery) > 0) {
    return sortSelectedFirst(
      displayOptions,
      displays,
    );
  }

  return displayOptions
    .map((display) => ({
      display,
      score: getMatchScore(
        display,
        filterSearchQuery,
      ),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      const aSelected = displays.includes(a.display);
      const bSelected = displays.includes(b.display);

      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;

      return a.display.localeCompare(b.display);
    })
    .map((item) => item.display);
}, [
  filterSearchQuery,
  displays,
]);

// ─────────────────────────────────────────────
// STORES
// ─────────────────────────────────────────────

const filteredStores = useMemo(() => {
  const selectedStores =
    filterValues.stores ?? [];

  if (!filterSearchQuery) {
    return sortSelectedFirst(
      stores,
      selectedStores,
    );
  }

  // Searching "store" or "stores"
  if (
    getMatchScore("Stores", filterSearchQuery) > 0 ||
    getMatchScore("Store", filterSearchQuery) > 0
  ) {
    return sortSelectedFirst(
      stores,
      selectedStores,
    );
  }

  return stores
    .map((store) => ({
      store,
      score: getMatchScore(
        store,
        filterSearchQuery,
      ),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      const aSelected = selectedStores.includes(
        a.store,
      );

      const bSelected = selectedStores.includes(
        b.store,
      );

      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;

      return a.store.localeCompare(b.store);
    })
    .map((item) => item.store);
}, [
  filterSearchQuery,
  filterValues.stores,
]);

// ─────────────────────────────────────────────
// PRICE
// ─────────────────────────────────────────────

const priceOptions = [
  ["Under ₹5,000", "", "5000"],
  ["₹5,000 - ₹10,000", "5000", "10000"],
  ["₹10,000 - ₹15,000", "10000", "15000"],
  ["₹15,000 - ₹20,000", "15000", "20000"],
  ["₹20,000 - ₹30,000", "20000", "30000"],
  ["Above ₹30,000", "30000", "30000+"],
] as const;

const filteredPriceOptions = useMemo(() => {
  if (!filterSearchQuery) {
    return priceOptions;
  }

  // Searching "price" should show all price options
  if (
    getMatchScore("Price", filterSearchQuery) > 0
  ) {
    return priceOptions;
  }

  return priceOptions
    .map((item) => ({
      item,
      score: getMatchScore(
        item[0],
        filterSearchQuery,
      ),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => {
      return b.score - a.score;
    })
    .map((item) => item.item);
}, [filterSearchQuery]);

const priceFilterMatches =
  !filterSearchQuery ||
  getMatchScore("Price", filterSearchQuery) > 0 ||
  filteredPriceOptions.length > 0;

// ─────────────────────────────────────────────
// OTHER FILTER GROUPS
// ─────────────────────────────────────────────

const filteredFilterGroups = useMemo(() => {
  if (!filterSearchQuery) {
    return filterGroups;
  }

  const query = filterSearchQuery.trim().toLowerCase();

  return filterGroups
    .map((group) => {
      const groupTitleMatches =
        group.title.toLowerCase().includes(query);

      const matchingOptions =
        group.options.filter((option) =>
          option.toLowerCase().includes(query),
        );

      // Group title matched:
      // show the entire group
      if (groupTitleMatches) {
        return {
          ...group,
          options: group.options,
        };
      }

      // Option matched:
      // show only matching options
      if (matchingOptions.length > 0) {
        return {
          ...group,
          options: matchingOptions,
        };
      }

      return null;
    })
    .filter(
      (
        group,
      ): group is (typeof filterGroups)[number] =>
        group !== null,
    );
}, [filterSearchQuery]);


// ─────────────────────────────────────────────
// APPLIED FILTERS
// ─────────────────────────────────────────────

const appliedFilterGroups: Record<
  string,
  {
    label: string;
    value: string;
    key: string;
  }[]
> = {};


// Search
if (search.trim()) {
  appliedFilterGroups.Search = [
    {
      label: "Search",
      value: search,
      key: "search",
    },
  ];
}


// Price
const hasSelectedPrice =
  (minPrice && minPrice !== "") ||
  (maxPrice && maxPrice !== "" && maxPrice !== "30000+");

if (hasSelectedPrice) {
  let priceLabel = "";

  if (minPrice && maxPrice && maxPrice !== "30000+") {
    priceLabel = `₹${Number(minPrice).toLocaleString(
      "en-IN"
    )} - ₹${Number(maxPrice).toLocaleString("en-IN")}`;
  } else if (minPrice && maxPrice === "30000+") {
    priceLabel = `Above ₹${Number(minPrice).toLocaleString(
      "en-IN"
    )}`;
  } else if (maxPrice && maxPrice !== "30000+") {
    priceLabel = `Under ₹${Number(maxPrice).toLocaleString(
      "en-IN"
    )}`;
  }

  if (priceLabel) {
    appliedFilterGroups.Price = [
      {
        label: "Price",
        value: priceLabel,
        key: "price",
      },
    ];
  }
}

// Brands
selectedBrands.forEach((brand) => {
  appliedFilterGroups.Brand ??= [];

  appliedFilterGroups.Brand.push({
    label: "Brand",
    value:
      brand.charAt(0).toUpperCase() +
      brand.slice(1),
    key: `brand:${brand}`,
  });
});


// Displays
displays.forEach((display) => {
  appliedFilterGroups.Display ??= [];

  appliedFilterGroups.Display.push({
    label: "Display",
    value: display,
    key: `display:${display}`,
  });
});


// Other filter groups
Object.entries(filterValues).forEach(
  ([groupKey, values]) => {
    if (!values.length) return;

    const group = filterGroups.find(
      (item) => item.key === groupKey
    );

    const groupName =
      group?.title ?? groupKey;

    appliedFilterGroups[groupName] ??= [];

    values.forEach((value) => {
      appliedFilterGroups[groupName].push({
        label: groupName,
        value,
        key: `${groupKey}:${value}`,
      });
    });
  }
);


// ─────────────────────────────────────────────
// APPLIED FILTER TOTAL
// ─────────────────────────────────────────────

const appliedGroups =
  Object.entries(appliedFilterGroups);

const totalAppliedFilters =
  appliedGroups.reduce(
    (total, [, items]) =>
      total + items.length,
    0
  );

const hasAppliedFilters =
  totalAppliedFilters > 0;

const visibleAppliedGroups = showAllAppliedGroups
  ? appliedGroups
  : appliedGroups.slice(0, 2);

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

  const removeAppliedFilter = (item: {
  key: string;
  label: string;
  value: string;
}) => {
  // Search
  if (item.key === "search") {
    onSearchChange("");
    return;
  }

  // Individual Brand
  if (item.key.startsWith("brand:")) {
    const brand = item.key.slice("brand:".length);
    onBrandChange(brand);
    return;
  }

  // Individual Display
  if (item.key.startsWith("display:")) {
    const display = item.key.slice("display:".length);
    onDisplayChange(display);
    return;
  }

  // Price
  if (item.key === "price") {
    onPriceChange("", "30000+");
    return;
  }

  // Any other filter
  const separatorIndex = item.key.indexOf(":");

  if (separatorIndex !== -1) {
    const groupKey = item.key.slice(0, separatorIndex);
    const value = item.key.slice(separatorIndex + 1);

    onFilterChange(groupKey, value);
  }
};
  const clearAppliedGroup = (
  groupName: string,
  items: { key: string; label: string; value: string }[]
) => {
  if (groupName === "Search") {
    onSearchChange("");
    return;
  }

  if (groupName === "Price") {
    onPriceChange("", "30000+");
    return;
  }

  if (groupName === "Brand") {
    items.forEach((item) => {
      if (item.key.startsWith("brand:")) {
        const brand = item.key.slice("brand:".length);
        onBrandChange(brand);
      }
    });
    return;
  }

  if (groupName === "Display") {
    items.forEach((item) => {
      if (item.key.startsWith("display:")) {
        const display = item.key.slice("display:".length);
        onDisplayChange(display);
      }
    });
    return;
  }

  items.forEach((item) => {
    const separatorIndex = item.key.indexOf(":");

    if (separatorIndex !== -1) {
      const groupKey = item.key.slice(0, separatorIndex);
      const value = item.key.slice(separatorIndex + 1);

      onFilterChange(groupKey, value);
    }
  });
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

    const lastFiveFilterKeys = filterGroups
  .slice(-5)
  .map((group) => group.key);

  return (
    <aside className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

{/* SEARCH FOR FILTERS */}
<div className="border-b border-slate-100 p-4">
  <label
    htmlFor="filter-search"
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
      id="filter-search"
      value={filterSearch}
      onChange={(event) =>
        setFilterSearch(event.target.value)
      }
      placeholder="Search for filters..."
      className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs font-medium text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
    />
  </div>
</div>

  
{/* FILTER STATUS */}
<div className="border-b border-slate-100 bg-slate-50/60 p-4">
  {!hasAppliedFilters ? (
    <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-4 text-center">
      <p className="text-[11px] font-semibold leading-5 text-slate-500">
        Search for filters or apply some filters from below
      </p>
    </div>
  ) : (
    <>
      {/* Applied Filters - only appears after a filter is applied */}
      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
            Applied Filters
          </span>

          <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
            {totalAppliedFilters}
          </span>
        </div>

        <button
          type="button"
          onClick={clearAllFilters}
          className="cursor-pointer text-xs font-semibold text-red-600 hover:text-red-700 hover:underline"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-3">
        {visibleAppliedGroups.map(([groupName, items]) => (
          <div key={groupName}>
            <div className="mb-1.5 flex items-center justify-between">
  <p className="text-[10px] font-bold text-slate-400">
    {groupName}
  </p>

  <button
    type="button"
    onClick={() => clearAppliedGroup(groupName, items)}
    className="cursor-pointer text-[13px] font-bold leading-none text-slate-400 transition hover:text-red-500"
    title={`Clear ${groupName}`}
  >
    ×
  </button>
</div>

            <div className="flex flex-wrap gap-1.5">
              {items.map((item) => (
  <button
    key={item.key}
    type="button"
    onClick={() => removeAppliedFilter(item)}
    className="group inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-indigo-100 bg-indigo-50 px-2.5 py-1.5 text-[10px] font-bold text-indigo-700 transition hover:border-red-100 hover:bg-red-50 hover:text-red-600"
  >
    <span className="max-w-[130px] truncate">
      {item.value}
    </span>

    <span className="text-indigo-400 group-hover:text-red-400">
      ×
    </span>
  </button>
))}
            </div>
          </div>
        ))}

        {appliedGroups.length > 2 && (
  <div className="flex justify-center pt-1">
    <button
      type="button"
      onClick={() =>
        setShowAllAppliedGroups((value) => !value)
      }
      className="cursor-pointer text-[10px] font-extrabold text-indigo-600 hover:text-indigo-700"
    >
      {showAllAppliedGroups
        ? "Show less"
        : `Show ${appliedGroups.length - 2} more`}
    </button>
  </div>
)}

      </div>
    </>
  )}
</div>


{/* PRICE */}
{priceFilterMatches && (
  <FilterSection
    title="Price"
    icon="₹"
    accent="emerald"
    badge={
      minPrice ||
      (maxPrice && maxPrice !== "30000+")
        ? 1
        : undefined
    }
  >
    <div className="grid grid-cols-2 gap-2">
      {filteredPriceOptions.map(
        ([label, min, max]) => {
          const isActive =
            minPrice === min &&
            maxPrice === max;

          return (
            <button
              key={label}
              type="button"
              onClick={() =>
                onPriceChange(min, max)
              }
              className={`cursor-pointer rounded-xl border px-2 py-2 text-[10px] font-bold transition ${
                isActive
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50"
              }`}
            >
              {label}
            </button>
          );
        },
      )}
    </div>
  </FilterSection>
)}

{/* BRAND */}
{(!filterSearchQuery ||
  filteredSidebarBrands.length > 0) && (
  <FilterSection
  title="Brand"
  icon="B"
  accent="indigo"
  badge={selectedBrands.length}
>
  {/* BRAND SEARCH */}
  <div className="mb-2">
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
        value={brandSearch}
        onChange={(event) =>
          setBrandSearch(event.target.value)
        }
        placeholder="Search brands..."
        className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs font-medium text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
      />
    </div>
  </div>

  {/* BRAND LIST */}
  <div className="max-h-[360px] overflow-y-auto pr-1">
    <div className="space-y-0.5">
      {filteredSidebarBrands.map((brand) => (
        <FilterOption
          key={brand}
          label={
            brand.charAt(0).toUpperCase() +
            brand.slice(1)
          }
          checked={selectedBrands.includes(brand)}
          count={brandCounts[brand]}
          onClick={() =>
            onBrandChange(brand)
          }
        />
      ))}
    </div>
  </div>
</FilterSection>

)}
  
      {/* DISPLAY */}
      {(!filterSearchQuery || filteredDisplays.length > 0) && (
  <FilterSection
    title="Display"
    icon="▣"
    accent="sky"
    badge={displays.length}
  >
    <div className="space-y-0.5">
      {filteredDisplays.map((display) => (
        <FilterOption
          key={display}
          label={display}
          checked={displays.includes(display)}
          onClick={() => onDisplayChange(display)}
        />
      ))}
    </div>
  </FilterSection>
)}

      {/* STORES */}
      {(!filterSearchQuery || filteredStores.length > 0) && (
  <FilterSection
    title="Stores"
    icon="▤"
    accent="amber"
    badge={filterValues.stores?.length ?? 0}
  >
    <div className="space-y-0.5">
      {filteredStores.map((store) => (
        <FilterOption
          key={store}
          label={store}
          checked={Boolean(
            filterValues.stores?.includes(store)
          )}
          onClick={() =>
            onFilterChange("stores", store)
          }
        />
      ))}
    </div>
  </FilterSection>
)}

      {/* OTHER FILTER GROUPS */}
{/* OTHER FILTER GROUPS */}
{filteredFilterGroups.map((group) => {
  const selectedCount =
    filterValues[group.key]?.length ?? 0;

  const isLastFive =
    lastFiveFilterKeys.includes(group.key);

  const groupTitleMatches =
    filterSearchQuery.length > 0 &&
    group.title
      .toLowerCase()
      .includes(filterSearchQuery);

  const optionMatches = group.options.some(
    (option) =>
      option
        .toLowerCase()
        .includes(filterSearchQuery),
  );

  const searchMatches =
    filterSearchQuery.length > 0 &&
    (groupTitleMatches || optionMatches);

  const hasSelectedFilters = selectedCount > 0;

  return (
    <FilterSection
  key={group.key}
  title={group.title}
  icon={getFilterIcon(group.key)}
  accent={getFilterAccent(group.key)}
  badge={selectedCount}
  defaultOpen={!isLastFive}
  forceOpen={hasSelectedFilters}
  searchOpen={searchMatches}
  >
      <div className="space-y-0.5">
        {group.options.map((option) => (
          <FilterOption
            key={option}
            label={option}
            checked={Boolean(
              filterValues[group.key]?.includes(option),
            )}
            onClick={() =>
              onFilterChange(group.key, option)
            }
          />
        ))}
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