"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bike,
  CalendarClock,
  CarFront,
  Laptop,
  Smartphone,
} from "lucide-react";

interface UpcomingCategory {
  name: string;
  href: string;
  icon: React.ComponentType<{
    className?: string;
    strokeWidth?: number;
  }>;
  description: string;
  tone: "blue" | "violet" | "emerald";
}

const upcomingCategories: UpcomingCategory[] = [
  {
    name: "Upcoming Phones",
    href: "/mobiles?filter=upcoming",
    icon: Smartphone,
    description: "Phones launching soon",
    tone: "blue",
  },
  {
    name: "Upcoming Laptops",
    href: "/products?category=laptop&filter=upcoming",
    icon: Laptop,
    description: "New laptops to watch",
    tone: "violet",
  },
  {
    name: "Upcoming Cars",
    href: "/cars?filter=upcoming",
    icon: CarFront,
    description: "Cars launching soon",
    tone: "emerald",
  },
];

const toneStyles = {
  blue: {
    icon: "bg-blue-50 text-blue-600 group-hover:bg-blue-100",
    label: "text-blue-600",
    border: "hover:border-blue-200",
  },
  violet: {
    icon: "bg-violet-50 text-violet-600 group-hover:bg-violet-100",
    label: "text-violet-600",
    border: "hover:border-violet-200",
  },
  emerald: {
    icon: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100",
    label: "text-emerald-600",
    border: "hover:border-emerald-200",
  },
};

export default function UpcomingSection() {
  return (
    <section className="w-full">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <CalendarClock
              className="h-5 w-5"
              strokeWidth={2}
            />
          </div>

          <div className="min-w-0">
            <p className="mb-0.5 text-[11px] font-bold uppercase tracking-[0.15em] text-amber-600">
              Coming Soon
            </p>

            <h2 className="truncate text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
              Upcoming
            </h2>
          </div>
        </div>

        <span className="hidden items-center gap-1.5 text-xs font-semibold text-slate-400 sm:flex">
          <CalendarClock className="h-3.5 w-3.5" />
          Stay ahead
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {upcomingCategories.map(
          ({
            name,
            href,
            icon: Icon,
            description,
            tone,
          }) => {
            const styles = toneStyles[tone];

            return (
              <Link
                key={name}
                href={href}
                className={`group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${styles.border}`}
              >
                <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-slate-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="relative flex items-center justify-between">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors ${styles.icon}`}
                  >
                    <Icon
                      className="h-5 w-5"
                      strokeWidth={2}
                    />
                  </div>

                  <ArrowRight className="h-4 w-4 text-slate-300 transition-all duration-200 group-hover:translate-x-1 group-hover:text-slate-500" />
                </div>

                <div className="relative mt-5">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-[0.14em] ${styles.label}`}
                  >
                    Coming Soon
                  </span>

                  <h3 className="mt-1.5 text-base font-extrabold text-slate-900">
                    {name}
                  </h3>

                  <p className="mt-1 text-xs font-medium text-slate-400">
                    {description}
                  </p>
                </div>
              </Link>
            );
          },
        )}
      </div>
    </section>
  );
}