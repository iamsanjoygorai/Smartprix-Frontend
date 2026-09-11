"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import { changeUserPassword } from "@/lib/api/user";

function EyeIcon({ off = false }: { off?: boolean }) {
  return off ? (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M3 3l18 18" />
      <path d="M10.6 10.6a2 2 0 102.8 2.8" />
      <path d="M9.9 4.2A10.8 10.8 0 0112 4c7 0 10 8 10 8a17.5 17.5 0 01-3.1 4.6" />
      <path d="M6.6 6.6C3.8 8.6 2 12 2 12s3 8 10 8c1.6 0 3-.4 4.2-1" />
    </svg>
  ) : (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M2 12s3-8 10-8 10 8 10 8-3 8-10 8S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c.8-4 3.4-6 8-6s7.2 2 8 6" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 3l8 3v5c0 5.2-3.4 8.6-8 10-4.6-1.4-8-4.8-8-10V6l8-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M18 8a6 6 0 00-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </svg>
  );
}

export default function UserSettingsPage() {
  const router = useRouter();

  const {
    data: user,
    isLoading,
  } = useCurrentUser();

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [passwordLoading, setPasswordLoading] =
    useState(false);

  const [passwordMessage, setPasswordMessage] =
    useState("");

  const [emailNotifications, setEmailNotifications] =
    useState(true);

  const [priceAlerts, setPriceAlerts] =
    useState(true);

  // --------------------------------------------------
  // Protect settings page
  // --------------------------------------------------

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/profile");
    }
  }, [isLoading, user, router]);

  // --------------------------------------------------
  // Load local preferences
  // --------------------------------------------------

  useEffect(() => {
    const emailPreference =
      localStorage.getItem(
        "smartprix_email_notifications",
      );

    const pricePreference =
      localStorage.getItem(
        "smartprix_price_alerts",
      );

    if (emailPreference !== null) {
      setEmailNotifications(
        emailPreference === "true",
      );
    }

    if (pricePreference !== null) {
      setPriceAlerts(
        pricePreference === "true",
      );
    }
  }, []);

  // --------------------------------------------------
  // Password change
  // --------------------------------------------------

 if (!currentPassword || !newPassword || !confirmPassword) {
  setPasswordMessage(
    "Please fill in all password fields.",
  );
  return;
}

if (newPassword.length < 6) {
  setPasswordMessage(
    "New password must be at least 6 characters.",
  );
  return;
}

