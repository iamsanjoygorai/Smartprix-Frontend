"use client";

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import type { ConfirmationResult } from "firebase/auth";

import {
  setupRecaptcha,
  sendPhoneOTP,
  verifyPhoneOTP,
  loginToSmartprixWithFirebase,
} from "@/lib/firebaseAuth";

/* =========================================================
   TYPES
========================================================= */

interface LoginUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  mobile?: string | null;
  role?: string | null;
  permissions?: string[];
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
   CONSTANTS
========================================================= */

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5000/api";

/* =========================================================
   PAGE
========================================================= */

export default function LoginPage() {
  const router = useRouter();

  /* -------------------------------------------------------
     LOGIN STATE
  ------------------------------------------------------- */

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [eyeAnimating, setEyeAnimating] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  /* -------------------------------------------------------
     OTP STATE
  ------------------------------------------------------- */

  const [otpMode, setOtpMode] = useState(false);

  const [otp, setOtp] = useState("");

  const [otpLoading, setOtpLoading] =
    useState(false);

  const confirmationResultRef =
    useRef<ConfirmationResult | null>(null);

  /* -------------------------------------------------------
     CLEANUP FIREBASE RECAPTCHA
  ------------------------------------------------------- */

  useEffect(() => {
    return () => {
      if (typeof window === "undefined") return;

      const win = window as typeof window & {
        recaptchaVerifier?: {
          clear?: () => void;
        };
      };

      try {
        win.recaptchaVerifier?.clear?.();
      } catch {
        // Ignore cleanup errors.
      }

      delete win.recaptchaVerifier;
    };
  }, []);

  /* =======================================================
     PASSWORD LOGIN
  ======================================================= */

async function handleSubmit(
  event: FormEvent<HTMLFormElement>,
) {
  event.preventDefault();

  if (loading || otpLoading) return;

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
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        identifier: cleanIdentifier,
        password,
      }),
    });

    let result: LoginResponse = {};

    try {
      result = await response.json();
    } catch {
      // Server returned an invalid/non-JSON response.
      result = {};
    }

    /*
     * -------------------------------------------------------
     * NORMAL LOGIN FAILURE
     *
     * Do NOT throw an Error here.
     * Invalid credentials are an expected authentication state,
     * not an application crash.
     * -------------------------------------------------------
     */
    if (!response.ok || !result.success) {
      setError(
        result.message ||
          "Invalid email/mobile or password.",
      );
      return;
    }

    /*
     * -------------------------------------------------------
     * GET AUTH DATA
     * -------------------------------------------------------
     */
    const token =
      result.data?.token ??
      result.token;

    const user =
      result.data?.user ??
      result.user;

    /*
     * -------------------------------------------------------
     * UNEXPECTED SUCCESS RESPONSE
     *
     * The server said login succeeded, but didn't provide
     * the required token. Treat this as a server problem,
     * not as an authentication failure.
     * -------------------------------------------------------
     */
    if (!token) {
      setError(
        "We couldn't complete your login. Please try again.",
      );
      return;
    }

    /*
     * -------------------------------------------------------
     * SAVE LOGIN
     * -------------------------------------------------------
     */
    localStorage.setItem(
      "smartprix_token",
      token,
    );

    if (user) {
      localStorage.setItem(
        "smartprix_user",
        JSON.stringify(user),
      );
    }

    /*
     * -------------------------------------------------------
     * REDIRECT
     * -------------------------------------------------------
     */
    if (
      user?.role === "SUPER_ADMIN" ||
      user?.role === "ADMIN"
    ) {
      router.push("/admin");
    } else {
      router.push("/");
    }

    router.refresh();
  } catch {
    /*
     * -------------------------------------------------------
     * NETWORK / SERVER CONNECTION FAILURE
     *
     * Don't expose technical errors to the user.
     * -------------------------------------------------------
     */
    setError(
      "Unable to connect right now. Please check your connection and try again.",
    );
  } finally {
    setLoading(false);
  }
}

  /* =======================================================
     SEND PHONE OTP
  ======================================================= */

  async function handleSendOTP() {
    if (loading || otpLoading) return;

    setError("");

    const mobile =
      identifier.replace(/\D/g, "");

    if (!mobile) {
      setError(
        "Please enter your mobile number first.",
      );
      return;
    }

    if (mobile.length !== 10) {
      setError(
        "Please enter a valid 10-digit Indian mobile number.",
      );
      return;
    }

    setOtpLoading(true);

    try {
      /*
       * Firebase Phone Auth requires E.164 format.
       * For India:
       *
       * 9876543210
       * becomes
       * +919876543210
       */

      const phoneNumber = `+91${mobile}`;

      /* ---------------------------------------------------
         RECAPTCHA
      --------------------------------------------------- */

      const recaptcha =
        setupRecaptcha(
          "firebase-recaptcha",
        );

      /* ---------------------------------------------------
         SEND OTP
      --------------------------------------------------- */

      const confirmation =
        await sendPhoneOTP(
          phoneNumber,
          recaptcha,
        );

      confirmationResultRef.current =
        confirmation;

      setOtp("");

      setOtpMode(true);

      setError("");
    } catch (otpError) {
      console.error(
        "Send OTP failed:",
        otpError,
      );

      confirmationResultRef.current =
        null;

      const message =
        otpError instanceof Error
          ? otpError.message
          : "Unable to send OTP.";

      /*
       * Convert common Firebase messages
       * into friendlier messages.
       */

      if (
        message.includes(
          "auth/invalid-phone-number",
        )
      ) {
        setError(
          "Invalid mobile number. Please check the number and try again.",
        );
      } else if (
        message.includes(
          "auth/too-many-requests",
        )
      ) {
        setError(
          "Too many OTP requests. Please wait a while and try again.",
        );
      } else if (
        message.includes(
          "auth/operation-not-allowed",
        )
      ) {
        setError(
          "Phone authentication is not enabled in Firebase.",
        );
      } else if (
        message.includes(
          "auth/captcha-check-failed",
        )
      ) {
        setError(
          "reCAPTCHA verification failed. Please refresh the page and try again.",
        );
      } else {
        setError(
          `Unable to send OTP. ${message}`,
        );
      }

      /*
       * Clear reCAPTCHA so another attempt
       * can create a fresh verifier.
       */

      if (typeof window !== "undefined") {
        const win =
          window as typeof window & {
            recaptchaVerifier?: {
              clear?: () => void;
            };
          };

        try {
          win.recaptchaVerifier?.clear?.();
        } catch {
          // Ignore cleanup errors.
        }

        delete win.recaptchaVerifier;
      }
    } finally {
      setOtpLoading(false);
    }
  }

  /* =======================================================
     VERIFY OTP
  ======================================================= */

  async function handleVerifyOTP() {
    if (otpLoading) return;

    setError("");

    if (!confirmationResultRef.current) {
      setError(
        "OTP session expired. Please request a new OTP.",
      );
      setOtpMode(false);
      return;
    }

    if (otp.length !== 6) {
      setError(
        "Please enter the 6-digit OTP.",
      );
      return;
    }

    setOtpLoading(true);

    try {
      /* ---------------------------------------------------
         VERIFY FIREBASE OTP
      --------------------------------------------------- */

      await verifyPhoneOTP(
        confirmationResultRef.current,
        otp,
      );

      /* ---------------------------------------------------
         LOGIN TO SMARTPRIX
      --------------------------------------------------- */

      const result =
        await loginToSmartprixWithFirebase();

      const user =
        result?.user as LoginUser | undefined;

      confirmationResultRef.current =
        null;

      setOtp("");

      setOtpMode(false);

      /* ---------------------------------------------------
         REDIRECT
      --------------------------------------------------- */

      if (
        user?.role === "SUPER_ADMIN" ||
        user?.role === "ADMIN"
      ) {
        router.push("/admin");
      } else {
        router.push("/");
      }

      router.refresh();
    } catch (verifyError) {
      console.error(
        "OTP verification failed:",
        verifyError,
      );

      const message =
        verifyError instanceof Error
          ? verifyError.message
          : "OTP verification failed.";

      if (
        message.includes(
          "auth/invalid-verification-code",
        )
      ) {
        setError(
          "Incorrect OTP. Please check the code and try again.",
        );
      } else if (
        message.includes(
          "auth/code-expired",
        )
      ) {
        setError(
          "This OTP has expired. Please request a new OTP.",
        );
      } else if (
        message.includes(
          "Firebase authentication failed",
        )
      ) {
        setError(
          "Firebase login verification failed. Please try again.",
        );
      } else {
        setError(
          message ||
            "OTP verification failed. Please try again.",
        );
      }
    } finally {
      setOtpLoading(false);
    }
  }

  /* =======================================================
     SWITCH BACK TO PASSWORD
  ======================================================= */

  function handleUsePassword() {
    if (otpLoading) return;

    setOtpMode(false);

    setOtp("");

    setError("");

    confirmationResultRef.current =
      null;

    if (typeof window !== "undefined") {
      const win =
        window as typeof window & {
          recaptchaVerifier?: {
            clear?: () => void;
          };
        };

      try {
        win.recaptchaVerifier?.clear?.();
      } catch {
        // Ignore cleanup errors.
      }

      delete win.recaptchaVerifier;
    }
  }

  /* =======================================================
     PASSWORD EYE
  ======================================================= */

  function togglePasswordVisibility() {
    setEyeAnimating(true);

    setShowPassword(
      (current) => !current,
    );

    window.setTimeout(() => {
      setEyeAnimating(false);
    }, 220);
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="min-h-screen bg-[#f1f3f6] px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-[460px] items-center justify-center">
        <section
          className="
            w-full
            overflow-hidden
            rounded-2xl
            border
            border-[#e4e6eb]
            bg-white
            shadow-[0_10px_40px_rgba(0,0,0,0.08)]
          "
        >
          {/* =================================================
              HEADER
          ================================================= */}

          <div className="px-7 pb-3 pt-8 text-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center"
            >
              <div
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-xl
                  bg-[#1877f2]
                  text-[24px]
                  font-black
                  text-white
                  shadow-[0_6px_18px_rgba(24,119,242,0.25)]
                "
              >
                S
              </div>
            </Link>

            <h1
              className="
                mt-5
                text-[25px]
                font-bold
                tracking-[-0.4px]
                text-[#1c1e21]
              "
            >
              Log in to Smartprix
            </h1>

            <p
              className="
                mt-2
                text-[14px]
                leading-6
                text-[#65676b]
              "
            >
              Compare products, discover the
              best deals and manage your account.
            </p>
          </div>

          {/* =================================================
              FIREBASE RECAPTCHA

              IMPORTANT:
              Keep ONLY ONE element with this ID.
          ================================================= */}

          <div id="firebase-recaptcha" />

          {/* =================================================
              FORM
          ================================================= */}

          <form
            onSubmit={handleSubmit}
            autoComplete="off"
            className="space-y-4 px-7 pb-8 pt-5"
          >
            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div
                className="
                  rounded-xl
                  border
                  border-[#f3b7b7]
                  bg-[#fff5f5]
                  px-4
                  py-3
                  text-[13px]
                  leading-5
                  text-[#c62828]
                "
              >
                <div className="flex items-start gap-2">
                  <span
                    className="
                      mt-[1px]
                      flex
                      h-5
                      w-5
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-[#e53935]
                      text-[11px]
                      font-bold
                      text-white
                    "
                  >
                    !
                  </span>

                  <p>{error}</p>
                </div>
              </div>
            )}

            {/* =================================================
                MOBILE / EMAIL
            ================================================= */}

            <div className="relative">
              <input
                id="login-identifier"
                name="identifier"
                type="text"
                value={identifier}
                onChange={(event) => {
                  setIdentifier(
                    event.target.value,
                  );
                  setError("");
                }}
                placeholder=" "
                autoComplete="username"
                disabled={
                  loading || otpMode
                }
                className="
                  peer
                  h-[56px]
                  w-full
                  rounded-xl
                  border
                  border-[#ccd0d5]
                  bg-white
                  px-4
                  pt-4
                  text-[15px]
                  text-[#1c1e21]
                  outline-none
                  transition-all
                  focus:border-[#1877f2]
                  focus:ring-2
                  focus:ring-[#1877f2]/10
                  disabled:cursor-not-allowed
                  disabled:bg-[#f5f6f7]
                  disabled:text-[#8a8d91]
                "
              />

              <label
                htmlFor="login-identifier"
                className="
                  pointer-events-none
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  bg-white
                  px-1
                  text-[15px]
                  text-[#65676b]
                  transition-all
                  peer-focus:top-0
                  peer-focus:text-[12px]
                  peer-focus:font-medium
                  peer-focus:text-[#1877f2]
                  peer-[:not(:placeholder-shown)]:top-0
                  peer-[:not(:placeholder-shown)]:text-[12px]
                  peer-[:not(:placeholder-shown)]:font-medium
                "
              >
                Email or mobile number
              </label>
            </div>

            {/* =================================================
                PASSWORD
            ================================================= */}

            <div className="relative">
              <input
                id="login-password"
                name="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={(event) => {
                  setPassword(
                    event.target.value,
                  );
                  setError("");
                }}
                placeholder=" "
                autoComplete="current-password"
                disabled={
                  loading || otpMode
                }
                className="
                  peer
                  h-[56px]
                  w-full
                  rounded-xl
                  border
                  border-[#ccd0d5]
                  bg-white
                  px-4
                  pb-1
                  pt-4
                  pr-14
                  text-[15px]
                  text-[#1c1e21]
                  outline-none
                  transition-all
                  focus:border-[#1877f2]
                  focus:ring-2
                  focus:ring-[#1877f2]/10
                  disabled:cursor-not-allowed
                  disabled:bg-[#f5f6f7]
                  disabled:text-[#8a8d91]
                "
              />

              <label
                htmlFor="login-password"
                className="
                  pointer-events-none
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  bg-white
                  px-1
                  text-[15px]
                  text-[#65676b]
                  transition-all
                  peer-focus:top-0
                  peer-focus:text-[12px]
                  peer-focus:font-medium
                  peer-focus:text-[#1877f2]
                  peer-[:not(:placeholder-shown)]:top-0
                  peer-[:not(:placeholder-shown)]:text-[12px]
                  peer-[:not(:placeholder-shown)]:font-medium
                "
              >
                Password
              </label>

              <button
                type="button"
                onClick={
                  togglePasswordVisibility
                }
                disabled={
                  loading || otpMode
                }
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
                  transition-all
                  hover:bg-[#f0f2f5]
                  hover:text-[#1877f2]
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                <svg
                  width="21"
                  height="21"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={
                    eyeAnimating
                      ? "scale-90 opacity-50 transition-all"
                      : "scale-100 opacity-100 transition-all"
                  }
                >
                  {showPassword ? (
                    <>
                      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                      <circle
                        cx="12"
                        cy="12"
                        r="3"
                      />
                    </>
                  ) : (
                    <>
                      <path d="M3 3l18 18" />
                      <path d="M10.6 5.1A10.7 10.7 0 0 1 12 5c6.5 0 10 7 10 7a17.5 17.5 0 0 1-3.1 3.9" />
                      <path d="M6.6 6.7C3.7 8.5 2 12 2 12s3.5 7 10 7a10.7 10.7 0 0 0 3.1-.5" />
                    </>
                  )}
                </svg>
              </button>
            </div>

            {/* =================================================
                FORGOT PASSWORD
            ================================================= */}

            {!otpMode && (
              <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="
                    text-[14px]
                    font-semibold
                    text-[#1877f2]
                    transition-colors
                    hover:text-[#166fe5]
                    hover:underline
                  "
                >
                  Forgot password?
                </Link>
              </div>
            )}

            {/* =================================================
                NORMAL LOGIN BUTTON
            ================================================= */}

            {!otpMode && (
              <button
                type="submit"
                disabled={
                  loading ||
                  otpLoading
                }
                className="
                  flex
                  h-[52px]
                  w-full
                  items-center
                  justify-center
                  rounded-full
                  bg-[#1877f2]
                  text-[16px]
                  font-bold
                  text-white
                  shadow-[0_5px_15px_rgba(24,119,242,0.22)]
                  transition-all
                  hover:bg-[#166fe5]
                  hover:shadow-[0_7px_20px_rgba(24,119,242,0.28)]
                  active:scale-[0.98]
                  disabled:cursor-not-allowed
                  disabled:opacity-70
                "
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span
                      className="
                        h-5
                        w-5
                        animate-spin
                        rounded-full
                        border-2
                        border-white/40
                        border-t-white
                      "
                    />
                    Logging in...
                  </span>
                ) : (
                  "Log In"
                )}
              </button>
            )}

            {/* =================================================
                OTP LOGIN
            ================================================= */}

            {!otpMode ? (
              <button
                type="button"
                onClick={handleSendOTP}
                disabled={
                  loading ||
                  otpLoading
                }
                className="
                  mt-3
                  flex
                  h-[52px]
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-full
                  border
                  border-[#1877f2]
                  bg-white
                  text-[16px]
                  font-bold
                  text-[#1877f2]
                  transition-all
                  hover:bg-[#f0f7ff]
                  hover:shadow-sm
                  active:scale-[0.98]
                  disabled:cursor-not-allowed
                  disabled:opacity-70
                "
              >
                {otpLoading ? (
                  <>
                    <span
                      className="
                        h-5
                        w-5
                        animate-spin
                        rounded-full
                        border-2
                        border-[#1877f2]/30
                        border-t-[#1877f2]
                      "
                    />
                    Sending OTP...
                  </>
                ) : (
                  <>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect
                        x="5"
                        y="2"
                        width="14"
                        height="20"
                        rx="2"
                      />
                      <path d="M12 18h.01" />
                    </svg>

                    Log in with OTP
                  </>
                )}
              </button>
            ) : (
              /* =================================================
                 OTP VERIFICATION PANEL
              ================================================= */

              <div className="mt-3 space-y-4">
                {/* ---------------------------------------------
                    OTP SENT INFO
                --------------------------------------------- */}

                <div
                  className="
                    rounded-xl
                    border
                    border-[#d7e8ff]
                    bg-[#f0f7ff]
                    px-4
                    py-4
                    text-center
                  "
                >
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#dbeeff] text-[#1877f2]">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect
                        x="5"
                        y="2"
                        width="14"
                        height="20"
                        rx="2"
                      />
                      <path d="M12 18h.01" />
                    </svg>
                  </div>

                  <p className="mt-3 text-[13px] text-[#65676b]">
                    OTP sent to
                  </p>

                  <p className="mt-1 text-[15px] font-bold text-[#1c1e21]">
                    +91{" "}
                    {identifier.replace(
                      /\D/g,
                      "",
                    )}
                  </p>
                </div>

                {/* ---------------------------------------------
                    OTP INPUT
                --------------------------------------------- */}

                <div className="relative">
                  <input
                    id="login-otp"
                    name="smartprix-otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(event) => {
                      const value =
                        event.target.value
                          .replace(/\D/g, "")
                          .slice(0, 6);

                      setOtp(value);
                      setError("");
                    }}
                    placeholder=" "
                    autoComplete="one-time-code"
                    disabled={otpLoading}
                    autoFocus
                    className="
                      peer
                      h-[58px]
                      w-full
                      rounded-xl
                      border
                      border-[#ccd0d5]
                      bg-white
                      px-4
                      pt-3
                      text-center
                      text-[21px]
                      font-bold
                      tracking-[7px]
                      text-[#1c1e21]
                      outline-none
                      transition-all
                      focus:border-[#1877f2]
                      focus:ring-2
                      focus:ring-[#1877f2]/10
                      disabled:cursor-not-allowed
                      disabled:bg-[#f5f6f7]
                    "
                  />

                  <label
                    htmlFor="login-otp"
                    className="
                      pointer-events-none
                      absolute
                      left-4
                      top-0
                      -translate-y-1/2
                      bg-white
                      px-1
                      text-[12px]
                      font-medium
                      text-[#1877f2]
                    "
                  >
                    Enter 6-digit OTP
                  </label>
                </div>

                {/* ---------------------------------------------
                    VERIFY BUTTON
                --------------------------------------------- */}

                <button
                  type="button"
                  onClick={
                    handleVerifyOTP
                  }
                  disabled={
                    otpLoading ||
                    otp.length !== 6
                  }
                  className="
                    flex
                    h-[52px]
                    w-full
                    items-center
                    justify-center
                    rounded-full
                    bg-[#1877f2]
                    text-[16px]
                    font-bold
                    text-white
                    shadow-[0_5px_15px_rgba(24,119,242,0.22)]
                    transition-all
                    hover:bg-[#166fe5]
                    hover:shadow-[0_7px_20px_rgba(24,119,242,0.28)]
                    active:scale-[0.98]
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  {otpLoading ? (
                    <span className="flex items-center gap-2">
                      <span
                        className="
                          h-5
                          w-5
                          animate-spin
                          rounded-full
                          border-2
                          border-white/40
                          border-t-white
                        "
                      />
                      Verifying...
                    </span>
                  ) : (
                    "Verify OTP"
                  )}
                </button>

                {/* ---------------------------------------------
                    CHANGE NUMBER / PASSWORD
                --------------------------------------------- */}

                <button
                  type="button"
                  onClick={
                    handleUsePassword
                  }
                  disabled={otpLoading}
                  className="
                    w-full
                    py-2
                    text-[14px]
                    font-semibold
                    text-[#1877f2]
                    transition-colors
                    hover:text-[#166fe5]
                    hover:underline
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  Use password instead
                </button>
              </div>
            )}

            {/* =================================================
                DIVIDER
            ================================================= */}

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#e4e6eb]" />
              </div>

              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-[12px] font-medium uppercase tracking-wide text-[#8a8d91]">
                  New to Smartprix?
                </span>
              </div>
            </div>

            {/* =================================================
                CREATE ACCOUNT
            ================================================= */}

            {!otpMode && (
              <Link
                href="/register"
                className="
                  flex
                  h-[50px]
                  w-full
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-[#42b72a]
                  bg-white
                  text-[15px]
                  font-bold
                  text-[#2e8b1d]
                  transition-all
                  hover:bg-[#f1faef]
                  hover:shadow-sm
                  active:scale-[0.98]
                "
              >
                Create new account
              </Link>
            )}

            {/* =================================================
                SECURITY NOTE
            ================================================= */}

            <p
              className="
                pt-1
                text-center
                text-[11px]
                leading-5
                text-[#8a8d91]
              "
            >
              By continuing, you agree to Smartprix's
              terms and privacy policy.
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}