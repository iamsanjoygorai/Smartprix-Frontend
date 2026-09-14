import type { AdminNavigationItem } from "@/components/admin/admin-navigation";

export interface AdminUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  mobile?: string | null;
  role?: string | null;
  permissions?: string[];
  profileImageUrl?: string | null;
}

/**
 * Check whether the user has a specific admin permission.
 */
export function hasAdminPermission(
  user: AdminUser,
  permission?: string,
): boolean {
  // No permission requirement means everyone
  // who can access the admin area is allowed.
  if (!permission) {
    return true;
  }

  const role = String(
    user.role ?? "",
  ).toUpperCase();

  // SUPER_ADMIN has complete access.
  if (role === "SUPER_ADMIN") {
    return true;
  }

  return (
    Array.isArray(user.permissions) &&
    user.permissions.includes(permission)
  );
}

/**
 * Check whether an admin navigation item
 * should be visible to the current user.
 */
export function canAccessAdminNavigation(
  user: AdminUser,
  item: AdminNavigationItem,
): boolean {
  const role = String(
    user.role ?? "",
  ).toUpperCase();

  // SUPER_ADMIN can access everything.
  if (role === "SUPER_ADMIN") {
    return true;
  }

  // Explicit SUPER_ADMIN-only navigation item.
  if (item.superAdminOnly) {
    return false;
  }

  // Permission-protected navigation item.
  if (item.permission) {
    return hasAdminPermission(
      user,
      item.permission,
    );
  }

  // No restriction.
  return true;
}

/**
 * Filter children of a navigation item
 * according to the current user's permissions.
 */
export function filterAdminNavigationChildren(
  user: AdminUser,
  item: AdminNavigationItem,
): AdminNavigationItem {
  if (
    !item.children ||
    item.children.length === 0
  ) {
    return item;
  }

  return {
    ...item,

    children: item.children.filter(
      (child) =>
        canAccessAdminNavigation(
          user,
          child,
        ),
    ),
  };
}

/**
 * Filter the complete admin navigation tree.
 *
 * Parent items and their children are both
 * permission-checked here.
 */
export function filterAdminNavigation(
  user: AdminUser,
  navigation: {
    label: string;
    items: AdminNavigationItem[];
  }[],
) {
  return navigation
    .map((section) => {
      const items = section.items
        .filter((item) =>
          canAccessAdminNavigation(
            user,
            item,
          ),
        )
        .map((item) =>
          filterAdminNavigationChildren(
            user,
            item,
          ),
        )
        .filter((item) => {
          // Normal item with no children.
          if (!item.children) {
            return true;
          }

          // Parent with at least one visible child.
          return item.children.length > 0;
        });

      return {
        ...section,
        items,
      };
    })
    .filter(
      (section) => section.items.length > 0,
    );
}
