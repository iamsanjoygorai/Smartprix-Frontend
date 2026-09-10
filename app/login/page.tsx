"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
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

export default function LoginPage() {
  const router = useRouter();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [eyeAnimating, setEyeAnimating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /*
   * Redirect users who are already logged in.
   */
  useEffect(() => {
    try {
      const token = localStorage.getItem("smartprix_token");

      if (!token) {
        return;
      }

      const storedUser = localStorage.getItem("smartprix_user");

      let user: {
        role?: string;
        isAdmin?: boolean;
      } | null = null;

      if (storedUser) {
        try {
          user = JSON.parse(storedUser);
        } catch {
          user = null;
        }
      }

      const role = String(user?.role ?? "").toUpperCase();

      const isAdmin =
        user?.isAdmin === true ||
        role === "ADMIN" ||
        role === "SUPER_ADMIN";

      if (isAdmin) {
        router.replace("/admin");
      } else {
        router.replace("/");
      }
    } catch {
      // If localStorage contains invalid data,
      // simply allow the user to see the login page.
    }
  }, [router]);

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

      const role = String(user?.role ?? "").toUpperCase();

      const isAdmin =
        user?.isAdmin === true ||
        role === "ADMIN" ||
        role === "SUPER_ADMIN";

      if (isAdmin) {
        router.replace("/admin");
      } else {
        router.replace("/");
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

  function togglePassword() {
    setEyeAnimating(true);

    setShowPassword((value) => !value);

    window.setTimeout(() => {
      setEyeAnimating(false);
    }, 180);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f0f2f5] px-4 py-10">
      <div className="w-full max-w-[460px]">

        {/* Smartprix Logo */}
        <div className="mb-6 text-center">
          <Link
            href="/"
            className="
              inline-block
              text-[42px]
              font-extrabold
              tracking-[-2px]
              text-[#1877f2]
              transition-opacity
              hover:opacity-90
            "
          >
            Smartprix
          </Link>
        </div>

        {/* Login Card */}
        <div
          className="
            overflow-hidden
            rounded-lg
            bg-white
            shadow-[0_2px_12px_rgba(0,0,0,0.12)]
          "
        >
          <div className="px-7 pb-8 pt-7 sm:px-9">

            {/* Heading */}
            <h1 className="mb-6 text-center text-[24px] font-bold text-[#1c1e21]">
              Log in to Smartprix
            </h1>

            <form
              onSubmit={handleSubmit}
              autoComplete="off"
              className="space-y-4"
            >

              {/* Email / Mobile */}
              <div className="relative">
                <input
                  id="login-identifier"
                  name="smartprix-identifier"
                  type="text"
                  value={identifier}
                  onChange={(event) => {
                    setIdentifier(event.target.value);
                    setError("");
                  }}
                  placeholder=" "
                  autoComplete="new-password"
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

              {/* Password */}
              <div className="relative">
                <input
                  id="login-password"
                  name="smartprix-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError("");
                  }}
                  placeholder=" "
                  autoComplete="new-password"
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

                {/* Eye Button */}
                <button
                  type="button"
                  onClick={togglePassword}
                  disabled={loading}
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
                    hover:text-[#1c1e21]
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
                      ${
                        eyeAnimating
                          ? "scale-75"
                          : "scale-100"
                      }
                    `}
                  >
                    <EyeIcon off={!showPassword} />
                  </span>
                </button>
              </div>

              {/* Error */}
              {error && (
                <div
                  className="
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

              {/* Login */}
              <button
                type="submit"
                disabled={loading}
                className="
                  mt-1
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
                  disabled:opacity-70
                "
              >
                {loading ? "Logging in..." : "Log in"}
              </button>

              {/* Forgot Password */}
              <div className="pt-1 text-center">
                <Link
                  href="/forgot-password"
                  className="
                    text-[14px]
                    font-semibold
                    text-[#1877f2]
                    hover:underline
                  "
                >
                  Forgotten password?
                </Link>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 py-2">
                <div className="h-px flex-1 bg-[#dadde1]" />
                <span className="text-[13px] text-[#8a8d91]">
                  OR
                </span>
                <div className="h-px flex-1 bg-[#dadde1]" />
              </div>

              {/* Create Account */}
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
                  border-[#1877f2]
                  bg-white
                  px-6
                  text-[16px]
                  font-bold
                  text-[#1877f2]
                  transition-all
                  duration-150
                  hover:bg-[#f0f2f5]
                  hover:shadow-sm
                  active:scale-[0.98]
                "
              >
                Create new account
              </Link>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-[12px] text-[#65676b]">
          © {new Date().getFullYear()} Smartprix
        </div>
      </div>
    </main>
  );
}
