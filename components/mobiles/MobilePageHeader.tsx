"use client";

import { useState } from "react";

export default function MobilePageHeader() {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Main header */}
      <div className="relative overflow-hidden px-5 py-5 sm:px-6 sm:py-6">
        {/* Decorative background */}
        <div className="pointer-events-none absolute -right-16 -top-20 h-44 w-44 rounded-full bg-indigo-50" />
        <div className="pointer-events-none absolute -bottom-20 right-20 h-32 w-32 rounded-full bg-purple-50" />

        <div className="relative">
          {/* Eyebrow */}
          <div className="mb-2 flex items-center gap-2">
            <span className="h-1.5 w-7 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
            <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-indigo-500">
              Smartphones
            </span>
          </div>

          {/* Title */}
          <h1 className="text-[25px] font-black leading-tight tracking-tight text-slate-900 sm:text-[30px]">
            Mobile Phones Price List
          </h1>

          {/* Description */}
          <div
            className={`mt-2 max-w-4xl text-[13px] leading-6 text-slate-500 transition-all ${
              expanded ? "" : "line-clamp-2"
            }`}
          >
            Discover the complete list of mobile phones in India with latest
            prices, full specifications, specs score, and user ratings.
            Compare phones side-by-side, track price drops, and explore
            historical pricing trends.
          </div>

          {/* Read more */}
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="mt-1 text-[11px] font-bold text-indigo-600 transition-colors hover:text-purple-600"
          >
            {expanded ? "Read Less ↑" : "Read More →"}
          </button>
        </div>
      </div>

      {/* Action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/70 px-4 py-2.5 sm:px-5">
        <span className="hidden text-[10px] font-semibold uppercase tracking-wider text-slate-400 sm:block">
          Share your experience
        </span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            className="group flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold text-slate-500 transition-all hover:bg-pink-50 hover:text-pink-500"
          >
            <span className="text-[18px] leading-none transition-transform group-hover:scale-110">
              ♡
            </span>
            Like
          </button>

          <button
            type="button"
            className="group flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold text-slate-500 transition-all hover:bg-indigo-50 hover:text-indigo-500"
          >
            <span className="text-[15px] leading-none transition-transform group-hover:scale-110">
              ▣
            </span>
            Comment
          </button>

          <button
            type="button"
            className="group flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold text-slate-500 transition-all hover:bg-purple-50 hover:text-purple-500"
          >
            <span className="text-[17px] leading-none transition-transform group-hover:scale-110">
              ♧
            </span>
            Share
          </button>
        </div>
      </div>
    </section>

    </>

  );
}