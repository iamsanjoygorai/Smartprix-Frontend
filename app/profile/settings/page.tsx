"use client";

import Link from "next/link";
import { useState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { changeUserPassword, deleteUserAccount } from "@/lib/api/user";

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

  const [showSignOutDialog, setShowSignOutDialog] =
  useState(false);
  const [showDeleteDialog, setShowDeleteDialog] =
  useState(false);

const [deletePassword, setDeletePassword] =
  useState("");

const [showDeletePassword, setShowDeletePassword] =
  useState(false);

const [deleteLoading, setDeleteLoading] =
  useState(false);

const [deleteMessage, setDeleteMessage] =
  useState("");

  const [deviceInfo, setDeviceInfo] = useState({
  browser: "Browser",
  platform: "Device",
});

  const [privacyLoaded, setPrivacyLoaded] =
  useState(false);

const [publicProfile, setPublicProfile] =
  useState(true);

const [publicReviews, setPublicReviews] =
  useState(true);

const [personalizedRecommendations, setPersonalizedRecommendations] =
  useState(true);

const [activityVisibility, setActivityVisibility] =
  useState(true);

  const [emailPreferencesLoaded, setEmailPreferencesLoaded] =
  useState(false);

const [productRecommendationEmails, setProductRecommendationEmails] =
  useState(true);

const [priceDropEmails, setPriceDropEmails] =
  useState(true);

const [weeklyDigestEmails, setWeeklyDigestEmails] =
  useState(false);

  const [showChangePassword, setShowChangePassword] =
  useState(false);

const [currentPassword, setCurrentPassword] =
  useState("");

const [newPassword, setNewPassword] =
  useState("");

const [confirmPassword, setConfirmPassword] =
  useState("");

const [passwordLoading, setPasswordLoading] =
  useState(false);
const [passwordMessage, setPasswordMessage] =
  useState("");
  const [notificationsLoaded, setNotificationsLoaded] =
  useState(false);
const [priceAlerts, setPriceAlerts] = useState(true);
const [productUpdates, setProductUpdates] = useState(true);
const [newsOffers, setNewsOffers] = useState(false);
const [productEmails, setProductEmails] = useState(true);
const [promotionalEmails, setPromotionalEmails] =
  useState(false);

  const router = useRouter();
  const [notifications, setNotifications] = useState({
  priceAlerts: true,
  productUpdates: true,
  newsOffers: false,
  productEmails: true,
  promotionalEmails: false,
});

const {
  data: user,
  isLoading,
} = useCurrentUser();

useEffect(() => {
  if (!isLoading && !user) {
    router.replace("/profile");
  }
}, [user, isLoading, router]);


useEffect(() => {
  const savedNotifications = localStorage.getItem(
    "smartprix_notification_preferences",
  );

  if (savedNotifications) {
    try {
      const parsed = JSON.parse(savedNotifications);

      if (typeof parsed.priceAlerts === "boolean") {
        setPriceAlerts(parsed.priceAlerts);
      }

      if (typeof parsed.productUpdates === "boolean") {
        setProductUpdates(parsed.productUpdates);
      }

      if (typeof parsed.newsOffers === "boolean") {
        setNewsOffers(parsed.newsOffers);
      }

      if (typeof parsed.productEmails === "boolean") {
        setProductEmails(parsed.productEmails);
      }

      if (
        typeof parsed.promotionalEmails === "boolean"
      ) {
        setPromotionalEmails(
          parsed.promotionalEmails,
        );
      }
    } catch {
      // Ignore invalid saved preferences.
    }
  }

  setNotificationsLoaded(true);
}, []);

useEffect(() => {
  if (!notificationsLoaded) return;

  localStorage.setItem(
    "smartprix_notification_preferences",
    JSON.stringify({
      priceAlerts,
      productUpdates,
      newsOffers,
      productEmails,
      promotionalEmails,
    }),
  );
}, [
  notificationsLoaded,
  priceAlerts,
  productUpdates,
  newsOffers,
  productEmails,
  promotionalEmails,
]);

useEffect(() => {
  const savedPreferences = localStorage.getItem(
    "smartprix_email_preferences",
  );

  if (savedPreferences) {
    try {
      const parsed = JSON.parse(savedPreferences);

      if (
        typeof parsed.productRecommendationEmails ===
        "boolean"
      ) {
        setProductRecommendationEmails(
          parsed.productRecommendationEmails,
        );
      }

      if (typeof parsed.priceDropEmails === "boolean") {
        setPriceDropEmails(parsed.priceDropEmails);
      }

      if (
        typeof parsed.weeklyDigestEmails === "boolean"
      ) {
        setWeeklyDigestEmails(
          parsed.weeklyDigestEmails,
        );
      }
    } catch {
      // Ignore invalid saved preferences.
    }
  }

  setEmailPreferencesLoaded(true);
}, []);

useEffect(() => {
  if (!emailPreferencesLoaded) return;

  localStorage.setItem(
    "smartprix_email_preferences",
    JSON.stringify({
      productRecommendationEmails,
      priceDropEmails,
      weeklyDigestEmails,
    }),
  );
}, [
  emailPreferencesLoaded,
  productRecommendationEmails,
  priceDropEmails,
  weeklyDigestEmails,
]);

useEffect(() => {
  const savedPrivacy = localStorage.getItem(
    "smartprix_privacy_preferences",
  );

  if (savedPrivacy) {
    try {
      const parsed = JSON.parse(savedPrivacy);

      if (typeof parsed.publicProfile === "boolean") {
        setPublicProfile(parsed.publicProfile);
      }

      if (typeof parsed.publicReviews === "boolean") {
        setPublicReviews(parsed.publicReviews);
      }

      if (
        typeof parsed.personalizedRecommendations ===
        "boolean"
      ) {
        setPersonalizedRecommendations(
          parsed.personalizedRecommendations,
        );
      }

      if (
        typeof parsed.activityVisibility === "boolean"
      ) {
        setActivityVisibility(
          parsed.activityVisibility,
        );
      }
    } catch {
      // Ignore invalid saved preferences.
    }
  }

  setPrivacyLoaded(true);
}, []);

useEffect(() => {
  if (!privacyLoaded) return;

  localStorage.setItem(
    "smartprix_privacy_preferences",
    JSON.stringify({
      publicProfile,
      publicReviews,
      personalizedRecommendations,
      activityVisibility,
    }),
  );
}, [
  privacyLoaded,
  publicProfile,
  publicReviews,
  personalizedRecommendations,
  activityVisibility,
]);

useEffect(() => {
  if (typeof window === "undefined") return;

  const userAgent = navigator.userAgent;

  let browser = "Browser";

  if (userAgent.includes("Edg/")) {
    browser = "Microsoft Edge";
  } else if (userAgent.includes("Chrome/")) {
    browser = "Google Chrome";
  } else if (userAgent.includes("Firefox/")) {
    browser = "Mozilla Firefox";
  } else if (userAgent.includes("Safari/")) {
    browser = "Safari";
  }

  let platform = "Device";

  if (/Windows/i.test(userAgent)) {
    platform = "Windows";
  } else if (/Macintosh|Mac OS/i.test(userAgent)) {
    platform = "macOS";
  } else if (/Android/i.test(userAgent)) {
    platform = "Android";
  } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
    platform = "iOS";
  } else if (/Linux/i.test(userAgent)) {
    platform = "Linux";
  }

  setDeviceInfo({
    browser,
    platform,
  });
}, []);


