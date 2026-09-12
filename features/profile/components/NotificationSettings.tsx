"use client";

import { useEffect, useState } from "react";

/* =========================================================
STORAGE KEY
========================================================= */

const STORAGE_KEY =
"smartprix_notification_preferences";

/* =========================================================
TYPES
========================================================= */

interface NotificationPreferences {
priceAlerts: boolean;
productUpdates: boolean;
newsOffers: boolean;
productEmails: boolean;
promotionalEmails: boolean;
}

/* =========================================================
DEFAULT VALUES
========================================================= */

const DEFAULT_PREFERENCES: NotificationPreferences = {
priceAlerts: true,
productUpdates: true,
newsOffers: true,
productEmails: true,
promotionalEmails: false,
};

/* =========================================================
COMPONENT
========================================================= */

export default function NotificationSettings() {
const [preferences, setPreferences] =
useState<NotificationPreferences>(
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
      JSON.parse(saved) as Partial<NotificationPreferences>;

    setPreferences({
      ...DEFAULT_PREFERENCES,
      ...parsed,
    });
  }
} catch (error) {
  console.error(
    "Failed to load notification preferences:",
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
    "Failed to save notification preferences:",
    error,
  );
}
 

}, [preferences, loaded]);

/* =======================================================
TOGGLE HELPER
======================================================= */

const updatePreference = (
key: keyof NotificationPreferences,
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
   id="notifications"
   className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
 >
{/* Header */} <div className="mb-6"> <div className="flex items-start gap-4"> <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600"> <NotificationIcon /> </div>

 
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          Notifications
        </h2>

        <p className="mt-1 text-sm leading-6 text-gray-500">
          Choose which notifications and updates
          you want to receive from Smartprix.
        </p>
      </div>
    </div>
  </div>

  {/* Notification settings */}
  <div className="divide-y divide-gray-100">
    <SettingToggle
      title="Price alerts"
      description="Get notified when the price of a product you're interested in drops."
      enabled={preferences.priceAlerts}
      onChange={(value) =>
        updatePreference(
          "priceAlerts",
          value,
        )
      }
    />

    <SettingToggle
      title="Product updates"
      description="Receive important updates about products, specifications and availability."
      enabled={preferences.productUpdates}
      onChange={(value) =>
        updatePreference(
          "productUpdates",
          value,
        )
      }
    />

    <SettingToggle
      title="News & offers"
      description="Stay updated with the latest technology news, deals and offers."
      enabled={preferences.newsOffers}
      onChange={(value) =>
        updatePreference(
          "newsOffers",
          value,
        )
      }
    />

    <SettingToggle
      title="Product emails"
      description="Receive useful emails related to products you follow and compare."
      enabled={preferences.productEmails}
      onChange={(value) =>
        updatePreference(
          "productEmails",
          value,
        )
      }
    />

    <SettingToggle
      title="Promotional emails"
      description="Receive promotional messages, special offers and marketing emails."
      enabled={preferences.promotionalEmails}
      onChange={(value) =>
        updatePreference(
          "promotionalEmails",
          value,
        )
      }
    />
  </div>

  {/* Info */}
  <div className="mt-6 flex gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
    <InfoIcon />

    <p className="text-sm leading-6 text-blue-800">
      You can change these preferences anytime.
      Your notification choices are saved
      automatically.
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
NOTIFICATION ICON
========================================================= */

function NotificationIcon() {
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
 > <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /> <path d="M13.73 21a2 2 0 0 1-3.46 0" /> </svg>
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
   className="mt-0.5 shrink-0 text-blue-600"
   aria-hidden="true"
 > <circle cx="12" cy="12" r="10" /> <path d="M12 16v-4" /> <path d="M12 8h.01" /> </svg>
);
}