if (newPassword !== confirmPassword) {
  setPasswordMessage(
    "New password and confirmation do not match.",
  );
  return;
}

  // --------------------------------------------------
  // Preferences
  // --------------------------------------------------

  const handleEmailNotifications = (
    value: boolean,
  ) => {
    setEmailNotifications(value);

    localStorage.setItem(
      "smartprix_email_notifications",
      String(value),
    );
  };

  const handlePriceAlerts = (
    value: boolean,
  ) => {
    setPriceAlerts(value);

    localStorage.setItem(
      "smartprix_price_alerts",
      String(value),
    );
  };

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f7fa] px-4 py-10">
        <div className="mx-auto max-w-[1050px] animate-pulse">
          <div className="h-8 w-48 rounded-lg bg-gray-200" />

          <div className="mt-6 h-44 rounded-2xl bg-white shadow-sm" />

          <div className="mt-5 h-72 rounded-2xl bg-white shadow-sm" />

          <div className="mt-5 h-52 rounded-2xl bg-white shadow-sm" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const profileName =
    user.name?.trim() ||
    user.email?.split("@")[0] ||
    user.mobile ||
    "User";

  const profileInitial =
    profileName.charAt(0).toUpperCase();

  return (
    <main className="min-h-screen bg-[#f5f7fa] px-4 py-7 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1050px]">

        {/* ------------------------------------------------ */}
        {/* Header */}
        {/* ------------------------------------------------ */}

        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
              <Link
                href="/profile"
                className="transition hover:text-[#1877f2]"
              >
                Profile
              </Link>

              <span>/</span>

              <span className="text-gray-800">
                Settings
              </span>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Account settings
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage your account, security and preferences.
            </p>
          </div>

          <Link
            href="/profile"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-[#1877f2] hover:text-[#1877f2]"
          >
            ← Back to profile
          </Link>
        </div>

        {/* ------------------------------------------------ */}
        {/* Account */}
        {/* ------------------------------------------------ */}

        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="border-b border-gray-100 px-5 py-5 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#1877f2]">
                <UserIcon />
              </div>

              <div>
                <h2 className="font-bold text-gray-900">
                  Account
                </h2>

                <p className="text-xs text-gray-500">
                  Your basic account information
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6">

            {/* Profile */}
            <div className="mb-6 flex flex-col gap-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 p-5 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-4">

                {user.profileImageUrl ? (
                  <img
                    src={user.profileImageUrl}
                    alt={profileName}
                    className="h-16 w-16 rounded-full object-cover ring-4 ring-white shadow"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#1877f2] to-[#6c5ce7] text-xl font-bold text-white ring-4 ring-white shadow">
                    {profileInitial}
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {profileName}
                  </h3>

                  <p className="text-sm text-gray-500">
                    {user.email}
                  </p>
                </div>
              </div>

              <Link
                href="/profile/edit"
                className="inline-flex items-center justify-center rounded-xl bg-[#1877f2] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1467d5]"
              >
                Edit profile
              </Link>
            </div>

            {/* Information grid */}

            <div className="grid gap-4 sm:grid-cols-2">

              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Full name
                </p>

                <p className="mt-1 font-semibold text-gray-900">
                  {user.name || "Not added"}
                </p>
              </div>

              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Email
                </p>

                <p className="mt-1 break-all font-semibold text-gray-900">
                  {user.email || "Not added"}
                </p>
              </div>

              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Mobile
                </p>

                <p className="mt-1 font-semibold text-gray-900">
                  {user.mobile || "Not added"}
                </p>
              </div>

              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Account type
                </p>

                <p className="mt-1 font-semibold text-gray-900">
                  {user.role || "USER"}
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* ------------------------------------------------ */}
        {/* Security */}
        {/* ------------------------------------------------ */}

        <section className="mt-5 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="border-b border-gray-100 px-5 py-5 sm:px-6">
            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <ShieldIcon />
              </div>

              <div>
                <h2 className="font-bold text-gray-900">
                  Security
                </h2>

                <p className="text-xs text-gray-500">
                  Keep your account secure
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleChangePassword}
            className="p-5 sm:p-6"
          >

            <div className="grid gap-5">

              {/* Current password */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Current password
                </label>

                <div className="relative">
                  <input
                    type={
                      showCurrentPassword
                        ? "text"
                        : "password"
                    }
                    value={currentPassword}
                    onChange={(e) =>
                      setCurrentPassword(
                        e.target.value,
                      )
                    }
                    placeholder="Enter current password"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-12 text-sm outline-none transition focus:border-[#1877f2] focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowCurrentPassword(
                        (value) => !value,
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  >
                    <EyeIcon
                      off={!showCurrentPassword}
                    />
                  </button>
                </div>
              </div>

              {/* New password */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  New password
                </label>

                <div className="relative">
                  <input
                    type={
                      showNewPassword
                        ? "text"
                        : "password"
                    }
                    value={newPassword}
                    onChange={(e) =>
                      setNewPassword(
                        e.target.value,
                      )
                    }
                    placeholder="Enter new password"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-12 text-sm outline-none transition focus:border-[#1877f2] focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowNewPassword(
                        (value) => !value,
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  >
                    <EyeIcon
                      off={!showNewPassword}
                    />
                  </button>
                </div>
              </div>

              {/* Confirm password */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Confirm new password
                </label>

                <div className="relative">
                  <input
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(
                        e.target.value,
                      )
                    }
                    placeholder="Confirm new password"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-12 text-sm outline-none transition focus:border-[#1877f2] focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        (value) => !value,
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  >
                    <EyeIcon
                      off={!showConfirmPassword}
                    />
                  </button>
                </div>
              </div>

            </div>

            {passwordMessage && (
              <div
                className={`mt-5 rounded-xl border px-4 py-3 text-sm ${
                  passwordMessage.includes(
                    "successfully",
                  )
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-red-200 bg-red-50 text-red-600"
                }`}
              >
                {passwordMessage}
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={passwordLoading}
                className="rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                {passwordLoading
                  ? "Updating..."
                  : "Update password"}
              </button>
            </div>
          </form>
        </section>

        {/* ------------------------------------------------ */}
        {/* Notifications */}
        {/* ------------------------------------------------ */}

        <section className="mt-5 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="border-b border-gray-100 px-5 py-5 sm:px-6">
            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                <BellIcon />
              </div>

              <div>
                <h2 className="font-bold text-gray-900">
                  Notifications
                </h2>

                <p className="text-xs text-gray-500">
                  Choose what you want to receive
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-100">

            {/* Email notifications */}

            <div className="flex items-center justify-between gap-5 px-5 py-5 sm:px-6">

              <div>
                <p className="font-semibold text-gray-900">
                  Email notifications
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Receive useful updates and account
                  notifications by email.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  handleEmailNotifications(
                    !emailNotifications,
                  )
                }
                className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                  emailNotifications
                    ? "bg-[#1877f2]"
                    : "bg-gray-300"
                }`}
                aria-label="Toggle email notifications"
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
                    emailNotifications
                      ? "left-6"
                      : "left-1"
                  }`}
                />
              </button>
            </div>

            {/* Price alerts */}

            <div className="flex items-center justify-between gap-5 px-5 py-5 sm:px-6">

              <div>
                <p className="font-semibold text-gray-900">
                  Price alerts
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Get notified when products you're
                  interested in have price changes.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  handlePriceAlerts(!priceAlerts)
                }
                className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                  priceAlerts
                    ? "bg-[#1877f2]"
                    : "bg-gray-300"
                }`}
                aria-label="Toggle price alerts"
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
                    priceAlerts
                      ? "left-6"
                      : "left-1"
                  }`}
                />
              </button>
            </div>

          </div>
        </section>

        {/* ------------------------------------------------ */}
        {/* Footer */}
        {/* ------------------------------------------------ */}

        <div className="py-8 text-center text-xs text-gray-400">
          Your Smartprix account settings
        </div>

      </div>
    </main>
  );
}