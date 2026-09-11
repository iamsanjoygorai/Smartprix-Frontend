"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  setupRecaptcha,
  sendPhoneOTP,
  verifyPhoneOTP,
  loginToSmartprixWithFirebase,
} from "@/lib/firebaseAuth";

import type { ConfirmationResult } from "firebase/auth";
import { useQueryClient } from "@tanstack/react-query";

/* =========================================================
   API
========================================================= */

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5000/api";

/* =========================================================
   TYPES
========================================================= */

interface LoginUser {
  id: string;
  name: string | null;
  email: string | null;
  mobile: string | null;
  role: string;
  permissions?: string[];
  isDisabled?: boolean;
}

interface LoginResponse {
  success?: boolean;
  message?: string;
  data?: {
    token?: string;
    user?: LoginUser;
  };
  token?: string;
  user?: LoginUser;
}

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
        <path d="M3 3l18 18" />
        <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
        <path d="M9.9 4.2A10.8 10.8 0 0 1 12 4c7 0 10 8 10 8a17.4 17.4 0 0 1-3.1 4.4" />
        <path d="M6.6 6.6C3.8 8.4 2 12 2 12s3 8 10 8a10.7 10.7 0 0 0 4.2-.8" />
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
   USER ICON
========================================================= */

function UserIcon() {
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
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c.7-4 3.3-6 8-6s7.3 2 8 6" />
    </svg>
  );
}

/* =========================================================
   PHONE ICON
========================================================= */

function PhoneIcon() {
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
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.2-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.8 2.1Z" />
    </svg>
  );
}

/* =========================================================
   ARROW ICON
========================================================= */

function ArrowIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

/* =========================================================
   GOOGLE-STYLE / PHONE OTP SWITCH ICON
========================================================= */

function ShieldIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3 20 6v5c0 5.2-3.3 8.8-8 10-4.7-1.2-8-4.8-8-10V6l8-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

/* =========================================================
   LOGIN PAGE
========================================================= */

