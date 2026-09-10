"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

interface LoginResponse {
  success?: boolean;
  message?: string;
  token?: string;
  data?: {
    token?: string;
    user?: {
      id?: string;
      name?: string;
      email?: string;
      role?: string;
      isAdmin?: boolean;
    };
  };
  user?: {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
    isAdmin?: boolean;
  };
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
        {/* Eye */}
        <path d="M2 12s3-8 10-8 10 8 10 8-3 8-10 8S2 12 2 12Z" />

        {/* Pupil */}
        <circle cx="12" cy="12" r="3" />

        {/* Slash: bottom-left → top-right */}
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
   LOGIN PAGE
========================================================= */

export default function LoginPage() {
  const router = useRouter();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [eyeAnimating, setEyeAnimating] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* =======================================================
     LOGIN
  ======================================================= */

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    const cleanIdentifier = identifier.trim();

    if (!cleanIdentifier) {
      setError("Please enter your email address or mobile number.");
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
          email: cleanIdentifier,
          password,
        }),
      });

      const result: LoginResponse = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(
          result.message || "Invalid email or password.",
        );
      }

      /*
       * Support both:
       *
       * {
       *   token,
       *   user
       * }
       *
       * and:
       *
       * {
       *   data: {
       *     token,
       *     user
       *   }
       * }
       */

      const token =
        result.token ??
        result.data?.token ??
        "";

      const user =
        result.user ??
        result.data?.user ??
        null;

      if (!token) {
        throw new Error(
          "Login succeeded, but no authentication token was returned.",
        );
      }

      localStorage.setItem("smartprix_token", token);

      if (user) {
        localStorage.setItem(
          "smartprix_user",
          JSON.stringify(user),
        );
      }

      /*
       * Admin users go to the admin dashboard.
       * Normal users go to the Smartprix home page.
       */

      const role = String(user?.role ?? "").toUpperCase();

      const isAdmin =
        user?.isAdmin === true ||
        role === "ADMIN" ||
        role === "SUPER_ADMIN";

      if (isAdmin) {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to log in. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  /* =======================================================
     PASSWORD EYE
  ======================================================= */

  function togglePassword() {
    setEyeAnimating(true);

    setShowPassword((value) => !value);

    window.setTimeout(() => {
      setEyeAnimating(false);
    }, 180);
  }

  return (
    <main
      className="
        flex
        min-h-screen
        items-center
        justify-center
        bg-[#f0f2f5]
        px-4
        py-8
        sm:py-12
      "
    >
      <div className="w-full max-w-[460px]">

        {/* =================================================
            SMARTPRIX BRAND
        ================================================= */}

        <div className="mb-5 text-center">
          <Link
            href="/"
            className="
              inline-block
              text-[38px]
              font-extrabold
              tracking-[-1.8px]
              text-[#1877f2]
              transition
              hover:opacity-90
            "
          >
            Smartprix
          </Link>
        </div>

        {/* =================================================
            LOGIN CARD
        ================================================= */}

        <div
          className="
            overflow-hidden
            rounded-xl
            bg-white
            shadow-[0_2px_12px_rgba(0,0,0,0.16)]
          "
        >
          <div className="px-7 pb-8 pt-7 sm:px-9">

            {/* TITLE */}

            <h1
              className="
                text-center
                text-[22px]
                font-bold
                tracking-[-0.2px]
                text-[#1c1e21]
              "
            >
              Log in to Smartprix
            </h1>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="mt-5 space-y-3"
            >

              {/* EMAIL / MOBILE */}

              {/* EMAIL / MOBILE — FLOATING INPUT */}
<div className="relative">
  <input
    id="login-identifier"
    type="text"
    value={identifier}
    onChange={(event) => {
      setIdentifier(event.target.value);
      setError("");
    }}
    placeholder=" "
    autoComplete="username"
    disabled={loading}
    className="
      peer
      h-[54px]
      w-full
      rounded-md
      border
      border-[#ccd0d5]
      bg-white
      px-4
      pt-3
      text-[15px]
      text-[#1c1e21]
      outline-none
      transition
      focus:border-[#1877f2]
      focus:ring-1
      focus:ring-[#1877f2]
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
    Email address or mobile number
  </label>
</div>

{/* PASSWORD — FLOATING INPUT */}
<div className="relative">
  <input
    id="login-password"
    type={showPassword ? "text" : "password"}
    value={password}
    onChange={(event) => {
      setPassword(event.target.value);
      setError("");
    }}
    placeholder=" "
    autoComplete="current-password"
    disabled={loading}
    className="
      peer
      h-[54px]
      w-full
      rounded-md
      border
      border-[#ccd0d5]
      bg-white
      px-4
      pt-3
      pr-12
      text-[15px]
      text-[#1c1e21]
      outline-none
      transition
      focus:border-[#1877f2]
      focus:ring-1
      focus:ring-[#1877f2]
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
    Password
  </label>

  {/* PASSWORD EYE — KEEP YOUR EXISTING CODE */}
  <button
    type="button"
    onClick={togglePassword}
    disabled={loading}
    aria-label={showPassword ? "Hide password" : "Show password"}
    title={showPassword ? "Hide password" : "Show password"}
    className="
      absolute
      right-2
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
      duration-200
      hover:bg-[#f0f2f5]
      hover:text-[#1877f2]
      disabled:pointer-events-none
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

              {/* ERROR */}

              {error && (
                <div
                  className="
                    rounded-md
                    border
                    border-[#f0b8b8]
                    bg-[#fff4f4]
                    px-3
                    py-2.5
                    text-[13px]
                    leading-5
                    text-[#c62828]
                  "
                >
                  {error}
                </div>
              )}

              {/* LOGIN BUTTON */}

              <button
                type="submit"
                disabled={loading}
                className="
                  mt-1 flex h-[50px] w-full items-center justify-center
  rounded-full bg-[#1877f2]
  text-[16px] font-bold text-white
  transition-all duration-150
  hover:bg-[#166fe5] hover:shadow-md
  active:scale-[0.98]
  disabled:cursor-pointer disabled:opacity-70
                "
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span
                      className="
                        h-4
                        w-4
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
                  "Log in"
                )}
              </button>
            </form>

            {/* FORGOTTEN PASSWORD */}

            <div className="mt-4 text-center">
              <Link
                href="/forgot-password"
                className="
                  text-[14px]
                  font-medium
                  text-[#1877f2]
                  hover:underline
                "
              >
                Forgotten password?
              </Link>
            </div>

            {/* DIVIDER */}

            <div className="my-5 flex items-center">
              <div className="h-px flex-1 bg-[#dadde1]" />

              <span
                className="
                  px-3
                  text-[12px]
                  font-medium
                  text-[#8a8d91]
                "
              >
                OR
              </span>

              <div className="h-px flex-1 bg-[#dadde1]" />
            </div>

            {/* CREATE ACCOUNT */}

            <div className="flex justify-center">
              <Link
                href="/register"
                className="
   flex h-[50px] w-full items-center justify-center
  rounded-full border border-[#1877f2] bg-white
  px-6 text-[16px] font-bold text-[#1877f2]
  transition-all duration-150
  hover:bg-[#f0f2f5] hover:shadow-sm
  active:scale-[0.98]
"
              >
                Create new account
              </Link>
            </div>
          </div>
        </div>

        {/* =================================================
            FOOTNOTE
        ================================================= */}

        <p
          className="
            mt-6
            text-center
            text-[11px]
            leading-5
            text-[#8a8d91]
          "
        >
          By continuing, you agree to use Smartprix in accordance
          with our Terms and Privacy Policy.
        </p>

        <div className="mt-3 text-center">
          <span className="text-[11px] text-[#a0a3a7]">
            © {new Date().getFullYear()} Smartprix
          </span>
        </div>
      </div>
    </main>
  );
}
