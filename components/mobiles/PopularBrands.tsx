"use client";

interface PopularBrandsProps {
  selectedBrands: string[];
  onBrandChange: (brand: string) => void;
}

const brands = [
  {
    name: "Vivo",
    slug: "vivo",
    logo: "vivo",
    style: "text-blue-500",
  },
  {
    name: "Samsung",
    slug: "samsung",
    logo: "SAMSUNG",
    style: "text-blue-600",
  },
  {
    name: "Motorola",
    slug: "motorola",
    logo: "M",
    style: "text-blue-500",
  },
  {
    name: "Realme",
    slug: "realme",
    logo: "realme",
    style: "text-yellow-500",
  },
  {
    name: "OPPO",
    slug: "oppo",
    logo: "oppo",
    style: "text-green-500",
  },
  {
    name: "Xiaomi",
    slug: "xiaomi",
    logo: "mi",
    style: "text-orange-500",
  },
  {
    name: "Poco",
    slug: "poco",
    logo: "POCO",
    style: "text-yellow-500",
  },
  {
    name: "OnePlus",
    slug: "oneplus",
    logo: "1+",
    style: "text-red-500",
  },
  {
    name: "Apple",
    slug: "apple",
    logo: "●",
    style: "text-slate-800",
  },
  {
    name: "iQOO",
    slug: "iqoo",
    logo: "iQOO",
    style: "text-indigo-500",
  },
];

export default function PopularBrands({
  selectedBrands,
  onBrandChange,
}: PopularBrandsProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 sm:px-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-5 w-1 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500" />

            <h2 className="text-[15px] font-bold tracking-tight text-slate-900 sm:text-[18px]">
              Popular Brands
            </h2>
          </div>
        </div>

        <span className="hidden rounded-full bg-slate-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:block">
          Top Brands
        </span>
      </div>

      {/* Brands */}
      <div className="grid grid-cols-5 gap-2 p-3 sm:grid-cols-5 sm:gap-3 sm:p-4 lg:grid-cols-10">
        {brands.map((brand) => {
          const isSelected = selectedBrands.includes(brand.slug);

          return (
            <button
              key={brand.slug}
              type="button"
              onClick={() =>
                onBrandChange(isSelected ? "" : brand.slug)
              }
              aria-pressed={isSelected}
              className={`group relative flex min-w-0 flex-col items-center rounded-xl p-2.5 transition-all duration-200 ${
                isSelected
                  ? "bg-indigo-50"
                  : "hover:bg-slate-50"
              }`}
            >
              {/* Selected indicator */}
              {isSelected && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-indigo-500 shadow-sm shadow-indigo-200" />
              )}

              {/* Logo */}
              <div
                className={`relative flex h-14 w-14 items-center justify-center rounded-2xl border bg-white shadow-sm transition-all duration-200 sm:h-16 sm:w-16 ${
                  isSelected
                    ? "border-indigo-300 shadow-md shadow-indigo-100"
                    : "border-slate-200 group-hover:-translate-y-1 group-hover:border-slate-300 group-hover:shadow-md"
                }`}
              >
                {/* Soft background */}
                <span
                  className={`absolute inset-1 rounded-xl bg-slate-50 opacity-70 transition-opacity group-hover:opacity-100 ${
                    isSelected ? "bg-indigo-50" : ""
                  }`}
                />

                {/* Logo text */}
                <span
                  className={`relative z-10 text-[11px] font-black tracking-tight ${brand.style} ${
                    brand.slug === "motorola"
                      ? "text-[20px]"
                      : brand.slug === "apple"
                        ? "text-[24px]"
                        : ""
                  }`}
                >
                  {brand.logo}
                </span>
              </div>

              {/* Brand name */}
              <span
                className={`mt-2 max-w-full truncate text-[11px] font-bold transition-colors ${
                  isSelected
                    ? "text-indigo-600"
                    : "text-slate-600 group-hover:text-indigo-600"
                }`}
              >
                {brand.name}
              </span>

              {/* Bottom indicator */}
              <span
                className={`mt-1 h-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-200 ${
                  isSelected
                    ? "w-5 opacity-100"
                    : "w-0 opacity-0 group-hover:w-4 group-hover:opacity-70"
                }`}
              />
            </button>
          );
        })}
      </div>
    </section>
  );
}