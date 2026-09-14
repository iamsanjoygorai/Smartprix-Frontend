import type { LucideIcon } from "lucide-react";

import {
  Activity,
  BarChart3,
  Boxes,
  ClipboardList,
  History,
  LayoutDashboard,
  Newspaper,
  Package,
  Settings,
  ShieldCheck,
  Smartphone,
  Tags,
  Users,
  UsersRound,
} from "lucide-react";

export interface AdminNavigationItem {
  label: string;
  href?: string;
  icon: LucideIcon;
  permission?: string;
  superAdminOnly?: boolean;
  children?: AdminNavigationItem[];
}

export interface AdminNavigationSection {
  label: string;
  items: AdminNavigationItem[];
}

export const adminNavigation: AdminNavigationSection[] = [
  {
    label: "Workspace",
    items: [
      {
        label: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
        permission: "dashboard.view",
      },
      {
        label: "Analytics",
        href: "/admin/analytics",
        icon: BarChart3,
        permission: "dashboard.view",
      },
    ],
  },

  {
    label: "Catalog",
    items: [
      {
        label: "Products",
        href: "/admin/products",
        icon: Smartphone,
        permission: "products.view",

        children: [
          {
            label: "All Products",
            href: "/admin/products",
            icon: Package,
            permission: "products.view",
          },
          {
            label: "Add Product",
            href: "/admin/products/new",
            icon: Package,
            permission: "products.create",
          },
          {
            label: "Categories",
            href: "/admin/products/categories",
            icon: Boxes,
            permission: "categories.view",
          },
          {
            label: "Brands",
            href: "/admin/products/brands",
            icon: Tags,
            permission: "products.view",
          },
          {
            label: "Specifications",
            href: "/admin/products/specifications",
            icon: ClipboardList,
            permission: "products.view",
          },
        ],
      },
    ],
  },

  {
    label: "Content",
    items: [
      {
        label: "News",
        href: "/admin/news",
        icon: Newspaper,
        permission: "news.view",
      },
    ],
  },

  {
    label: "Users",
    items: [
      {
        label: "Users",
        href: "/admin/users",
        icon: UsersRound,
        permission: "users.view",
      },
      {
        label: "Admin Management",
        href: "/admin/admins",
        icon: Users,
        permission: "admins.view",
      },
    ],
  },

  {
    label: "System",
    items: [
      {
        label: "Audit Logs",
        href: "/admin/audit-logs",
        icon: Activity,
        permission: "audit.view",
      },
      {
        label: "Audit & Security",
        href: "/admin/audit",
        icon: ShieldCheck,
        permission: "audit.view",
      },
      {
        label: "History",
        href: "/admin/history",
        icon: History,
        superAdminOnly: true,
      },
      {
        label: "Settings",
        href: "/admin/settings",
        icon: Settings,
        permission: "settings.view",
      },
    ],
  },
];