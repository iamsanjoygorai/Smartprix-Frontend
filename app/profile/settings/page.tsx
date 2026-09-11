"use client";

import Link from "next/link";
import { useState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";

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
   PAGE
========================================================= */

export default function AccountSettingsPage() {
  const [priceAlerts, setPriceAlerts] = useState(true);
  const [productUpdates, setProductUpdates] = useState(true);
  const [newsOffers, setNewsOffers] = useState(false);
  const [productEmails, setProductEmails] = useState(true);
  const [promotionalEmails, setPromotionalEmails] = useState(false);

  const router = useRouter();

const {
  data: user,
  isLoading,
} = useCurrentUser();

useEffect(() => {
  if (!isLoading && !user) {
    router.replace("/profile");
  }
}, [user, isLoading, router]);





if (isLoading) {
  return null;
}

if (!user) {
  return null;
}


  return (
    <main className="min-h-[calc(100vh-140px)] bg-[#f1f3f6] px-4 py-7 sm:px-6 sm:py-9">
      <div className="mx-auto max-w-[1050px]">

        {/* BACK */}
        <Link
          href="/profile/edit"
          className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-gray-500 transition hover:text-[#1877f2]"
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
              <path d="M19 12H5" />
              <path d="m12 19-7-7 7-7" />
            </svg>
          </Icon>

          Back to profile
        </Link>

        {/* HEADER */}
        <div className="mb-7">
          <p className="text-sm font-bold text-[#1877f2]">
            Smartprix Account
          </p>

          <h1 className="mt-1 text-[30px] font-extrabold tracking-[-0.7px] text-[#1c1e21] sm:text-[36px]">
            Account settings
          </h1>

          <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
            Manage your security, notifications, privacy and other
            account preferences.
          </p>
        </div>

        {/* LAYOUT */}
        <div className="grid gap-6 lg:grid-cols-[235px_1fr]">

          {/* SIDEBAR */}
          <aside className="h-fit rounded-[22px] border border-gray-200 bg-white p-3 shadow-[0_8px_30px_rgba(0,0,0,0.04)] lg:sticky lg:top-6">
            <p className="px-3 pb-2 pt-2 text-[10px] font-extrabold uppercase tracking-[0.12em] text-gray-400">
              Settings
            </p>

            <a
              href="#security"
              className="flex items-center gap-3 rounded-xl bg-blue-50 px-3 py-3 text-sm font-extrabold text-[#1877f2]"
            >
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
                  <rect x="4" y="10" width="16" height="10" rx="2" />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                </svg>
              </Icon>
              Security
            </a>

            <a
              href="#notifications"
              className="mt-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
            >
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
                  <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                  <path d="M10 21h4" />
                </svg>
              </Icon>
              Notifications
            </a>

            <a
              href="#email"
              className="mt-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
            >
              <Icon>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3 7 9 6 9-6" />
                </svg>
              </Icon>
              Email preferences
            </a>

            <a
              href="#privacy"
              className="mt-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
            >
              <Icon>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 3 20 6v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3Z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </Icon>
              Privacy
            </a>

            <a
              href="#sessions"
              className="mt-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
            >
              <Icon>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="4" width="18" height="14" rx="2" />
                  <path d="M8 21h8" />
                  <path d="M12 18v3" />
                </svg>
              </Icon>
              Sessions & devices
            </a>

            <div className="my-3 border-t border-gray-100" />

            <a
              href="#danger"
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50"
            >
              <Icon>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M3 6h18" />
                  <path d="M8 6V4h8v2" />
                  <path d="M19 6l-1 14H6L5 6" />
                </svg>
              </Icon>
              Delete account
            </a>
          </aside>

          {/* CONTENT */}
          <div className="space-y-6">

            {/* =================================================
                SECURITY
            ================================================= */}

            <section
              id="security"
              className="scroll-mt-6 overflow-hidden rounded-[22px] border border-gray-200 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
            >
              <div className="border-b border-gray-100 p-6 sm:p-7">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1877f2]">
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
                      <rect x="4" y="10" width="16" height="10" rx="2" />
                      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                    </svg>
                  </div>

                  <div>
                    <h2 className="text-lg font-extrabold text-gray-900">
                      Security
                    </h2>

                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      Protect your account and manage your password.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-7">
                <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-extrabold text-gray-900">
                      Password
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Change your Smartprix account password.
                    </p>
                  </div>

                  <Link
                    href="/profile/change-password"
                    className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-[#1877f2] px-5 text-xs font-extrabold text-white shadow-[0_4px_14px_rgba(24,119,242,0.18)] transition hover:bg-[#166fe5]"
                  >
                    Change password
                  </Link>
                </div>

                <div className="mt-4 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white">
                    ✓
                  </span>

                  <div>
                    <p className="text-xs font-extrabold text-emerald-800">
                      Your account is protected
                    </p>

                    <p className="mt-0.5 text-[11px] text-emerald-700">
                      Keep your password private and never share it.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* =================================================
                NOTIFICATIONS
            ================================================= */}

            <section
              id="notifications"
              className="scroll-mt-6 overflow-hidden rounded-[22px] border border-gray-200 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
            >
              <div className="border-b border-gray-100 p-6 sm:p-7">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                    <svg
                      width="21"
                      height="21"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                      <path d="M10 21h4" />
                    </svg>
                  </div>

                  <div>
                    <h2 className="text-lg font-extrabold text-gray-900">
                      Notifications
                    </h2>

                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      Choose which product and Smartprix notifications
                      you want to receive.
                    </p>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                <SettingToggle
                  title="Price alerts"
                  description="Get notified when products you're watching become cheaper."
                  enabled={priceAlerts}
                  onChange={() => setPriceAlerts(!priceAlerts)}
                />

                <SettingToggle
                  title="Product updates"
                  description="Receive updates about products, comparisons and new launches."
                  enabled={productUpdates}
                  onChange={() =>
                    setProductUpdates(!productUpdates)
                  }
                />

                <SettingToggle
                  title="News & offers"
                  description="Get Smartprix news, deals and occasional special offers."
                  enabled={newsOffers}
                  onChange={() => setNewsOffers(!newsOffers)}
                />
              </div>
            </section>

            {/* =================================================
                EMAIL
            ================================================= */}

            <section
              id="email"
              className="scroll-mt-6 overflow-hidden rounded-[22px] border border-gray-200 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
            >
              <div className="border-b border-gray-100 p-6 sm:p-7">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                    <svg
                      width="21"
                      height="21"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="m3 7 9 6 9-6" />
                    </svg>
                  </div>

                  <div>
                    <h2 className="text-lg font-extrabold text-gray-900">
                      Email preferences
                    </h2>

                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      Control the types of email communication you receive.
                    </p>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                <SettingToggle
                  title="Product emails"
                  description="Helpful product recommendations, price information and updates."
                  enabled={productEmails}
                  onChange={() =>
                    setProductEmails(!productEmails)
                  }
                />

                <SettingToggle
                  title="Promotional emails"
                  description="Deals, promotions and special Smartprix announcements."
                  enabled={promotionalEmails}
                  onChange={() =>
                    setPromotionalEmails(!promotionalEmails)
                  }
                />
              </div>
            </section>

            {/* =================================================
                PRIVACY
            ================================================= */}

            <section
              id="privacy"
              className="scroll-mt-6 overflow-hidden rounded-[22px] border border-gray-200 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
            >
              <div className="border-b border-gray-100 p-6 sm:p-7">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <svg
                      width="21"
                      height="21"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 3 20 6v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3Z" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                  </div>

                  <div>
                    <h2 className="text-lg font-extrabold text-gray-900">
                      Privacy
                    </h2>

                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      Manage how your account information is handled.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-7">
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-gray-500 shadow-sm">
                      <svg
                        width="17"
                        height="17"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 10v6" />
                        <path d="M12 7h.01" />
                      </svg>
                    </div>

                    <div>
                      <p className="text-sm font-extrabold text-gray-800">
                        Your information
                      </p>

                      <p className="mt-1 text-xs leading-5 text-gray-500">
                        Your account information is used to provide
                        Smartprix features such as profiles, favorites,
                        comparisons and price alerts.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* =================================================
                SESSIONS
            ================================================= */}

            <section
              id="sessions"
              className="scroll-mt-6 overflow-hidden rounded-[22px] border border-gray-200 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
            >
              <div className="border-b border-gray-100 p-6 sm:p-7">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                    <svg
                      width="21"
                      height="21"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="3" y="4" width="18" height="14" rx="2" />
                      <path d="M8 21h8" />
                      <path d="M12 18v3" />
                    </svg>
                  </div>

                  <div>
                    <h2 className="text-lg font-extrabold text-gray-900">
                      Sessions & devices
                    </h2>

                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      Review where your Smartprix account is signed in.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-7">
                <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-gray-600 shadow-sm">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="3" y="4" width="18" height="14" rx="2" />
                      <path d="M8 21h8" />
                      <path d="M12 18v3" />
                    </svg>
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-extrabold text-gray-900">
                      This device
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Your current Smartprix session
                    </p>
                  </div>

                  <span className="ml-auto shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-emerald-600">
                    Active
                  </span>
                </div>

                <p className="mt-3 text-[11px] text-gray-400">
                  Detailed device and session management will be available
                  once session tracking is enabled.
                </p>
              </div>
            </section>

            {/* =================================================
                DANGER ZONE
            ================================================= */}

            <section
              id="danger"
              className="scroll-mt-6 overflow-hidden rounded-[22px] border border-red-200 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
            >
              <div className="border-b border-red-100 bg-red-50/60 p-6 sm:p-7">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                    <svg
                      width="21"
                      height="21"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M3 6h18" />
                      <path d="M8 6V4h8v2" />
                      <path d="M19 6l-1 14H6L5 6" />
                    </svg>
                  </div>

                  <div>
                    <h2 className="text-lg font-extrabold text-red-700">
                      Danger zone
                    </h2>

                    <p className="mt-1 text-xs leading-5 text-red-600/70">
                      These actions can permanently affect your account.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-7">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-extrabold text-gray-900">
                      Delete your account
                    </p>

                    <p className="mt-1 max-w-xl text-xs leading-5 text-gray-500">
                      Permanently remove your Smartprix account and
                      associated personal data. This action cannot be undone.
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled
                    className="inline-flex h-10 shrink-0 items-center justify-center rounded-full border border-red-200 bg-white px-5 text-xs font-extrabold text-red-600 opacity-60"
                  >
                    Delete account
                  </button>
                </div>

                <p className="mt-4 rounded-xl bg-gray-50 px-4 py-3 text-[11px] text-gray-400">
                  Account deletion will be enabled after the secure
                  confirmation flow is implemented.
                </p>
              </div>
            </section>

          </div>
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   TOGGLE
========================================================= */

function SettingToggle({
  title,
  description,
  enabled,
  onChange,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center gap-4 px-6 py-5 sm:px-7">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-extrabold text-gray-900">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-gray-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={onChange}
        aria-pressed={enabled}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${
          enabled
            ? "bg-[#1877f2]"
            : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
            enabled
              ? "left-6"
              : "left-1"
          }`}
        />
      </button>
    </div>
  );
}
