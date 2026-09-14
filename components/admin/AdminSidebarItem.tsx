"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import type { AdminNavigationItem } from "@/components/admin/admin-navigation";

interface AdminSidebarItemProps {
  item: AdminNavigationItem;
  collapsed: boolean;
  onNavigate?: () => void;
}

export default function AdminSidebarItem({
  item,
  collapsed,
  onNavigate,
}: AdminSidebarItemProps) {
  const pathname = usePathname();

  const hasChildren =
    Array.isArray(item.children) &&
    item.children.length > 0;

  /*
   * Parent is active ONLY when its own URL is active.
   *
   * Example:
   * /admin/products          → Products active
   * /admin/products/brands   → Brands active
   *
   * Products will NOT be active just because
   * we are somewhere inside /admin/products/.
   */
  const isExactActive =
    Boolean(item.href) &&
    pathname === item.href;

  /*
   * Check whether one of the children is active.
   */
  const hasActiveChild =
    item.children?.some((child) => {
      if (!child.href) return false;

      return pathname === child.href;
    }) ?? false;

  /*
   * Parent active state is ONLY exact match.
   */
  const active = isExactActive;

  /*
   * Automatically open submenu when one of its
   * children is currently active.
   */
  const [expanded, setExpanded] =
    useState(hasActiveChild);

  useEffect(() => {
    if (hasActiveChild) {
      setExpanded(true);
    }
  }, [hasActiveChild]);

  /*
   * =====================================================
   * COLLAPSED SIDEBAR
   * =====================================================
   */

  if (collapsed) {
    return (
      <div className="relative">
        <Link
          href={item.href || "#"}
          onClick={onNavigate}
          title={item.label}
          className={`
            group relative flex h-11 w-full
            items-center justify-center
            rounded-xl
            transition-all duration-200

            ${
              active
                ? "bg-white/10 text-white shadow-sm"
                : "text-white/50 hover:bg-white/[0.06] hover:text-white"
            }
          `}
        >
          <item.icon className="h-[18px] w-[18px] shrink-0" />

          <span
            className="
              pointer-events-none
              absolute left-full ml-3
              z-[100]
              whitespace-nowrap
              rounded-lg
              bg-[#1c1f26]
              px-3 py-2
              text-xs font-semibold
              text-white
              opacity-0
              shadow-xl
              transition
              group-hover:opacity-100
            "
          >
            {item.label}
          </span>
        </Link>
      </div>
    );
  }

  /*
   * =====================================================
   * ITEMS WITH CHILDREN
   *
   * IMPORTANT:
   * Clicking Products does NOT navigate.
   * It only opens/closes the submenu.
   * =====================================================
   */

  if (hasChildren) {
    return (
      <div>
        <button
          type="button"
          onClick={() =>
            setExpanded((value) => !value)
          }
          className={`
            flex w-full items-center
            rounded-xl
            px-3 py-2.5
            text-sm font-medium
            transition-all duration-200

            ${
              active
                ? "bg-white/[0.07] text-white"
                : "text-white/60 hover:bg-white/[0.05] hover:text-white"
            }
          `}
        >
          <item.icon className="h-[18px] w-[18px] shrink-0" />

          <span className="ml-3 min-w-0 flex-1 truncate text-left">
            {item.label}
          </span>

          <ChevronDown
            className={`
              h-4 w-4
              shrink-0
              text-white/40
              transition-transform duration-200

              ${expanded ? "rotate-180" : ""}
            `}
          />
        </button>

        {expanded && (
          <div
            className="
              ml-5
              mt-1
              space-y-1
              border-l
              border-white/[0.08]
              pl-3
            "
          >
            {item.children?.map((child) => {
              if (!child.href) {
                return null;
              }

              const childActive =
                pathname === child.href;

              return (
                <Link
                  key={child.label}
                  href={child.href}
                  onClick={onNavigate}
                  className={`
                    flex items-center gap-2.5
                    rounded-lg
                    px-3 py-2
                    text-[13px]
                    transition-all duration-200

                    ${
                      childActive
                        ? "bg-emerald-500/15 font-semibold text-emerald-400"
                        : "text-white/45 hover:bg-white/[0.05] hover:text-white"
                    }
                  `}
                >
                  <span
                    className={`
                      h-1.5 w-1.5
                      shrink-0
                      rounded-full
                      transition

                      ${
                        childActive
                          ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]"
                          : "bg-white/20"
                      }
                    `}
                  />

                  <span className="truncate">
                    {child.label}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  /*
   * =====================================================
   * NORMAL MENU ITEM
   * =====================================================
   */

  return (
    <Link
      href={item.href || "#"}
      onClick={onNavigate}
      className={`
        flex items-center gap-3
        rounded-xl
        px-3 py-2.5
        text-sm font-medium
        transition-all duration-200

        ${
          active
            ? "bg-white/10 text-white shadow-sm"
            : "text-white/55 hover:bg-white/[0.06] hover:text-white"
        }
      `}
    >
      <item.icon className="h-[18px] w-[18px] shrink-0" />

      <span className="truncate">
        {item.label}
      </span>
    </Link>
  );
}