if (isLoading) {
  return null;
}

if (!user) {
  return null;
}


const handleSignOutCurrentDevice = () => {
  setShowSignOutDialog(true);
};

const confirmSignOut = () => {
  localStorage.removeItem("smartprix_token");
  localStorage.removeItem("smartprix_user");

  window.dispatchEvent(
    new Event("smartprix-auth-changed"),
  );

  router.replace("/");
};

const handleDeleteAccount = () => {
  setDeletePassword("");
  setDeleteMessage("");
  setShowDeletePassword(false);
  setShowDeleteDialog(true);
};

const confirmDeleteAccount = async () => {
  setDeleteMessage("");

  if (!deletePassword.trim()) {
    setDeleteMessage(
      "Please enter your current password.",
    );
    return;
  }

  try {
    setDeleteLoading(true);

    const response = await deleteUserAccount(
      deletePassword,
    );

    if (!response.success) {
      setDeleteMessage(
        response.message ??
          "Unable to delete your account.",
      );
      return;
    }

    /* -----------------------------------------------
       ACCOUNT SUCCESSFULLY DELETED
    ------------------------------------------------ */

    localStorage.removeItem(
      "smartprix_token",
    );

    localStorage.removeItem(
      "smartprix_user",
    );

    localStorage.removeItem(
      "smartprix_notification_preferences",
    );

    localStorage.removeItem(
      "smartprix_email_preferences",
    );

    localStorage.removeItem(
      "smartprix_privacy_preferences",
    );

    window.dispatchEvent(
      new Event("smartprix-auth-changed"),
    );

    router.replace("/");
  } catch {
    setDeleteMessage(
      "Something went wrong. Please try again.",
    );
  } finally {
    setDeleteLoading(false);
  }
};

