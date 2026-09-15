"use client";

import Link from "next/link";
import {
  AirVent,
  ArrowRight,
  Microwave,
  Refrigerator,
  WashingMachine,
} from "lucide-react";

interface ApplianceCategory {
  name: string;
  href: string;
  icon: React.ComponentType<{
    className?: string;
    strokeWidth?: number;
  }>;
  description: string;
}

const applianceCategories: ApplianceCategory[] = [
  {
    name: "Air Conditioners",
    href: "/appliances?category=air-conditioner",
    icon: AirVent,
    description: "Cool your space",
  },
  {
    name: "Refrigerators",
    href: "/appliances?category=refrigerator",
    icon: Refrigerator,
    description: "Smart cooling",
  },
  {
    name: "Washing Machines",
    href: "/appliances?category=washing-machine",
    icon: WashingMachine,
    description: "Easy laundry",
  },
  {
    name: "Microwaves",
    href: "/appliances?category=microwave",
    icon: Microwave,
    description: "Quick cooking",
  },
];

export default function ApplianceSection() {
  return (
    <section className="w-full">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
            <AirVent
              className="h-5 w-5"
              strokeWidth={2}
            />
          </div>

          <div className="min-w-0">
            <p className="mb-0.5 text-[11px] font-bold uppercase tracking-[0.15em] text-orange-600">
              Discover
            </p>

            <h2 className="truncate text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
              Home Appliances
            </h2>
          </div>
        </div>

        <Link
          href="/appliances"
          className="group hidden shrink-0 items-center gap-1.5 text-sm font-bold text-orange-600 sm:flex"
        >
          View All
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {applianceCategories.map(
          ({
            name,
            href,
            icon: Icon,
            description,
          }) => (
            <Link
              key={name}
              href={href}
              className="group rounded-2xl border border-slate-200/80 bg-white p-4 transition-all duration-200 hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-600 transition-colors group-hover:bg-orange-50 group-hover:text-orange-600">
                  <Icon
                    className="h-5 w-5"
                    strokeWidth={2}
                  />
                </div>

                <ArrowRight className="h-4 w-4 text-slate-300 transition-all duration-200 group-hover:translate-x-1 group-hover:text-orange-500" />
              </div>

              <h3 className="mt-4 text-sm font-extrabold text-slate-900">
                {name}
              </h3>

              <p className="mt-1 text-[11px] font-medium text-slate-400">
                {description}
              </p>
            </Link>
          ),
        )}
      </div>

      <Link
        href="/appliances"
        className="mt-3 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-orange-600 transition hover:border-orange-200 hover:bg-orange-50 sm:hidden"
      >
        View All Appliances
        <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  );
}