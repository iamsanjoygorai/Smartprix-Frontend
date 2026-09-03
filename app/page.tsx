export default function Home() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Hero */}
      <section className="rounded-xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900">
          Find the best products at the best prices
        </h1>

        <p className="mt-3 max-w-2xl text-gray-600">
          Compare smartphones, laptops, specifications and prices
          from different sellers.
        </p>

        <div className="mt-6 flex max-w-2xl">
          <input
            type="search"
            placeholder="Search mobiles, laptops and more..."
            className="h-12 flex-1 rounded-l-lg border border-gray-300 px-4 outline-none focus:border-gray-500"
          />

          <button
            type="button"
            className="rounded-r-lg bg-black px-6 font-medium text-white hover:bg-gray-800"
          >
            Search
          </button>
        </div>
      </section>

      {/* Categories */}
      <section className="mt-8">
        <h2 className="mb-4 text-2xl font-bold text-gray-900">
          Explore Categories
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold">Mobiles</h3>
            <p className="mt-2 text-sm text-gray-600">
              Compare smartphones and find the best deals.
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold">Laptops</h3>
            <p className="mt-2 text-sm text-gray-600">
              Find laptops based on price and specifications.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}