const toggleNotification = (
  key: keyof typeof notifications,
) => {
  setNotifications((current) => ({
    ...current,
    [key]: !current[key],
  }));
};

const handleChangePassword = async (
  e: React.FormEvent,
) => {
  e.preventDefault();

  setPasswordMessage("");

  if (
    !currentPassword ||
    !newPassword ||
    !confirmPassword
  ) {
    setPasswordMessage(
      "Please fill in all password fields.",
    );
    return;
  }

  if (newPassword.length < 6) {
    setPasswordMessage(
      "New password must be at least 6 characters.",
    );
    return;
  }

  if (newPassword !== confirmPassword) {
    setPasswordMessage(
      "New password and confirmation do not match.",
    );
    return;
  }

  try {
    setPasswordLoading(true);

    const response = await changeUserPassword({
      currentPassword,
      newPassword,
      confirmPassword,
    });

    if (!response.success) {
      setPasswordMessage(
        response.message ||
          "Unable to change password.",
      );
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    setPasswordMessage(
      "Password changed successfully.",
    );
  } catch {
    setPasswordMessage(
      "Something went wrong. Please try again.",
    );
  } finally {
    setPasswordLoading(false);
  }
};


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

                  <button
  type="button"
  onClick={() => {
    setShowChangePassword(
      (value) => !value,
    );
    setPasswordMessage("");
  }}
  className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-[#1877f2] px-5 text-xs font-extrabold text-white shadow-[0_4px_14px_rgba(24,119,242,0.18)] transition hover:bg-[#166fe5]"
>
  {showChangePassword
    ? "Cancel"
    : "Change password"}
</button>
                </div>

                {showChangePassword && (
  <form
    onSubmit={handleChangePassword}
    className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/50 p-5"
  >
    <div className="mb-5">
      <h3 className="text-sm font-extrabold text-gray-900">
        Change your password
      </h3>

      <p className="mt-1 text-xs text-gray-500">
        Enter your current password and choose a
        new password for your Smartprix account.
      </p>
    </div>

    <div className="grid gap-4">

      {/* Current password */}

      <div>
        <label className="mb-2 block text-xs font-extrabold text-gray-700">
          Current password
        </label>

        <input
          type="password"
          value={currentPassword}
          onChange={(e) =>
            setCurrentPassword(e.target.value)
          }
          placeholder="Enter current password"
          autoComplete="current-password"
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#1877f2] focus:ring-4 focus:ring-blue-100"
        />
      </div>

      {/* New password */}

      <div>
        <label className="mb-2 block text-xs font-extrabold text-gray-700">
          New password
        </label>

        <input
          type="password"
          value={newPassword}
          onChange={(e) =>
            setNewPassword(e.target.value)
          }
          placeholder="Enter new password"
          autoComplete="new-password"
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#1877f2] focus:ring-4 focus:ring-blue-100"
        />
      </div>

      {/* Confirm password */}

      <div>
        <label className="mb-2 block text-xs font-extrabold text-gray-700">
          Confirm new password
        </label>

        <input
          type="password"
          value={confirmPassword}
          onChange={(e) =>
            setConfirmPassword(e.target.value)
          }
          placeholder="Confirm new password"
          autoComplete="new-password"
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#1877f2] focus:ring-4 focus:ring-blue-100"
        />
      </div>

    </div>

    {passwordMessage && (
      <div
        className={`mt-4 rounded-xl border px-4 py-3 text-xs font-semibold ${
          passwordMessage.includes(
            "successfully",
          )
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-red-200 bg-red-50 text-red-600"
        }`}
      >
        {passwordMessage}
      </div>
    )}

    <div className="mt-5 flex justify-end">
      <button
        type="submit"
        disabled={passwordLoading}
        className="inline-flex h-10 items-center justify-center rounded-full bg-[#1877f2] px-6 text-xs font-extrabold text-white shadow-[0_4px_14px_rgba(24,119,242,0.18)] transition hover:bg-[#166fe5] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {passwordLoading
          ? "Updating..."
          : "Update password"}
      </button>
    </div>
  </form>
)}

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
  title="Product recommendations"
  description="Receive personalized product recommendations based on your interests."
  enabled={productRecommendationEmails}
  onChange={() =>
    setProductRecommendationEmails(
      !productRecommendationEmails,
    )
  }
/>

<SettingToggle
  title="Price-drop emails"
  description="Get an email when a product you're interested in drops in price."
  enabled={priceDropEmails}
  onChange={() =>
    setPriceDropEmails(!priceDropEmails)
  }
/>

<SettingToggle
  title="Weekly Smartprix digest"
  description="Receive a weekly summary of useful products, deals and Smartprix updates."
  enabled={weeklyDigestEmails}
  onChange={() =>
    setWeeklyDigestEmails(
      !weeklyDigestEmails,
    )
  }
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

              <SettingToggle
  title="Product emails"
  description="Receive useful emails about products, comparisons and price changes."
  enabled={productEmails}
  onChange={() =>
    setProductEmails(!productEmails)
  }
/>

<SettingToggle
  title="Promotional emails"
  description="Receive occasional Smartprix promotions, deals and special offers."
  enabled={promotionalEmails}
  onChange={() =>
    setPromotionalEmails(!promotionalEmails)
  }
/>
            </section>

            {/* =================================================
                PRIVACY
            ================================================= */}
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

  <div className="mt-5 overflow-hidden rounded-2xl border border-gray-200 bg-white">
    <SettingToggle
      title="Public profile"
      description="Allow other Smartprix users to view your public profile."
      enabled={publicProfile}
      onChange={() =>
        setPublicProfile(!publicProfile)
      }
    />

    <SettingToggle
      title="Show reviews publicly"
      description="Allow your product reviews to be visible to other users."
      enabled={publicReviews}
      onChange={() =>
        setPublicReviews(!publicReviews)
      }
    />

    <SettingToggle
      title="Personalized recommendations"
      description="Use your activity to improve product recommendations."
      enabled={personalizedRecommendations}
      onChange={() =>
        setPersonalizedRecommendations(
          !personalizedRecommendations,
        )
      }
    />

    <SettingToggle
      title="Activity visibility"
      description="Allow your comparisons and favorites to appear in relevant Smartprix activity."
      enabled={activityVisibility}
      onChange={() =>
        setActivityVisibility(
          !activityVisibility,
        )
      }
    />
  </div>
</div>

            {/* =================================================
                SESSIONS
            ================================================= */}
<div className="p-6 sm:p-7">
  <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
    <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
        <svg
          width="21"
          height="21"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect
            x="3"
            y="4"
            width="18"
            height="14"
            rx="2"
          />
          <path d="M8 21h8" />
          <path d="M12 18v3" />
        </svg>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-extrabold text-gray-900">
            This device
          </p>

          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-emerald-600">
            Active
          </span>
        </div>

        <p className="mt-1 text-xs text-gray-500">
          {deviceInfo.browser} on {deviceInfo.platform}
        </p>

        <p className="mt-1 text-[11px] text-gray-400">
          This is the device currently being used to
          access your Smartprix account.
        </p>
      </div>

      <button
        type="button"
        onClick={handleSignOutCurrentDevice}
        className="inline-flex h-9 shrink-0 items-center justify-center rounded-full border border-red-200 bg-red-50 px-4 text-xs font-extrabold text-red-600 transition hover:border-red-300 hover:bg-red-100"
      >
        Sign out
      </button>
    </div>

    <div className="border-t border-gray-100 bg-gray-50 px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-gray-500 shadow-sm">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 3v18" />
            <path d="M3 12h18" />
          </svg>
        </div>

        <div>
          <p className="text-xs font-extrabold text-gray-700">
            Session security
          </p>

          <p className="mt-0.5 text-[11px] leading-5 text-gray-400">
            You're currently signed in on this device.
          </p>
        </div>
      </div>
    </div>
  </div>

  <p className="mt-4 text-[11px] leading-5 text-gray-400">
    Other device and session management will become
    available when multi-session tracking is enabled.
  </p>
</div>

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
  onClick={handleDeleteAccount}
  className="inline-flex h-10 shrink-0 items-center justify-center rounded-full border border-red-200 bg-white px-5 text-xs font-extrabold text-red-600 transition hover:border-red-300 hover:bg-red-50"
>
  Delete account
</button>
                </div>

                <div className="mt-4 rounded-xl border border-red-100 bg-red-50/60 px-4 py-3">
  <p className="text-[11px] font-bold text-red-700">
    Permanent deletion
  </p>

  <p className="mt-1 text-[11px] leading-5 text-red-600/80">
    Your account, profile information, favorites,
    comparisons, reviews and price alerts will be
    permanently removed. This action cannot be undone.
  </p>
</div>
              </div>
            </section>

          </div>
        </div>
      </div>
      {showDeleteDialog && (
  <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4">
    {/* Backdrop */}
    <div
      className="absolute inset-0 bg-black/55 backdrop-blur-sm"
      onClick={() => {
        if (!deleteLoading) {
          setShowDeleteDialog(false);
        }
      }}
    />

    {/* Dialog */}
    <div className="relative w-full max-w-md overflow-hidden rounded-[26px] border border-red-100 bg-white shadow-[0_30px_100px_rgba(0,0,0,0.25)]">
      {/* Header */}
      <div className="border-b border-red-100 bg-gradient-to-br from-red-50 to-white p-6 sm:p-7">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-600">
            <svg
              width="23"
              height="23"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18" />
              <path d="M8 6V4h8v2" />
              <path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v5" />
              <path d="M14 11v5" />
            </svg>
          </div>

          <div className="min-w-0">
            <h3 className="text-lg font-extrabold text-gray-900">
              Delete your account?
            </h3>

            <p className="mt-1 text-xs leading-5 text-gray-500">
              This action is permanent and cannot be undone.
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 sm:p-7">
        <div className="rounded-2xl border border-red-100 bg-red-50/70 p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-red-500 shadow-sm">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
                <path d="m10.3 3.5-8 14A2 2 0 0 0 4 20.5h16a2 2 0 0 0 1.7-3l-8-14a2 2 0 0 0-3.4 0Z" />
              </svg>
            </div>

            <div>
              <p className="text-xs font-extrabold text-red-800">
                Everything will be removed
              </p>

              <p className="mt-1 text-[11px] leading-5 text-red-700/80">
                Your profile, favorites, comparisons,
                reviews and price alerts will be permanently
                deleted.
              </p>
            </div>
          </div>
        </div>

        {/* Password */}
        <div className="mt-5">
          <label className="mb-2 block text-xs font-extrabold text-gray-700">
            Confirm with your current password
          </label>

          <div className="relative">
            <input
              type={
                showDeletePassword
                  ? "text"
                  : "password"
              }
              value={deletePassword}
              onChange={(e) =>
                setDeletePassword(
                  e.target.value,
                )
              }
              placeholder="Enter your current password"
              autoComplete="current-password"
              disabled={deleteLoading}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 pr-12 text-sm outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100 disabled:bg-gray-50"
            />

            <button
              type="button"
              onClick={() =>
                setShowDeletePassword(
                  (value) => !value,
                )
              }
              disabled={deleteLoading}
              aria-label={
                showDeletePassword
                  ? "Hide password"
                  : "Show password"
              }
              className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
            >
              {showDeletePassword ? (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              ) : (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="m3 3 18 18" />
                  <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                  <path d="M9.9 4.2A10.7 10.7 0 0 1 12 4c6.5 0 10 8 10 8a18.5 18.5 0 0 1-3.1 4.4" />
                  <path d="M6.6 6.6C3.7 8.6 2 12 2 12s3.5 8 10 8c1.4 0 2.7-.3 3.9-.8" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Error */}
        {deleteMessage && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-600">
            {deleteMessage}
          </div>
        )}

        {/* Buttons */}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={deleteLoading}
            onClick={() => {
              setShowDeleteDialog(false);
              setDeleteMessage("");
              setDeletePassword("");
            }}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-gray-200 bg-white px-5 text-sm font-extrabold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={deleteLoading}
            onClick={confirmDeleteAccount}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-red-600 px-5 text-sm font-extrabold text-white shadow-[0_6px_20px_rgba(220,38,38,0.22)] transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleteLoading
              ? "Deleting account..."
              : "Permanently delete"}
          </button>
        </div>
      </div>
    </div>
  </div>
)}
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
