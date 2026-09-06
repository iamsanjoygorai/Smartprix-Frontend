"use client";

import { useEffect, useState } from "react";

interface AdminUser {
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
  const [allowed, setAllowed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const storedUser =
      localStorage.getItem("smartprix_user");

    if (!storedUser) {
      setLoaded(true);
      return;
    }

    try {
      const user = JSON.parse(
        storedUser,
      ) as AdminUser;

      setAllowed(
        user.permissions?.includes(permission) ?? false,
      );
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
