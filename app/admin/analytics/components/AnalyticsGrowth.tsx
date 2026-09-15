"use client";

import { BarChart3, Package, Users } from "lucide-react";

import type {
  AnalyticsProductGrowth,
  AnalyticsUserGrowth,
} from "@/lib/api/analytics";

/* =========================================================
   TYPES
========================================================= */

interface AnalyticsGrowthProps {
  users: AnalyticsUserGrowth;
  products: AnalyticsProductGrowth;
}

interface GrowthChartProps {
  title: string;
  subtitle: string;
  icon: typeof Users;
  iconClassName: string;
  iconBackgroundClassName: string;
  gradientId: string;
  points: Array<{
    date: string;
    count: number;
  }>;
  total: number;
}

/* =========================================================
   HELPERS
========================================================= */

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-IN").format(value);
}

function formatDate(date: string): string {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
}

function buildChartPoints(
  points: Array<{
    date: string;
    count: number;
  }>,
  width: number,
  height: number,
  padding: number,
) {
  if (points.length === 0) {
    return [];
  }

  const maxValue = Math.max(
    ...points.map((point) => point.count),
    1,
  );

  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  return points.map((point, index) => {
    const x =
      points.length === 1
        ? width / 2
        : padding +
          (index / (points.length - 1)) *
            chartWidth;

    const y =
      height -
      padding -
      (point.count / maxValue) *
        chartHeight;

    return {
      ...point,
      x,
      y,
    };
  });
}

