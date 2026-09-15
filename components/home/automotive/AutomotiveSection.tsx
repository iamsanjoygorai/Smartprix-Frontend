"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bike,
  CarFront,
  Gauge,
  Sparkles,
} from "lucide-react";

interface AutomotiveCategory {
  name: string;
  href: string;
  icon: React.ComponentType<{
    className?: string;
    strokeWidth?: number;
  }>;
  description: string;
}

const automotiveCategories: AutomotiveCategory[] = [
  {
    name: "Cars",
    href: "/cars",
    icon: CarFront,
    description: "Explore new cars",
  },
  {
    name: "Motorcycles",
    href: "/motorcycles",
    icon: Bike,
    description: "Discover new bikes",
  },
  {
    name: "New Launches",
    href: "/cars?filter=new",
    icon: Sparkles,
    description: "Latest launches",
  },
  {
    name: "Performance",
    href: "/cars?filter=performance",
    icon: Gauge,
    description: "Performance machines",
  },
];

export default function AutomotiveSection() {
  return (
    <section className="w-full">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <CarFront
              className="h-5 w-5"
              strokeWidth={2}
            />
          </div>

          <div className="min-w-0">
            <p className="mb-0.5 text-[11px] font-bold uppercase tracking-[0.15em] text-emerald-600">
              Explore
            </p>

            <h2 className="truncate text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
              Cars & Motorcycles
            </h2>
          </div>
        </div>

        <Link
          href="/cars"
          className="group hidden shrink-0 items-center gap-1.5 text-sm font-bold text-emerald-600 sm:flex"
        >
          View All
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {automotiveCategories.map(
          ({
            name,
            href,
            icon: Icon,
            description,
          }) => (
            <Link
              key={name}
              href={href}
              className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 transition-all duration-200 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg"
            >
              <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-emerald-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <div className="relative flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-600 transition-colors group-hover:bg-emerald-50 group-hover:text-emerald-600">
                  <Icon
                    className="h-5 w-5"
                    strokeWidth={2}
                  />
                </div>

                <ArrowRight className="h-4 w-4 text-slate-300 transition-all duration-200 group-hover:translate-x-1 group-hover:text-emerald-500" />
              </div>

              <h3 className="relative mt-4 text-sm font-extrabold text-slate-900">
                {name}
              </h3>

              <p className="relative mt-1 text-[11px] font-medium text-slate-400">
                {description}
              </p>
            </Link>
          ),
        )}
      </div>

      <Link
        href="/cars"
        className="mt-3 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-emerald-600 transition hover:border-emerald-200 hover:bg-emerald-50 sm:hidden"
      >
        View All Cars
        <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  );
}