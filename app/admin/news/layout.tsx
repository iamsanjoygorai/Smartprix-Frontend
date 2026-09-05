"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  {
    label: "All Posts",
    href: "/admin/news",
  },
  {
    label: "Add New",
    href: "/admin/news/new",
  },
  {
    label: "Categories",
    href: "/admin/news/categories",
  },
];

export default function NewsAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <div className="flex min-h-screen">

        {/* News Admin Sidebar */}
        <aside className="fixed inset-y-0 left-0 z-40 flex w-[240px] flex-col border-r border-gray-200 bg-white">

          {/* Logo */}
          <div className="flex h-[72px] items-center border-b border-gray-200 px-6">
            <Link
              href="/admin/news"
              className="text-xl font-bold text-gray-900"
            >
              Smartprix News
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">

            <div className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              News Management
            </div>

            <div className="space-y-1">
              {menuItems.map((item) => {
                const isActive =
                  item.href === "/admin/news"
                    ? pathname === "/admin/news"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center rounded-lg px-3 py-3 text-sm font-medium transition ${
                      isActive
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Bottom */}
          <div className="border-t border-gray-200 p-4">
            <Link
              href="/admin"
              className="flex items-center rounded-lg px-3 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              ← Back to Admin
            </Link>
          </div>
        </aside>

        {/* Page Content */}
        <main className="ml-[240px] min-h-screen min-w-0 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}