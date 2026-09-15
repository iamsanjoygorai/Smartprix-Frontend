"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bike,
  Camera,
  CarFront,
  Cpu,
  Gamepad2,
  Headphones,
  Laptop,
  PlugZap,
  Refrigerator,
  Smartphone,
  Tv,
  Watch,
} from "lucide-react";

interface CategoryItem {
  name: string;
  href: string;
  icon: React.ComponentType<{
    className?: string;
    strokeWidth?: number;
  }>;
  color: string;
  iconColor: string;
  hoverColor: string;
}

const categories: CategoryItem[] = [
  {
    name: "Mobiles",
    href: "/mobiles",
    icon: Smartphone,
    color: "bg-blue-50",
    iconColor: "text-blue-600",
    hoverColor: "hover:border-blue-200 hover:bg-blue-50/70",
  },
  {
    name: "Laptops",
    href: "/products?category=laptop",
    icon: Laptop,
    color: "bg-violet-50",
    iconColor: "text-violet-600",
    hoverColor: "hover:border-violet-200 hover:bg-violet-50/70",
  },
  {
    name: "Cameras",
    href: "/products?category=camera",
    icon: Camera,
    color: "bg-pink-50",
    iconColor: "text-pink-600",
    hoverColor: "hover:border-pink-200 hover:bg-pink-50/70",
  },
  {
    name: "TVs",
    href: "/products?category=tv",
    icon: Tv,
    color: "bg-cyan-50",
    iconColor: "text-cyan-600",
    hoverColor: "hover:border-cyan-200 hover:bg-cyan-50/70",
  },
  {
    name: "Wearables",
    href: "/products?category=wearables",
    icon: Watch,
    color: "bg-emerald-50",
    iconColor: "text-emerald-600",
    hoverColor: "hover:border-emerald-200 hover:bg-emerald-50/70",
  },
  {
    name: "Audio",
    href: "/products?category=audio",
    icon: Headphones,
    color: "bg-orange-50",
    iconColor: "text-orange-600",
    hoverColor: "hover:border-orange-200 hover:bg-orange-50/70",
  },
  {
    name: "Cars",
    href: "/cars",
    icon: CarFront,
    color: "bg-red-50",
    iconColor: "text-red-600",
    hoverColor: "hover:border-red-200 hover:bg-red-50/70",
  },
  {
    name: "Motorcycles",
    href: "/motorcycles",
    icon: Bike,
    color: "bg-amber-50",
    iconColor: "text-amber-600",
    hoverColor: "hover:border-amber-200 hover:bg-amber-50/70",
  },
  {
    name: "Appliances",
    href: "/appliances",
    icon: Refrigerator,
    color: "bg-teal-50",
    iconColor: "text-teal-600",
    hoverColor: "hover:border-teal-200 hover:bg-teal-50/70",
  },
  {
    name: "Computers",
    href: "/products?category=computer",
    icon: Cpu,
    color: "bg-indigo-50",
    iconColor: "text-indigo-600",
    hoverColor: "hover:border-indigo-200 hover:bg-indigo-50/70",
  },
  {
    name: "Gaming",
    href: "/products?category=gaming",
    icon: Gamepad2,
    color: "bg-fuchsia-50",
    iconColor: "text-fuchsia-600",
    hoverColor: "hover:border-fuchsia-200 hover:bg-fuchsia-50/70",
  },
  {
    name: "Accessories",
    href: "/accessories",
    icon: PlugZap,
    color: "bg-lime-50",
    iconColor: "text-lime-600",
    hoverColor: "hover:border-lime-200 hover:bg-lime-50/70",
  },
];

export default function CategoryExplorer() {
  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-500" />

            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-blue-600">
              Explore
            </p>
          </div>

          <h2 className="mt-1 text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
            Explore Categories
          </h2>
        </div>

        <span className="hidden text-xs font-semibold text-slate-400 sm:block">
          Everything you need in one place
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12">
        {categories.map(
          ({
            name,
            href,
            icon: Icon,
            color,
            iconColor,
            hoverColor,
          }) => (
            <Link
              key={name}
              href={href}
              className={`group relative flex min-h-[105px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-white px-2 py-3 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${hoverColor}`}
            >
              <div
                className={`absolute -right-5 -top-5 h-14 w-14 rounded-full opacity-0 transition-all duration-300 group-hover:scale-150 group-hover:opacity-60 ${color}`}
              />

              <div
                className={`relative flex h-10 w-10 items-center justify-center rounded-xl ${color} ${iconColor} transition-transform duration-300 group-hover:scale-110`}
              >
                <Icon
                  className="h-5 w-5"
                  strokeWidth={2}
                />
              </div>

              <span className="relative mt-2.5 text-[11px] font-extrabold text-slate-700 transition-colors group-hover:text-slate-900">
                {name}
              </span>

              <ArrowRight
                className={`relative mt-1 h-3 w-3 ${iconColor} opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100`}
              />
            </Link>
          ),
        )}
      </div>
    </section>
  );
}