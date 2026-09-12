"use client";

import { useEffect, useState } from "react";

/* =========================================================
STORAGE KEY
========================================================= */

const STORAGE_KEY =
"smartprix_email_preferences";

/* =========================================================
TYPES
========================================================= */

interface EmailPreferencesState {
productRecommendationEmails: boolean;
priceDropEmails: boolean;
weeklyDigestEmails: boolean;
}

/* =========================================================
DEFAULT VALUES
========================================================= */

const DEFAULT_PREFERENCES: EmailPreferencesState = {
productRecommendationEmails: true,
priceDropEmails: true,
weeklyDigestEmails: false,
};

/* =========================================================
COMPONENT
========================================================= */

export default function EmailPreferences() {
const [preferences, setPreferences] =
useState<EmailPreferencesState>(
DEFAULT_PREFERENCES,
);

const [loaded, setLoaded] =
useState(false);

/* =======================================================
LOAD SAVED PREFERENCES
======================================================= */

useEffect(() => {
if (typeof window === "undefined") {
return;
}

  
try {
  const saved =
    localStorage.getItem(STORAGE_KEY);

  if (saved) {
    const parsed =
      JSON.parse(saved) as Partial<EmailPreferencesState>;

    setPreferences({
      ...DEFAULT_PREFERENCES,
      ...parsed,
    });
  }
} catch (error) {
  console.error(
    "Failed to load email preferences:",
    error,
  );
} finally {
  setLoaded(true);
}
  

}, []);

/* =======================================================
SAVE PREFERENCES
======================================================= */

useEffect(() => {
if (!loaded) {
return;
}

  
try {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(preferences),
  );
} catch (error) {
  console.error(
    "Failed to save email preferences:",
    error,
  );
}
  

}, [preferences, loaded]);

/* =======================================================
UPDATE PREFERENCE
======================================================= */

const updatePreference = (
key: keyof EmailPreferencesState,
value: boolean,
) => {
setPreferences((current) => ({
...current,
[key]: value,
}));
};

/* =======================================================
UI
======================================================= */

return ( <section
   id="email-preferences"
   className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
 >
{/* Header */} <div className="mb-6"> <div className="flex items-start gap-4">
{/* Icon */} <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600"> <MailIcon /> </div>

  
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          Email preferences
        </h2>

        <p className="mt-1 text-sm leading-6 text-gray-500">
          Choose the types of emails you want to
          receive from Smartprix.
        </p>
      </div>
    </div>
  </div>

  {/* Email settings */}
  <div className="divide-y divide-gray-100">
    <SettingToggle
      title="Product recommendations"
      description="Receive personalized recommendations based on products you may be interested in."
      enabled={
        preferences.productRecommendationEmails
      }
      onChange={(value) =>
        updatePreference(
          "productRecommendationEmails",
          value,
        )
      }
    />

    <SettingToggle
      title="Price-drop emails"
      description="Get an email when products you're interested in have a significant price drop."
      enabled={
        preferences.priceDropEmails
      }
      onChange={(value) =>
        updatePreference(
          "priceDropEmails",
          value,
        )
      }
    />

    <SettingToggle
      title="Weekly digest"
      description="Receive a weekly summary of important technology news, products and deals."
      enabled={
        preferences.weeklyDigestEmails
      }
      onChange={(value) =>
        updatePreference(
          "weeklyDigestEmails",
          value,
        )
      }
    />
  </div>

  {/* Info */}
  <div className="mt-6 flex gap-3 rounded-xl border border-purple-100 bg-purple-50 p-4">
    <InfoIcon />

    <p className="text-sm leading-6 text-purple-800">
      These preferences only control Smartprix
      emails. You can change them at any time.
    </p>
  </div>
</section>
  

);
}

/* =========================================================
SETTING TOGGLE
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
onChange: (value: boolean) => void;
}) {
return ( <div className="flex items-center justify-between gap-6 py-5"> <div className="min-w-0"> <h3 className="text-sm font-semibold text-gray-900">
{title} </h3>

  
    <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
      {description}
    </p>
  </div>

  <button
    type="button"
    role="switch"
    aria-checked={enabled}
    aria-label={`Toggle ${title}`}
    onClick={() => onChange(!enabled)}
    className={`relative h-7 w-12 shrink-0 rounded-full transition-all duration-200 ${
      enabled
        ? "bg-green-500 shadow-sm"
        : "bg-gray-300"
    }`}
  >
    <span
      className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition-all duration-200 ${
        enabled
          ? "left-6"
          : "left-1"
      }`}
    />
  </button>
</div>
  

);
}

/* =========================================================
MAIL ICON
========================================================= */

function MailIcon() {
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
 > <rect
     width="20"
     height="16"
     x="2"
     y="4"
     rx="2"
   />

  
  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
</svg>
  

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
   className="mt-0.5 shrink-0 text-purple-600"
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
