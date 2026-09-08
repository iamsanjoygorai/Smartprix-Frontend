"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [profileOpen, setProfileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(
    pathname.startsWith("/admin/products"),
  );

  const profileRef = useRef<HTMLDivElement>(null);

  const [adminUser, setAdminUser] =
    useState<AdminUser | null>(null);

  const [loadingUser, setLoadingUser] = useState(true);

  /*
   * ─────────────────────────────────────────────
   * Load current admin user
   * ─────────────────────────────────────────────
   */

  useEffect(() => {
    const loadCurrentUser = async () => {
      const storedUser =
        localStorage.getItem("smartprix_user");

      const token =
        localStorage.getItem("smartprix_token");

      if (!storedUser || !token) {
        router.replace("/login");
        return;
      }

      try {
        const cachedUser = JSON.parse(
          storedUser,
        ) as AdminUser;

        const isAdminUser =
          cachedUser.role === "ADMIN" ||
          cachedUser.role === "SUPER_ADMIN" ||
          cachedUser.role === "EDITOR";

        if (!isAdminUser) {
          router.replace("/");
          return;
        }

        /*
         * Show cached user immediately.
         */
        setAdminUser(cachedUser);

        /*
         * Fetch latest user + permissions.
         */
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/me`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (!response.ok) {
          if (
            response.status === 401 ||
            response.status === 403
          ) {
            localStorage.removeItem(
              "smartprix_token",
            );

            localStorage.removeItem(
              "smartprix_user",
            );

            router.replace("/login");
            return;
          }

          throw new Error(
            "Failed to refresh user",
          );
        }

        const result = await response.json();

        const latestUser =
          result.data as AdminUser;

        localStorage.setItem(
          "smartprix_user",
          JSON.stringify(latestUser),
        );

        setAdminUser(latestUser);
      } catch (error) {
        console.error(
          "Failed to refresh admin user:",
          error,
        );
      } finally {
        setLoadingUser(false);
      }
    };

    loadCurrentUser();
  }, [router]);

  /*
   * ─────────────────────────────────────────────
   * Close profile when clicking outside
   * ─────────────────────────────────────────────
   */

  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent,
    ) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(
          event.target as Node,
        )
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
    };
  }, []);

  /*
   * ─────────────────────────────────────────────
   * Close mobile sidebar on navigation
   * ─────────────────────────────────────────────
   */

  useEffect(() => {
    setSidebarOpen(false);

    if (pathname.startsWith("/admin/products")) {
      setProductsOpen(true);
    }
  }, [pathname]);

  /*
   * ─────────────────────────────────────────────
   * Logout
   * ─────────────────────────────────────────────
   */

  const handleLogout = () => {
    localStorage.removeItem("smartprix_token");
    localStorage.removeItem("smartprix_user");

    setAdminUser(null);

    router.replace("/login");
  };

  /*
   * ─────────────────────────────────────────────
   * Permissions
   * ─────────────────────────────────────────────
   */

  const hasPermission = (
    permission: string,
  ) => {
    if (!adminUser) {
      return false;
    }

    return (
      adminUser.permissions?.includes(permission) ??
      false
    );
  };

  /*
   * ─────────────────────────────────────────────
   * Active route
   * ─────────────────────────────────────────────
   */

  const isActive = (
    href: string,
    exact = false,
  ) => {
    if (exact) {
      return pathname === href;
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  };

  /*
   * ─────────────────────────────────────────────
   * Initials
   * ─────────────────────────────────────────────
   */

  const initials = adminUser?.name
    ? adminUser.name
        .split(" ")
        .map((word) =>
          word.charAt(0),
        )
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "AD";

  /*
   * ─────────────────────────────────────────────
   * Loading
   * ─────────────────────────────────────────────
   */

  if (loadingUser || !adminUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8fa]">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black text-sm font-bold text-white shadow-sm">
            S
          </div>

          <p className="text-sm font-medium text-gray-500">
            Loading admin panel...
          </p>
        </div>
      </div>
    );
  }

  /*
   * IMPORTANT:
   *
   * News has its own dedicated admin layout.
   * Do not wrap News with this sidebar.
   */
  // if (pathname.startsWith("/admin/news")) {
  //   return <>{children}</>;
  // }

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-gray-900">
      {/* ═══════════════════════════════════════ */}
      {/* MOBILE OVERLAY */}
      {/* ═══════════════════════════════════════ */}

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px] lg:hidden"
        />
      )}

      {/* ═══════════════════════════════════════ */}
      {/* SIDEBAR */}
      {/* ═══════════════════════════════════════ */}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[264px] flex-col border-r border-gray-200 bg-white transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex h-[72px] shrink-0 items-center border-b border-gray-100 px-5">
          <Link
            href="/admin"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-sm font-bold text-white shadow-sm">
              S
            </div>

            <div>
              <div className="text-[15px] font-bold tracking-tight text-gray-950">
                Smartprix
              </div>

              <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-gray-400">
                Admin Console
              </div>
            </div>
          </Link>

          {/* Mobile close */}
          <button
            type="button"
            onClick={() =>
              setSidebarOpen(false)
            }
            className="ml-auto flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 lg:hidden"
          >
            ×
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-5">
          {/* Workspace */}
          <SidebarSection label="Workspace">
            {hasPermission("dashboard.view") && (
              <SidebarLink
                href="/admin"
                label="Dashboard"
                icon="▦"
                active={isActive(
                  "/admin",
                  true,
                )}
              />
            )}
          </SidebarSection>

          {/* Catalog */}
          {hasPermission("products.view") && (
            <SidebarSection label="Catalog">
              <SidebarExpandable
                label="Products"
                icon="□"
                open={productsOpen}
                active={isActive(
                  "/admin/products",
                )}
                onClick={() =>
                  setProductsOpen(
                    (current) => !current,
                  )
                }
              />

              {productsOpen && (
                <div className="ml-5 mt-1 space-y-0.5 border-l border-gray-200 pl-3">
                  <SidebarSubLink
                    href="/admin/products"
                    label="All Products"
                    active={isActive(
                      "/admin/products",
                      true,
                    )}
                  />

                  {hasPermission(
                    "products.create",
                  ) && (
                    <SidebarSubLink
                      href="/admin/products/new"
                      label="Add Product"
                      active={isActive(
                        "/admin/products/new",
                        true,
                      )}
                    />
                  )}

                  {hasPermission(
                    "categories.view",
                  ) && (
                    <SidebarSubLink
                      href="/admin/products/categories"
                      label="Categories"
                      active={isActive(
                        "/admin/products/categories",
                      )}
                    />
                  )}

                  {hasPermission(
                    "products.view",
                  ) && (
                    <>
                      <SidebarSubLink
                        href="/admin/products/brands"
                        label="Brands"
                        active={isActive(
                          "/admin/products/brands",
                        )}
                      />

                      <SidebarSubLink
                        href="/admin/products/specifications"
                        label="Specifications"
                        active={isActive(
                          "/admin/products/specifications",
                        )}
                      />

                      <SidebarSubLink
                        href="/admin/products/variants"
                        label="Variants"
                        active={isActive(
                          "/admin/products/variants",
                        )}
                      />

                      <SidebarSubLink
                        href="/admin/products/prices"
                        label="Prices"
                        active={isActive(
                          "/admin/products/prices",
                        )}
                      />
                    </>
                  )}
                </div>
              )}
            </SidebarSection>
          )}

          {/* Content */}
          {(hasPermission("news.view") ||
            hasPermission("media.view")) && (
            <SidebarSection label="Content">
              {hasPermission("news.view") && (
                <SidebarLink
                  href="/admin/news"
                  label="News"
                  icon="▤"
                  active={isActive(
                    "/admin/news",
                  )}
                />
              )}

              {hasPermission("media.view") && (
                <SidebarLink
                  href="/admin/media"
                  label="Media Library"
                  icon="▧"
                  active={isActive(
                    "/admin/media",
                  )}
                />
              )}
            </SidebarSection>
          )}

          {/* Users */}
          {hasPermission("users.view") && (
            <SidebarSection label="Users">
              <SidebarLink
                href="/admin/users"
                label="Users"
                icon="♙"
                active={isActive(
                  "/admin/users",
                )}
              />
            </SidebarSection>
          )}

          {/* System */}
          {(hasPermission("admins.view") ||
            hasPermission("audit.view") ||
            hasPermission("settings.view")) && (
            <SidebarSection label="System">
              {hasPermission("admins.view") && (
                <SidebarLink
                  href="/admin/admins"
                  label="Admin Management"
                  icon="♙"
                  active={isActive(
                    "/admin/admins",
                  )}
                />
              )}

              {hasPermission("audit.view") && (
                <SidebarLink
                  href="/admin/audit-logs"
                  label="Audit Logs"
                  icon="◷"
                  active={isActive(
                    "/admin/audit-logs",
                  )}
                />
              )}

              {hasPermission(
                "settings.view",
              ) && (
                <SidebarLink
                  href="/admin/settings"
                  label="Settings"
                  icon="⚙"
                  active={isActive(
                    "/admin/settings",
                  )}
                />
              )}
            </SidebarSection>
          )}
        </div>

        {/* Sidebar bottom */}
        <div className="border-t border-gray-100 p-3">
          <div className="rounded-xl bg-gray-50 p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-black text-xs font-semibold text-white">
                {initials}
              </div>

              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-gray-900">
                  {adminUser.name}
                </p>

                <p className="truncate text-[11px] text-gray-500">
                  {adminUser.role}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ═══════════════════════════════════════ */}
      {/* MAIN AREA */}
      {/* ═══════════════════════════════════════ */}

      <div className="lg:pl-[264px]">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-gray-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
          {/* Mobile menu */}
          <button
            type="button"
            onClick={() =>
              setSidebarOpen(true)
            }
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 lg:hidden"
          >
            ☰
          </button>

          {/* Desktop breadcrumb/context */}
          <div className="hidden lg:block">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-gray-400">
              Smartprix Administration
            </p>

            <p className="mt-0.5 text-sm font-semibold text-gray-900">
              {getPageTitle(pathname)}
            </p>
          </div>

          <div className="ml-auto flex items-center gap-3">
            {/* Status */}
            <div className="hidden items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />

              <span className="text-xs font-medium text-gray-600">
                System operational
              </span>
            </div>

            {/* Profile */}
            <div
              ref={profileRef}
              className="relative"
            >
              <button
                type="button"
                onClick={() =>
                  setProfileOpen(
                    (current) => !current,
                  )
                }
                className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-2.5 py-2 transition hover:border-gray-300 hover:bg-gray-50"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-black text-xs font-semibold text-white">
                  {initials}
                </span>

                <span className="hidden text-left sm:block">
                  <span className="block max-w-[140px] truncate text-sm font-semibold text-gray-900">
                    {adminUser.name}
                  </span>

                  <span className="block text-[11px] font-medium text-gray-500">
                    {adminUser.role}
                  </span>
                </span>

                <span
                  className={`hidden text-xs text-gray-400 transition sm:block ${
                    profileOpen
                      ? "rotate-180"
                      : ""
                  }`}
                >
                  ▼
                </span>
              </button>

              {/* Profile dropdown */}
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-72 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl shadow-gray-200/50">
                  <div className="border-b border-gray-100 bg-gray-50 px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black text-sm font-semibold text-white">
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
                      <span className="inline-flex rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-semibold text-green-700">
                        {adminUser.role}
                      </span>
                    </div>
                  </div>

                  <div className="p-2">
                    <Link
                      href="/admin/profile"
                      onClick={() =>
                        setProfileOpen(false)
                      }
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <span className="w-5 text-center">
                        👤
                      </span>

                      <span>Profile</span>
                    </Link>

                    {hasPermission(
                      "settings.view",
                    ) && (
                      <Link
                        href="/admin/settings"
                        onClick={() =>
                          setProfileOpen(false)
                        }
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <span className="w-5 text-center">
                          ⚙
                        </span>

                        <span>Settings</span>
                      </Link>
                    )}
                  </div>

                  <div className="border-t border-gray-100 p-2">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      <span className="w-5 text-center">
                        ↪
                      </span>

                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="min-h-[calc(100vh-72px)] px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1440px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════ */
/* Sidebar Section */
/* ═══════════════════════════════════════════════ */

function SidebarSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-6">
      <div className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
        {label}
      </div>

      <div className="space-y-0.5">
        {children}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════ */
/* Sidebar Link */
/* ═══════════════════════════════════════════════ */

function SidebarLink({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
        active
          ? "bg-gray-950 text-white shadow-sm"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-950"
      }`}
    >
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-lg text-sm ${
          active
            ? "bg-white/10 text-white"
            : "text-gray-400 group-hover:text-gray-700"
        }`}
      >
        {icon}
      </span>

      <span>{label}</span>
    </Link>
  );
}

/* ═══════════════════════════════════════════════ */
/* Expandable Sidebar Item */
/* ═══════════════════════════════════════════════ */

function SidebarExpandable({
  label,
  icon,
  active,
  open,
  onClick,
}: {
  label: string;
  icon: string;
  active: boolean;
  open: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
        active
          ? "bg-gray-100 text-gray-950"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-950"
      }`}
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-lg text-sm text-gray-400 group-hover:text-gray-700">
        {icon}
      </span>

      <span className="flex-1">
        {label}
      </span>

      <span
        className={`text-[10px] text-gray-400 transition ${
          open ? "rotate-180" : ""
        }`}
      >
        ▼
      </span>
    </button>
  );
}

