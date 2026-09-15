"use client";

import {
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";

import { useCallback, useEffect, useState } from "react";

import {
  getAnalyticsActivity,
  getAnalyticsEngagement,
  getAnalyticsOverview,
  getAnalyticsProductGrowth,
  getAnalyticsProducts,
  getAnalyticsSearches,
  getAnalyticsTopProducts,
  getAnalyticsUserGrowth,
  getAnalyticsUsers,
  type AnalyticsActivity,
  type AnalyticsEngagement,
  type AnalyticsOverview,
  type AnalyticsProductGrowth,
  type AnalyticsProducts,
  type AnalyticsSearches,
  type AnalyticsTopProducts,
  type AnalyticsUserGrowth,
  type AnalyticsUsers,
} from "@/lib/api/analytics";

import AnalyticsActivityComponent from "./components/AnalyticsActivity";
import AnalyticsEngagementComponent from "./components/AnalyticsEngagement";
import AnalyticsGrowth from "./components/AnalyticsGrowth";
import AnalyticsHeader, {
  type AnalyticsRange,
} from "./components/AnalyticsHeader";
import AnalyticsOverviewCards from "./components/AnalyticsOverviewCards";
import AnalyticsSearchesComponent from "./components/AnalyticsSearches";
import AnalyticsTopProductsComponent from "./components/AnalyticsTopProducts";

/* =========================================================
   TYPES
========================================================= */

interface AnalyticsData {
  overview: AnalyticsOverview;
  users: AnalyticsUsers;
  userGrowth: AnalyticsUserGrowth;
  products: AnalyticsProducts;
  productGrowth: AnalyticsProductGrowth;
  topProducts: AnalyticsTopProducts;
  searches: AnalyticsSearches;
  engagement: AnalyticsEngagement;
  activity: AnalyticsActivity;
}

/* =========================================================
   LOADING STATE
========================================================= */

function AnalyticsLoadingState() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white"
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {[1, 2].map((item) => (
          <div
            key={item}
            className="h-[380px] animate-pulse rounded-2xl border border-slate-200 bg-white"
          />
        ))}
      </div>

      <div className="h-[350px] animate-pulse rounded-2xl border border-slate-200 bg-white" />
    </div>
  );
}

/* =========================================================
   ERROR STATE
========================================================= */

