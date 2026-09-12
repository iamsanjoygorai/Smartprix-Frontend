"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { deleteUserAccount } from "@/features/profile/api/profile.api";

/* =========================================================
COMPONENT
========================================================= */

export default function DangerZone() {
const router = useRouter();

const [showDeleteDialog, setShowDeleteDialog] =
useState(false);

const [deletePassword, setDeletePassword] =
useState("");

const [showPassword, setShowPassword] =
useState(false);

const [deleteLoading, setDeleteLoading] =
useState(false);

const [deleteMessage, setDeleteMessage] =
useState("");

/* =======================================================
OPEN DELETE DIALOG
======================================================= */

const openDeleteDialog = () => {
setDeletePassword("");
setDeleteMessage("");
setShowDeleteDialog(true);
};

/* =======================================================
CLOSE DELETE DIALOG
======================================================= */

const closeDeleteDialog = () => {
if (deleteLoading) {
return;
}

   
setShowDeleteDialog(false);
setDeletePassword("");
setDeleteMessage("");
setShowPassword(false);
   

};

/* =======================================================
DELETE ACCOUNT
======================================================= */

const handleDeleteAccount = async () => {
setDeleteMessage("");

   
/*
 * The current backend does not validate the password
 * supplied here. Therefore this field is currently a
 * confirmation UX only, not a security check.
 */

if (!deletePassword.trim()) {
  setDeleteMessage(
    "Please enter your password to confirm account deletion.",
  );
  return;
}

setDeleteLoading(true);

try {
  await deleteUserAccount();

  /* ---------------------------------------------------
     Clear local authentication/session data
  --------------------------------------------------- */

  localStorage.removeItem(
    "smartprix_token",
  );

  localStorage.removeItem(
    "smartprix_user",
  );

  /* ---------------------------------------------------
     Clear local preferences
  --------------------------------------------------- */

  localStorage.removeItem(
    "smartprix_notification_preferences",
  );

  localStorage.removeItem(
    "smartprix_email_preferences",
  );

  localStorage.removeItem(
    "smartprix_privacy_preferences",
  );

  /* ---------------------------------------------------
     Notify the application that auth changed
  --------------------------------------------------- */

  window.dispatchEvent(
    new Event("smartprix-auth-changed"),
  );

  /* ---------------------------------------------------
     Redirect to home
  --------------------------------------------------- */

  router.replace("/");

  router.refresh();
} catch (error: any) {
  console.error(
    "Delete account error:",
    error,
  );

  setDeleteMessage(
    error?.message ||
      "Failed to delete your account. Please try again.",
  );
} finally {
  setDeleteLoading(false);
}
   

};

/* =======================================================
UI
========================================================= */

return (
<> <section
     id="danger-zone"
     className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm"
   >
{/* Header */} <div className="mb-6"> <div className="flex items-start gap-4"> <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600"> <WarningIcon /> </div>

   
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Danger zone
          </h2>

          <p className="mt-1 text-sm leading-6 text-gray-500">
            These actions can have a permanent
            impact on your Smartprix account.
          </p>
        </div>
      </div>
    </div>

    {/* Delete account */}
    <div className="rounded-xl border border-red-200 bg-red-50 p-5">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h3 className="font-semibold text-red-900">
            Delete account
          </h3>

          <p className="mt-1 max-w-2xl text-sm leading-6 text-red-700">
            Permanently delete your account and
            disable access to your Smartprix
            account. Your historical records may
            be retained according to Smartprix's
            data retention policy.
          </p>
        </div>

        <button
          type="button"
          onClick={openDeleteDialog}
          className="shrink-0 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Delete account
        </button>
      </div>
    </div>
  </section>

  {/* ===================================================
      DELETE ACCOUNT MODAL
  =================================================== */}

  {showDeleteDialog && (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-account-title"
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Modal header */}
        <div className="border-b border-gray-100 px-6 py-5">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
              <WarningIcon />
            </div>

            <div>
              <h2
                id="delete-account-title"
                className="text-lg font-bold text-gray-900"
              >
                Delete your account?
              </h2>

              <p className="mt-1 text-sm leading-6 text-gray-500">
                This action cannot be undone.
              </p>
            </div>
          </div>
        </div>

        {/* Modal body */}
        <div className="px-6 py-5">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex gap-3">
              <InfoIcon />

              <p className="text-sm leading-6 text-red-800">
                Your account will be marked as
                deleted and access will be
                disabled. Historical records may
                be retained.
              </p>
            </div>
          </div>

          {/* Password confirmation */}
          <div className="mt-5">
            <label
              htmlFor="delete-password"
              className="mb-2 block text-sm font-semibold text-gray-900"
            >
              Confirm with your password
            </label>

            <div className="relative">
              <input
                id="delete-password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={deletePassword}
                onChange={(event) =>
                  setDeletePassword(
                    event.target.value,
                  )
                }
                disabled={deleteLoading}
                placeholder="Enter your password"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pr-12 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 disabled:bg-gray-100"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (current) => !current,
                  )
                }
                disabled={deleteLoading}
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {showPassword ? (
                  <EyeOffIcon />
                ) : (
                  <EyeIcon />
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {deleteMessage && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm font-medium text-red-700">
                {deleteMessage}
              </p>
            </div>
          )}
        </div>

        {/* Modal footer */}
        <div className="flex flex-col-reverse gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={closeDeleteDialog}
            disabled={deleteLoading}
            className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleDeleteAccount}
            disabled={
              deleteLoading ||
              !deletePassword.trim()
            }
            className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deleteLoading ? (
              <span className="flex items-center justify-center gap-2">
                <LoadingIcon />
                Deleting...
              </span>
            ) : (
              "Delete account"
            )}
          </button>
        </div>
      </div>
    </div>
  )}
