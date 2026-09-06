"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api/client";

interface PermissionItem {
  name: string;
  description: string | null;
  roleAllowed: boolean;
  override: boolean | null;
  allowed: boolean;
}

interface PermissionsResponse {
  success: boolean;
  user: {
    id: string;
    name: string | null;
    email: string;
    role: string;
  };
  permissions: PermissionItem[];
}

interface UserPermissionsModalProps {
  userId: string;
  userName: string | null;
  userRole: string;
  onClose: () => void;
  onSaved?: () => void;
}

const PERMISSION_LABELS: Record<string, string> = {
  view: "View",
  create: "Create",
  update: "Update",
  delete: "Delete",
  publish: "Publish",
  upload: "Upload",
  disable: "Disable",
  change: "Change",
};

const GROUP_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  products: "Products",
  news: "News",
  media: "Media",
  users: "Users",
  admins: "Admin Management",
  settings: "Settings",
  account: "Account",
  audit: "Audit",
};

export default function UserPermissionsModal({
  userId,
  userName,
  userRole,
  onClose,
  onSaved,
}: UserPermissionsModalProps) {
  const [permissions, setPermissions] = useState<
    PermissionItem[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadPermissions = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await apiFetch<PermissionsResponse>(
            `/admin/admins/${userId}/permissions`,
          );

        setPermissions(response.permissions ?? []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load permissions",
        );
      } finally {
        setLoading(false);
      }
    };

    loadPermissions();
  }, [userId]);

  const groupedPermissions = useMemo(() => {
    const groups: Record<string, PermissionItem[]> =
      {};

    for (const permission of permissions) {
      const [group] = permission.name.split(".");

      if (!groups[group]) {
        groups[group] = [];
      }

      groups[group].push(permission);
    }

    return groups;
  }, [permissions]);

  const togglePermission = (name: string) => {
    setPermissions((current) =>
      current.map((permission) =>
        permission.name === name
          ? {
              ...permission,
              allowed: !permission.allowed,
              override: !permission.allowed,
            }
          : permission,
      ),
    );
  };

  const savePermissions = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await apiFetch(
        `/admin/admins/${userId}/permissions`,
        {
          method: "PUT",
          body: JSON.stringify({
            permissions: permissions.map(
              (permission) => ({
                name: permission.name,
                allowed: permission.allowed,
              }),
            ),
          }),
        },
      );

      setSuccess(
        "User permissions updated successfully",
      );

      onSaved?.();

      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update permissions",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-200 px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Manage Permissions
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {userName || "Unnamed Admin"} · {userRole}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[65vh] overflow-y-auto p-6">
          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {success}
            </div>
          )}

          {loading ? (
            <div className="flex min-h-[250px] items-center justify-center">
              <p className="text-sm text-gray-500">
                Loading permissions...
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedPermissions).map(
                ([group, groupPermissions]) => (
                  <div
                    key={group}
                    className="overflow-hidden rounded-xl border border-gray-200"
                  >
                    <div className="border-b border-gray-200 bg-gray-50 px-5 py-3">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
                        {GROUP_LABELS[group] ||
                          group}
                      </h3>
                    </div>

                    <div className="divide-y divide-gray-100">
                      {groupPermissions.map(
                        (permission) => {
                          const action =
                            permission.name.split(
                              ".",
                            )[1];

                          return (
                            <label
                              key={permission.name}
                              className="flex cursor-pointer items-center justify-between px-5 py-4 hover:bg-gray-50"
                            >
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {PERMISSION_LABELS[
                                    action
                                  ] || action}
                                </p>

                                {permission.description && (
                                  <p className="mt-0.5 text-xs text-gray-500">
                                    {
                                      permission.description
                                    }
                                  </p>
                                )}
                              </div>

                              <input
                                type="checkbox"
                                checked={
                                  permission.allowed
                                }
                                onChange={() =>
                                  togglePermission(
                                    permission.name,
                                  )
                                }
                                className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                              />
                            </label>
                          );
                        },
                      )}
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={savePermissions}
            disabled={loading || saving}
            className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Permissions"}
          </button>
        </div>
      </div>
    </div>
  );
}