"use client";

import Link from "next/link";

import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X,
} from "lucide-react";

import { adminNavigation } from "@/components/admin/admin-navigation";
import AdminSidebarItem from "@/components/admin/AdminSidebarItem";

import {
  type AdminUser,
  filterAdminNavigation,
} from "@/lib/api/admin-permissions";

/* =========================================================
   TYPES
========================================================= */

interface AdminSidebarProps {
  user: AdminUser;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
  onLogout: () => void;
}

/* =========================================================
   COMPONENT
========================================================= */

export default function AdminSidebar({
  user,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onMobileClose,
  onLogout,
}: AdminSidebarProps) {
  /*
   * Filter navigation using the same permission system.
   */
  const visibleSections = filterAdminNavigation(
    user,
    adminNavigation,
  ).filter(
    (section) => section.items.length > 0,
  );

  return (
    <>
      {/* =====================================================
          MOBILE OVERLAY
      ===================================================== */}

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onMobileClose}
          className="
            fixed inset-0 z-40
            bg-black/50
            backdrop-blur-sm
            lg:hidden
          "
        />
      )}

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex flex-col
          bg-[#111318]
          text-white
          shadow-2xl
          transition-all
          duration-300
          ease-in-out
          w-[264px]

          ${
            collapsed
              ? "lg:w-[76px]"
              : "lg:w-[264px]"
          }

          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        {/* ===================================================
    SIDEBAR HEADER
=================================================== */}

<div
  className={`
    relative
    flex
    h-[72px]
    shrink-0
    items-center
    border-b
    border-white/[0.07]

    ${
      collapsed
        ? "justify-center px-2"
        : "justify-between px-4"
    }
  `}
>
  {/* =================================================
      EXPANDED LOGO
  ================================================= */}

  {!collapsed && (
    <>
      <Link
        href="/admin"
        onClick={onMobileClose}
        className="flex items-center gap-3"
      >
        <div
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-gradient-to-br
            from-emerald-400
            to-green-600
            shadow-lg
            shadow-green-500/20
          "
        >
          <Sparkles className="h-5 w-5 text-white" />
        </div>

        <div>
          <p
            className="
              whitespace-nowrap
              text-[15px]
              font-bold
              tracking-tight
            "
          >
            Smartprix
          </p>

          <p
            className="
              whitespace-nowrap
              text-[11px]
              font-medium
              text-white/40
            "
          >
            ADMIN STUDIO
          </p>
        </div>
      </Link>

      {/* Collapse */}

      <button
        type="button"
        onClick={onToggleCollapse}
        title="Collapse sidebar"
        aria-label="Collapse sidebar"
        className="
          flex
          h-8
          w-8
          items-center
          justify-center
          rounded-lg
          border
          border-white/[0.08]
          bg-white/[0.03]
          text-white/40
          transition-all
          hover:bg-white/[0.08]
          hover:text-white
        "
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
    </>
  )}

  {/* =================================================
      COLLAPSED MODE
      ONLY EXPAND BUTTON — NO LOGO
  ================================================= */}

  {collapsed && (
    <button
      type="button"
      onClick={onToggleCollapse}
      title="Expand sidebar"
      aria-label="Expand sidebar"
      className="
        flex
        h-10
        w-10
        items-center
        justify-center
        rounded-xl
        border
        border-white/[0.08]
        bg-white/[0.04]
        text-white/50
        transition-all
        hover:border-emerald-400/30
        hover:bg-emerald-400/10
        hover:text-emerald-400
      "
    >
      <ChevronRight className="h-5 w-5" />
    </button>
  )}

  {/* =================================================
      MOBILE CLOSE
  ================================================= */}

  <button
    type="button"
    onClick={onMobileClose}
    aria-label="Close sidebar"
    className="
      rounded-lg
      p-2
      text-white/50
      transition
      hover:bg-white/10
      hover:text-white
      lg:hidden
    "
  >
    <X className="h-5 w-5" />
  </button>
</div>
 

        {/* ===================================================
            NAVIGATION
        =================================================== */}

        <nav
          className="
            flex-1
            overflow-y-auto
            px-3
            py-5
          "
        >
          <div className="space-y-6">
            {visibleSections.map((section) => (
              <div key={section.label}>
                {/* Section title */}

                <div
                  className={`
                    mb-2
                    px-3
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.16em]
                    text-white/30
                    transition-all
                    duration-200

                    ${
                      collapsed
                        ? "lg:h-0 lg:overflow-hidden lg:opacity-0"
                        : "opacity-100"
                    }
                  `}
                >
                  {section.label}
                </div>

                <div className="space-y-1">
                  {section.items.map((item) => (
                    <AdminSidebarItem
                      key={item.label}
                      item={item}
                      collapsed={collapsed}
                      onNavigate={onMobileClose}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </nav>
      </aside>
    </>
  );
}