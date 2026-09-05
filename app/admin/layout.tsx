import Link from "next/link";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-64 border-r bg-gray-900 text-white md:block">
          <div className="border-b border-gray-700 px-6 py-5">
            <Link href="/admin" className="text-xl font-bold">
              Smartprix Admin
            </Link>
          </div>

          <nav className="space-y-1 p-4">
            <Link
              href="/admin"
              className="block rounded-lg px-4 py-3 text-sm hover:bg-gray-800"
            >
              Dashboard
            </Link>

            <Link
              href="/admin/products"
              className="block rounded-lg px-4 py-3 text-sm hover:bg-gray-800"
            >
              Products
            </Link>

            <Link
              href="/admin/categories"
              className="block rounded-lg px-4 py-3 text-sm hover:bg-gray-800"
            >
              Categories
            </Link>

            <Link
              href="/admin/brands"
              className="block rounded-lg px-4 py-3 text-sm hover:bg-gray-800"
            >
              Brands
            </Link>

            <Link
              href="/admin/sellers"
              className="block rounded-lg px-4 py-3 text-sm hover:bg-gray-800"
            >
              Sellers
            </Link>

            <Link
              href="/admin/users"
              className="block rounded-lg px-4 py-3 text-sm hover:bg-gray-800"
            >
              Users
            </Link>

            <Link
              href="/admin/settings"
              className="block rounded-lg px-4 py-3 text-sm hover:bg-gray-800"
            >
              Settings
            </Link>
          </nav>

          <div className="mt-8 border-t border-gray-700 p-4">
            <Link
              href="/"
              className="block rounded-lg px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              ← Back to Website
            </Link>
          </div>
        </aside>

        {/* Main area */}
        <div className="min-w-0 flex-1">

          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}