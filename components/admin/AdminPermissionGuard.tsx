"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  type AdminPermission,
} from "@/lib/admin/permissions";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
}

interface AdminPermissionGuardProps {
  permission: AdminPermission;
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

      const isAdminUser =
        user.role === "ADMIN" ||
        user.role === "SUPER_ADMIN" ||
        user.role === "EDITOR";

      if (!isAdminUser) {
        router.replace("/");
        return;
      }

      const hasPermission =
        user.permissions?.includes(permission);

      if (!hasPermission) {
        router.replace("/admin");
        return;
      }

      setAllowed(true);
    } catch {
      localStorage.removeItem("smartprix_user");
      localStorage.removeItem("smartprix_token");

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
