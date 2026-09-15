"use client";

import Link from "next/link";
import {
  ArrowRight,
  BatteryCharging,
  Cable,
  Gamepad2,
  Headphones,
  MoreHorizontal,
  Power,
  Watch,
} from "lucide-react";

interface GadgetCategory {
  name: string;
  href: string;
  icon: React.ComponentType<{
    className?: string;
    strokeWidth?: number;
  }>;
  description: string;
}

const gadgetCategories: GadgetCategory[] = [
  {
    name: "Earbuds",
    href: "/products?category=earbuds",
    icon: Headphones,
    description: "Wireless audio",
  },
  {
    name: "Smartwatches",
    href: "/products?category=smartwatch",
    icon: Watch,
    description: "Wearable tech",
  },
  {
    name: "Gaming",
    href: "/products?category=gaming",
    icon: Gamepad2,
    description: "Gaming gear",
  },
  {
    name: "Chargers",
    href: "/products?category=chargers",
    icon: Cable,
    description: "Fast charging",
  },
  {
    name: "Power Banks",
    href: "/products?category=power-bank",
    icon: BatteryCharging,
    description: "Portable power",
  },
  {
    name: "Accessories",
    href: "/accessories",
    icon: Power,
    description: "More essentials",
  },
];

export default function GadgetCategories() {
  return (
    <section className="w-full">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <Headphones
              className="h-5 w-5"
              strokeWidth={2}
            />
          </div>

          <div className="min-w-0">
            <p className="mb-0.5 text-[11px] font-bold uppercase tracking-[0.15em] text-violet-600">
              Explore
            </p>

            <h2 className="truncate text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
              Gadgets & Accessories
            </h2>
          </div>
        </div>

        <Link
          href="/accessories"
          className="group hidden shrink-0 items-center gap-1.5 text-sm font-bold text-violet-600 sm:flex"
        >
          View All

          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
        {gadgetCategories.map(
          ({
            name,
            href,
            icon: Icon,
            description,
          }) => (
            <Link
              key={name}
              href={href}
              className="group rounded-2xl border border-slate-200/80 bg-white p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-600 transition-colors group-hover:bg-violet-50 group-hover:text-violet-600">
                  <Icon
                    className="h-4.5 w-4.5"
                    strokeWidth={2}
                  />
                </div>

                <ArrowRight className="h-3.5 w-3.5 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-violet-500" />
              </div>

              <h3 className="mt-3 text-sm font-extrabold text-slate-900">
                {name}
              </h3>

              <p className="mt-0.5 text-[11px] font-medium text-slate-400">
                {description}
              </p>
            </Link>
          ),
        )}
      </div>

      <Link
        href="/accessories"
        className="mt-3 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-violet-600 transition hover:border-violet-200 hover:bg-violet-50 sm:hidden"
      >
        <MoreHorizontal className="h-4 w-4" />
        View All Gadgets
      </Link>
    </section>
  );
}