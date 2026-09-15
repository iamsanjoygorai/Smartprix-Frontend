"use client";

import {
  ArrowRight,
  GitCompareArrows,
  Smartphone,
} from "lucide-react";
import Link from "next/link";

import type { Product } from "@/types/product";

import ComparePhones from "./ComparePhones";

interface CompareSectionProps {
  products: Product[];
}

export default function CompareSection({
  products,
}: CompareSectionProps) {
  return (
    <section className="overflow-hidden rounded-[26px] border border-cyan-100 bg-gradient-to-br from-cyan-50 via-white to-violet-50 shadow-sm">
      {/* Section header */}
      <div className="border-b border-cyan-100/70 p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700 shadow-sm">
              <GitCompareArrows
                className="h-5 w-5"
                strokeWidth={2.3}
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-slate-900 sm:text-xl">
                  Compare Smartphones
                </h2>

                <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-wide text-violet-600">
                  Popular
                </span>
              </div>

              <p className="mt-0.5 text-xs font-medium text-slate-500">
                Compare specifications, prices and features
                side-by-side.
              </p>
            </div>
          </div>

          <Link
            href="/compare"
            className="group inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-200 bg-white px-3.5 py-2 text-xs font-extrabold text-cyan-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-cyan-300 hover:bg-cyan-50 hover:shadow-md"
          >
            Open Full Comparison

            <ArrowRight
              className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
              strokeWidth={2.5}
            />
          </Link>
        </div>
      </div>

      {/* Compact phone selector */}
      <div className="p-3 sm:p-4">
        {products.length > 0 ? (
          <ComparePhones products={products} />
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 px-5 py-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Smartphone
                className="h-6 w-6"
                strokeWidth={2}
              />
            </div>

            <h3 className="mt-3 text-sm font-black text-slate-700">
              Smartphones are loading
            </h3>

            <p className="mt-1 text-xs font-medium text-slate-400">
              Please wait while the latest phones are
              loaded.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