/* ═══════════════════════════════════════════════ */
/* Sidebar Sub Link */
/* ═══════════════════════════════════════════════ */

function SidebarSubLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`block rounded-lg px-3 py-2 text-[13px] font-medium transition ${
        active
          ? "bg-gray-100 text-gray-950"
          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      {label}
    </Link>
  );
}

/* ═══════════════════════════════════════════════ */
/* Page Title */
/* ═══════════════════════════════════════════════ */

function getPageTitle(pathname: string) {
  if (pathname === "/admin") {
    return "Dashboard";
  }

  if (pathname.startsWith("/admin/products/categories")) {
    return "Product Categories";
  }

  if (pathname.startsWith("/admin/products/brands")) {
    return "Product Brands";
  }

  if (
    pathname.startsWith(
      "/admin/products/specifications",
    )
  ) {
    return "Product Specifications";
  }

  if (
    pathname.startsWith(
      "/admin/products/variants",
    )
  ) {
    return "Product Variants";
  }

  if (
    pathname.startsWith(
      "/admin/products/prices",
    )
  ) {
    return "Product Prices";
  }

  if (
    pathname.startsWith("/admin/products/new")
  ) {
    return "Add Product";
  }

  if (pathname.startsWith("/admin/products")) {
    return "Products";
  }

  if (pathname.startsWith("/admin/media")) {
    return "Media Library";
  }

  if (pathname.startsWith("/admin/users")) {
    return "Users";
  }

  if (pathname.startsWith("/admin/admins")) {
    return "Admin Management";
  }

  if (pathname.startsWith("/admin/audit-logs")) {
    return "Audit Logs";
  }

  if (pathname.startsWith("/admin/settings")) {
    return "Settings";
  }

  if (pathname.startsWith("/admin/profile")) {
    return "Profile";
  }

  return "Administration";
}