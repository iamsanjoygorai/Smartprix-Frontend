import Link from "next/link";
import ProductCard from "@/components/products/ProductCard";
import { getProducts } from "@/lib/api/products";
import type { Product } from "@/types/product";

const categories = [
  {
    name: "Mobiles",
    icon: "📱",
    href: "/products?category=mobile",
  },
  {
    name: "Laptops",
    icon: "💻",
    href: "/products?category=laptop",
  },
  {
    name: "Tablets",
    icon: "▣",
    href: "/products?category=tablet",
  },
  {
    name: "Smart Watches",
    icon: "⌚",
    href: "/products?category=smartwatch",
  },
  {
    name: "TVs",
    icon: "📺",
    href: "/products?category=tv",
  },
  {
    name: "Headphones",
    icon: "🎧",
    href: "/products?category=headphones",
  },
];

const popularLinks = [
  "Best Mobile Phones",
  "Best Laptops",
  "Best Smart Watches",
  "Best TVs",
  "Best Earphones",
  "Best Tablets",
];

export default async function HomePage() {
  let products: Product[] = [];

  try {
    const response = await getProducts();
    products = response.data ?? [];
  } catch {
    products = [];
  }

  const featuredProducts = products.slice(0, 8);

  return (
    <main className="min-h-screen bg-[#f4f6f8]">

      {/* =========================================================
          HERO
      ========================================================= */}
      <section className="bg-white border-b">
        <div className="mx-auto max-w-7xl px-4 py-8 md:py-10">

          <div className="grid items-center gap-8 lg:grid-cols-[1.3fr_0.7fr]">

            <div>
              <span className="inline-flex rounded-full bg-blue-50 px-4 py-1.5 text-xs font-bold text-blue-700">
                SMART SHOPPING
              </span>

              <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-gray-900 md:text-5xl">
                Find the right product
                <span className="text-blue-600"> at the right price.</span>
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600 md:text-lg">
                Compare specifications, prices, reviews and offers from
                different products before you buy.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/products"
                  className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
                >
                  Explore Products
                </Link>

                <Link
                  href="/products"
                  className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
                >
                  Compare Products
                </Link>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="relative mx-auto h-64 max-w-md overflow-hidden rounded-2xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 p-8 shadow-xl">

                <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/10" />
                <div className="absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-white/10" />

                <div className="relative">
                  <p className="text-sm font-semibold text-blue-100">
                    Compare before you buy
                  </p>

                  <h2 className="mt-3 text-3xl font-extrabold text-white">
                    Better choices.
                    <br />
                    Better prices.
                  </h2>

                  <div className="mt-6 flex gap-2">
                    <span className="rounded-md bg-white/15 px-3 py-2 text-xs font-semibold text-white">
                      Specs
                    </span>

                    <span className="rounded-md bg-white/15 px-3 py-2 text-xs font-semibold text-white">
                      Prices
                    </span>

                    <span className="rounded-md bg-white/15 px-3 py-2 text-xs font-semibold text-white">
                      Deals
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================
          CATEGORIES
      ========================================================= */}
      <section className="mx-auto max-w-7xl px-4 py-7">

        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900">
              Browse Categories
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Find products by category
            </p>
          </div>

          <Link
            href="/products"
            className="text-sm font-bold text-blue-600 hover:text-blue-700"
          >
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className="group flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white px-3 py-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-50 text-3xl transition group-hover:bg-blue-50">
                {category.icon}
              </span>

              <span className="mt-3 text-center text-sm font-bold text-gray-800 group-hover:text-blue-600">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* =========================================================
          QUICK LINKS
      ========================================================= */}
      <section className="mx-auto max-w-7xl px-4 pb-2">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">

          <div className="mb-3 flex items-center gap-2">
            <span className="text-lg">🔥</span>
            <h2 className="font-extrabold text-gray-900">
              Popular Searches
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {popularLinks.map((item) => (
              <Link
                key={item}
                href="/products"
                className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
              >
                {item}
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* =========================================================
          FEATURED PRODUCTS
      ========================================================= */}
      <section className="mx-auto max-w-7xl px-4 py-8">

        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900">
              Featured Products
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Popular products worth checking out
            </p>
          </div>

          <Link
            href="/products"
            className="hidden text-sm font-bold text-blue-600 sm:block"
          >
            See all products →
          </Link>
        </div>

        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="text-4xl">📦</div>

            <h3 className="mt-4 font-bold text-gray-900">
              No products available
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Products will appear here once they are added to the catalogue.
            </p>
          </div>
        )}

      </section>

      {/* =========================================================
          WHY SMARTPRIX
      ========================================================= */}
      <section className="border-y border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10">

          <div className="mb-7 text-center">
            <h2 className="text-2xl font-extrabold text-gray-900">
              Why use Smartprix?
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Everything you need before making a purchase
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">

            <div className="rounded-xl border border-gray-200 p-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-2xl">
                ⚖️
              </div>

              <h3 className="mt-4 font-extrabold text-gray-900">
                Compare Products
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Compare specifications and features to find the product that
                matches your requirements.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 p-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-2xl">
                💰
              </div>

              <h3 className="mt-4 font-extrabold text-gray-900">
                Find Better Prices
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Check available prices and discover better deals before you
                purchase.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 p-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-orange-50 text-2xl">
                ⭐
              </div>

              <h3 className="mt-4 font-extrabold text-gray-900">
                Make Better Decisions
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Get useful product information in one place and shop with
                confidence.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================
          CTA
      ========================================================= */}
      <section className="mx-auto max-w-7xl px-4 py-10">

        <div className="overflow-hidden rounded-2xl bg-[#08366f] px-6 py-10 text-center md:px-12">

          <h2 className="text-2xl font-extrabold text-white md:text-3xl">
            Looking for something specific?
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-blue-100">
            Search our product catalogue and compare products before making
            your next purchase.
          </p>

          <Link
            href="/products"
            className="mt-6 inline-flex rounded-lg bg-white px-6 py-3 text-sm font-extrabold text-[#08366f] transition hover:bg-gray-100"
          >
            Browse Products
          </Link>

        </div>

      </section>

    </main>
  );
}