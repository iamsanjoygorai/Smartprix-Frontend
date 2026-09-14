"use client";

import { useEffect, useState } from "react";

interface AdminUser {
  role?: string;
  permissions?: string[];
}

interface AdminPermissionProps {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function AdminPermission({
  permission,
  children,
  fallback = null,
}: AdminPermissionProps) {
  const [allowed, setAllowed] =
    useState(false);

  const [loaded, setLoaded] =
    useState(false);

  useEffect(() => {
    const storedUser =
      localStorage.getItem("smartprix_user");

    if (!storedUser) {
      setAllowed(false);
      setLoaded(true);
      return;
    }

    try {
      const user = JSON.parse(
        storedUser,
      ) as AdminUser;

      const role = String(
        user.role ?? "",
      ).toUpperCase();

      // SUPER_ADMIN has all permissions.
      if (role === "SUPER_ADMIN") {
        setAllowed(true);
        setLoaded(true);
        return;
      }

      const hasPermission =
        Array.isArray(user.permissions) &&
        user.permissions.includes(permission);

      setAllowed(hasPermission);
    } catch {
      setAllowed(false);
    } finally {
      setLoaded(true);
    }
  }, [permission]);

  if (!loaded) {
    return null;
  }

  if (!allowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}