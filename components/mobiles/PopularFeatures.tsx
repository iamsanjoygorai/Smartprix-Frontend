"use client";

import {
  Smartphone,
  MonitorSmartphone,
  HardDrive,
  FoldVertical,
  Camera,
  CalendarClock,
  Sparkles,
} from "lucide-react";

interface PopularFeaturesProps {
  onFeatureChange?: (feature: string) => void;
}

const features = [
  {
    name: "5G Mobiles",
    icon: Smartphone,
  },
  {
    name: "Android Phones",
    icon: MonitorSmartphone,
  },
  {
    name: "256GB Storage",
    icon: HardDrive,
  },
  {
    name: "Foldable Phones",
    icon: FoldVertical,
  },
  {
    name: "Best Camera",
    icon: Camera,
  },
  {
    name: "Upcoming Mobiles",
    icon: CalendarClock,
  },
  {
    name: "Latest Mobiles",
    icon: Sparkles,
  },
];

export default function PopularFeatures({
  onFeatureChange,
}: PopularFeaturesProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5 sm:px-5">
        <div className="flex items-center gap-2">
          <span className="h-4 w-1 rounded-full bg-gradient-to-b from-violet-500 to-fuchsia-500" />

          <h2 className="text-[16px] font-extrabold tracking-tight text-slate-900 sm:text-[17px]">
            Most Searched Features
          </h2>
        </div>

        <span className="hidden rounded-full bg-violet-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-violet-600 sm:block">
          Explore
        </span>
      </div>

      {/* Features */}
      <div className="grid grid-cols-2 gap-2 p-2.5 sm:grid-cols-4 sm:gap-2.5 sm:p-3 lg:grid-cols-7">
        {features.map((feature) => {
          const Icon = feature.icon;

          return (
            <button
              key={feature.name}
              type="button"
              onClick={() =>
                onFeatureChange?.(feature.name)
              }
              className="group flex min-w-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50/40 hover:shadow-md"
            >
              {/* Icon */}
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600 transition-colors group-hover:bg-violet-100">
                <Icon className="h-4 w-4" strokeWidth={2.2} />
              </span>

              {/* Text */}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[10px] font-bold leading-tight text-slate-800 sm:text-[11px]">
                  {feature.name}
                </span>

                <span className="mt-0.5 block text-[9px] font-semibold text-violet-600">
                  Explore →
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}