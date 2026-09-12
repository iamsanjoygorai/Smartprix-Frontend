"use client";

import Link from "next/link";

import SecuritySection from "./SecuritySection";
import NotificationSettings from "./NotificationSettings";
import EmailPreferences from "./EmailPreferences";
import PrivacySettings from "./PrivacySettings";
import SessionsSection from "./SessionsSection";
import DangerZone from "./DangerZone";

export default function AccountSettings() {
return ( <div className="min-h-screen bg-[#f5f7fa]">
{/* =====================================================
HEADER
===================================================== */}

   
  <div className="border-b border-gray-200 bg-white">
    <div className="mx-auto max-w-6xl px-4 py-5">
      <Link
        href="/profile"
        className="text-sm font-medium text-gray-500 transition hover:text-gray-900"
      >
        ← Back to profile
      </Link>

      <h1 className="mt-3 text-2xl font-bold text-gray-900">
        Account settings
      </h1>

      <p className="mt-1 text-sm text-gray-500">
        Manage your Smartprix account, security and
        preferences.
      </p>
    </div>
  </div>

  {/* =====================================================
      MAIN
  ===================================================== */}

  <div className="mx-auto flex max-w-6xl gap-8 px-4 py-8">
    {/* ===================================================
        SIDEBAR
    =================================================== */}

    <aside className="hidden w-56 shrink-0 lg:block">
      <nav className="sticky top-6 space-y-1">
        <a
          href="#security"
          className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-white"
        >
          Security
        </a>

        <a
          href="#notifications"
          className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-white"
        >
          Notifications
        </a>

        <a
          href="#email-preferences"
          className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-white"
        >
          Email preferences
        </a>

        <a
          href="#privacy"
          className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-white"
        >
          Privacy
        </a>

        <a
          href="#sessions"
          className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-white"
        >
          Sessions & devices
        </a>

        <a
          href="#danger-zone"
          className="block rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
        >
          Delete account
        </a>
      </nav>
    </aside>

    {/* ===================================================
        SETTINGS CONTENT
    =================================================== */}

    <main className="min-w-0 flex-1 space-y-6">
      <SecuritySection />

      <NotificationSettings />

      <EmailPreferences />

      <PrivacySettings />

      <SessionsSection />

      <DangerZone />
    </main>
  </div>
</div>
   

);
}
