"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

interface AdminUser {
  id: string;
  name?: string | null;
  email?: string | null;
  mobile?: string | null;
  role: string;
  permissions?: string[];
  profileImageUrl?: string | null;
}

interface AdminShellProps {
  children: React.ReactNode;
}

export default function AdminShell({
  children,
}: AdminShellProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [adminUser, setAdminUser] =
    useState<AdminUser | null>(null);

  const [loading, setLoading] = useState(true);

  /*
   * =========================================================
   * SIDEBAR STATE
   * =========================================================
   */

  // Desktop sidebar
  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  // Mobile sidebar
  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false);

  /*
   * =========================================================
   * LOAD SIDEBAR PREFERENCE
   * =========================================================
   */

  useEffect(() => {
    try {
      const saved =
        localStorage.getItem(
          "smartprix_admin_sidebar_collapsed",
        );

      if (saved !== null) {
        setSidebarCollapsed(saved === "true");
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  /*
   * =========================================================
   * TOGGLE DESKTOP SIDEBAR
   * =========================================================
   */

  const handleSidebarToggle = () => {
    setSidebarCollapsed((current) => {
      const next = !current;

      try {
        localStorage.setItem(
          "smartprix_admin_sidebar_collapsed",
          String(next),
        );
      } catch {
        // Ignore localStorage errors
      }

      return next;
    });
  };

  /*
   * =========================================================
   * CLOSE MOBILE SIDEBAR WHEN ROUTE CHANGES
   * =========================================================
   */

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  /*
   * =========================================================
   * LOAD CURRENT ADMIN USER
   * =========================================================
   */

  useEffect(() => {
    let mounted = true;

    const loadAdminUser = async () => {
      try {
        /*
         * -----------------------------------------------------
         * GET TOKEN
         * -----------------------------------------------------
         */

        const token =
          localStorage.getItem("smartprix_token");

        if (!token) {
          router.replace("/login");
          return;
        }

        /*
         * -----------------------------------------------------
         * LOAD CACHED USER FIRST
         * -----------------------------------------------------
         */

        const cachedUser =
          localStorage.getItem("smartprix_user");

        if (cachedUser) {
          try {
            const parsedUser = JSON.parse(cachedUser);

            if (
              parsedUser &&
              typeof parsedUser === "object"
            ) {
              setAdminUser(parsedUser);
            }
          } catch {
            // Ignore invalid cached user
          }
        }

        /*
         * -----------------------------------------------------
         * API URL
         * -----------------------------------------------------
         */

        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL ||
          "http://localhost:5000/api";

        /*
         * -----------------------------------------------------
         * VERIFY SESSION
         * -----------------------------------------------------
         */

        const response = await fetch(
          `${apiUrl}/auth/me`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            cache: "no-store",
          },
        );

        /*
         * -----------------------------------------------------
         * SESSION EXPIRED
         * -----------------------------------------------------
         */

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

        /*
         * -----------------------------------------------------
         * OTHER API ERROR
         * -----------------------------------------------------
         */

        if (!response.ok) {
          console.error(
            "Admin /auth/me failed:",
            response.status,
          );

          /*
           * IMPORTANT:
           * Don't logout the user for temporary server
           * errors. If cached user exists, continue.
           */

          if (mounted) {
            setLoading(false);
          }

          return;
        }

        /*
         * -----------------------------------------------------
         * READ RESPONSE
         * -----------------------------------------------------
         */

        const data = await response.json();

        /*
         * Your backend may return:
         *
         * { user: {...} }
         *
         * OR
         *
         * {...user fields...}
         */

        const user =
          data?.user ??
          data?.data?.user ??
          data?.data ??
          data;

        /*
         * -----------------------------------------------------
         * VALID USER CHECK
         * -----------------------------------------------------
         */

        if (
          !user ||
          typeof user !== "object"
        ) {
          console.error(
            "Invalid /auth/me response:",
            data,
          );

          if (mounted) {
            setLoading(false);
          }

          return;
        }

        /*
         * -----------------------------------------------------
         * NORMALIZE ROLE
         * -----------------------------------------------------
         */

        const role = String(
          user.role ?? "",
        ).toUpperCase();

        /*
         * -----------------------------------------------------
         * ADMIN ROLES
         * -----------------------------------------------------
         */

        const isAdmin =
          role === "ADMIN" ||
          role === "SUPER_ADMIN" ||
          role === "EDITOR";

        /*
         * -----------------------------------------------------
         * DON'T LOGOUT FOR UNKNOWN ROLE
         *
         * This prevents the new sidebar architecture from
         * accidentally breaking your existing authentication.
         * Backend authentication remains the source of truth.
         * -----------------------------------------------------
         */

        if (!isAdmin) {
          console.warn(
            "User does not have an admin role:",
            role,
          );

          /*
           * If we already had a cached admin user,
           * don't immediately destroy the session.
           */
          if (!adminUser) {
            router.replace("/");
            return;
          }

          return;
        }

        /*
         * -----------------------------------------------------
         * SAVE USER
         * -----------------------------------------------------
         */

        if (mounted) {
          setAdminUser({
            ...user,
            role,
            permissions:
              Array.isArray(user.permissions)
                ? user.permissions
                : [],
          });

          localStorage.setItem(
            "smartprix_user",
            JSON.stringify({
              ...user,
              role,
              permissions:
                Array.isArray(user.permissions)
                  ? user.permissions
                  : [],
            }),
          );
        }
      } catch (error) {
        /*
         * -----------------------------------------------------
         * IMPORTANT:
         * DON'T LOGOUT ON NETWORK/SERVER ERRORS.
         * -----------------------------------------------------
         */

        console.error(
          "Admin session check failed:",
          error,
        );

        /*
         * If we already have cached user,
         * allow the admin page to continue.
         */
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadAdminUser();

    return () => {
      mounted = false;
    };
  }, [router]);

  /*
   * =========================================================
   * LOGOUT
   * =========================================================
   */

  const handleLogout = () => {
    try {
      localStorage.removeItem(
        "smartprix_token",
      );

      localStorage.removeItem(
        "smartprix_user",
      );
    } catch {
      // Ignore localStorage errors
    }

    router.replace("/login");
  };

  /*
   * =========================================================
   * LOADING SCREEN
   * =========================================================
   */

  if (loading && !adminUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f7f9]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-11 w-11 animate-spin rounded-full border-4 border-gray-200 border-t-emerald-500" />

          <div className="text-center">
            <p className="text-sm font-semibold text-gray-700">
              Loading Smartprix Admin
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Preparing Admin Studio...
            </p>
          </div>
        </div>
      </div>
    );
  }

  /*
   * =========================================================
   * NO USER
   * =========================================================
   */

  if (!adminUser) {
    return null;
  }

  /*
   * =========================================================
   * ADMIN SHELL
   * =========================================================
   */

  return (
    <div className="min-h-screen bg-[#f6f7f9]">
      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <AdminSidebar
        user={adminUser}
        collapsed={sidebarCollapsed}
        onToggleCollapse={handleSidebarToggle}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() =>
          setMobileSidebarOpen(false)
        }
        onLogout={handleLogout}
      />

      {/* =====================================================
          MAIN AREA
      ===================================================== */}

      <div
        className={`
          min-h-screen
          transition-[padding]
          duration-300
          ease-in-out

          ${
            sidebarCollapsed
              ? "lg:pl-[76px]"
              : "lg:pl-[264px]"
          }
        `}
      >
        {/* ===================================================
            HEADER
        =================================================== */}

        <AdminHeader
  user={adminUser}
  onMobileMenu={() =>
    setMobileSidebarOpen(true)
  }
  onLogout={handleLogout}
/>

        {/* ===================================================
            PAGE CONTENT
        =================================================== */}

        <main className="min-h-[calc(100vh-64px)] p-4 sm:p-6 lg:p-7">
          {children}
        </main>
      </div>
    </div>
  );
}