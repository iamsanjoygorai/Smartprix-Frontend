"use client";

interface PopularBrandsProps {
  selectedBrand: string;
  onBrandChange: (brand: string) => void;
}

const brands = [
  {
    name: "Vivo",
    slug: "vivo",
    logo: "vivo",
  },
  {
    name: "Samsung",
    slug: "samsung",
    logo: "SAMSUNG",
  },
  {
    name: "Motorola",
    slug: "motorola",
    logo: "M",
  },
  {
    name: "Realme",
    slug: "realme",
    logo: "realme",
  },
  {
    name: "OPPO",
    slug: "oppo",
    logo: "oppo",
  },
  {
    name: "Xiaomi",
    slug: "xiaomi",
    logo: "mi",
  },
  {
    name: "Poco",
    slug: "poco",
    logo: "POCO",
  },
  {
    name: "OnePlus",
    slug: "oneplus",
    logo: "1+",
  },
  {
    name: "Apple",
    slug: "apple",
    logo: "●",
  },
  {
    name: "iQOO",
    slug: "iqoo",
    logo: "iQOO",
  },
];

export default function PopularBrands({
  selectedBrand,
  onBrandChange,
}: PopularBrandsProps) {
  return (
    <section className="rounded-sm border border-gray-300 bg-[#eef8ff] p-3">
      <h2 className="mb-3 text-[17px] font-semibold text-gray-800">
        Popular Brands
      </h2>

      <div className="grid grid-cols-5 gap-y-4 sm:grid-cols-10">
        {brands.map((brand) => {
          const isSelected = selectedBrand === brand.slug;

          return (
            <button
              key={brand.slug}
              type="button"
              onClick={() =>
                onBrandChange(
                  isSelected ? "" : brand.slug,
                )
              }
              className="group flex flex-col items-center"
            >
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-full border bg-white text-sm font-bold shadow-sm transition group-hover:scale-105 ${
                  isSelected
                    ? "border-blue-500 ring-2 ring-blue-200"
                    : "border-gray-300"
                }`}
              >
                {brand.logo}
              </div>

              <span
                className={`mt-1.5 text-xs ${
                  isSelected
                    ? "font-semibold text-blue-600"
                    : "text-gray-700"
                }`}
              >
                {brand.name}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
