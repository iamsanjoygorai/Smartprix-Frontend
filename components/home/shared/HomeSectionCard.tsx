"use client";

import type { ReactNode } from "react";

type Accent =
  | "blue"
  | "violet"
  | "emerald"
  | "orange"
  | "amber"
  | "pink";

interface HomeSectionCardProps {
  children: ReactNode;
  accent?: Accent;
  className?: string;
}

const accentStyles: Record<
  Accent,
  {
    border: string;
    glow: string;
  }
> = {
  blue: {
    border: "hover:border-blue-200",
    glow: "bg-blue-100/40",
  },
  violet: {
    border: "hover:border-violet-200",
    glow: "bg-violet-100/40",
  },
  emerald: {
    border: "hover:border-emerald-200",
    glow: "bg-emerald-100/40",
  },
  orange: {
    border: "hover:border-orange-200",
    glow: "bg-orange-100/40",
  },
  amber: {
    border: "hover:border-amber-200",
    glow: "bg-amber-100/40",
  },
  pink: {
    border: "hover:border-pink-200",
    glow: "bg-pink-100/40",
  },
};

export default function HomeSectionCard({
  children,
  accent = "blue",
  className = "",
}: HomeSectionCardProps) {
  const styles = accentStyles[accent];

  return (
    <section
      className={`group relative overflow-hidden rounded-[24px] border border-slate-200/80 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-md sm:p-5 ${styles.border} ${className}`}
    >
      <div
        className={`pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100 ${styles.glow}`}
      />

      <div className="relative">
        {children}
      </div>
    </section>
  );
}