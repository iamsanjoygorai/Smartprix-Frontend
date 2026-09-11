"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getUserProfile,
  type UserProfile,
} from "@/lib/api/user";

/* =========================================================
   ICON
========================================================= */

function Icon({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center ${className}`}
    >
      {children}
    </span>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function formatDate(value: string | null) {
  if (!value) return "Not provided";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not provided";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function getInitials(name: string | null) {
  if (!name?.trim()) {
    return "U";
  }

  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return (
    parts[0][0] +
    parts[parts.length - 1][0]
  ).toUpperCase();
}

function calculateProfileCompletion(
  user: UserProfile,
) {
  const fields = [
    user.name,
    user.email,
    user.mobile,
    user.dateOfBirth,
    user.gender,
  ];

  const completed = fields.filter(
    (value) =>
      value !== null &&
      value !== undefined &&
      String(value).trim() !== "",
  ).length;

  return Math.round(
    (completed / fields.length) * 100,
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] =
    useState<UserProfile | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [loggingOut, setLoggingOut] =
    useState(false);

  /* =======================================================
     LOAD PROFILE
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      const token =
        localStorage.getItem(
          "smartprix_token",
        );

      if (!token) {
        router.replace("/login");
        return;
      }

      const result =
        await getUserProfile();

      if (cancelled) {
        return;
      }

      if (!result.success) {
        if (
          result.message ===
          "Account is disabled"
        ) {
          setError(
            "Your account is disabled.",
          );
          setLoading(false);
          return;
        }

        router.replace("/login");
        return;
      }

      if (result.data) {
        setUser(result.data);

        /* Keep local user information synchronized. */
        const storedUser =
          localStorage.getItem(
            "smartprix_user",
          );

        let previousUser:
          | Record<string, unknown>
          | null = null;

        if (storedUser) {
          try {
            previousUser =
              JSON.parse(storedUser);
          } catch {
            previousUser = null;
          }
        }

        localStorage.setItem(
          "smartprix_user",
          JSON.stringify({
            ...(previousUser ?? {}),
            ...result.data,
          }),
        );
      }

      setLoading(false);
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [router]);

  /* =======================================================
     PROFILE COMPLETION
  ======================================================= */

  const profileCompletion = useMemo(() => {
    if (!user) return 0;

    return calculateProfileCompletion(user);
  }, [user]);

  /* =======================================================
     LOGOUT
  ======================================================= */

  async function handleLogout() {
    setLoggingOut(true);

    localStorage.removeItem(
      "smartprix_token",
    );

    localStorage.removeItem(
      "smartprix_user",
    );

    await new Promise((resolve) =>
      setTimeout(resolve, 180),
    );

    router.replace("/");
  }

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-140px)] bg-[#f1f3f6] px-4 py-7 sm:px-6 sm:py-9">
        <div className="mx-auto max-w-[1080px]">
          <div className="animate-pulse">
            <div className="h-[250px] rounded-[24px] bg-white" />

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({
                length: 4,
              }).map((_, index) => (
                <div
                  key={index}
                  className="h-[125px] rounded-2xl bg-white"
                />
              ))}
            </div>

            <div className="mt-5 h-[280px] rounded-2xl bg-white" />
          </div>
        </div>
      </main>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error) {
    return (
      <main className="flex min-h-[calc(100vh-140px)] items-center justify-center bg-[#f1f3f6] px-4">
        <div className="w-full max-w-md rounded-[24px] border border-gray-200 bg-white p-8 text-center shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
            <Icon>
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                />
                <path d="M12 8v4" />
                <path d="M12 16h.01" />
              </svg>
            </Icon>
          </div>

          <h1 className="mt-5 text-xl font-extrabold text-gray-900">
            Account unavailable
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              router.replace("/login")
            }
            className="mt-6 h-11 rounded-full bg-[#1877f2] px-7 text-sm font-bold text-white transition hover:bg-[#166fe5] hover:shadow-md"
          >
            Back to login
          </button>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  /* =======================================================
     MAIN PAGE
  ======================================================= */

  return (
    <main className="min-h-[calc(100vh-140px)] bg-[#f1f3f6] px-4 py-6 sm:px-6 sm:py-9">
      <div className="mx-auto max-w-[1080px]">

        {/* =================================================
            PAGE INTRO
        ================================================= */}

        <div className="mb-6">
          <p className="text-sm font-bold text-[#1877f2]">
            Smartprix Profile
          </p>

          <h1 className="mt-1 text-[28px] font-extrabold tracking-[-0.6px] text-[#1c1e21] sm:text-[34px]">
            Your Profile
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Your Smartprix identity, activity and
            preferences.
          </p>
        </div>

        {/* =================================================
            PROFILE HERO
        ================================================= */}

        <section className="relative overflow-hidden rounded-[24px] border border-gray-200 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.05)]">

          {/* Decorative background */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -right-24 -top-28 h-72 w-72 rounded-full bg-[#1877f2]/10" />
            <div className="absolute -bottom-36 right-28 h-80 w-80 rounded-full bg-[#6c5ce7]/10" />
            <div className="absolute -left-24 top-20 h-52 w-52 rounded-full bg-cyan-100/40" />
          </div>

          <div className="relative px-6 py-7 sm:px-8 sm:py-9">

            <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">

              {/* User identity */}
              <div className="flex min-w-0 items-center gap-5">

                <div className="relative shrink-0">

                  <div className="flex h-[88px] w-[88px] items-center justify-center rounded-full border-[5px] border-white bg-gradient-to-br from-[#1877f2] to-[#6c5ce7] text-[25px] font-extrabold text-white shadow-[0_8px_25px_rgba(24,119,242,0.25)] sm:h-[100px] sm:w-[100px] sm:text-[28px]">
                    {getInitials(user.name)}
                  </div>

                  {/* Online indicator */}
                  <span className="absolute bottom-1 right-1 h-5 w-5 rounded-full border-[4px] border-white bg-emerald-500" />
                </div>

                <div className="min-w-0">

                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="max-w-full truncate text-[22px] font-extrabold tracking-[-0.3px] text-[#1c1e21] sm:text-[26px]">
                      {user.name ||
                        "Smartprix User"}
                    </h2>

                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-[#1877f2]">
                      <Icon>
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      </Icon>
                      Member
                    </span>
                  </div>

                  <p className="mt-1 truncate text-sm text-gray-500">
                    {user.email}
                  </p>

                  <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-gray-400">
                    <Icon>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="9"
                        />
                        <path d="M12 7v5l3 2" />
                      </svg>
                    </Icon>

                    Member since{" "}
                    {formatDate(
                      user.createdAt,
                    )}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">

                <Link
                  href="/profile/edit"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#1877f2] px-6 text-sm font-bold text-white shadow-[0_5px_16px_rgba(24,119,242,0.2)] transition hover:bg-[#166fe5] hover:shadow-[0_7px_20px_rgba(24,119,242,0.28)] active:scale-[0.98]"
                >
                  <Icon>
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" />
                    </svg>
                  </Icon>

                  Edit profile
                </Link>

                <Link
                  href="/profile/settings"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-6 text-sm font-bold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 active:scale-[0.98]"
                >
                  Account settings
                </Link>
              </div>
            </div>

            {/* Profile completion */}
            <div className="mt-8 rounded-2xl border border-white/80 bg-white/70 p-4 backdrop-blur-sm">

              <div className="flex items-center justify-between gap-4">

                <div>
                  <p className="text-sm font-extrabold text-gray-800">
                    Profile completion
                  </p>

                  <p className="mt-0.5 text-xs text-gray-500">
                    Complete your profile for a
                    better Smartprix experience.
                  </p>
                </div>

                <span className="text-sm font-extrabold text-[#1877f2]">
                  {profileCompletion}%
                </span>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#1877f2] to-[#6c5ce7] transition-all duration-700"
                  style={{
                    width: `${profileCompletion}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            STATS
        ================================================= */}

        <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

          {/* Reviews */}
          <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition hover:-translate-y-0.5 hover:shadow-md">

            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-500 transition group-hover:bg-amber-500 group-hover:text-white">
                <Icon>
                  <svg
                    width="21"
                    height="21"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 3l2.9 5.9 6.1.9-4.5 4.4 1.1 6.1L12 18.4 6.4 21.3l1.1-6.1L3 9.8l6.1-.9L12 3Z" />
                  </svg>
                </Icon>
              </div>

              <span className="text-[11px] font-bold text-gray-400">
                REVIEWS
              </span>
            </div>

            <p className="mt-4 text-2xl font-extrabold text-gray-900">
              0
            </p>

            <p className="mt-0.5 text-xs text-gray-500">
              Reviews written
            </p>
          </div>

          {/* Favorites */}
          <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition hover:-translate-y-0.5 hover:shadow-md">

            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-500 transition group-hover:bg-rose-500 group-hover:text-white">
                <Icon>
                  <svg
                    width="21"
                    height="21"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M20.8 8.7c0 5.5-8.8 10.3-8.8 10.3S3.2 14.2 3.2 8.7A4.7 4.7 0 0 1 12 6.2a4.7 4.7 0 0 1 8.8 2.5Z" />
                  </svg>
                </Icon>
              </div>

              <span className="text-[11px] font-bold text-gray-400">
                SAVED
              </span>
            </div>

           <p className="mt-4 text-2xl font-extrabold text-gray-900">
  {user.stats.reviews}
</p>

            <p className="mt-0.5 text-xs text-gray-500">
              Favorite products
            </p>
          </div>

          {/* Comparisons */}
          <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition hover:-translate-y-0.5 hover:shadow-md">

            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600 transition group-hover:bg-violet-600 group-hover:text-white">
                <Icon>
                  <svg
                    width="21"
                    height="21"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M8 3v18" />
                    <path d="M16 3v18" />
                    <path d="M3 8h18" />
                    <path d="M3 16h18" />
                  </svg>
                </Icon>
              </div>

              <span className="text-[11px] font-bold text-gray-400">
                COMPARE
              </span>
            </div>

            <p className="mt-4 text-2xl font-extrabold text-gray-900">
  {user.stats.favorites}
</p>

            <p className="mt-0.5 text-xs text-gray-500">
              Comparisons created
            </p>
          </div>

          {/* Alerts */}
          <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition hover:-translate-y-0.5 hover:shadow-md">

            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-600 group-hover:text-white">
                <Icon>
                  <svg
                    width="21"
                    height="21"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 3v18" />
                    <path d="M17 7H9.5a3.5 3.5 0 0 0 0 7H15a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </Icon>
              </div>

              <span className="text-[11px] font-bold text-gray-400">
                ALERTS
              </span>
            </div>

            <p className="mt-4 text-2xl font-extrabold text-gray-900">
              0
            </p>

            <p className="mt-0.5 text-xs text-gray-500">
              Price alerts
            </p>
          </div>
        </section>

        {/* =================================================
            CONTENT GRID
        ================================================= */}

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_330px]">

          {/* =================================================
              PERSONAL INFORMATION
          ================================================= */}

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)] sm:p-7">

            <div className="flex items-center justify-between gap-4">

              <div>
                <h2 className="text-lg font-extrabold text-gray-900">
                  Personal information
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Information associated with your
                  Smartprix account.
                </p>
              </div>

              <Link
                href="/profile/edit"
                className="hidden items-center gap-1.5 text-xs font-bold text-[#1877f2] transition hover:text-[#166fe5] sm:inline-flex"
              >
                Edit
                <Icon>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12h14" />
                    <path d="m13 6 6 6-6 6" />
                  </svg>
                </Icon>
              </Link>
            </div>

            <div className="mt-6 divide-y divide-gray-100">

              {/* Name */}
              <div className="flex items-center justify-between gap-5 py-4 first:pt-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-[#1877f2]">
                    <Icon>
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle
                          cx="12"
                          cy="8"
                          r="4"
                        />
                        <path d="M4 21a8 8 0 0 1 16 0" />
                      </svg>
                    </Icon>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-400">
                      Full name
                    </p>

                    <p className="mt-0.5 text-sm font-bold text-gray-800">
                      {user.name ||
                        "Not provided"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-3 py-4">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                  <Icon>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect
                        x="3"
                        y="5"
                        width="18"
                        height="14"
                        rx="2"
                      />
                      <path d="m3 7 9 6 9-6" />
                    </svg>
                  </Icon>
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-400">
                    Email address
                  </p>

                  <p className="mt-0.5 truncate text-sm font-bold text-gray-800">
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Mobile */}
              <div className="flex items-center gap-3 py-4">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <Icon>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect
                        x="7"
                        y="2"
                        width="10"
                        height="20"
                        rx="2"
                      />
                      <path d="M11 18h2" />
                    </svg>
                  </Icon>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-400">
                    Mobile number
                  </p>

                  <p className="mt-0.5 text-sm font-bold text-gray-800">
                    {user.mobile ||
                      "Not provided"}
                  </p>
                </div>
              </div>

              {/* Date of birth */}
              <div className="flex items-center gap-3 py-4">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <Icon>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect
                        x="3"
                        y="4"
                        width="18"
                        height="18"
                        rx="2"
                      />
                      <path d="M16 2v4" />
                      <path d="M8 2v4" />
                      <path d="M3 10h18" />
                    </svg>
                  </Icon>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-400">
                    Date of birth
                  </p>

                  <p className="mt-0.5 text-sm font-bold text-gray-800">
                    {formatDate(
                      user.dateOfBirth,
                    )}
                  </p>
                </div>
              </div>

              {/* Gender */}
              <div className="flex items-center gap-3 py-4 last:pb-0">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-pink-50 text-pink-500">
                  <Icon>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle
                        cx="10"
                        cy="14"
                        r="5"
                      />
                      <path d="M14 10l6-6" />
                      <path d="M15 4h5v5" />
                    </svg>
                  </Icon>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-400">
                    Gender
                  </p>

                  <p className="mt-0.5 text-sm font-bold capitalize text-gray-800">
                    {user.gender ||
                      "Not provided"}
                  </p>
                </div>
              </div>
            </div>

            <Link
              href="/profile/edit"
              className="mt-5 flex h-11 w-full items-center justify-center rounded-full border border-gray-200 bg-white text-sm font-bold text-gray-700 transition hover:border-[#1877f2] hover:bg-blue-50 hover:text-[#1877f2] sm:hidden"
            >
              Edit profile
            </Link>
          </section>

          {/* =================================================
              SIDE PANEL
          ================================================= */}

          <div className="space-y-5">

            {/* Account status */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Icon>
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4Z" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                  </Icon>
                </div>

                <div>
                  <h2 className="text-sm font-extrabold text-gray-900">
                    Account status
                  </h2>

                  <p className="mt-0.5 text-xs text-gray-500">
                    Your account is protected.
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3">

                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />

                  <span className="text-xs font-bold text-emerald-700">
                    Active account
                  </span>
                </div>

                <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-600">
                  Secure
                </span>
              </div>

              <Link
                href="/profile/security"
                className="mt-4 flex h-10 items-center justify-center rounded-full border border-gray-200 text-xs font-bold text-gray-700 transition hover:border-[#1877f2] hover:bg-blue-50 hover:text-[#1877f2]"
              >
                Security settings
              </Link>
            </section>

            {/* Quick links */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">

              <h2 className="text-sm font-extrabold text-gray-900">
                Quick links
              </h2>

              <div className="mt-4 space-y-2">

                <Link
                  href="/favorites"
                  className="group flex items-center justify-between rounded-xl border border-transparent px-3 py-3 transition hover:border-gray-100 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-500">
                      <Icon>
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M20.8 8.7c0 5.5-8.8 10.3-8.8 10.3S3.2 14.2 3.2 8.7A4.7 4.7 0 0 1 12 6.2a4.7 4.7 0 0 1 8.8 2.5Z" />
                        </svg>
                      </Icon>
                    </div>

                    <span className="text-xs font-bold text-gray-700">
                      Favorites
                    </span>
                  </div>

                  <Icon className="text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-gray-500">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </Icon>
                </Link>

                <Link
                  href="/comparisons"
                  className="group flex items-center justify-between rounded-xl border border-transparent px-3 py-3 transition hover:border-gray-100 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                      <Icon>
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M8 3v18" />
                          <path d="M16 3v18" />
                          <path d="M3 8h18" />
                          <path d="M3 16h18" />
                        </svg>
                      </Icon>
                    </div>

                    <span className="text-xs font-bold text-gray-700">
                      Comparisons
                    </span>
                  </div>

                  <Icon className="text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-gray-500">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </Icon>
                </Link>

                <Link
                  href="/profile/security"
                  className="group flex items-center justify-between rounded-xl border border-transparent px-3 py-3 transition hover:border-gray-100 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-[#1877f2]">
                      <Icon>
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <rect
                            x="4"
                            y="10"
                            width="16"
                            height="11"
                            rx="2"
                          />
                          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                        </svg>
                      </Icon>
                    </div>

                    <span className="text-xs font-bold text-gray-700">
                      Security
                    </span>
                  </div>

                  <Icon className="text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-gray-500">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </Icon>
                </Link>
              </div>
            </section>
          </div>
        </div>

        {/* =================================================
            ACTIVITY
        ================================================= */}

        <section className="mt-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)] sm:p-7">

          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="text-lg font-extrabold text-gray-900">
                Recent activity
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Your latest Smartprix activity will
                appear here.
              </p>
            </div>

            <span className="mt-2 w-fit rounded-full bg-gray-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-gray-500 sm:mt-0">
              Coming soon
            </span>
          </div>

          <div className="mt-6 rounded-2xl border border-dashed border-gray-200 bg-gray-50/70 px-5 py-10 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-gray-400 shadow-sm">
              <Icon>
                <svg
                  width="25"
                  height="25"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M4 19V5" />
                  <path d="M4 19h16" />
                  <path d="M7 15l3-4 3 2 4-6" />
                </svg>
              </Icon>
            </div>

            <h3 className="mt-4 text-sm font-extrabold text-gray-800">
              Your Smartprix journey starts here
            </h3>

            <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-gray-500">
              Compare phones, save your favorite
              products, write reviews and track
              prices. Your activity will appear here.
            </p>

            <Link
              href="/mobiles"
              className="mt-5 inline-flex h-10 items-center justify-center rounded-full bg-[#1877f2] px-5 text-xs font-bold text-white transition hover:bg-[#166fe5]"
            >
              Explore mobiles
            </Link>
          </div>
        </section>

        {/* =================================================
            LOGOUT
        ================================================= */}

        <div className="mt-5 flex justify-end pb-4">

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-red-200 bg-white px-6 text-sm font-bold text-red-600 transition hover:bg-red-50 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Icon>
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10 17l5-5-5-5" />
                <path d="M15 12H3" />
                <path d="M21 19V5a2 2 0 0 0-2-2h-6" />
              </svg>
            </Icon>

            {loggingOut
              ? "Logging out..."
              : "Log out"}
          </button>
        </div>
      </div>
    </main>
  );
}
