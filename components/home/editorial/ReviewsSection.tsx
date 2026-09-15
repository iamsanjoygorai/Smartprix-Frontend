"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  GitCompareArrows,
  Star,
} from "lucide-react";

interface EditorialCategory {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{
    className?: string;
    strokeWidth?: number;
  }>;
  tone: "amber" | "blue" | "violet";
}

const editorialCategories: EditorialCategory[] = [
  {
    title: "Reviews",
    description: "Detailed hands-on reviews",
    href: "/news?category=reviews",
    icon: Star,
    tone: "amber",
  },
  {
    title: "Comparisons",
    description: "Compare before you buy",
    href: "/news?category=comparisons",
    icon: GitCompareArrows,
    tone: "blue",
  },
  {
    title: "Buying Guides",
    description: "Smart picks for every budget",
    href: "/news?category=buying-guides",
    icon: BookOpenCheck,
    tone: "violet",
  },
];

const toneStyles = {
  amber: {
    icon: "bg-amber-50 text-amber-600 group-hover:bg-amber-100",
    border: "hover:border-amber-200",
    arrow: "group-hover:text-amber-500",
  },
  blue: {
    icon: "bg-blue-50 text-blue-600 group-hover:bg-blue-100",
    border: "hover:border-blue-200",
    arrow: "group-hover:text-blue-500",
  },
  violet: {
    icon: "bg-violet-50 text-violet-600 group-hover:bg-violet-100",
    border: "hover:border-violet-200",
    arrow: "group-hover:text-violet-500",
  },
};

export default function ReviewsSection() {
  return (
    <section className="w-full">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Star
              className="h-5 w-5"
              strokeWidth={2}
            />
          </div>

          <div className="min-w-0">
            <p className="mb-0.5 text-[11px] font-bold uppercase tracking-[0.15em] text-amber-600">
              Expert Picks
            </p>

            <h2 className="truncate text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
              Reviews & Buying Guides
            </h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {editorialCategories.map(
          ({
            title,
            description,
            href,
            icon: Icon,
            tone,
          }) => {
            const styles = toneStyles[tone];

            return (
              <Link
                key={title}
                href={href}
                className={`group rounded-2xl border border-slate-200/80 bg-white p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${styles.border}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors ${styles.icon}`}
                  >
                    <Icon
                      className="h-5 w-5"
                      strokeWidth={2}
                    />
                  </div>

                  <ArrowRight
                    className={`h-4 w-4 text-slate-300 transition-all duration-200 group-hover:translate-x-1 ${styles.arrow}`}
                  />
                </div>

                <h3 className="mt-5 text-base font-extrabold text-slate-900">
                  {title}
                </h3>

                <p className="mt-1 text-xs font-medium text-slate-400">
                  {description}
                </p>
              </Link>
            );
          },
        )}
      </div>
    </section>
  );
}