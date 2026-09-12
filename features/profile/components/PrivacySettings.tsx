"use client";

import { useEffect, useState } from "react";

/* =========================================================
STORAGE KEY
========================================================= */

const STORAGE_KEY =
"smartprix_privacy_preferences";

/* =========================================================
TYPES
========================================================= */

interface PrivacyPreferences {
publicProfile: boolean;
publicReviews: boolean;
personalizedRecommendations: boolean;
activityVisibility: boolean;
}

/* =========================================================
DEFAULT VALUES
========================================================= */

const DEFAULT_PREFERENCES: PrivacyPreferences = {
publicProfile: true,
publicReviews: true,
personalizedRecommendations: true,
activityVisibility: false,
};

/* =========================================================
COMPONENT
========================================================= */

export default function PrivacySettings() {
const [preferences, setPreferences] =
useState<PrivacyPreferences>(
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
      JSON.parse(saved) as Partial<PrivacyPreferences>;

    setPreferences({
      ...DEFAULT_PREFERENCES,
      ...parsed,
    });
  }
} catch (error) {
  console.error(
    "Failed to load privacy preferences:",
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
    "Failed to save privacy preferences:",
    error,
  );
}
   

}, [preferences, loaded]);

/* =======================================================
UPDATE PREFERENCE
======================================================= */

const updatePreference = (
key: keyof PrivacyPreferences,
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
   id="privacy"
   className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
 >
{/* Header */} <div className="mb-6"> <div className="flex items-start gap-4"> <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"> <PrivacyIcon /> </div>

   
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          Privacy
        </h2>

        <p className="mt-1 text-sm leading-6 text-gray-500">
          Control how your profile, activity and
          preferences are used on Smartprix.
        </p>
      </div>
    </div>
  </div>

  {/* Privacy settings */}
  <div className="divide-y divide-gray-100">
    <SettingToggle
      title="Public profile"
      description="Allow other Smartprix users to view your public profile information."
      enabled={preferences.publicProfile}
      onChange={(value) =>
        updatePreference(
          "publicProfile",
          value,
        )
      }
    />

    <SettingToggle
      title="Public reviews"
      description="Allow your product reviews to be visible to other users."
      enabled={preferences.publicReviews}
      onChange={(value) =>
        updatePreference(
          "publicReviews",
          value,
        )
      }
    />

    <SettingToggle
      title="Personalized recommendations"
      description="Allow Smartprix to use your activity and preferences to provide more relevant product recommendations."
      enabled={
        preferences.personalizedRecommendations
      }
      onChange={(value) =>
        updatePreference(
          "personalizedRecommendations",
          value,
        )
      }
    />

    <SettingToggle
      title="Activity visibility"
      description="Allow selected activity such as follows, comparisons and product interactions to be visible on your profile."
      enabled={preferences.activityVisibility}
      onChange={(value) =>
        updatePreference(
          "activityVisibility",
          value,
        )
      }
    />
  </div>

  {/* Privacy information */}
  <div className="mt-6 flex gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
    <InfoIcon />

    <p className="text-sm leading-6 text-emerald-800">
      Your privacy preferences are saved
      automatically. You can change these settings
      whenever you want.
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
PRIVACY ICON
========================================================= */

function PrivacyIcon() {
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
 > <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /> <path d="m9 12 2 2 4-4" /> </svg>
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
   className="mt-0.5 shrink-0 text-emerald-600"
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
