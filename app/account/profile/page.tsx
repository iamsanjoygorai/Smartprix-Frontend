"use client";

import Link from "next/link";
import {
FormEvent,
useEffect,
useMemo,
useState,
} from "react";
import { useRouter } from "next/navigation";

import {
getUserProfile,
updateUserProfile,
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
{children} </span>
);
}

/* =========================================================
HELPERS
========================================================= */

function getInitials(
name: string | null,
email: string | null,
) {
const source =
name?.trim() ||
email?.split("@")[0] ||
"User";

const parts = source
.split(/\s+/)
.filter(Boolean);

if (parts.length >= 2) {
return (
parts[0][0] +
parts[parts.length - 1][0]
).toUpperCase();
}

return source
.slice(0, 2)
.toUpperCase();
}

/* =========================================================
PAGE
========================================================= */

export default function EditProfilePage() {
const router = useRouter();

const [user, setUser] =
useState<UserProfile | null>(null);

const [loading, setLoading] =
useState(true);

const [saving, setSaving] =
useState(false);

const [error, setError] =
useState("");

const [success, setSuccess] =
useState("");

/* =======================================================
FORM
======================================================= */

const [name, setName] =
useState("");

const [mobile, setMobile] =
useState("");

const [dateOfBirth, setDateOfBirth] =
useState("");

const [gender, setGender] =
useState("");

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

  try {
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

    if (!result.data) {
      setError(
        "Unable to load your profile.",
      );
      setLoading(false);
      return;
    }

    const profile =
      result.data;

    setUser(profile);

    setName(
      profile.name ?? "",
    );

    setMobile(
      profile.mobile ?? "",
    );

    /*
     * Convert ISO database date into
     * YYYY-MM-DD for the date input.
     */
    if (profile.dateOfBirth) {
      const date =
        new Date(
          profile.dateOfBirth,
        );

      if (
        !Number.isNaN(
          date.getTime(),
        )
      ) {
        setDateOfBirth(
          date
            .toISOString()
            .split("T")[0],
        );
      }
    }

    setGender(
      profile.gender ?? "",
    );
  } catch (err) {
    console.error(
      "Profile loading failed:",
      err,
    );

    if (!cancelled) {
      setError(
        "Unable to load your profile.",
      );
    }
  } finally {
    if (!cancelled) {
      setLoading(false);
    }
  }
}

loadProfile();

return () => {
  cancelled = true;
};
 

}, [router]);

/* =======================================================
INITIALS
======================================================= */

const initials = useMemo(
() =>
getInitials(
user?.name ?? null,
user?.email ?? null,
),
[user],
);

/* =======================================================
SAVE
======================================================= */

async function handleSubmit(
event: FormEvent<HTMLFormElement>,
) {
event.preventDefault();

 
setError("");
setSuccess("");

const cleanName =
  name.trim();

const cleanMobile =
  mobile.trim();

if (!cleanName) {
  setError(
    "Please enter your full name.",
  );
  return;
}

if (
  cleanMobile &&
  !/^[0-9]{10}$/.test(
    cleanMobile,
  )
) {
  setError(
    "Please enter a valid 10-digit mobile number.",
  );
  return;
}

setSaving(true);

try {
  const result =
    await updateUserProfile({
      name: cleanName,
      email:
        user?.email ?? "",
      mobile: cleanMobile,
      dateOfBirth,
      gender,
    });

  if (!result.success) {
    setError(
      result.message ??
        "Failed to update profile.",
    );
    return;
  }

  if (result.data) {
    setUser(
      (previous) => ({
        ...previous,
        ...result.data,
      }),
    );
  }

  setSuccess(
    result.message ??
      "Profile updated successfully.",
  );

  /*
   * Refresh profile data so that
   * /profile immediately reflects
   * the latest database values.
   */
  window.dispatchEvent(
    new Event(
      "smartprix-auth-changed",
    ),
  );
} catch (err) {
  console.error(
    "Profile update failed:",
    err,
  );

  setError(
    "Unable to update your profile.",
  );
} finally {
  setSaving(false);
}
 

}

/* =======================================================
LOADING
======================================================= */

