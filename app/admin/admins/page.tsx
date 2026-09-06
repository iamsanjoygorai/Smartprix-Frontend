"use client";

import { FormEvent, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api/client";
import AdminPermissionGuard from "@/components/admin/AdminPermissionGuard";
import AdminPermission from "@/components/admin/AdminPermission";
import UserPermissionsModal from "@/components/admin/UserPermissionsModal";

type AdminRole = "EDITOR" | "ADMIN" | "SUPER_ADMIN";

interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  role: string;
  isDisabled: boolean;
  createdAt: string;
  updatedAt: string;
  userRoles?: {
    role: {
      id: string;
      name: string;
    };
  }[];
}

interface AdminResponse {
  success: boolean;
  data: AdminUser[];
}

interface CreateAdminResponse {
  success: boolean;
  message: string;
  data: AdminUser;
}

interface UpdateAdminResponse {
  success: boolean;
  message: string;
  data: AdminUser;
}

interface DeleteAdminResponse {
  success: boolean;
  message: string;
}

const ROLES: AdminRole[] = [
  "EDITOR",
  "ADMIN",
  "SUPER_ADMIN",
];

export default function AdminsPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingAdmin, setEditingAdmin] =
    useState<AdminUser | null>(null);
    const [permissionAdmin, setPermissionAdmin] =
  useState<AdminUser | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "ADMIN" as AdminRole,
  });

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await apiFetch<AdminResponse>("/admin/admins");

      setAdmins(response.data ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to fetch admins",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      password: "",
      role: "ADMIN",
    });

    setEditingAdmin(null);
    setShowForm(false);
  };

  const handleCreate = () => {
    setEditingAdmin(null);

    setForm({
      name: "",
      email: "",
      password: "",
      role: "ADMIN",
    });

    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const handleEdit = (admin: AdminUser) => {
    setEditingAdmin(admin);

    setForm({
      name: admin.name ?? "",
      email: admin.email,
      password: "",
      role: (
        ROLES.includes(admin.role as AdminRole)
          ? admin.role
          : "ADMIN"
      ) as AdminRole,
    });

    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (editingAdmin) {
        const response =
          await apiFetch<UpdateAdminResponse>(
            `/admin/admins/${editingAdmin.id}`,
            {
              method: "PATCH",
              body: JSON.stringify({
                name: form.name,
                email: form.email,
                role: form.role,
              }),
            },
          );

        setSuccess(
          response.message ||
            "Admin updated successfully",
        );
      } else {
        if (!form.password) {
          setError("Password is required");
          return;
        }

        const response =
  await apiFetch<CreateAdminResponse>(
    "/admin/admins",
    {
      method: "POST",
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      }),
    },
  );

setSuccess(
  form.role === "EDITOR"
    ? "Editor created successfully"
    : form.role === "ADMIN"
      ? "Admin created successfully"
      : "Super Admin created successfully",
);
      }

      resetForm();
      await fetchAdmins();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save admin",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (admin: AdminUser) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${admin.name || admin.email}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      const response =
        await apiFetch<DeleteAdminResponse>(
          `/admin/admins/${admin.id}`,
          {
            method: "DELETE",
          },
        );

      setSuccess(
        response.message ||
          "Admin deleted successfully",
      );

      await fetchAdmins();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete admin",
      );
    }
  };

  const handleToggleStatus = async (admin: AdminUser) => {
  const action = admin.isDisabled ? "activate" : "block";

  const confirmed = window.confirm(
    `Are you sure you want to ${action} ${
      admin.name || admin.email
    }?`,
  );

  if (!confirmed) {
    return;
  }

  try {
    setSaving(true);
    setError("");

    await apiFetch(
      `/admin/admins/${admin.id}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({
          isDisabled: !admin.isDisabled,
        }),
      },
    );

    setSuccess(
      admin.isDisabled
        ? "Admin activated successfully"
        : "Admin blocked successfully",
    );

    await fetchAdmins();
  } catch (error) {
    setError(
      error instanceof Error
        ? error.message
        : "Failed to update account status",
    );
  } finally {
    setSaving(false);
  }
};

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      },
    );
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "bg-red-100 text-red-700";

      case "ADMIN":
        return "bg-blue-100 text-blue-700";

      case "EDITOR":
        return "bg-purple-100 text-purple-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <AdminPermissionGuard permission="admins.view">
      <div className="p-6">
        {permissionAdmin && (
  <UserPermissionsModal
    userId={permissionAdmin.id}
    userName={permissionAdmin.name}
    userRole={permissionAdmin.role}
    onClose={() => setPermissionAdmin(null)}
    onSaved={() => {
      setSuccess(
        "User permissions updated successfully",
      );
    }}
  />
)}
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Admin Management
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage EDITOR, ADMIN and SUPER_ADMIN
              accounts.
            </p>
          </div>

          <AdminPermission permission="admins.create">
            <button
              type="button"
              onClick={handleCreate}
              className="rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              + Add Admin
            </button>
          </AdminPermission>
        </div>

        {/* Messages */}
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

        {/* Create / Edit Form */}
        {showForm && (
          <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingAdmin
                    ? "Edit Admin"
                    : "Create Admin"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {editingAdmin
                    ? "Update admin account details."
                    : "Create a new administrative account."}
                </p>
              </div>

              <button
                type="button"
                onClick={resetForm}
                className="text-sm text-gray-500 hover:text-gray-900"
              >
                Cancel
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="grid gap-5 md:grid-cols-2"
            >
              {/* Name */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Name
                </label>

                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                  placeholder="Enter name"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black"
                />
              </div>

              {/* Email */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Email
                </label>

                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      email: e.target.value,
                    })
                  }
                  placeholder="admin@example.com"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black"
                />
              </div>

              {/* Password */}
              {!editingAdmin && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Password
                  </label>

                  <input
                    type="password"
                    required
                    minLength={8}
                    value={form.password}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        password: e.target.value,
                      })
                    }
                    placeholder="Minimum 8 characters"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black"
                  />
                </div>
              )}

              {/* Role */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Role
                </label>

                <select
                  value={form.role}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      role: e.target.value as AdminRole,
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-black"
                >
                  {ROLES.map((role) => (
                    <option
                      key={role}
                      value={role}
                    >
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit */}
              <div className="flex items-end gap-3 md:col-span-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingAdmin
                      ? "Update Admin"
                      : "Create Admin"}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Admin Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex min-h-[250px] items-center justify-center">
              <p className="text-sm text-gray-500">
                Loading admins...
              </p>
            </div>
          ) : admins.length === 0 ? (
            <div className="flex min-h-[250px] flex-col items-center justify-center px-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900">
                No admin accounts found
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Create an admin account to get started.
              </p>

              <AdminPermission permission="admins.create">
                <button
                  type="button"
                  onClick={handleCreate}
                  className="mt-4 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                >
                  + Add Admin
                </button>
              </AdminPermission>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Admin
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Role
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Status
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Created
                      </th>

                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {admins.map((admin) => (
                      <tr
                        key={admin.id}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-5 py-4">
                          <div className="font-medium text-gray-900">
                            {admin.name || "Unnamed Admin"}
                          </div>

                          <div className="mt-0.5 text-sm text-gray-500">
                            {admin.email}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getRoleBadgeClass(
                              admin.role,
                            )}`}
                          >
                            {admin.role}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          {admin.isDisabled ? (
                            <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                              Disabled
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                              Active
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-600">
                          {formatDate(admin.createdAt)}
                        </td>

                        <td className="px-5 py-4">
                         <div className="flex justify-end gap-2">
  {admin.role !== "SUPER_ADMIN" && (
    <button
      type="button"
      onClick={() => setPermissionAdmin(admin)}
      className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
    >
      Permissions
    </button>
    
  )}

  <button
  type="button"
  onClick={() => handleToggleStatus(admin)}
  disabled={saving}
  className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
    admin.isDisabled
      ? "border-green-300 text-green-700 hover:bg-green-50"
      : "border-red-300 text-red-700 hover:bg-red-50"
  } disabled:cursor-not-allowed disabled:opacity-50`}
>
  {admin.isDisabled ? "Activate" : "Block"}
</button>

  <AdminPermission permission="admins.update">
    <button
      type="button"
      onClick={() => handleEdit(admin)}
      className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
    >
      Edit
    </button>
  </AdminPermission>

  <AdminPermission permission="admins.delete">
    <button
      type="button"
      onClick={() => handleDelete(admin)}
      className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
    >
      Delete
    </button>
  </AdminPermission>
</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="divide-y divide-gray-100 md:hidden">
                
                {admins.map((admin) => (
                  
                  <div
                    key={admin.id}
                    className="p-5"
                  >
                    <button
  type="button"
  onClick={() => handleToggleStatus(admin)}
  disabled={saving}
  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium ${
    admin.isDisabled
      ? "border-green-300 text-green-700 hover:bg-green-50"
      : "border-red-300 text-red-700 hover:bg-red-50"
  } disabled:cursor-not-allowed disabled:opacity-50`}
>
  {admin.isDisabled ? "Activate" : "Block"}
</button>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {admin.name ||
                            "Unnamed Admin"}
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                          {admin.email}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${getRoleBadgeClass(
                          admin.role,
                        )}`}
                      >
                        {admin.role}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-sm">
                      <div>
                        <span className="text-gray-500">
                          Status:
                        </span>{" "}
                        <span
                          className={
                            admin.isDisabled
                              ? "font-medium text-gray-600"
                              : "font-medium text-green-600"
                          }
                        >
                          {admin.isDisabled
                            ? "Disabled"
                            : "Active"}
                        </span>
                      </div>

                      <div className="text-gray-500">
                        {formatDate(admin.createdAt)}
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
  {admin.role !== "SUPER_ADMIN" && (
    <button
      type="button"
      onClick={() => setPermissionAdmin(admin)}
      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
    >
      Permissions
    </button>
  )}

  <AdminPermission permission="admins.update">
    <button
      type="button"
      onClick={() => handleEdit(admin)}
      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
    >
      Edit
    </button>
  </AdminPermission>

  <AdminPermission permission="admins.delete">
    <button
      type="button"
      onClick={() => handleDelete(admin)}
      className="flex-1 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
    >
      Delete
    </button>
  </AdminPermission>
</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </AdminPermissionGuard>
  );
}