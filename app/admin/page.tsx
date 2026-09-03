import Link from "next/link";

import { getAdminStats } from "@/lib/api/admin";

export default async function AdminDashboard() {
  let stats = {
    products: 0,
    categories: 0,
    brands: 0,
    sellers: 0,
    users: 0,
  };

  try {
    const response = await getAdminStats();
    stats = response.data;
  } catch {
    // Keep dashboard usable if the API is temporarily unavailable.
  }

  const statCards = [
    {
      title: "Products",
      value: stats.products,
      description: "Total products",
      href: "/admin/products",
    },
    {
      title: "Categories",
      value: stats.categories,
      description: "Product categories",
      href: "/admin/categories",
    },
    {
      title: "Brands",
      value: stats.brands,
      description: "Registered brands",
      href: "/admin/brands",
    },
    {
      title: "Sellers",
      value: stats.sellers,
      description: "Active sellers",
      href: "/admin/sellers",
    },
  ];

  const quickActions = [
    {
      title: "Manage Products",
      description: "Add, edit, delete and restore products.",
      href: "/admin/products",
    },
    {
      title: "Manage Categories",
      description: "Control product categories and slugs.",
      href: "/admin/categories",
    },
    {
      title: "Manage Brands",
      description: "Manage brands displayed on the website.",
      href: "/admin/brands",
    },
    {
      title: "Manage Sellers",
      description: "Control sellers and marketplace information.",
      href: "/admin/sellers",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">
          Dashboard
        </h2>

        <p className="mt-2 text-gray-600">
          Welcome to the Smartprix administration panel.
        </p>
      </div>

      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Link
            key={stat.title}
            href={stat.href}
            className="rounded-xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <p className="text-sm font-medium text-gray-500">
              {stat.title}
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {stat.value}
            </p>

            <p className="mt-1 text-sm text-gray-500">
              {stat.description}
            </p>
          </Link>
        ))}
      </section>

      <section className="mt-8">
        <h3 className="text-2xl font-bold text-gray-900">
          Quick Actions
        </h3>

        <div className="mt-4 grid gap-5 md:grid-cols-2">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="rounded-xl bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <h4 className="text-lg font-semibold text-gray-900">
                {action.title}
              </h4>

              <p className="mt-2 text-sm text-gray-600">
                {action.description}
              </p>

              <p className="mt-4 text-sm font-semibold text-blue-600">
                Open →
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-xl bg-white p-6 shadow-sm">
        <h3 className="text-xl font-bold text-gray-900">
          System Status
        </h3>

        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
            <span className="text-sm font-medium text-gray-700">
              Backend API
            </span>

            <span className="font-medium text-green-600">
              Connected
            </span>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
            <span className="text-sm font-medium text-gray-700">
              Database
            </span>

            <span className="font-medium text-green-600">
              Online
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}