export default function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  /* -------------------------------------------------------
     AUTH CHECK
  ------------------------------------------------------- */

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [alreadyLoggedIn, setAlreadyLoggedIn] = useState(false);

  /* -------------------------------------------------------
     LOGIN STATE
  ------------------------------------------------------- */

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [eyeAnimating, setEyeAnimating] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* -------------------------------------------------------
     OTP STATE
  ------------------------------------------------------- */

  const [otpMode, setOtpMode] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  const confirmationResultRef =
    useRef<ConfirmationResult | null>(null);

  /* =======================================================
     CHECK EXISTING LOGIN
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    async function checkExistingLogin() {
      const token = localStorage.getItem("smartprix_token");

      /*
       * No token = user is logged out.
       * Show the login page normally.
       */
      if (!token) {
        if (!cancelled) {
          setCheckingAuth(false);
        }

        return;
      }

      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        /*
         * Token is valid.
         */
        if (response.ok) {
          const result = await response.json();

          if (cancelled) return;

          const user = result?.data;

          /*
           * Keep the latest user information locally.
           */
          if (user) {
            const existingUser =
              localStorage.getItem("smartprix_user");

            let previousUser: Record<string, unknown> = {};

            if (existingUser) {
              try {
                previousUser = JSON.parse(existingUser);
              } catch {
                previousUser = {};
              }
            }

            localStorage.setItem(
              "smartprix_user",
              JSON.stringify({
                ...previousUser,
                ...user,
              }),
            );
          }

          /*
           * Tell the UI that an authenticated user was found.
           */
          setAlreadyLoggedIn(true);

          /*
           * Admin users go to admin dashboard.
           */
          if (
  user?.role === "SUPER_ADMIN" ||
  user?.role === "ADMIN"
) {
  router.replace("/admin");
} else {
  /*
   * Normal users go to home.
   */
  router.replace("/");
}

          return;
        }

        /*
         * Invalid / expired authentication.
         */
        if (
          response.status === 401 ||
          response.status === 403
        ) {
          localStorage.removeItem("smartprix_token");
          localStorage.removeItem("smartprix_user");
        }
      } catch (error) {
        /*
         * Network/server error:
         *
         * Do NOT delete the token because it may still
         * be valid. Let the user use the login page.
         */
        console.error(
          "Existing authentication check failed:",
          error,
        );
      } finally {
        if (!cancelled) {
          setCheckingAuth(false);
        }
      }
    }

    checkExistingLogin();

    return () => {
      cancelled = true;
    };
  }, [router]);

  /* =======================================================
     FIREBASE RECAPTCHA CLEANUP
  ======================================================= */

  useEffect(() => {
    return () => {
      try {
        const verifier = (
          window as typeof window & {
            recaptchaVerifier?: {
              clear?: () => void;
            };
          }
        ).recaptchaVerifier;

        if (verifier?.clear) {
          verifier.clear();
        }
      } catch {
        // Ignore cleanup errors.
      }
    };
  }, []);

  /* =======================================================
     SAVE LOGIN DATA
  ======================================================= */

  function saveLoginData(
    token: string,
    user?: LoginUser,
  ) {
    localStorage.setItem("smartprix_token", token);

    if (user) {
      const existingUser =
        localStorage.getItem("smartprix_user");

      let previousUser: Record<string, unknown> = {};

      if (existingUser) {
        try {
          previousUser = JSON.parse(existingUser);
        } catch {
          previousUser = {};
        }
      }

      localStorage.setItem(
        "smartprix_user",
        JSON.stringify({
          ...previousUser,
          ...user,
        }),
      );
    }

    /*
     * Notify Header and other components that authentication
     * has changed.
     */
    window.dispatchEvent(
      new Event("smartprix-auth-changed"),
    );
  }

  /* =======================================================
     REDIRECT AFTER LOGIN
  ======================================================= */

  function redirectAfterLogin(user?: LoginUser) {
    if (
      user?.role === "SUPER_ADMIN" ||
      user?.role === "ADMIN"
    ) {
      router.replace("/admin");
    } else {
      router.replace("/");
    }

    router.refresh();
  }

  /* =======================================================
     PASSWORD LOGIN
  ======================================================= */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    const cleanIdentifier = identifier.trim();

    if (!cleanIdentifier) {
      setError("Please enter your email or mobile number.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            identifier: cleanIdentifier,
            password,
          }),
        },
      );

      const result =
        (await response.json()) as LoginResponse;

      if (!response.ok) {
        setError(
          result.message ??
            "Invalid email/mobile or password.",
        );

        return;
      }

      const token =
        result.data?.token ?? result.token;

      const user =
        result.data?.user ?? result.user;

      if (!token) {
        setError(
          "Login succeeded, but no authentication token was received.",
        );

        return;
      }

      /*
       * Store token and user.
       */
      saveLoginData(token, user);

      queryClient.removeQueries({
  queryKey: ["current-user"],
});

