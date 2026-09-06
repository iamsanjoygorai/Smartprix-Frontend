"use client";

interface PopularFeaturesProps {
onFeatureChange?: (feature: string) => void;
}

const features = [
"5G Mobiles",
"Android Phones",
"256GB Storage",
"Foldable Phones",
"Best Camera",
"Upcoming Mobiles",
"Latest Mobiles",
];

export default function PopularFeatures({
onFeatureChange,
}: PopularFeaturesProps) {
return ( <section className="rounded-sm border border-gray-300 bg-[#fff5f8] p-3"> <h2 className="mb-3 text-[17px] font-semibold text-gray-800">
Most Searched Features </h2>

  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
    {features.map((feature) => {
      const words = feature.split(" ");

      return (
        <button
          key={feature}
          type="button"
          onClick={() => onFeatureChange?.(feature)}
          className="min-h-[62px] rounded border border-gray-300 bg-white px-2 py-2 text-left shadow-sm transition hover:border-blue-400 hover:shadow"
        >
          <span className="block text-sm font-bold text-blue-600">
            {words.slice(0, -1).join(" ")}
          </span>

          <span className="block text-sm text-blue-600">
            {words[words.length - 1]}
          </span>
        </button>
      );
    })}
  </div>
</section>

);
}
