"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5000/api";

interface LoginUser {
  id: string;
  email: string;
  name?: string;
  role: string;
  permissions: string[];
}

interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    user: LoginUser;
  };
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /*
   * If the user is already logged in:
   *
   * ADMIN        -> /admin
   * SUPER_ADMIN  -> /admin
   * EDITOR       -> /admin
   * USER         -> /
   *
   * This prevents an already-logged-in user from staying
   * on the login page.
   */
  useEffect(() => {
    const token = localStorage.getItem("smartprix_token");
    const userData = localStorage.getItem("smartprix_user");

    if (!token || !userData) {
      setCheckingAuth(false);
      return;
    }

    try {
      const user: LoginUser = JSON.parse(userData);

      const isAdminUser =
        user.role === "ADMIN" ||
        user.role === "SUPER_ADMIN" ||
        user.role === "EDITOR";

      if (isAdminUser) {
        router.replace("/admin");
        return;
      }

      router.replace("/");
    } catch {
      localStorage.removeItem("smartprix_user");
      localStorage.removeItem("smartprix_token");

      setCheckingAuth(false);
    }
  }, [router]);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        },
      );

      const responseData: LoginResponse =
        await response.json();

      if (!response.ok || !responseData.success) {
        throw new Error(
          responseData.message ||
            "Invalid email or password",
        );
      }

      if (
        !responseData.data?.token ||
        !responseData.data?.user
      ) {
        throw new Error(
          "Invalid login response from server.",
        );
      }

      const { token, user } = responseData.data;

      /*
       * Store authentication information.
       */
      localStorage.setItem(
        "smartprix_token",
        token,
      );

      localStorage.setItem(
        "smartprix_user",
        JSON.stringify(user),
      );

      setSuccess(
        responseData.message ||
          "Login successful",
      );

      /*
       * Redirect according to user role.
       *
       * ADMIN        -> /admin
       * SUPER_ADMIN  -> /admin
       * EDITOR       -> /admin
       * USER         -> /
       */
      const isAdminUser =
        user.role === "ADMIN" ||
        user.role === "SUPER_ADMIN" ||
        user.role === "EDITOR";

      if (isAdminUser) {
        router.replace("/admin");
      } else {
        router.replace("/");
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to login.",
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * Prevent the login form from briefly appearing
   * while we check localStorage.
   */
  if (checkingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-sm text-gray-500">
          Checking authentication...
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Login to your Smartprix account.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Email address
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="you@example.com"
              autoComplete="email"
              disabled={loading}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black disabled:cursor-not-allowed disabled:bg-gray-100"
            />
          </div>

          {/* Password */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>

              <Link
                href="/forgot-password"
                className="text-sm font-medium text-gray-600 hover:text-black"
              >
                Forgot password?
              </Link>
            </div>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={loading}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black disabled:cursor-not-allowed disabled:bg-gray-100"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {success}
            </div>
          )}

          {/* Login button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>
        </form>

        {/* Register */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Don't have an account?{" "}

            <Link
              href="/register"
              className="font-medium text-gray-900 hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
