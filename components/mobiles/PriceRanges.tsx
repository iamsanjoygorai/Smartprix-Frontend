"use client";

interface PriceRangesProps {
  minPrice: string;
  maxPrice: string;
  onPriceChange: (min: string, max: string) => void;
}

const priceRanges = [
  {
    label: "Under",
    price: "₹5,000",
    min: "",
    max: "5000",
  },
  {
    label: "₹5,000 -",
    price: "₹10,000",
    min: "5000",
    max: "10000",
  },
  {
    label: "₹10,000 -",
    price: "₹15,000",
    min: "10000",
    max: "15000",
  },
  {
    label: "₹15,000 -",
    price: "₹20,000",
    min: "15000",
    max: "20000",
  },
  {
    label: "₹20,000 -",
    price: "₹30,000",
    min: "20000",
    max: "30000",
  },
  {
    label: "Above",
    price: "₹30,000",
    min: "30000",
    max: "30000+",
  },
];

export default function PriceRanges({
  minPrice,
  maxPrice,
  onPriceChange,
}: PriceRangesProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2 sm:px-5">
        <div className="flex items-center gap-2">
          <span className="h-4 w-1 rounded-full bg-gradient-to-b from-emerald-500 to-teal-500" />

          <h2 className="text-[16px] font-bold tracking-tight text-slate-900 sm:text-[17px]">
            Search By Price
          </h2>
        </div>

        <span className="hidden rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-emerald-600 sm:block">
          Budget
        </span>
      </div>

      {/* Price ranges */}
      <div className="grid grid-cols-2 gap-2 p-2.5 sm:grid-cols-3 sm:gap-2.5 sm:p-3 lg:grid-cols-6">
        {priceRanges.map((range) => {
          const isSelected =
            minPrice === range.min &&
            maxPrice === range.max;

          return (
            <button
              key={`${range.min}-${range.max}`}
              type="button"
              onClick={() => {
                if (isSelected) {
                  onPriceChange("", "30000+");
                } else {
                  onPriceChange(range.min, range.max);
                }
              }}
              aria-pressed={isSelected}
              className={`group relative flex min-w-0 items-center overflow-hidden rounded-xl border px-2.5 py-2 transition-all duration-200 ${
                isSelected
                  ? "border-emerald-300 bg-emerald-50 shadow-sm shadow-emerald-100"
                  : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-slate-50 hover:shadow-md"
              }`}
            >
              {/* Price icon */}
              <span
                className={`mr-1.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-black transition-colors ${
                  isSelected
                    ? "bg-emerald-500 text-white"
                    : "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100"
                }`}
              >
                ₹
              </span>

              {/* Single-line price text */}
              <span
                className={`min-w-0 truncate text-[10px] font-bold tracking-tight sm:text-[11px] ${
                  isSelected
                    ? "text-emerald-700"
                    : "text-slate-700"
                }`}
              >
                {range.label} {range.price}
              </span>

              {/* Selected indicator */}
              {isSelected && (
                <span className="ml-auto flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-[8px] font-black text-white">
                  ✓
                </span>
              )}

              {/* Bottom indicator */}
              <span
                className={`absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300 ${
                  isSelected
                    ? "w-full"
                    : "w-0 group-hover:w-full"
                }`}
              />
            </button>
          );
        })}
      </div>
    </section>
  );
}
