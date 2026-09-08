"use client";

interface PopularFeaturesProps {
  onFeatureChange?: (feature: string) => void;
}

const features = [
  {
    name: "5G Mobiles",
    icon: "5G",
    style: "from-indigo-500 to-blue-500",
    bg: "bg-indigo-50",
    text: "text-indigo-600",
  },
  {
    name: "Android Phones",
    icon: "A",
    style: "from-emerald-500 to-green-500",
    bg: "bg-emerald-50",
    text: "text-emerald-600",
  },
  {
    name: "256GB Storage",
    icon: "GB",
    style: "from-violet-500 to-purple-500",
    bg: "bg-violet-50",
    text: "text-violet-600",
  },
  {
    name: "Foldable Phones",
    icon: "▯",
    style: "from-pink-500 to-rose-500",
    bg: "bg-pink-50",
    text: "text-pink-600",
  },
  {
    name: "Best Camera",
    icon: "◎",
    style: "from-amber-500 to-orange-500",
    bg: "bg-amber-50",
    text: "text-amber-600",
  },
  {
    name: "Upcoming Mobiles",
    icon: "↗",
    style: "from-cyan-500 to-sky-500",
    bg: "bg-cyan-50",
    text: "text-cyan-600",
  },
  {
    name: "Latest Mobiles",
    icon: "★",
    style: "from-red-500 to-orange-500",
    bg: "bg-red-50",
    text: "text-red-600",
  },
];

export default function PopularFeatures({
  onFeatureChange,
}: PopularFeaturesProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 sm:px-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-5 w-1 rounded-full bg-gradient-to-b from-pink-500 to-rose-500" />

            <h2 className="text-[17px] font-extrabold tracking-tight text-slate-900 sm:text-[18px]">
              Most Searched Features
            </h2>
          </div>

          <p className="mt-1 pl-3 text-[11px] font-medium text-slate-400">
            Quickly explore popular smartphone categories
          </p>
        </div>

        <span className="hidden rounded-full bg-pink-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-pink-500 sm:block">
          Explore
        </span>
      </div>

      {/* Features */}
      <div className="grid grid-cols-2 gap-2.5 p-3 sm:grid-cols-4 sm:gap-3 sm:p-4 lg:grid-cols-7">
        {features.map((feature) => (
          <button
            key={feature.name}
            type="button"
            onClick={() => onFeatureChange?.(feature.name)}
            className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
          >
            {/* Icon */}
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${feature.style} text-[11px] font-black text-white shadow-sm transition-transform duration-200 group-hover:scale-105`}
            >
              {feature.icon}
            </div>

            {/* Text */}
            <div className="mt-3">
              <span className="block text-[12px] font-extrabold leading-4 text-slate-800">
                {feature.name}
              </span>

              <span
                className={`mt-1 block text-[10px] font-semibold ${feature.text}`}
              >
                Explore →
              </span>
            </div>

            {/* Decorative background */}
            <span
              className={`absolute -bottom-5 -right-5 h-16 w-16 rounded-full ${feature.bg} opacity-70 transition-transform duration-300 group-hover:scale-125`}
            />

            {/* Bottom indicator */}
            <span
              className={`absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r ${feature.style} transition-all duration-300 group-hover:w-full`}
            />
          </button>
        ))}
      </div>
    </section>
  );
}