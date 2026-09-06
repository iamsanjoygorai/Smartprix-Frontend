"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export default function AdminProfilePage() {
  const [user, setUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("smartprix_user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
  }, []);

  if (!user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-gray-500">
          Loading profile...
        </p>
      </div>
    );
  }

  const initials =
    user.name
      ?.split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase() || "AD";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Admin Profile
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          View your Smartprix administrator account.
        </p>
      </div>

      {/* Profile Card */}
      <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="border-b bg-gray-50 px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black text-xl font-bold text-white">
              {initials}
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {user.name}
              </h2>

              <p className="text-sm text-gray-500">
                {user.email}
              </p>

              <span className="mt-2 inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                {user.role}
              </span>
            </div>
          </div>
        </div>

        <div className="divide-y">
          <ProfileRow
            label="Full name"
            value={user.name}
          />

          <ProfileRow
            label="Email address"
            value={user.email}
          />

          <ProfileRow
            label="Account ID"
            value={user.id}
          />

          <ProfileRow
            label="Role"
            value={user.role}
          />
        </div>
      </section>

      {/* Account Actions */}
      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-gray-900">
          Account
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Manage your administrator account settings.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/admin/settings"
            className="rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
          >
            Account Settings
          </Link>

          <Link
            href="/admin"
            className="rounded-lg border bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Back to Dashboard
          </Link>
        </div>
      </section>
    </div>
  );
}

function ProfileRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm font-medium text-gray-500">
        {label}
      </span>

      <span className="break-all text-sm text-gray-900 sm:text-right">
        {value}
      </span>
    </div>
  );
}