function AnalyticsErrorState({
  message,
  onRetry,
  isRetrying,
}: {
  message: string;
  onRetry: () => void;
  isRetrying: boolean;
}) {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-red-100 bg-white px-6 text-center shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500 ring-1 ring-red-100">
        <AlertCircle
          className="h-6 w-6"
          strokeWidth={2}
        />
      </div>

      <h2 className="mt-4 text-base font-bold text-slate-800">
        Unable to load analytics
      </h2>

      <p className="mt-1 max-w-md text-sm leading-6 text-slate-500">
        {message}
      </p>

      <button
        type="button"
        onClick={onRetry}
        disabled={isRetrying}
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isRetrying ? (
          <Loader2
            className="h-4 w-4 animate-spin"
            strokeWidth={2}
          />
        ) : (
          <RefreshCw
            className="h-4 w-4"
            strokeWidth={2}
          />
        )}

        Try again
      </button>
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function AnalyticsPage() {
  const [range, setRange] =
    useState<AnalyticsRange>(30);

  const [data, setData] =
    useState<AnalyticsData | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isRefreshing, setIsRefreshing] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  /* =======================================================
     FETCH ANALYTICS
  ======================================================= */

  const loadAnalytics = useCallback(
    async (selectedRange: AnalyticsRange) => {
      try {
        setError(null);

        const [
          overview,
          users,
          userGrowth,
          products,
          productGrowth,
          topProducts,
          searches,
          engagement,
          activity,
        ] = await Promise.all([
          getAnalyticsOverview(),
          getAnalyticsUsers(),
          getAnalyticsUserGrowth(
            selectedRange,
          ),
          getAnalyticsProducts(),
          getAnalyticsProductGrowth(
            selectedRange,
          ),
          getAnalyticsTopProducts(
            selectedRange,
          ),
          getAnalyticsSearches(
            selectedRange,
          ),
          getAnalyticsEngagement(
            selectedRange,
          ),
          getAnalyticsActivity(
            selectedRange,
          ),
        ]);

        setData({
          overview,
          users,
          userGrowth,
          products,
          productGrowth,
          topProducts,
          searches,
          engagement,
          activity,
        });
      } catch (requestError) {
        const message =
          requestError instanceof Error
            ? requestError.message
            : "Something went wrong while loading analytics.";

        setError(message);
      }
    },
    [],
  );

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setIsLoading(true);

      try {
        setError(null);

        const [
          overview,
          users,
          userGrowth,
          products,
          productGrowth,
          topProducts,
          searches,
          engagement,
          activity,
        ] = await Promise.all([
          getAnalyticsOverview(),
          getAnalyticsUsers(),
          getAnalyticsUserGrowth(range),
          getAnalyticsProducts(),
          getAnalyticsProductGrowth(range),
          getAnalyticsTopProducts(range),
          getAnalyticsSearches(range),
          getAnalyticsEngagement(range),
          getAnalyticsActivity(range),
        ]);

        if (!mounted) {
          return;
        }

        setData({
          overview,
          users,
          userGrowth,
          products,
          productGrowth,
          topProducts,
          searches,
          engagement,
          activity,
        });
      } catch (requestError) {
        if (!mounted) {
          return;
        }

        const message =
          requestError instanceof Error
            ? requestError.message
            : "Something went wrong while loading analytics.";

        setError(message);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [range]);

  /* =======================================================
     RANGE CHANGE
  ======================================================= */

  const handleRangeChange = useCallback(
    (nextRange: AnalyticsRange) => {
      if (nextRange === range) {
        return;
      }

      setRange(nextRange);
    },
    [range],
  );

  /* =======================================================
     REFRESH
  ======================================================= */

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);

    try {
      await loadAnalytics(range);
    } finally {
      setIsRefreshing(false);
    }
  }, [loadAnalytics, range]);

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8">
        {/* ===================================================
            HEADER
        =================================================== */}

        <AnalyticsHeader
          range={range}
          onRangeChange={handleRangeChange}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />

        {/* ===================================================
            CONTENT
        =================================================== */}

        <div className="mt-6">
          {isLoading ? (
            <AnalyticsLoadingState />
          ) : error && !data ? (
            <AnalyticsErrorState
              message={error}
              onRetry={handleRefresh}
              isRetrying={isRefreshing}
            />
          ) : data ? (
            <>
              {/* =============================================
                  OVERVIEW
              ============================================= */}

              <AnalyticsOverviewCards
                data={data.overview}
              />

              {/* =============================================
                  GROWTH
              ============================================= */}

              <AnalyticsGrowth
                users={data.userGrowth}
                products={data.productGrowth}
              />

              {/* =============================================
                  TOP PRODUCTS
              ============================================= */}

              <AnalyticsTopProductsComponent
                data={data.topProducts}
              />

              {/* =============================================
                  SEARCH + ENGAGEMENT
              ============================================= */}

              <div className="grid grid-cols-1 gap-0 xl:grid-cols-2 xl:gap-4">
                <AnalyticsSearchesComponent
                  data={data.searches}
                />

                <AnalyticsEngagementComponent
                  data={data.engagement}
                />
              </div>

              {/* =============================================
                  ACTIVITY
              ============================================= */}

              <AnalyticsActivityComponent
                data={data.activity}
              />

              {/* =============================================
                  SOFT ERROR
              ============================================= */}

              {error && (
                <div className="mb-6 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-700">
                  Some analytics data could not be
                  refreshed. Showing the latest
                  successfully loaded data.
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </main>
  );
}