function createSmoothPath(
  points: Array<{
    x: number;
    y: number;
  }>,
): string {
  if (points.length === 0) {
    return "";
  }

  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y}`;
  }

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1];
    const current = points[index];

    const controlX =
      (previous.x + current.x) / 2;

    path +=
      ` C ${controlX} ${previous.y},` +
      ` ${controlX} ${current.y},` +
      ` ${current.x} ${current.y}`;
  }

  return path;
}

/* =========================================================
   EMPTY STATE
========================================================= */

function GrowthEmptyState() {
  return (
    <div className="flex h-[260px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm ring-1 ring-slate-200">
        <BarChart3
          className="h-5 w-5"
          strokeWidth={2}
        />
      </div>

      <p className="mt-3 text-sm font-semibold text-slate-600">
        No growth data available
      </p>

      <p className="mt-1 max-w-xs text-xs leading-5 text-slate-400">
        There is not enough activity in the selected
        period to display a growth trend.
      </p>
    </div>
  );
}

/* =========================================================
   GROWTH CHART
========================================================= */

function GrowthChart({
  title,
  subtitle,
  icon: Icon,
  iconClassName,
  iconBackgroundClassName,
  gradientId,
  points,
  total,
}: GrowthChartProps) {
  const width = 720;
  const height = 260;
  const padding = 32;

  const chartPoints = buildChartPoints(
    points,
    width,
    height,
    padding,
  );

  const linePath = createSmoothPath(chartPoints);

  const areaPath =
    chartPoints.length > 0
      ? `${linePath} L ${
          chartPoints[chartPoints.length - 1].x
        } ${height - padding} L ${
          chartPoints[0].x
        } ${height - padding} Z`
      : "";

  const maxValue = Math.max(
    ...points.map((point) => point.count),
    0,
  );

  const latestValue =
    points.length > 0
      ? points[points.length - 1].count
      : 0;

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex min-w-0 items-center justify-between gap-4 border-b border-slate-100 px-5 py-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBackgroundClassName}`}
          >
            <Icon
              className={`h-5 w-5 ${iconClassName}`}
              strokeWidth={2}
            />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-bold leading-5 text-slate-900">
              {title}
            </h3>

            <p className="mt-0.5 truncate text-xs leading-4 text-slate-400">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-xl font-bold tracking-tight text-slate-900">
            {formatNumber(total)}
          </p>

          <p className="text-[11px] font-medium text-slate-400">
            Total
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="p-5">
        {points.length === 0 ? (
          <GrowthEmptyState />
        ) : (
          <>
            <div className="relative overflow-hidden rounded-xl bg-slate-50/70">
              <svg
                viewBox={`0 0 ${width} ${height}`}
                className="h-[260px] w-full"
                role="img"
                aria-label={`${title} growth chart`}
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient
                    id={gradientId}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="currentColor"
                      stopOpacity="0.18"
                    />

                    <stop
                      offset="100%"
                      stopColor="currentColor"
                      stopOpacity="0"
                    />
                  </linearGradient>
                </defs>

                {/* Horizontal grid */}
                {[0, 1, 2, 3, 4].map((line) => {
                  const y =
                    padding +
                    (line / 4) *
                      (height - padding * 2);

                  return (
                    <line
                      key={line}
                      x1={padding}
                      y1={y}
                      x2={width - padding}
                      y2={y}
                      stroke="currentColor"
                      className="text-slate-200"
                      strokeWidth="1"
                      strokeDasharray="4 6"
                    />
                  );
                })}

                {/* Area */}
                <path
                  d={areaPath}
                  fill={`url(#${gradientId})`}
                  className="text-indigo-500"
                />

                {/* Line */}
                <path
                  d={linePath}
                  fill="none"
                  stroke="currentColor"
                  className="text-indigo-500"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data points */}
                {chartPoints.map((point, index) => (
                  <circle
                    key={`${point.date}-${index}`}
                    cx={point.x}
                    cy={point.y}
                    r="4"
                    fill="white"
                    stroke="currentColor"
                    className="text-indigo-500"
                    strokeWidth="2.5"
                  />
                ))}
              </svg>

              {/* Maximum value */}
              <div className="pointer-events-none absolute right-3 top-3 rounded-lg bg-white/90 px-2 py-1 text-[10px] font-semibold text-slate-500 shadow-sm ring-1 ring-slate-200">
                Peak: {formatNumber(maxValue)}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                  Latest
                </p>

                <p className="mt-0.5 text-sm font-bold text-slate-700">
                  {formatNumber(latestValue)}
                </p>
              </div>

              <div className="flex min-w-0 gap-1.5 overflow-hidden">
                {points.length > 0 && (
                  <>
                    <span className="shrink-0 text-[11px] text-slate-400">
                      {formatDate(points[0].date)}
                    </span>

                    {points.length > 2 && (
                      <span className="text-[11px] text-slate-300">
                        →
                      </span>
                    )}

                    {points.length > 1 && (
                      <span className="shrink-0 text-[11px] font-medium text-slate-500">
                        {formatDate(
                          points[points.length - 1].date,
                        )}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </article>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function AnalyticsGrowth({
  users,
  products,
}: AnalyticsGrowthProps) {
  return (
    <section
      aria-labelledby="analytics-growth-heading"
      className="mb-6"
    >
      {/* Section heading */}
      <div className="mb-4 flex min-w-0 items-center gap-2 px-0.5">
        <BarChart3
          className="h-4 w-4 shrink-0 text-slate-400"
          strokeWidth={2}
        />

        <h2
          id="analytics-growth-heading"
          className="whitespace-nowrap text-sm font-bold uppercase tracking-wider text-slate-500"
        >
          Growth Trends
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <GrowthChart
          title="User Growth"
          subtitle={`Registration trend • ${users.range}`}
          icon={Users}
          iconClassName="text-blue-600"
          iconBackgroundClassName="bg-blue-50 ring-1 ring-blue-100"
          gradientId="analytics-user-growth"
          points={users.series}
          total={users.total}
        />

        <GrowthChart
          title="Product Growth"
          subtitle={`Product creation trend • ${products.range}`}
          icon={Package}
          iconClassName="text-violet-600"
          iconBackgroundClassName="bg-violet-50 ring-1 ring-violet-100"
          gradientId="analytics-product-growth"
          points={products.series}
          total={products.total}
        />
      </div>
    </section>
  );
}