"use client";

import { useEffect, useState } from "react";

/* =========================================================
TYPES
========================================================= */

interface DeviceInfo {
browser: string;
platform: string;
}

/* =========================================================
COMPONENT
========================================================= */

export default function SessionsSection() {
const [deviceInfo, setDeviceInfo] =
useState<DeviceInfo>({
browser: "Browser",
platform: "Device",
});

/* =======================================================
DETECT CURRENT DEVICE
======================================================= */

useEffect(() => {
if (typeof window === "undefined") {
return;
}

   
const userAgent =
  navigator.userAgent.toLowerCase();

/* -----------------------------------------------------
   Browser
----------------------------------------------------- */

let browser = "Browser";

if (userAgent.includes("edg/")) {
  browser = "Microsoft Edge";
} else if (
  userAgent.includes("chrome") &&
  !userAgent.includes("edg/")
) {
  browser = "Google Chrome";
} else if (
  userAgent.includes("firefox")
) {
  browser = "Mozilla Firefox";
} else if (
  userAgent.includes("safari") &&
  !userAgent.includes("chrome")
) {
  browser = "Safari";
} else if (
  userAgent.includes("opera") ||
  userAgent.includes("opr/")
) {
  browser = "Opera";
}

/* -----------------------------------------------------
   Platform
----------------------------------------------------- */

let platform = "Device";

if (
  userAgent.includes("windows")
) {
  platform = "Windows";
} else if (
  userAgent.includes("android")
) {
  platform = "Android";
} else if (
  userAgent.includes("iphone") ||
  userAgent.includes("ipad") ||
  userAgent.includes("ipod")
) {
  platform = "iOS";
} else if (
  userAgent.includes("mac")
) {
  platform = "macOS";
} else if (
  userAgent.includes("linux")
) {
  platform = "Linux";
}

setDeviceInfo({
  browser,
  platform,
});
   

}, []);

/* =======================================================
UI
======================================================= */

return ( <section
   id="sessions"
   className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
 >
{/* Header */} <div className="mb-6"> <div className="flex items-start gap-4"> <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600"> <DeviceIcon /> </div>

   
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          Sessions & devices
        </h2>

        <p className="mt-1 text-sm leading-6 text-gray-500">
          Review the device and browser currently
          being used to access your Smartprix account.
        </p>
      </div>
    </div>
  </div>

  {/* Current session */}
  <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
    <div className="flex items-center justify-between gap-4">
      {/* Device information */}
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-gray-600 shadow-sm">
          <MonitorIcon />
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-gray-900">
              {deviceInfo.browser}
            </h3>

            <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
              Current session
            </span>
          </div>

          <p className="mt-1 text-sm text-gray-500">
            {deviceInfo.platform}
          </p>
        </div>
      </div>

      {/* Online indicator */}
      <div className="flex items-center gap-2 text-sm font-medium text-green-600">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
        </span>

        Active
      </div>
    </div>
  </div>

  {/* Security information */}
  <div className="mt-6 flex gap-3 rounded-xl border border-orange-100 bg-orange-50 p-4">
    <InfoIcon />

    <div>
      <p className="text-sm font-semibold text-orange-900">
        Keep your account secure
      </p>

      <p className="mt-1 text-sm leading-6 text-orange-800">
        If you notice a device or session that you
        don't recognize, change your password
        immediately and sign out of other sessions.
      </p>
    </div>
  </div>
</section>
   

);
}

/* =========================================================
DEVICE ICON
========================================================= */

function DeviceIcon() {
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
     width="14"
     height="20"
     x="5"
     y="2"
     rx="2"
     ry="2"
   />

   
  <path d="M12 18h.01" />
</svg>
   

);
}

/* =========================================================
MONITOR ICON
========================================================= */

function MonitorIcon() {
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
     height="14"
     x="2"
     y="3"
     rx="2"
   />

   
  <line
    x1="8"
    x2="16"
    y1="21"
    y2="21"
  />

  <line
    x1="12"
    x2="12"
    y1="17"
    y2="21"
  />
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
   className="mt-0.5 shrink-0 text-orange-600"
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
