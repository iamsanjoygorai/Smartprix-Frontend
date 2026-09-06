"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  getAdminDashboard,
  type AdminDashboard,
} from "@/lib/api/admin";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] =
    useState<AdminDashboard | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getAdminDashboard();

        if (!response.success || !response.data) {
          throw new Error(
            response.message || "Failed to load dashboard",
          );
        }

        setDashboard(response.data);
      } catch (error) {
        console.error(error);

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load dashboard",
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-sm text-gray-500">
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="font-semibold text-red-800">
          Unable to load dashboard
        </h2>

        <p className="mt-1 text-sm text-red-600">
          {error || "No dashboard data available."}
        </p>

        <button
          onClick={() => window.location.reload()}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const {
    overview,
    recentProducts,
    recentNews,
    contentHealth,
  } = dashboard;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Dashboard
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage your Smartprix platform.
          </p>
        </div>

       <button className="flex items-center gap-3 rounded-lg border bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-xs font-semibold text-white">
    {(adminUser?.name || "Admin")
      .charAt(0)
      .toUpperCase()}
  </span>

  <span className="text-left">
    <span className="block font-medium text-gray-900">
      {adminUser?.name || "Admin"}
    </span>

    <span className="block text-xs text-gray-500">
      {adminUser?.role || "ADMIN"}
    </span>
  </span>

  <span className="text-xs text-gray-400">▼</span>
</button>
      </div>

      {/* Overview */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Overview
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <OverviewCard
            title="Products"
            value={overview.products}
            href="/admin/products"
          />

          <OverviewCard
            title="News"
            value={overview.news}
            href="/admin/news"
          />

          <OverviewCard
            title="Users"
            value={overview.users}
          />

          <OverviewCard
            title="Brands"
            value={overview.brands}
          />
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Quick Actions
        </h2>

        <div className="flex flex-wrap gap-3">
          <QuickAction
            href="/admin/products/new"
            label="+ Product"
          />

          <QuickAction
            href="/admin/news/new"
            label="+ News"
          />

          <QuickAction
            href="/admin/products"
            label="Products"
          />

          <QuickAction
            href="/admin/news"
            label="News"
          />
        </div>
      </section>

      {/* Activity + Health */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <section className="rounded-xl border bg-white shadow-sm">
          <div className="border-b px-5 py-4">
            <h2 className="font-semibold text-gray-900">
              Recent Activity
            </h2>
          </div>

          <div className="divide-y">
            {recentProducts.slice(0, 3).map((product) => (
              <div
                key={`product-${product.id}`}
                className="flex items-center justify-between px-5 py-4"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Product added
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {product.name}
                  </p>
                </div>

                <span className="text-xs text-gray-400">
                  {formatDate(product.createdAt)}
                </span>
              </div>
            ))}

            {recentNews.slice(0, 3).map((news) => (
              <div
                key={`news-${news.id}`}
                className="flex items-center justify-between px-5 py-4"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    News created
                  </p>

                  <p className="mt-1 max-w-xs truncate text-xs text-gray-500">
                    {news.title}
                  </p>
                </div>

                <span className="text-xs text-gray-400">
                  {formatDate(news.createdAt)}
                </span>
              </div>
            ))}

            {recentProducts.length === 0 &&
              recentNews.length === 0 && (
                <div className="px-5 py-8 text-center text-sm text-gray-500">
                  No recent activity.
                </div>
              )}
          </div>
        </section>

        {/* Content Health */}
        <section className="rounded-xl border bg-white shadow-sm">
          <div className="border-b px-5 py-4">
            <h2 className="font-semibold text-gray-900">
              Content Health
            </h2>
          </div>

          <div className="divide-y">
            <HealthRow
              label="Missing images"
              value={contentHealth.missingImages}
              href="/admin/products"
            />

            <HealthRow
              label="Missing prices"
              value={contentHealth.missingPrices}
              href="/admin/products"
            />

            <HealthRow
              label="Missing specs"
              value={contentHealth.missingSpecifications}
              href="/admin/products"
            />

            <HealthRow
              label="Draft articles"
              value={contentHealth.draftArticles}
              href="/admin/news"
            />
          </div>
        </section>
      </div>

      {/* Recent Products */}
      <section className="rounded-xl border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="font-semibold text-gray-900">
            Recent Products
          </h2>

          <Link
            href="/admin/products"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View all
          </Link>
        </div>

        <div className="divide-y">
          {recentProducts.map((product) => (
            <Link
              key={product.id}
              href={`/admin/products/${product.id}`}
              className="flex items-center justify-between px-5 py-4 hover:bg-gray-50"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border bg-gray-50">
                  {product.images[0]?.url ? (
                    <img
                      src={product.images[0].url}
                      alt={product.name}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-gray-400">
                      No image
                    </span>
                  )}
                </div>

                <div>
                  <p className="font-medium text-gray-900">
                    {product.name}
                  </p>

                  <p className="text-xs text-gray-500">
                    {product.brand.name}
                  </p>
                </div>
              </div>

              <div className="text-right">
                {product.prices[0] ? (
                  <p className="font-medium text-gray-900">
                    ₹
                    {formatPrice(
                      product.prices[0].amount,
                    )}
                  </p>
                ) : (
                  <p className="text-xs text-gray-400">
                    No price
                  </p>
                )}

                <p className="mt-1 text-xs text-gray-400">
                  {formatDate(product.createdAt)}
                </p>
              </div>
            </Link>
          ))}

          {recentProducts.length === 0 && (
            <div className="px-5 py-8 text-center text-sm text-gray-500">
              No products found.
            </div>
          )}
        </div>
      </section>

      {/* Recent News */}
      <section className="rounded-xl border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="font-semibold text-gray-900">
            Recent News
          </h2>

          <Link
            href="/admin/news"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View all
          </Link>
        </div>

        <div className="divide-y">
          {recentNews.map((news) => (
            <Link
              key={news.id}
              href={`/admin/news/${news.id}`}
              className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-gray-50"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-gray-900">
                  {news.title}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  {formatDate(news.createdAt)}
                </p>
              </div>

              <StatusBadge status={news.status} />
            </Link>
          ))}

          {recentNews.length === 0 && (
            <div className="px-5 py-8 text-center text-sm text-gray-500">
              No news found.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

/* ───────────────────────────────────────────── */
/* Components */
/* ───────────────────────────────────────────── */

function OverviewCard({
  title,
  value,
  href,
}: {
  title: string;
  value: number;
  href?: string;
}) {
  const content = (
    <div className="rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md">
      <p className="text-sm font-medium text-gray-500">
        {title}
      </p>

      <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
        {value.toLocaleString()}
      </p>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

function QuickAction({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-lg border bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
    >
      {label}
    </Link>
  );
}

function HealthRow({
  label,
  value,
  href,
}: {
  label: string;
  value: number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between px-5 py-4 hover:bg-gray-50"
    >
      <span className="text-sm text-gray-700">
        {label}
      </span>

      <span
        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
          value > 0
            ? "bg-red-50 text-red-600"
            : "bg-green-50 text-green-600"
        }`}
      >
        {value}
      </span>
    </Link>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const published =
    status.toUpperCase() === "PUBLISHED";

  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
        published
          ? "bg-green-50 text-green-700"
          : "bg-yellow-50 text-yellow-700"
      }`}
    >
      {status}
    </span>
  );
}

/* ───────────────────────────────────────────── */
/* Helpers */
/* ───────────────────────────────────────────── */

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function formatPrice(value: string | number) {
  return Number(value).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  });
}