</>
   

);
}

/* =========================================================
WARNING ICON
========================================================= */

function WarningIcon() {
return ( <svg
   width="22"
   height="22"
   viewBox="0 0 24 24"
   fill="none"
   stroke="currentColor"
   strokeWidth="2"
   strokeLinecap="round"
   strokeLinejoin="round"
   aria-hidden="true"
 > <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" /> <line x1="12" x2="12" y1="9" y2="13" /> <line x1="12" x2="12.01" y1="17" y2="17" /> </svg>
);
}

/* =========================================================
INFO ICON
========================================================= */

function InfoIcon() {
return ( <svg
   width="20"
   height="20"
   viewBox="0 0 24 24"
   fill="none"
   stroke="currentColor"
   strokeWidth="2"
   strokeLinecap="round"
   strokeLinejoin="round"
   className="mt-0.5 shrink-0 text-red-600"
   aria-hidden="true"
 > <circle
     cx="12"
     cy="12"
     r="10"
   />

   
  <path d="M12 16v-4" />

  <path d="M12 8h.01" />
</svg>
   

);
}

/* =========================================================
EYE ICON
========================================================= */

function EyeIcon() {
return ( <svg
   width="19"
   height="19"
   viewBox="0 0 24 24"
   fill="none"
   stroke="currentColor"
   strokeWidth="2"
   strokeLinecap="round"
   strokeLinejoin="round"
   aria-hidden="true"
 > <path d="M2.06 12.35a1 1 0 0 1 0-.7C3.7 7.77 7.5 5 12 5s8.3 2.77 9.94 6.65a1 1 0 0 1 0 .7C20.3 16.23 16.5 19 12 19s-8.3-2.77-9.94-6.65Z" /> <circle
     cx="12"
     cy="12"
     r="3"
   /> </svg>
);
}

/* =========================================================
EYE OFF ICON
========================================================= */

function EyeOffIcon() {
return ( <svg
   width="19"
   height="19"
   viewBox="0 0 24 24"
   fill="none"
   stroke="currentColor"
   strokeWidth="2"
   strokeLinecap="round"
   strokeLinejoin="round"
   aria-hidden="true"
 > <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /> <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c4.5 0 8.3 2.77 9.94 6.65a1 1 0 0 1 0 .7 10.7 10.7 0 0 1-2.02 3.18" /> <path d="M6.61 6.61A10.7 10.7 0 0 0 2.06 11.65a1 1 0 0 0 0 .7C3.7 16.23 7.5 19 12 19a10.43 10.43 0 0 0 3.39-.56" /> <line
     x1="2"
     x2="22"
     y1="2"
     y2="22"
   /> </svg>
);
}

/* =========================================================
LOADING ICON
========================================================= */

function LoadingIcon() {
return ( <svg
   className="h-4 w-4 animate-spin"
   viewBox="0 0 24 24"
   fill="none"
   aria-hidden="true"
 > <circle
     cx="12"
     cy="12"
     r="9"
     stroke="currentColor"
     strokeWidth="3"
     opacity="0.25"
   />

   
  <path
    d="M21 12a9 9 0 0 0-9-9"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
  />
</svg>
   

);
}
