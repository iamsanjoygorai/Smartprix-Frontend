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
    <section className="rounded-sm border border-gray-300 bg-[#f0fff0] p-3">
      <h2 className="mb-3 text-[17px] font-semibold text-gray-800">
        Search By Price
      </h2>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
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
              className={`rounded border bg-white px-2 py-2.5 text-left shadow-sm transition hover:border-blue-400 hover:shadow ${
                isSelected
                  ? "border-blue-500 ring-1 ring-blue-300"
                  : "border-gray-300"
              }`}
            >
              <span className="block text-xs text-blue-600">
                {range.label}
              </span>

              <span className="block text-sm font-bold text-blue-600">
                {range.price}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
 