queryClient.invalidateQueries({
  queryKey: ["current-user"],
});

      /*
       * Redirect based on role.
       */
      redirectAfterLogin(user);
    } catch (error) {
      console.error("Login failed:", error);

      setError(
        "Unable to connect to the server. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  /* =======================================================
     PHONE NUMBER NORMALIZATION
  ======================================================= */

  function getIndianPhoneNumber() {
    let phone = identifier.trim();

    /*
     * Remove spaces, hyphens and brackets.
     */
    phone = phone.replace(/[\s\-()]/g, "");

    /*
     * Convert +91XXXXXXXXXX to XXXXXXXXXX.
     */
    if (phone.startsWith("+91")) {
      phone = phone.slice(3);
    }

    /*
     * Convert 91XXXXXXXXXX to XXXXXXXXXX.
     */
    if (
      phone.startsWith("91") &&
      phone.length === 12
    ) {
      phone = phone.slice(2);
    }

    return phone;
  }

  /* =======================================================
     SEND OTP
  ======================================================= */

  async function handleSendOTP() {
    setError("");

    const phone = getIndianPhoneNumber();

    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError(
        "Please enter a valid 10-digit Indian mobile number.",
      );

      return;
    }

    setOtpLoading(true);

    try {
      /*
       * Make sure Firebase reCAPTCHA is ready.
       */
      const verifier = await setupRecaptcha();

      /*
       * Firebase expects +91XXXXXXXXXX.
       */
      const confirmationResult =
        await sendPhoneOTP(
          `+91${phone}`,
          verifier,
        );

      confirmationResultRef.current =
        confirmationResult;

      setOtpMode(true);
      setOtp("");

    } catch (error) {
      console.error("Send OTP failed:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to send OTP. Please try again.",
      );
    } finally {
      setOtpLoading(false);
    }
  }

  /* =======================================================
     VERIFY OTP
  ======================================================= */

  async function handleVerifyOTP() {
    setError("");

    const cleanOTP = otp.trim();

    if (!/^\d{6}$/.test(cleanOTP)) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    if (!confirmationResultRef.current) {
      setError(
        "OTP session expired. Please request a new OTP.",
      );

      return;
    }

    setOtpLoading(true);

    try {
      /*
       * Verify Firebase OTP.
       */
      await verifyPhoneOTP(
        confirmationResultRef.current,
        cleanOTP,
      );

      /*
       * Exchange Firebase authentication for a
       * Smartprix backend token.
       */
      const loginResult =
        await loginToSmartprixWithFirebase();

      /*
       * loginToSmartprixWithFirebase may return the
       * backend response in slightly different shapes,
       * so support common formats.
       */
      const result = loginResult as
        | LoginResponse
        | {
            success?: boolean;
            token?: string;
            user?: LoginUser;
            data?: {
              token?: string;
              user?: LoginUser;
            };
          };

      const token =
        result.data?.token ??
        result.token;

      const user =
        result.data?.user ??
        result.user;

      if (!token) {
        /*
         * In case the helper already saved the backend token,
         * check localStorage before failing.
         */
        const storedToken =
          localStorage.getItem("smartprix_token");

        if (!storedToken) {
          setError(
            "OTP verified, but Smartprix login could not be completed.",
          );

          return;
        }

        /*
         * If helper saved token but did not return user,
         * fetch current user from /auth/me.
         */
        try {
          const meResponse = await fetch(
            `${API_URL}/auth/me`,
            {
              method: "GET",
              headers: {
                Accept: "application/json",
                Authorization: `Bearer ${storedToken}`,
              },
              cache: "no-store",
            },
          );

          if (meResponse.ok) {
            const meResult =
              await meResponse.json();

            const meUser = meResult?.data;

            if (meUser) {
              const existingUser =
                localStorage.getItem(
                  "smartprix_user",
                );

              let previousUser: Record<
                string,
                unknown
              > = {};

              if (existingUser) {
                try {
                  previousUser =
                    JSON.parse(existingUser);
                } catch {
                  previousUser = {};
                }
              }

              localStorage.setItem(
                "smartprix_user",
                JSON.stringify({
                  ...previousUser,
                  ...meUser,
                }),
              );

              window.dispatchEvent(
                new Event(
                  "smartprix-auth-changed",
                ),
              );

              redirectAfterLogin(meUser);
              return;
            }
          }
        } catch (meError) {
          console.error(
            "Unable to fetch current user after OTP:",
            meError,
          );
        }

        /*
         * Token exists, but user data could not be
         * loaded. Redirect to profile as a normal user.
         */
        router.replace("/");
        router.refresh();
        return;
      }

      /*
       * Save backend token.
       */
      saveLoginData(token, user);

      /*
       * Redirect based on role.
       */
      redirectAfterLogin(user);
    } catch (error) {
      console.error("Verify OTP failed:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Invalid OTP. Please try again.",
      );
    } finally {
      setOtpLoading(false);
    }
  }

  /* =======================================================
     SWITCH TO PASSWORD LOGIN
  ======================================================= */

  function switchToPasswordLogin() {
    setOtpMode(false);
    setOtp("");
    setError("");
    confirmationResultRef.current = null;
  }

  /* =======================================================
     SWITCH TO OTP LOGIN
  ======================================================= */

  function switchToOTPLogin() {
    setOtpMode(true);
    setError("");
    setPassword("");
  }

  /* =======================================================
     PASSWORD EYE
  ======================================================= */

  function togglePasswordVisibility() {
    setEyeAnimating(true);

    setShowPassword((previous) => !previous);

    window.setTimeout(() => {
      setEyeAnimating(false);
    }, 220);
  }

  /* =======================================================
     AUTH CHECK LOADING
  ======================================================= */

  if (checkingAuth || alreadyLoggedIn) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f1f3f6] px-4">
        <div className="flex flex-col items-center">

          {/* Logo */}
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1877f2] text-[26px] font-black text-white shadow-[0_8px_24px_rgba(24,119,242,0.25)]">
            S
          </div>

          {/* Spinner */}
          <div className="mt-5 h-6 w-6 animate-spin rounded-full border-2 border-[#1877f2]/20 border-t-[#1877f2]" />

          {/* Message */}
          <p className="mt-4 text-sm font-semibold text-[#65676b]">
            {alreadyLoggedIn
              ? "You are already logged in. Redirecting..."
              : "Checking your account..."}
          </p>
        </div>
      </main>
    );
  }

  /* =======================================================
     LOGIN UI
  ======================================================= */

  return (
    <main className="min-h-screen bg-[#f1f3f6] px-4 py-8 sm:py-12">

      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-[470px] items-center justify-center">

        <div className="w-full">

          {/* =================================================
              BRAND
          ================================================= */}

          <div className="mb-7 text-center">

            <Link
              href="/"
              className="inline-flex items-center gap-2"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1877f2] text-xl font-black text-white shadow-[0_8px_20px_rgba(24,119,242,0.22)]">
                S
              </span>

              <span className="text-[24px] font-extrabold tracking-[-0.5px] text-[#1f2937]">
                Smartprix
              </span>
            </Link>

            <p className="mt-3 text-[14px] text-[#65676b]">
              {otpMode
                ? "Verify your mobile number"
                : "Login to your Smartprix account"}
            </p>
          </div>

          {/* =================================================
              CARD
          ================================================= */}

          <div className="overflow-hidden rounded-[18px] border border-[#e5e7eb] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.08)]">

            {/* =================================================
                CARD HEADER
            ================================================= */}

            <div className="border-b border-[#eef0f2] px-6 py-5 sm:px-7">

              <div className="flex items-center justify-between">

                <div>
                  <h1 className="text-[21px] font-bold tracking-[-0.3px] text-[#1f2937]">
                    {otpMode
                      ? "Login with OTP"
                      : "Welcome back"}
                  </h1>

                  <p className="mt-1 text-[13px] text-[#6b7280]">
                    {otpMode
                      ? "We’ll send a verification code to your mobile"
                      : "Access your account and personalized experience"}
                  </p>
                </div>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eff6ff] text-[#1877f2]">
                  {otpMode ? (
                    <PhoneIcon />
                  ) : (
                    <UserIcon />
                  )}
                </div>

              </div>
            </div>

            {/* =================================================
                FORM
            ================================================= */}

            <div className="px-6 py-6 sm:px-7">

              {/* =================================================
                  ERROR
              ================================================= */}

              {error && (
                <div className="mb-5 flex items-start gap-3 rounded-xl border border-[#fecaca] bg-[#fef2f2] px-4 py-3">

                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#dc2626] text-[11px] font-bold text-white">
                    !
                  </div>

                  <p className="text-[13px] font-medium leading-5 text-[#b91c1c]">
                    {error}
                  </p>

                </div>
              )}

              {/* =================================================
                  OTP MODE
              ================================================= */}

              {otpMode ? (
                <div>

                  {/* Phone */}
                  <label
                    htmlFor="login-phone"
                    className="mb-2 block text-[13px] font-semibold text-[#374151]"
                  >
                    Mobile number
                  </label>

                  <div className="relative">

                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[#9ca3af]">
                      <PhoneIcon />
                    </div>

                    <div className="pointer-events-none absolute inset-y-0 left-[48px] flex items-center text-[14px] font-semibold text-[#374151]">
                      +91
                    </div>

                    <input
                      id="login-phone"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      maxLength={10}
                      value={identifier}
                      onChange={(event) =>
                        setIdentifier(
                          event.target.value.replace(
                            /\D/g,
                            "",
                          ),
                        )
                      }
                      placeholder="Enter 10-digit mobile number"
                      disabled={otpLoading}
                      className="h-[48px] w-full rounded-xl border border-[#d9dde3] bg-white pl-[82px] pr-4 text-[14px] font-medium text-[#1f2937] outline-none transition placeholder:text-[#9ca3af] focus:border-[#1877f2] focus:ring-4 focus:ring-[#1877f2]/10 disabled:bg-[#f9fafb]"
                    />

                  </div>

                  {/* OTP field */}
                  {confirmationResultRef.current && (
                    <div className="mt-5">

                      <label
                        htmlFor="login-otp"
                        className="mb-2 block text-[13px] font-semibold text-[#374151]"
                      >
                        Verification code
                      </label>

                      <input
                        id="login-otp"
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        value={otp}
                        onChange={(event) =>
                          setOtp(
                            event.target.value.replace(
                              /\D/g,
                              "",
                            ),
                          )
                        }
                        placeholder="Enter 6-digit OTP"
                        disabled={otpLoading}
                        className="h-[48px] w-full rounded-xl border border-[#d9dde3] bg-white px-4 text-center text-[18px] font-bold tracking-[8px] text-[#1f2937] outline-none transition placeholder:text-[#9ca3af] placeholder:tracking-normal focus:border-[#1877f2] focus:ring-4 focus:ring-[#1877f2]/10 disabled:bg-[#f9fafb]"
                      />

                    </div>
                  )}

                  {/* OTP button */}
                  <button
                    type="button"
                    onClick={
                      confirmationResultRef.current
                        ? handleVerifyOTP
                        : handleSendOTP
                    }
                    disabled={otpLoading}
                    className="mt-6 flex h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-[#1877f2] text-[14px] font-bold text-white shadow-[0_6px_16px_rgba(24,119,242,0.20)] transition hover:bg-[#166fe5] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {otpLoading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                        <span>
                          {confirmationResultRef.current
                            ? "Verifying..."
                            : "Sending OTP..."}
                        </span>
                      </>
                    ) : (
                      <>
                        <span>
                          {confirmationResultRef.current
                            ? "Verify & Login"
                            : "Send OTP"}
                        </span>

                        <ArrowIcon />
                      </>
                    )}
                  </button>

                  {/* Change login method */}
                  <button
                    type="button"
                    onClick={switchToPasswordLogin}
                    disabled={otpLoading}
                    className="mt-4 flex w-full items-center justify-center gap-2 text-[13px] font-semibold text-[#1877f2] transition hover:text-[#125fc4] disabled:opacity-50"
                  >
                    Login with password
                  </button>

                </div>
              ) : (
                /* =================================================
                   PASSWORD MODE
                ================================================= */
                <form onSubmit={handleSubmit}>

                  {/* Identifier */}
                  <div>

                    <label
                      htmlFor="login-identifier"
                      className="mb-2 block text-[13px] font-semibold text-[#374151]"
                    >
                      Email or mobile number
                    </label>

                    <div className="relative">

                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[#9ca3af]">
                        <UserIcon />
                      </div>

                      <input
                        id="login-identifier"
                        type="text"
                        autoComplete="username"
                        value={identifier}
                        onChange={(event) =>
                          setIdentifier(
                            event.target.value,
                          )
                        }
                        placeholder="Enter email or mobile number"
                        disabled={loading}
                        className="h-[48px] w-full rounded-xl border border-[#d9dde3] bg-white pl-12 pr-4 text-[14px] font-medium text-[#1f2937] outline-none transition placeholder:text-[#9ca3af] focus:border-[#1877f2] focus:ring-4 focus:ring-[#1877f2]/10 disabled:bg-[#f9fafb]"
                      />

                    </div>
                  </div>

                  {/* Password */}
                  <div className="mt-5">

                    <div className="mb-2 flex items-center justify-between">

                      <label
                        htmlFor="login-password"
                        className="block text-[13px] font-semibold text-[#374151]"
                      >
                        Password
                      </label>

                      <Link
                        href="/forgot-password"
                        className="text-[12px] font-semibold text-[#1877f2] transition hover:text-[#125fc4]"
                      >
                        Forgot password?
                      </Link>

                    </div>

                    <div className="relative">

                      <input
                        id="login-password"
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        autoComplete="current-password"
                        value={password}
                        onChange={(event) =>
                          setPassword(
                            event.target.value,
                          )
                        }
                        placeholder="Enter your password"
                        disabled={loading}
                        className="h-[48px] w-full rounded-xl border border-[#d9dde3] bg-white px-4 pr-12 text-[14px] font-medium text-[#1f2937] outline-none transition placeholder:text-[#9ca3af] focus:border-[#1877f2] focus:ring-4 focus:ring-[#1877f2]/10 disabled:bg-[#f9fafb]"
                      />

                      <button
                        type="button"
                        onClick={
                          togglePasswordVisibility
                        }
                        disabled={loading}
                        aria-label={
                          showPassword
                            ? "Hide password"
                            : "Show password"
                        }
                        className={`absolute right-0 top-0 flex h-[48px] w-12 items-center justify-center text-[#9ca3af] transition hover:text-[#374151] ${
                          eyeAnimating
                            ? "scale-90"
                            : "scale-100"
                        }`}
                      >
                        <EyeIcon
                          off={!showPassword}
                        />
                      </button>

                    </div>
                  </div>

                  {/* Login */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-6 flex h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-[#1877f2] text-[14px] font-bold text-white shadow-[0_6px_16px_rgba(24,119,242,0.20)] transition hover:bg-[#166fe5] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        <span>Logging in...</span>
                      </>
                    ) : (
                      <>
                        <span>Login</span>
                        <ArrowIcon />
                      </>
                    )}
                  </button>

                  {/* Divider */}
                  <div className="my-6 flex items-center gap-3">

                    <div className="h-px flex-1 bg-[#e5e7eb]" />

                    <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9ca3af]">
                      OR
                    </span>

                    <div className="h-px flex-1 bg-[#e5e7eb]" />

                  </div>

                  {/* OTP Login */}
                  <button
                    type="button"
                    onClick={switchToOTPLogin}
                    disabled={loading}
                    className="flex h-[46px] w-full items-center justify-center gap-2 rounded-xl border border-[#d9dde3] bg-white text-[13px] font-bold text-[#374151] transition hover:border-[#1877f2]/40 hover:bg-[#f8fbff] hover:text-[#1877f2] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <PhoneIcon />
                    Login with mobile OTP
                  </button>

                </form>
              )}

              {/* =================================================
                  SECURITY NOTE
              ================================================= */}

              <div className="mt-6 flex items-start gap-2.5 rounded-xl bg-[#f8fafc] px-3.5 py-3">

                <div className="mt-0.5 shrink-0 text-[#1877f2]">
                  <ShieldIcon />
                </div>

                <p className="text-[11px] leading-[17px] text-[#6b7280]">
                  Your account information is securely
                  authenticated. Never share your password
                  or verification code with anyone.
                </p>

              </div>

              {/* =================================================
                  REGISTER
              ================================================= */}

              <p className="mt-6 text-center text-[13px] text-[#6b7280]">

                Don't have an account?{" "}

                <Link
                  href="/register"
                  className="font-bold text-[#1877f2] transition hover:text-[#125fc4]"
                >
                  Create account
                </Link>

              </p>

            </div>
          </div>

          {/* =================================================
              FOOTER
          ================================================= */}

          <p className="mt-6 text-center text-[11px] leading-5 text-[#9ca3af]">
            By continuing, you agree to Smartprix's{" "}
            <Link
              href="/terms"
              className="font-medium hover:text-[#6b7280]"
            >
              Terms
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="font-medium hover:text-[#6b7280]"
            >
              Privacy Policy
            </Link>
            .
          </p>

        </div>
      </div>

      {/* =====================================================
          FIREBASE RECAPTCHA CONTAINER
      ===================================================== */}

      <div id="recaptcha-container" />

    </main>
  );
}