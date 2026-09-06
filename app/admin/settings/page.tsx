"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { changeAdminPassword } from "@/lib/api/admin";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export default function AdminSettingsPage() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
const [newPassword, setNewPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");

const [passwordLoading, setPasswordLoading] = useState(false);
const [passwordError, setPasswordError] = useState("");
const [passwordSuccess, setPasswordSuccess] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("smartprix_user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
  }, []);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Settings
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage your administrator preferences and account.
        </p>
      </div>

      {/* Account */}
      <section className="rounded-xl border bg-white shadow-sm">
        <div className="border-b px-6 py-5">
          <h2 className="font-semibold text-gray-900">
            Account
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Your administrator account information.
          </p>
        </div>

        <div className="grid gap-5 p-6 sm:grid-cols-2">
          <SettingField
            label="Name"
            value={user?.name || "Loading..."}
          />

          <SettingField
            label="Email"
            value={user?.email || "Loading..."}
          />

          <SettingField
            label="Role"
            value={user?.role || "Loading..."}
          />

          <SettingField
            label="Account ID"
            value={user?.id || "Loading..."}
          />
        </div>
      </section>

{/* Security */}
<section className="rounded-xl border bg-white shadow-sm">
  <div className="border-b px-6 py-5">
    <h2 className="font-semibold text-gray-900">
      Security
    </h2>

    <p className="mt-1 text-sm text-gray-500">
      Change your administrator account password.
    </p>
  </div>

  <form
    onSubmit={async (event) => {
      event.preventDefault();

      setPasswordError("");
      setPasswordSuccess("");

      if (!currentPassword) {
        setPasswordError(
          "Please enter your current password.",
        );
        return;
      }

      if (newPassword.length < 8) {
        setPasswordError(
          "New password must be at least 8 characters long.",
        );
        return;
      }

      if (newPassword !== confirmPassword) {
        setPasswordError(
          "New passwords do not match.",
        );
        return;
      }

      try {
        setPasswordLoading(true);

        const response = await changeAdminPassword({
          currentPassword,
          newPassword,
        });

        if (!response.success) {
          throw new Error(
            response.message ||
              "Failed to change password.",
          );
        }

        setPasswordSuccess(
          "Password changed successfully.",
        );

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } catch (error) {
        setPasswordError(
          error instanceof Error
            ? error.message
            : "Failed to change password.",
        );
      } finally {
        setPasswordLoading(false);
      }
    }}
    className="space-y-5 p-6"
  >
    {/* Current Password */}
    <div>
      <label
        htmlFor="currentPassword"
        className="mb-2 block text-sm font-medium text-gray-700"
      >
        Current password
      </label>

      <input
        id="currentPassword"
        type="password"
        value={currentPassword}
        onChange={(event) =>
          setCurrentPassword(event.target.value)
        }
        autoComplete="current-password"
        placeholder="Enter current password"
        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
      />
    </div>

    {/* New Password */}
    <div>
      <label
        htmlFor="newPassword"
        className="mb-2 block text-sm font-medium text-gray-700"
      >
        New password
      </label>

      <input
        id="newPassword"
        type="password"
        value={newPassword}
        onChange={(event) =>
          setNewPassword(event.target.value)
        }
        autoComplete="new-password"
        placeholder="Enter new password"
        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
      />

      <p className="mt-2 text-xs text-gray-500">
        Password must contain at least 8 characters.
      </p>
    </div>

    {/* Confirm Password */}
    <div>
      <label
        htmlFor="confirmPassword"
        className="mb-2 block text-sm font-medium text-gray-700"
      >
        Confirm new password
      </label>

      <input
        id="confirmPassword"
        type="password"
        value={confirmPassword}
        onChange={(event) =>
          setConfirmPassword(event.target.value)
        }
        autoComplete="new-password"
        placeholder="Confirm new password"
        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
      />
    </div>

    {/* Error */}
    {passwordError && (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {passwordError}
      </div>
    )}

    {/* Success */}
    {passwordSuccess && (
      <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
        {passwordSuccess}
      </div>
    )}

    {/* Submit */}
    <div className="flex justify-end">
      <button
        type="submit"
        disabled={passwordLoading}
        className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {passwordLoading
          ? "Changing password..."
          : "Change password"}
      </button>
    </div>
  </form>
</section>


      {/* Preferences */}
      <section className="rounded-xl border bg-white shadow-sm">
        <div className="border-b px-6 py-5">
          <h2 className="font-semibold text-gray-900">
            Preferences
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Customize your admin experience.
          </p>
        </div>

        <div className="divide-y">
          <PreferenceRow
            title="Email notifications"
            description="Receive notifications about important admin events."
          />

          <PreferenceRow
            title="Activity updates"
            description="Show recent content activity on the dashboard."
          />
        </div>
      </section>

      {/* Navigation */}
      <div className="flex gap-3">
        <Link
          href="/admin/profile"
          className="rounded-lg border bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          View Profile
        </Link>

        <Link
          href="/admin"
          className="rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
        >
          Dashboard
        </Link>
      </div>
    </div>
  );
}

function SettingField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <div className="rounded-lg border bg-gray-50 px-4 py-3 text-sm text-gray-700">
        {value}
      </div>
    </div>
  );
}

function SettingAction({
  title,
  description,
  button,
  onClick,
  disabled = false,
}: {
  title: string;
  description: string;
  button: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">
          {title}
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="shrink-0 rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-default disabled:opacity-70"
      >
        {button}
      </button>
    </div>
  );
}

function PreferenceRow({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center justify-between gap-6 px-6 py-5">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">
          {title}
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        className="relative h-6 w-11 shrink-0 rounded-full bg-black"
        aria-label={`Toggle ${title}`}
      >
        <span className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm" />
      </button>
    </div>
  );
}
