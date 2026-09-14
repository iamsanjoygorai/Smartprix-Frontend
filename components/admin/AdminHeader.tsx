"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  LogOut,
  Menu,
  Settings,
  UserCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface AdminHeaderProps {
  user: {
    name?: string | null;
    role?: string | null;
    email?: string | null;
    profileImageUrl?: string | null;
  };
  onMobileMenu: () => void;
  onLogout?: () => void;
}

export default function AdminHeader({
  user,
  onMobileMenu,
  onLogout,
}: AdminHeaderProps) {
  const pathname = usePathname();

  const [profileOpen, setProfileOpen] =
    useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  /*
   * =====================================================
   * INITIALS
   * =====================================================
   */

  const initials =
    user.name
      ?.split(" ")
      .filter(Boolean)
      .map((part) => part.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase() || "AD";

  /*
   * =====================================================
   * PAGE TITLE
   * =====================================================
   */

  const getPageTitle = () => {
    if (pathname === "/admin") {
      return "Dashboard";
    }

    if (
      pathname.startsWith(
        "/admin/products/categories",
      )
    ) {
      return "Product Categories";
    }

    if (
      pathname.startsWith(
        "/admin/products/brands",
      )
    ) {
      return "Product Brands";
    }

    if (
      pathname.startsWith(
        "/admin/products/specifications",
      )
    ) {
      return "Product Specifications";
    }

    if (pathname.startsWith("/admin/products/new")) {
      return "Add Product";
    }

    if (pathname.startsWith("/admin/products")) {
      return "Products";
    }

    if (pathname.startsWith("/admin/news")) {
      return "News";
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

    if (pathname.startsWith("/admin/audit")) {
      return "Audit & Security";
    }

    if (pathname.startsWith("/admin/history")) {
      return "History";
    }

    if (pathname.startsWith("/admin/settings")) {
      return "Settings";
    }

    if (pathname.startsWith("/admin/profile")) {
      return "Profile";
    }

    return "Administration";
  };

  /*
   * =====================================================
   * CLOSE DROPDOWN WHEN CLICKING OUTSIDE
   * =====================================================
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
   * =====================================================
   * CLOSE DROPDOWN ON ESCAPE
   * =====================================================
   */

  useEffect(() => {
    const handleEscape = (
      event: KeyboardEvent,
    ) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, []);

  return (
    <header
      className="
        sticky top-0 z-30
        flex h-[72px]
        items-center
        border-b border-gray-200/80
        bg-white/90
        px-4
        backdrop-blur-xl
        sm:px-6
        lg:px-8
      "
    >
      {/* =================================================
          MOBILE MENU
          ================================================= */}

      <button
        type="button"
        onClick={onMobileMenu}
        className="
          flex h-10 w-10
          items-center justify-center
          rounded-xl
          border border-gray-200
          bg-white
          text-gray-600
          shadow-sm
          transition
          hover:border-gray-300
          hover:bg-gray-50
          lg:hidden
        "
        aria-label="Open admin menu"
      >
        <Menu size={19} />
      </button>

      {/* =================================================
          PAGE TITLE
          ================================================= */}

      <div className="ml-3 lg:ml-0">
        <div className="flex items-center gap-2">
          <span
            className="
              hidden
              text-xs
              font-medium
              text-gray-400
              sm:block
            "
          >
            Admin Studio
          </span>

          <ChevronRight
            size={13}
            className="
              hidden
              text-gray-300
              sm:block
            "
          />

          <h1
            className="
              text-sm
              font-bold
              text-gray-900
            "
          >
            {getPageTitle()}
          </h1>
        </div>

        <p
          className="
            mt-0.5
            hidden
            text-[11px]
            font-medium
            text-gray-400
            sm:block
          "
        >
          Manage your Smartprix platform
        </p>
      </div>

      {/* =================================================
          RIGHT SIDE
          ================================================= */}

      <div className="ml-auto flex items-center gap-3">
        {/* System status */}

        <div
          className="
            hidden
            items-center
            gap-2
            rounded-full
            border
            border-emerald-100
            bg-emerald-50
            px-3
            py-1.5
            sm:flex
          "
        >
          <span
            className="
              h-1.5
              w-1.5
              rounded-full
              bg-emerald-500
            "
          />

          <span
            className="
              text-[11px]
              font-semibold
              text-emerald-700
            "
          >
            System operational
          </span>
        </div>

        {/* =================================================
            PROFILE DROPDOWN
            ================================================= */}

        <div
          ref={profileRef}
          className="relative"
        >
          {/* Profile button */}

          <button
            type="button"
            onClick={() =>
              setProfileOpen((value) => !value)
            }
            className={`
              flex
              items-center
              gap-2.5
              rounded-xl
              border
              bg-white
              px-2
              py-1.5
              shadow-sm
              transition-all
              duration-200

              ${
                profileOpen
                  ? "border-gray-300 shadow-md"
                  : "border-gray-200 hover:border-gray-300 hover:shadow-md"
              }
            `}
            aria-expanded={profileOpen}
            aria-haspopup="menu"
          >
            {/* Avatar */}

            {user.profileImageUrl ? (
              <img
                src={user.profileImageUrl}
                alt={user.name || "Admin"}
                className="
                  h-8
                  w-8
                  rounded-lg
                  object-cover
                  ring-1
                  ring-gray-200
                "
              />
            ) : (
              <span
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-lg
                  bg-gradient-to-br
                  from-gray-900
                  to-gray-700
                  text-[11px]
                  font-bold
                  text-white
                "
              >
                {initials}
              </span>
            )}

            {/* Name */}

            <span className="hidden text-left sm:block">
              <span
                className="
                  block
                  max-w-[130px]
                  truncate
                  text-xs
                  font-bold
                  text-gray-900
                "
              >
                {user.name || "Admin"}
              </span>

              <span
                className="
                  block
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-wide
                  text-gray-400
                "
              >
                {user.role || "ADMIN"}
              </span>
            </span>

            <ChevronDown
              size={15}
              className={`
                hidden
                text-gray-400
                transition-transform
                sm:block

                ${
                  profileOpen
                    ? "rotate-180"
                    : ""
                }
              `}
            />
          </button>

          {/* =================================================
              DROPDOWN
              ================================================= */}

          {profileOpen && (
            <div
              className="
                absolute
                right-0
                top-[calc(100%+10px)]
                z-[100]
                w-[280px]
                overflow-hidden
                rounded-2xl
                border
                border-gray-200
                bg-white
                shadow-[0_20px_50px_rgba(0,0,0,0.15)]
              "
              role="menu"
            >
              {/* Profile summary */}

              <div
                className="
                  border-b
                  border-gray-100
                  bg-gradient-to-br
                  from-gray-50
                  to-white
                  px-4
                  py-4
                "
              >
                <div className="flex items-center gap-3">
                  {user.profileImageUrl ? (
                    <img
                      src={user.profileImageUrl}
                      alt={
                        user.name || "Admin"
                      }
                      className="
                        h-11
                        w-11
                        rounded-xl
                        object-cover
                        ring-2
                        ring-white
                        shadow-sm
                      "
                    />
                  ) : (
                    <div
                      className="
                        flex
                        h-11
                        w-11
                        items-center
                        justify-center
                        rounded-xl
                        bg-gradient-to-br
                        from-gray-900
                        to-gray-700
                        text-sm
                        font-bold
                        text-white
                        shadow-sm
                      "
                    >
                      {initials}
                    </div>
                  )}

                  <div className="min-w-0">
                    <p
                      className="
                        truncate
                        text-sm
                        font-bold
                        text-gray-900
                      "
                    >
                      {user.name || "Admin"}
                    </p>

                    <p
                      className="
                        mt-0.5
                        truncate
                        text-xs
                        text-gray-500
                      "
                    >
                      {user.email ||
                        "Administrator"}
                    </p>

                    <span
                      className="
                        mt-1.5
                        inline-flex
                        rounded-full
                        bg-emerald-50
                        px-2
                        py-0.5
                        text-[9px]
                        font-bold
                        uppercase
                        tracking-wider
                        text-emerald-700
                      "
                    >
                      {user.role ||
                        "ADMIN"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Menu */}

              <div className="p-2">
                <Link
                  href="/admin/profile"
                  onClick={() =>
                    setProfileOpen(false)
                  }
                  className="
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    py-2.5
                    text-sm
                    font-medium
                    text-gray-700
                    transition
                    hover:bg-gray-50
                    hover:text-gray-900
                  "
                  role="menuitem"
                >
                  <span
                    className="
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-lg
                      bg-blue-50
                      text-blue-600
                    "
                  >
                    <UserCircle size={18} />
                  </span>

                  <span>
                    <span className="block font-semibold">
                      Profile
                    </span>

                    <span className="block text-[11px] text-gray-400">
                      View your profile
                    </span>
                  </span>
                </Link>

                <Link
                  href="/admin/settings"
                  onClick={() =>
                    setProfileOpen(false)
                  }
                  className="
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    py-2.5
                    text-sm
                    font-medium
                    text-gray-700
                    transition
                    hover:bg-gray-50
                    hover:text-gray-900
                  "
                  role="menuitem"
                >
                  <span
                    className="
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-lg
                      bg-purple-50
                      text-purple-600
                    "
                  >
                    <Settings size={18} />
                  </span>

                  <span>
                    <span className="block font-semibold">
                      Account settings
                    </span>

                    <span className="block text-[11px] text-gray-400">
                      Manage your account
                    </span>
                  </span>
                </Link>
              </div>

              {/* Logout */}

              <div
                className="
                  border-t
                  border-gray-100
                  p-2
                "
              >
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    onLogout?.();
                  }}
                  className="
                    flex
                    w-full
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    py-2.5
                    text-sm
                    font-semibold
                    text-red-600
                    transition
                    hover:bg-red-50
                  "
                  role="menuitem"
                >
                  <span
                    className="
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-lg
                      bg-red-50
                      text-red-600
                    "
                  >
                    <LogOut size={18} />
                  </span>

                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}