"use client";

import { useState } from "react";
import { changeUserPassword } from "@/features/profile/api/profile.api";

export default function SecuritySection() {
  const [showChangePassword, setShowChangePassword] =
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

  const handleChangePassword = async () => {
    setPasswordMessage("");

    if (!currentPassword) {
      setPasswordMessage(
        "Please enter your current password.",
      );
      return;
    }

    if (!newPassword) {
      setPasswordMessage(
        "Please enter a new password.",
      );
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage(
        "New password must be at least 6 characters.",
      );
      return;
    }

    if (!confirmPassword) {
      setPasswordMessage(
        "Please confirm your new password.",
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage(
        "New passwords do not match.",
      );
      return;
    }

    setPasswordLoading(true);

    try {
      const result =
        await changeUserPassword({
          currentPassword,
          newPassword,
          confirmPassword,
        });

      if (!result.success) {
        setPasswordMessage(
          result.message ??
            "Failed to change password.",
        );
        return;
      }

      setPasswordMessage(
        result.message ??
          "Password changed successfully.",
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowChangePassword(false);
    } catch {
      setPasswordMessage(
        "Unable to change password.",
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <section
      id="security"
      className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          Security
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Manage your password and account security.
        </p>
      </div>

      {!showChangePassword ? (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 p-4">
          <div>
            <h3 className="font-semibold text-gray-900">
              Password
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Keep your account secure with a strong password.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setShowChangePassword(true)
            }
            className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            Change password
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 p-5">
          <div className="mb-5">
            <h3 className="font-semibold text-gray-900">
              Change password
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Enter your current password and choose
              a new password.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Current password
              </label>

              <input
                type="password"
                value={currentPassword}
                onChange={(event) =>
                  setCurrentPassword(
                    event.target.value,
                  )
                }
                autoComplete="current-password"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                placeholder="Enter current password"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                New password
              </label>

              <input
                type="password"
                value={newPassword}
                onChange={(event) =>
                  setNewPassword(
                    event.target.value,
                  )
                }
                autoComplete="new-password"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                placeholder="Enter new password"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Confirm new password
              </label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(
                    event.target.value,
                  )
                }
                autoComplete="new-password"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                placeholder="Confirm new password"
              />
            </div>

            {passwordMessage && (
              <div className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-700">
                {passwordMessage}
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleChangePassword}
                disabled={passwordLoading}
                className="rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {passwordLoading
                  ? "Changing..."
                  : "Change password"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowChangePassword(false);
                  setPasswordMessage("");
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                disabled={passwordLoading}
                className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}