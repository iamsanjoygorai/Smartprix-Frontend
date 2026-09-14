"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AdminUser {
  id?: string;
  email?: string;
  name?: string;
  role?: string;
  permissions?: string[];
}

interface AdminPermissionGuardProps {
  permission: string;
  children: React.ReactNode;
}

export default function AdminPermissionGuard({
  permission,
  children,
}: AdminPermissionGuardProps) {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const storedUser =
      localStorage.getItem("smartprix_user");

    if (!storedUser) {
      router.replace("/login");
      return;
    }

    try {
      const user = JSON.parse(
        storedUser,
      ) as AdminUser;

      const role = String(
        user.role ?? "",
      ).toUpperCase();

      const isAdminUser =
        role === "ADMIN" ||
        role === "SUPER_ADMIN" ||
        role === "EDITOR";

      if (!isAdminUser) {
        router.replace("/");
        return;
      }

      // SUPER_ADMIN has full access.
      if (role === "SUPER_ADMIN") {
        setAllowed(true);
        return;
      }

      const hasPermission =
        Array.isArray(user.permissions) &&
        user.permissions.includes(permission);

      if (!hasPermission) {
        router.replace("/admin");
        return;
      }

      setAllowed(true);
    } catch {
      localStorage.removeItem(
        "smartprix_user",
      );

      localStorage.removeItem(
        "smartprix_token",
      );

      router.replace("/login");
    } finally {
      setChecking(false);
    }
  }, [permission, router]);

  if (checking) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-gray-500">
          Checking permissions...
        </p>
      </div>
    );
  }

  if (!allowed) {
    return null;
  }

  return <>{children}</>;
}