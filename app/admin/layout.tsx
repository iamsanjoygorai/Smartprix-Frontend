"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("smartprix_user");

    if (!storedUser) {
      router.replace("/login");
      return;
    }

    try {
      const user = JSON.parse(storedUser) as AdminUser;

      if (user.role !== "ADMIN") {
        router.replace("/");
        return;
      }

      setAdminUser(user);
    } catch {
      localStorage.removeItem("smartprix_user");
      localStorage.removeItem("smartprix_token");
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("smartprix_token");
    localStorage.removeItem("smartprix_user");

    setAdminUser(null);

    router.replace("/login");
  };

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }

    return pathname.startsWith(href);
  };

  if (!adminUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-500">Loading admin...</p>
      </div>
    );
  }

  const initials = adminUser.name
    ? adminUser.name
        .split(" ")
        .map((word) => word.charAt(0))
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "AD";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link
            href="/admin"
            className="flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-black text-sm font-bold text-white">
              S
            </div>

            <div>
              <p className="text-sm font-bold text-gray-900">
                Smartprix
              </p>

              <p className="text-xs text-gray-500">
                Admin Panel
              </p>
            </div>
          </Link>

          {/* Profile */}
          <div
            ref={profileRef}
            className="relative"
          >
            <button
              type="button"
              onClick={() =>
                setProfileOpen((current) => !current)
              }
              className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2 transition hover:bg-gray-50"
            >
              {/* Avatar */}
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-xs font-semibold text-white">
                {initials}
              </span>

              {/* User info */}
              <span className="hidden text-left sm:block">
                <span className="block text-sm font-semibold text-gray-900">
                  {adminUser.name}
                </span>

                <span className="block text-xs text-gray-500">
                  {adminUser.role}
                </span>
              </span>

              {/* Arrow */}
              <span
                className={`text-xs text-gray-400 transition ${
                  profileOpen ? "rotate-180" : ""
                }`}
              >
                ▼
              </span>
            </button>

            {/* Dropdown */}
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-72 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                {/* User information */}
                <div className="border-b bg-gray-50 px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black text-sm font-semibold text-white">
                      {initials}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {adminUser.name}
                      </p>

                      <p className="truncate text-xs text-gray-500">
                        {adminUser.email}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3">
                    <span className="inline-flex rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                      {adminUser.role}
                    </span>
                  </div>
                </div>

                {/* Menu */}
                <div className="p-2">
                  <Link
                    href="/admin/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <span className="w-5 text-center">
                      👤
                    </span>

                    <span>Profile</span>
                  </Link>

                 <Link
  href="/admin/settings"
  onClick={() => setProfileOpen(false)}
  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
>
  <span className="w-5 text-center">
    ⚙️
  </span>

  <span>Settings</span>
</Link>
                </div>

                {/* Logout */}
                <div className="border-t p-2">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <span className="w-5 text-center">
                      🚪
                    </span>

                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Admin Navigation */}
      <div className="border-b bg-white">
        <nav className="flex gap-1 overflow-x-auto px-4 sm:px-6">
          <AdminNavLink
            href="/admin"
            label="Dashboard"
            active={isActive("/admin")}
            exact
          />

          <AdminNavLink
            href="/admin/products"
            label="Products"
            active={isActive("/admin/products")}
          />

          <AdminNavLink
            href="/admin/news"
            label="News"
            active={isActive("/admin/news")}
          />
        </nav>
      </div>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}

function AdminNavLink({
  href,
  label,
  active,
  exact = false,
}: {
  href: string;
  label: string;
  active: boolean;
  exact?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`border-b-2 px-4 py-3 text-sm font-medium transition ${
        active
          ? "border-black text-gray-900"
          : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-900"
      }`}
    >
      {label}
    </Link>
  );
}
