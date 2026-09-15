"use client";

import {
  BarChart3,
  Medal,
  Package,
  Trophy,
} from "lucide-react";

import type {
  AnalyticsTopProducts,
} from "@/lib/api/analytics";

/* =========================================================
   TYPES
========================================================= */

interface AnalyticsTopProductsProps {
  data: AnalyticsTopProducts;
}

/* =========================================================
   HELPERS
========================================================= */

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-IN").format(value);
}

/* =========================================================
   RANK ICON
========================================================= */

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 ring-1 ring-amber-100">
        <Trophy
          className="h-4.5 w-4.5"
          strokeWidth={2}
        />
      </div>
    );
  }

  if (rank === 2) {
    return (
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 ring-1 ring-slate-200">
        <Medal
          className="h-4.5 w-4.5"
          strokeWidth={2}
        />
      </div>
    );
  }

  if (rank === 3) {
    return (
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-600 ring-1 ring-orange-100">
        <Medal
          className="h-4.5 w-4.5"
          strokeWidth={2}
        />
      </div>
    );
  }

  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-400 ring-1 ring-slate-200">
      <span className="text-xs font-bold">
        {rank}
      </span>
    </div>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState() {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm ring-1 ring-slate-200">
        <Package
          className="h-5 w-5"
          strokeWidth={2}
        />
      </div>

      <p className="mt-3 text-sm font-semibold text-slate-600">
        No product activity yet
      </p>

      <p className="mt-1 max-w-xs text-xs leading-5 text-slate-400">
        Product engagement data will appear here
        once users start viewing products.
      </p>
    </div>
  );
}

/* =========================================================
   PRODUCT ROW
========================================================= */

function ProductRow({
  rank,
  productName,
  slug,
  eventCount,
  maxEventCount,
}: {
  rank: number;
  productName: string;
  slug: string;
  eventCount: number;
  maxEventCount: number;
}) {
  const percentage =
    maxEventCount > 0
      ? Math.max(
          (eventCount / maxEventCount) * 100,
          4,
        )
      : 0;

  return (
    <div className="group rounded-xl border border-slate-100 bg-white p-3 transition-all duration-200 hover:border-slate-200 hover:shadow-sm">
      <div className="flex items-center gap-3">
        <RankIcon rank={rank} />

        <div className="min-w-0 flex-1">
          <p
            className="truncate text-sm font-semibold text-slate-800"
            title={productName}
          >
            {productName}
          </p>

          <p
            className="mt-0.5 truncate text-[11px] text-slate-400"
            title={slug}
          >
            {slug}
          </p>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-sm font-bold text-slate-800">
            {formatNumber(eventCount)}
          </p>

          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
            Views
          </p>
        </div>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function AnalyticsTopProducts({
  data,
}: AnalyticsTopProductsProps) {
  const products = data.products;

  const maxEventCount =
    products.length > 0
      ? Math.max(
          ...products.map(
            (product) => product.eventCount,
          ),
          1,
        )
      : 0;

  return (
    <section
      aria-labelledby="analytics-top-products-heading"
      className="mb-6"
    >
      <div className="mb-3 flex items-center gap-2">
        <BarChart3
          className="h-4 w-4 text-slate-400"
          strokeWidth={2}
        />

        <h2
          id="analytics-top-products-heading"
          className="text-sm font-bold uppercase tracking-wider text-slate-500"
        >
          Top Products
        </h2>
      </div>

      <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 p-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 ring-1 ring-violet-100">
              <Package
                className="h-5 w-5"
                strokeWidth={2}
              />
            </div>

            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900">
                Most Viewed Products
              </h3>

              <p className="mt-0.5 text-xs text-slate-400">
                Product engagement • {data.range}
              </p>
            </div>
          </div>

          <div className="shrink-0 text-right">
            <p className="text-xl font-bold tracking-tight text-slate-900">
              {formatNumber(data.totalEvents)}
            </p>

            <p className="text-[11px] font-medium text-slate-400">
              Total events
            </p>
          </div>
        </div>

        <div className="p-5">
          {products.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {products.map((product, index) => (
                <ProductRow
                  key={product.productId}
                  rank={index + 1}
                  productName={product.productName}
                  slug={product.slug}
                  eventCount={product.eventCount}
                  maxEventCount={maxEventCount}
                />
              ))}
            </div>
          )}
        </div>
      </article>
    </section>
  );
}