if (loading) {
return ( <main className="min-h-[calc(100vh-140px)] bg-[#f1f3f6] px-4 py-8 sm:px-6"> <div className="mx-auto max-w-[900px]"> <div className="animate-pulse rounded-[24px] bg-white p-8 shadow-sm"> <div className="h-8 w-48 rounded-lg bg-gray-200" />

 
        <div className="mt-3 h-4 w-72 rounded bg-gray-100" />

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {Array.from({
            length: 4,
          }).map((_, index) => (
            <div
              key={index}
              className="h-14 rounded-xl bg-gray-100"
            />
          ))}
        </div>
      </div>
    </div>
  </main>
);
 

}

/* =======================================================
ERROR
======================================================= */

if (!user) {
return ( <main className="flex min-h-[calc(100vh-140px)] items-center justify-center bg-[#f1f3f6] px-4"> <div className="w-full max-w-md rounded-[24px] border border-gray-200 bg-white p-8 text-center shadow-sm"> <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500"> <Icon> <svg
             width="25"
             height="25"
             viewBox="0 0 24 24"
             fill="none"
             stroke="currentColor"
             strokeWidth="2"
           > <circle
               cx="12"
               cy="12"
               r="9"
             /> <path d="M12 8v4" /> <path d="M12 16h.01" /> </svg> </Icon> </div>

 
      <h1 className="mt-4 text-xl font-extrabold text-gray-900">
        Profile unavailable
      </h1>

      <p className="mt-2 text-sm text-gray-500">
        {error ||
          "Unable to load your profile."}
      </p>

      <Link
        href="/profile"
        className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-[#1877f2] px-6 text-sm font-bold text-white transition hover:bg-[#166fe5]"
      >
        Back to profile
      </Link>
    </div>
  </main>
);
 

}

/* =======================================================
MAIN
======================================================= */

return ( <main className="min-h-[calc(100vh-140px)] bg-[#f1f3f6] px-4 py-7 sm:px-6 sm:py-9"> <div className="mx-auto max-w-[900px]">

 
    {/* BACK */}

    <Link
      href="/profile"
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

    <div className="mb-6">
      <p className="text-sm font-bold text-[#1877f2]">
        Smartprix Account
      </p>

      <h1 className="mt-1 text-[30px] font-extrabold tracking-[-0.7px] text-[#1c1e21] sm:text-[36px]">
        Edit profile
      </h1>

      <p className="mt-1 text-sm text-gray-500">
        Keep your personal information up to date.
      </p>
    </div>

    {/* CARD */}

    <section className="overflow-hidden rounded-[24px] border border-gray-200 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.05)]">

      {/* PROFILE HEADER */}

      <div className="relative overflow-hidden bg-gradient-to-br from-[#1877f2] via-[#356ee8] to-[#6c5ce7] px-6 py-8 sm:px-8">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/10" />

        <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-white/10" />

        <div className="relative flex items-center gap-5">
          <div className="flex h-[78px] w-[78px] shrink-0 items-center justify-center rounded-full border-4 border-white/30 bg-white text-xl font-extrabold text-[#1877f2] shadow-lg">
            {initials}
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-xl font-extrabold text-white">
              {user.name ||
                "Smartprix User"}
            </h2>

            <p className="mt-1 truncate text-sm text-white/75">
              {user.email}
            </p>

            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
              Active member
            </span>
          </div>
        </div>
      </div>

      {/* FORM */}

      <form
        onSubmit={handleSubmit}
        className="p-6 sm:p-8"
      >

        {/* SUCCESS */}

        {success && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white">
              ✓
            </span>

            {success}
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white">
              !
            </span>

            {error}
          </div>
        )}

        <div className="mb-7">
          <h3 className="text-lg font-extrabold text-gray-900">
            Personal information
          </h3>

          <p className="mt-1 text-xs text-gray-500">
            Update the information associated with your account.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">

          {/* NAME */}

          <div>
            <label className="mb-2 block text-sm font-bold text-gray-700">
              Full name
            </label>

            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(event) =>
                  setName(
                    event.target.value,
                  )
                }
                placeholder="Enter your full name"
                maxLength={100}
                className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 pr-11 text-sm font-medium text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#1877f2] focus:ring-4 focus:ring-[#1877f2]/10"
              />

              <Icon className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
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
          </div>

          {/* EMAIL */}

          <div>
            <label className="mb-2 block text-sm font-bold text-gray-700">
              Email address
            </label>

            <div className="relative">
              <input
                type="email"
                value={
                  user.email ?? ""
                }
                disabled
                className="h-12 w-full rounded-xl border border-gray-200 bg-gray-100 px-4 pr-24 text-sm font-medium text-gray-500 outline-none"
              />

              <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-emerald-600">
                Verified
              </span>
            </div>

            <p className="mt-1.5 text-[11px] text-gray-400">
              Email address cannot be changed here.
            </p>
          </div>

          {/* MOBILE */}

          <div>
            <label className="mb-2 block text-sm font-bold text-gray-700">
              Mobile number
            </label>

            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={mobile}
                onChange={(event) =>
                  setMobile(
                    event.target.value
                      .replace(
                        /\D/g,
                        "",
                      )
                      .slice(
                        0,
                        10,
                      ),
                  )
                }
                placeholder="10-digit mobile number"
                className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 pr-11 text-sm font-medium text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#1877f2] focus:ring-4 focus:ring-[#1877f2]/10"
              />

              <Icon className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
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
          </div>

          {/* DATE OF BIRTH */}

          <div>
            <label className="mb-2 block text-sm font-bold text-gray-700">
              Date of birth
            </label>

            <input
              type="date"
              value={dateOfBirth}
              onChange={(event) =>
                setDateOfBirth(
                  event.target.value,
                )
              }
              className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-900 outline-none transition focus:border-[#1877f2] focus:ring-4 focus:ring-[#1877f2]/10"
            />
          </div>
        </div>

        {/* GENDER */}

        <div className="mt-7">
          <label className="mb-3 block text-sm font-bold text-gray-700">
            Gender
          </label>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                value: "MALE",
                label: "Male",
              },
              {
                value: "FEMALE",
                label: "Female",
              },
              {
                value: "OTHER",
                label: "Other",
              },
              {
                value:
                  "PREFER_NOT_TO_SAY",
                label:
                  "Prefer not to say",
              },
            ].map((option) => {
              const selected =
                gender ===
                option.value;

              return (
                <button
                  key={
                    option.value
                  }
                  type="button"
                  onClick={() =>
                    setGender(
                      selected
                        ? ""
                        : option.value,
                    )
                  }
                  className={`flex h-12 items-center gap-3 rounded-xl border px-4 text-sm font-bold transition ${
                    selected
                      ? "border-[#1877f2] bg-blue-50 text-[#1877f2] ring-2 ring-[#1877f2]/10"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                      selected
                        ? "border-[#1877f2]"
                        : "border-gray-300"
                    }`}
                  >
                    {selected && (
                      <span className="h-2.5 w-2.5 rounded-full bg-[#1877f2]" />
                    )}
                  </span>

                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ACCOUNT INFORMATION */}

        <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-gray-500 shadow-sm">
              <Icon>
                <svg
                  width="19"
                  height="19"
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
                  <path d="M12 10v6" />
                  <path d="M12 7h.01" />
                </svg>
              </Icon>
            </div>

            <div>
              <h3 className="text-sm font-extrabold text-gray-800">
                Account information
              </h3>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                Your account ID and account type are managed by Smartprix and cannot be changed from this page.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">

            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wide text-gray-400">
                Account ID
              </p>

              <p className="mt-1 break-all text-xs font-semibold text-gray-700">
                {user.id}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wide text-gray-400">
                Account type
              </p>

              <p className="mt-1 text-xs font-semibold uppercase text-gray-700">
                {user.role}
              </p>
            </div>

          </div>
        </div>

        {/* ACTIONS */}

        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:items-center sm:justify-between">

          <Link
            href="/profile"
            className="inline-flex h-12 items-center justify-center rounded-full border border-gray-200 bg-white px-6 text-sm font-bold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#1877f2] px-7 text-sm font-extrabold text-white shadow-[0_5px_16px_rgba(24,119,242,0.2)] transition hover:bg-[#166fe5] hover:shadow-[0_7px_20px_rgba(24,119,242,0.28)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Saving...
              </>
            ) : (
              <>
                <span>✓</span>
                Save changes
              </>
            )}
          </button>

        </div>
      </form>
    </section>
  </div>
</main>
 

);
}
