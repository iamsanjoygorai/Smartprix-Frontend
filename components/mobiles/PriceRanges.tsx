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
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 sm:px-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-5 w-1 rounded-full bg-gradient-to-b from-emerald-500 to-teal-500" />

            <h2 className="text-[17px] font-extrabold tracking-tight text-slate-900 sm:text-[18px]">
              Search By Price
            </h2>
          </div>

          <p className="mt-1 pl-3 text-[11px] font-medium text-slate-400">
            Find smartphones within your budget
          </p>
        </div>

        <span className="hidden rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 sm:block">
          Budget
        </span>
      </div>

      {/* Price ranges */}
      <div className="grid grid-cols-2 gap-2.5 p-3 sm:grid-cols-3 sm:gap-3 sm:p-4 lg:grid-cols-6">
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
              className={`group relative overflow-hidden rounded-xl border p-3 text-left transition-all duration-200 ${
                isSelected
                  ? "border-emerald-300 bg-emerald-50 shadow-sm shadow-emerald-100"
                  : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-slate-50 hover:shadow-md"
              }`}
            >
              {/* Selected indicator */}
              {isSelected && (
                <span className="absolute right-2.5 top-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-black text-white">
                  ✓
                </span>
              )}

              {/* Price icon */}
              <span
                className={`mb-2 flex h-7 w-7 items-center justify-center rounded-lg text-[12px] font-black transition-colors ${
                  isSelected
                    ? "bg-emerald-500 text-white"
                    : "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100"
                }`}
              >
                ₹
              </span>

              <span
                className={`block text-[10px] font-semibold uppercase tracking-wide ${
                  isSelected
                    ? "text-emerald-600"
                    : "text-slate-400"
                }`}
              >
                {range.label}
              </span>

              <span
                className={`mt-0.5 block text-[14px] font-black tracking-tight ${
                  isSelected
                    ? "text-emerald-700"
                    : "text-slate-800"
                }`}
              >
                {range.price}
              </span>

              {/* Bottom hover/selected line */}
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