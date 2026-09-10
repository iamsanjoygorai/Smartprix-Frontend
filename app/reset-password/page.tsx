"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { resetPassword } from "@/lib/api/auth";

/* =========================================================
   EYE ICON
========================================================= */

function EyeIcon({ off = false }: { off?: boolean }) {
  if (off) {
    return (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M2 12s3-8 10-8 10 8 10 8-3 8-10 8S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
        <path d="M4 20L20 4" />
      </svg>
    );
  }

  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 12s3-8 10-8 10 8 10 8-3 8-10 8S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

/* =========================================================
   PASSWORD FIELD
========================================================= */

function PasswordField({
  id,
  label,
  value,
  onChange,
  disabled,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const [showPassword, setShowPassword] =
    useState(false);

  const [eyeAnimating, setEyeAnimating] =
    useState(false);

  function togglePassword() {
    setEyeAnimating(true);

    setShowPassword((value) => !value);

    window.setTimeout(() => {
      setEyeAnimating(false);
    }, 180);
  }

  return (
    <div className="relative">
      <input
        id={id}
        name={id}
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder=" "
        autoComplete="new-password"
        disabled={disabled}
        className="
          peer
          h-[52px]
          w-full
          rounded-md
          border
          border-[#ccd0d5]
          bg-white
          px-4
          pr-12
          pt-3
          text-[16px]
          text-[#1c1e21]
          outline-none
          transition
          focus:border-[#1877f2]
          focus:ring-1
          focus:ring-[#1877f2]
          disabled:bg-gray-100
        "
      />

      <label
        htmlFor={id}
        className="
          pointer-events-none
          absolute
          left-4
          top-1/2
          -translate-y-1/2
          bg-white
          px-1
          text-[16px]
          text-[#8a8d91]
          transition-all
          duration-150
          peer-focus:top-0
          peer-focus:-translate-y-1/2
          peer-focus:text-[12px]
          peer-focus:font-medium
          peer-focus:text-[#1877f2]
          peer-[:not(:placeholder-shown)]:top-0
          peer-[:not(:placeholder-shown)]:-translate-y-1/2
          peer-[:not(:placeholder-shown)]:text-[12px]
          peer-[:not(:placeholder-shown)]:font-medium
          peer-[:not(:placeholder-shown)]:text-[#65676b]
        "
      >
        {label}
      </label>

      <button
        type="button"
        onClick={togglePassword}
        disabled={disabled}
        aria-label={
          showPassword
            ? "Hide password"
            : "Show password"
        }
        className="
          absolute
          right-3
          top-1/2
          flex
          h-9
          w-9
          -translate-y-1/2
          items-center
          justify-center
          rounded-full
          text-[#65676b]
          transition-colors
          hover:bg-[#f0f2f5]
          disabled:cursor-not-allowed
        "
      >
        <span
          className={`
            flex
            items-center
            justify-center
            transition-transform
            duration-180
            ease-out
            ${eyeAnimating ? "scale-75" : "scale-100"}
          `}
        >
          <EyeIcon off={!showPassword} />
        </span>
      </button>
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token") ?? "";

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState(false);

  /* =======================================================
     PASSWORD STRENGTH
  ======================================================= */

  const passwordStrength =
    newPassword.length === 0
      ? 0
      : newPassword.length < 8
        ? 1
        : newPassword.length < 12
          ? 2
          : 3;

  /* =======================================================
     TOKEN CHECK
  ======================================================= */

  useEffect(() => {
    if (!token) {
      setError(
        "This password reset link is invalid or missing.",
      );
    }
  }, [token]);

  /* =======================================================
     SUBMIT
  ======================================================= */

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    if (!token) {
      setError(
        "This password reset link is invalid or missing.",
      );
      return;
    }

    if (newPassword.length < 8) {
      setError(
        "New password must be at least 8 characters long.",
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await resetPassword({
        token,
        newPassword,
      });

      if (!response.success) {
        throw new Error(
          response.message ||
            "Unable to reset password.",
        );
      }

      setSuccess(true);

      setNewPassword("");
      setConfirmPassword("");

      /*
       * Give the user a moment to see the success
       * message, then return to login.
       */
      window.setTimeout(() => {
        router.replace("/login");
      }, 1800);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to reset password.",
      );
    } finally {
      setLoading(false);
    }
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f0f2f5] px-4 py-10">
      <div className="w-full max-w-[500px]">

        {/* =================================================
            SMARTPRIX LOGO
        ================================================= */}

        <div className="mb-6 text-center">
          <Link
            href="/"
            className="
              inline-block
              text-[42px]
              font-extrabold
              tracking-[-2px]
              text-[#1877f2]
              transition
              hover:opacity-90
            "
          >
            Smartprix
          </Link>
        </div>

        {/* =================================================
            CARD
        ================================================= */}

        <div
          className="
            overflow-hidden
            rounded-lg
            bg-white
            shadow-[0_2px_12px_rgba(0,0,0,0.12)]
          "
        >

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="border-b border-[#dadde1] px-6 py-5">
            <h1 className="text-[24px] font-bold text-[#1c1e21]">
              Reset your password
            </h1>

            <p className="mt-1 text-[15px] leading-5 text-[#606770]">
              Create a new password for your Smartprix
              account.
            </p>
          </div>

          {/* =================================================
              SUCCESS STATE
          ================================================= */}

          {success ? (
            <div className="px-6 py-7">

              <div
                className="
                  flex
                  items-start
                  gap-3
                  rounded-md
                  border
                  border-[#b7ebc6]
                  bg-[#f0fff4]
                  px-4
                  py-4
                  text-sm
                  text-[#18733c]
                "
              >
                <div
                  className="
                    mt-0.5
                    flex
                    h-6
                    w-6
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-[#18733c]
                    text-white
                  "
                >
                  ✓
                </div>

                <div>
                  <p className="font-semibold">
                    Password reset successfully
                  </p>

                  <p className="mt-1 text-[#2d6a46]">
                    Your password has been changed.
                    Redirecting you to login...
                  </p>
                </div>
              </div>

              <Link
                href="/login"
                className="
                  mt-5
                  block
                  text-center
                  text-[14px]
                  font-semibold
                  text-[#1877f2]
                  hover:underline
                "
              >
                Go to login
              </Link>
            </div>
          ) : !token ? (

            /* =================================================
               INVALID TOKEN
            ================================================= */

            <div className="px-6 py-6">

              <div
                className="
                  rounded-md
                  border
                  border-[#f5c2c7]
                  bg-[#fff5f5]
                  px-4
                  py-3
                  text-sm
                  text-[#b42318]
                "
              >
                This password reset link is invalid or
                missing.
              </div>

              <Link
                href="/forgot-password"
                className="
                  mt-5
                  block
                  text-center
                  text-[14px]
                  font-semibold
                  text-[#1877f2]
                  hover:underline
                "
              >
                Request a new reset link
              </Link>
            </div>

          ) : (

            /* =================================================
               RESET FORM
            ================================================= */

            <form
              onSubmit={handleSubmit}
              autoComplete="off"
              className="px-6 pb-7 pt-6"
            >

              <p className="mb-5 text-[15px] leading-5 text-[#606770]">
                Choose a strong password that you
                haven't used before.
              </p>

              {/* =================================================
                  NEW PASSWORD
              ================================================= */}

              <PasswordField
                id="reset-new-password"
                label="New password"
                value={newPassword}
                onChange={(value) => {
                  setNewPassword(value);
                  setError("");
                }}
                disabled={loading}
              />

              {/* =================================================
                  STRENGTH
              ================================================= */}

              {newPassword && (
                <div className="mt-3">

                  <div className="flex gap-1">
                    {[1, 2, 3].map((level) => (
                      <div
                        key={level}
                        className={`
                          h-1.5
                          flex-1
                          rounded-full
                          transition-all
                          duration-200
                          ${
                            passwordStrength >= level
                              ? "bg-[#1877f2]"
                              : "bg-[#e4e6eb]"
                          }
                        `}
                      />
                    ))}
                  </div>

                  <p className="mt-1.5 text-xs text-[#65676b]">
                    {passwordStrength === 1
                      ? "Too short"
                      : passwordStrength === 2
                        ? "Good password"
                        : "Strong password"}
                  </p>
                </div>
              )}

              {/* =================================================
                  CONFIRM PASSWORD
              ================================================= */}

              <div className="mt-5">
                <PasswordField
                  id="reset-confirm-password"
                  label="Confirm new password"
                  value={confirmPassword}
                  onChange={(value) => {
                    setConfirmPassword(value);
                    setError("");
                  }}
                  disabled={loading}
                />
              </div>

              {/* =================================================
                  MATCH STATUS
              ================================================= */}

              {confirmPassword &&
                newPassword !==
                  confirmPassword && (
                  <p className="mt-2 text-xs text-[#b42318]">
                    Passwords do not match.
                  </p>
                )}

              {confirmPassword &&
                newPassword ===
                  confirmPassword &&
                newPassword.length >= 8 && (
                  <p className="mt-2 text-xs text-[#18733c]">
                    ✓ Passwords match.
                  </p>
                )}

              {/* =================================================
                  ERROR
              ================================================= */}

              {error && (
                <div
                  className="
                    mt-4
                    rounded-md
                    border
                    border-[#f5c2c7]
                    bg-[#fff5f5]
                    px-4
                    py-3
                    text-sm
                    leading-5
                    text-[#b42318]
                  "
                >
                  {error}
                </div>
              )}

              {/* =================================================
                  RESET BUTTON
              ================================================= */}

              <button
                type="submit"
                disabled={
                  loading ||
                  !newPassword ||
                  !confirmPassword
                }
                className="
                  mt-6
                  flex
                  h-[50px]
                  w-full
                  items-center
                  justify-center
                  rounded-full
                  bg-[#1877f2]
                  text-[16px]
                  font-bold
                  text-white
                  transition-all
                  duration-150
                  hover:bg-[#166fe5]
                  hover:shadow-md
                  active:scale-[0.98]
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {loading
                  ? "Resetting..."
                  : "Reset password"}
              </button>
            </form>
          )}
        </div>

        {/* =================================================
            BACK TO LOGIN
        ================================================= */}

        {!success && (
          <div className="mt-5 text-center">
            <Link
              href="/login"
              className="
                text-[14px]
                font-semibold
                text-[#1877f2]
                hover:underline
              "
            >
              ← Back to login
            </Link>
          </div>
        )}

      </div>
    </main>
  );
}
