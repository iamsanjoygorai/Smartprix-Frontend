"use client";

import Link from "next/link";
import type { ReactNode } from "react";

interface Mobile {
  id: string;
  slug: string;
  name: string;

  brand?: string | null;
  category?: string | null;

  price: string;
  score: number;
  rating: number;
  reviewCount: number;

  image: string;

  display: string;
  displayType?: string | null;
  refreshRate?: string | null;

  battery: string;
  charging?: string | null;

  camera: string;
  frontCamera?: string | null;

  storage: string;
  ram?: string | null;
  processor?: string | null;

  connectivity?: string | null;
  wifi?: string | null;
  bluetooth?: string | null;

  memoryCard?: string | null;
  operatingSystem?: string | null;
  reverseWirelessCharging?: string | null;

  seller?: string | null;
  description?: string | null;

  /* NEW:
     Complete structured specifications from database */
  specifications?: Record<string, string>;
}

interface MobileCardProps {
  mobile: Mobile;
}

/* =========================================================
   SPECIFICATION HELPERS
========================================================= */

function getSpec(
  mobile: Mobile,
  slugs: string[],
): string | null {
  const specifications =
    mobile.specifications ?? {};

  for (const slug of slugs) {
    const value =
      specifications[slug];

    if (
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
    ) {
      return String(value).trim();
    }
  }

  return null;
}

function hasSpec(
  mobile: Mobile,
  slugs: string[],
): boolean {
  return Boolean(
    getSpec(mobile, slugs),
  );
}

function isNegativeSpec(
  value: string | null | undefined,
): boolean {
  if (!value) {
    return false;
  }

  return /^(no|none|not supported|unsupported|false|n\/a)$/i.test(
    value.trim(),
  );
}

/* =========================================================
   SPEC DISPLAY HELPERS
========================================================= */

function formatRam(
  mobile: Mobile,
): string | null {
  const ram =
    getSpec(mobile, [
      "ram",
    ]) ??
    mobile.ram;

  if (!ram) {
    return null;
  }

  return /\b(?:GB|MB)\b/i.test(ram)
    ? ram
    : `${ram} GB`;
}

function formatStorage(
  mobile: Mobile,
): string | null {
  const storage =
    getSpec(mobile, [
      "storage",
      "internal-storage",
      "inbuilt-memory",
    ]) ??
    mobile.storage;

  if (!storage) {
    return null;
  }

  return /\b(?:GB|TB)\b/i.test(storage)
    ? storage
    : `${storage} GB`;
}

function formatBattery(
  mobile: Mobile,
): string | null {
  const battery =
    getSpec(mobile, [
      "battery-capacity",
      "battery",
    ]) ??
    mobile.battery;

  if (!battery) {
    return null;
  }

  return /\bmAh\b/i.test(battery)
    ? battery
    : `${battery} mAh`;
}

function formatScreenSize(
  mobile: Mobile,
): string | null {
  const size =
    getSpec(mobile, [
      "screen-size",
      "size",
      "display-size",
    ]) ??
    mobile.display;

  if (!size) {
    return null;
  }

  return size;
}

function formatCamera(
  mobile: Mobile,
): string | null {
  const camera =
    getSpec(mobile, [
      "rear-camera",
      "main-camera",
    ]) ??
    mobile.camera;

  if (!camera) {
    return null;
  }

  return camera;
}

function formatProcessor(
  mobile: Mobile,
): string | null {
  return (
    getSpec(mobile, [
      "processor",
      "chipset",
      "cpu",
      "processor-model",
    ]) ??
    mobile.processor ??
    null
  );
}

function formatDisplay(
  mobile: Mobile,
): string | null {
  const size =
    formatScreenSize(mobile);

  const type =
    getSpec(mobile, [
      "display-type",
      "display",
    ]) ??
    mobile.displayType;

  const refreshRate =
    getSpec(mobile, [
      "refresh-rate",
    ]) ??
    mobile.refreshRate;

  const parts: string[] = [];

  if (size) {
    parts.push(size);
  }

  if (type) {
    parts.push(type);
  }

  if (refreshRate) {
    parts.push(refreshRate);
  }

  if (parts.length === 0) {
    return null;
  }

  return parts.join(" ");
}

function formatConnectivity(
  mobile: Mobile,
): string | null {
  const network =
    getSpec(mobile, [
      "network",
    ]) ??
    mobile.connectivity;

  const fiveG =
    getSpec(mobile, [
      "5g",
    ]);

  const fourG =
    getSpec(mobile, [
      "4g",
    ]);

  const parts: string[] = [];

  if (network) {
    parts.push(network);
  }

  if (
    fiveG &&
    !parts.some((part) =>
      /5G/i.test(part),
    )
  ) {
    parts.push("5G");
  }

  if (
    fourG &&
    !parts.some((part) =>
      /4G/i.test(part),
    )
  ) {
    parts.push("4G");
  }

  return parts.length > 0
    ? parts.join(", ")
    : null;
}

/* =========================================================
   OPTIONAL FEATURE HELPERS
========================================================= */

function getFeature(
  mobile: Mobile,
  slugs: string[],
): string | null {
  const value = getSpec(
    mobile,
    slugs,
  );

  if (!value || isNegativeSpec(value)) {
    return null;
  }

  return value;
}

/* =========================================================
   COMPONENT
========================================================= */

export default function MobileCard({
  mobile,
}: MobileCardProps) {
  const rating =
    Number(mobile.rating) || 0;

  const ratingPercentage =
    Math.min(
      100,
      Math.max(
        0,
        (rating / 5) * 100,
      ),
    );

  /* =======================================================
     DYNAMIC DATABASE SPECIFICATIONS
  ======================================================= */

  const display =
    formatDisplay(mobile);

  const processor =
    formatProcessor(mobile);

  const ram =
    formatRam(mobile);

  const storage =
    formatStorage(mobile);

  const battery =
    formatBattery(mobile);

  const camera =
    formatCamera(mobile);

  const frontCamera =
    getSpec(mobile, [
      "front-camera",
    ]) ??
    mobile.frontCamera;

  const charging =
    getSpec(mobile, [
      "charging-wattage",
      "fast-charging",
    ]) ??
    mobile.charging;

  const connectivity =
    formatConnectivity(mobile);

  const wifi =
    getFeature(mobile, [
      "wifi",
      "wi-fi",
      "wifi-version",
      "wi-fi-version",
    ]) ??
    mobile.wifi;

  const bluetooth =
    getFeature(mobile, [
      "bluetooth",
      "bluetooth-version",
    ]) ??
    mobile.bluetooth;

  const operatingSystem =
    getSpec(mobile, [
      "operating-system",
      "os",
      "os-version",
      "android-version",
    ]) ??
    mobile.operatingSystem;

  const memoryCard =
    getSpec(mobile, [
      "memory-card",
      "expandable-storage",
    ]) ??
    mobile.memoryCard;

  const reverseWirelessCharging =
    getFeature(mobile, [
      "reverse-wireless-charging",
    ]) ??
    mobile.reverseWirelessCharging;

  const nfc =
    getFeature(mobile, [
      "nfc",
    ]);

  const ipRating =
    getFeature(mobile, [
      "ip-rating",
    ]);

  const usbOtg =
    getFeature(mobile, [
      "usb-otg",
    ]);

  const ois =
    getFeature(mobile, [
      "ois",
    ]);

  const autofocus =
    getFeature(mobile, [
      "autofocus",
    ]);

  const dualSim =
    getFeature(mobile, [
      "dual-sim",
    ]);

  const numberOfSims =
    getFeature(mobile, [
      "number-of-sims",
    ]);

  const stereoSpeakers =
    getFeature(mobile, [
      "stereo-speakers",
    ]);

  const dolbyAtmos =
    getFeature(mobile, [
      "dolby-atmos",
    ]);

  const hdr =
    getFeature(mobile, [
      "hdr",
      "hdr10-plus",
    ]);

  const wirelessCharging =
    getFeature(mobile, [
      "wireless-charging",
    ]);

  const hasMemoryCard =
    Boolean(memoryCard) &&
    !isNegativeSpec(memoryCard);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <article className="group relative overflow-hidden border-b border-slate-200 bg-white transition-colors hover:bg-slate-50/40">
      <div className="p-4 sm:p-5 lg:p-6">
        <div className="flex gap-4 sm:gap-6">

          {/* =================================================
              PRODUCT IMAGE
          ================================================= */}

          <div className="relative flex w-[135px] shrink-0 items-start justify-center sm:w-[170px] lg:w-[190px]">
            <Link
              href={`/mobiles/${mobile.slug}`}
              className="relative flex h-[185px] w-[125px] items-center justify-center rounded-lg bg-gradient-to-b from-slate-50 to-white transition-transform duration-300 group-hover:-translate-y-1 sm:h-[205px] sm:w-[145px] lg:h-[220px] lg:w-[165px]"
            >
              <div className="absolute inset-x-3 bottom-2 h-8 rounded-full bg-slate-300/30 blur-xl" />

              <img
                src={mobile.image}
                alt={mobile.name}
                className="relative z-10 h-[155px] w-[125px] object-contain drop-shadow-[0_10px_12px_rgba(15,23,42,0.14)] transition-transform duration-300 group-hover:scale-[1.04] sm:h-[175px] sm:w-[145px] lg:h-[190px] lg:w-[166px]"
              />
            </Link>

            <button
              type="button"
              aria-label={`Compare ${mobile.name}`}
              className="absolute -bottom-1 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-600 shadow-sm transition-all hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600"
            >
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-[11px] font-black text-white">
                +
              </span>
              Compare
            </button>
          </div>

          {/* =================================================
              PRODUCT CONTENT
          ================================================= */}

          <div className="min-w-0 flex-1">

            {/* HEADER */}

            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <Link
                  href={`/mobiles/${mobile.slug}`}
                  className="block"
                >
                  <h3 className="text-[17px] font-extrabold leading-6 text-slate-900 transition-colors hover:text-indigo-600 sm:text-[19px]">
                    {mobile.name}
                  </h3>
                </Link>

                <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-slate-400">
                  {mobile.brand ??
                    mobile.category ??
                    "Mobile"}
                </p>
              </div>
            </div>

            {/* =================================================
                PRICE
            ================================================= */}

            <div className="mt-3 flex items-end justify-between gap-3">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-extrabold text-gray-900">
                    {mobile.price}
                  </span>

                  {mobile.price !==
                    "Price unavailable" && (
                    <span className="text-xs font-medium text-gray-500">
                      onwards
                    </span>
                  )}
                </div>

                <p className="mt-1 text-xs text-gray-500">
                  Lowest price
                  {mobile.seller
                    ? ` on ${mobile.seller}`
                    : ""}
                </p>
              </div>

              <Link
                href={`/mobiles/${mobile.slug}`}
                className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-100"
              >
                View Prices
              </Link>
            </div>

            {/* =================================================
                RATING
            ================================================= */}

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {rating > 0 ? (
                <>
                  <span className="text-sm font-bold text-gray-900">
                    {rating.toFixed(1)}
                  </span>

                  <span
                    className="relative inline-block text-sm tracking-[1px]"
                    aria-label={`${rating} out of 5`}
                  >
                    <span className="text-slate-200">
                      ★★★★★
                    </span>

                    <span
                      className="absolute left-0 top-0 overflow-hidden whitespace-nowrap text-yellow-500"
                      style={{
                        width: `${ratingPercentage}%`,
                      }}
                    >
                      ★★★★★
                    </span>
                  </span>

                  {mobile.reviewCount > 0 && (
                    <span className="text-xs text-gray-500">
                      ({mobile.reviewCount} reviews)
                    </span>
                  )}
                </>
              ) : (
                <span className="text-xs font-medium text-slate-400">
                  No ratings yet
                </span>
              )}

              {mobile.score > 0 && (
                <span className="ml-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-600">
                  Spec Score {mobile.score}
                </span>
              )}
            </div>

            {/* =================================================
                ACTION BAR
            ================================================= */}

            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-slate-100 py-2.5">
              <button
                type="button"
                className="text-xs font-semibold text-slate-600 transition hover:text-indigo-600"
              >
                + Compare
              </button>

              <button
                type="button"
                className="text-xs font-semibold text-slate-600 transition hover:text-pink-600"
              >
                ♡ Like
              </button>

              <Link
                href={`/mobiles/${mobile.slug}`}
                className="text-xs font-semibold text-indigo-600 transition hover:text-indigo-800"
              >
                View Details →
              </Link>
            </div>

            {/* =================================================
                SPECIFICATIONS
            ================================================= */}

            <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-2.5 text-[12px] leading-[18px] text-slate-600 sm:grid-cols-2">

              {/* =================================================
                  LEFT COLUMN
              ================================================= */}

              <div className="space-y-2.5">

                {/* CONNECTIVITY */}

                <SpecItem available={Boolean(connectivity)}>
                  {connectivity
                    ? `Connectivity: ${connectivity}`
                    : "Connectivity information unavailable"}
                </SpecItem>

                {/* PROCESSOR */}

                <SpecItem available={Boolean(processor)}>
                  {processor
                    ? `Processor: ${processor}`
                    : "Processor information unavailable"}
                </SpecItem>

                {/* MEMORY */}

                <SpecItem
                  available={
                    Boolean(
                      ram ||
                      storage,
                    )
                  }
                >
                  {ram || storage
                    ? [
                        ram
                          ? `${ram} RAM`
                          : null,
                        storage
                          ? `${storage} inbuilt`
                          : null,
                      ]
                        .filter(Boolean)
                        .join(", ")
                    : "Memory information unavailable"}
                </SpecItem>

                {/* BATTERY */}

                <SpecItem available={Boolean(battery)}>
                  {battery
                    ? `${battery} Battery${
                        charging
                          ? ` with ${charging} Charging`
                          : ""
                      }`
                    : "Battery information unavailable"}
                </SpecItem>

                {/* WIFI */}

                {wifi && (
                  <SpecItem>
                    Wi-Fi: {wifi}
                  </SpecItem>
                )}

                {/* BLUETOOTH */}

                {bluetooth && (
                  <SpecItem>
                    Bluetooth: {bluetooth}
                  </SpecItem>
                )}

                {/* NFC */}

                {nfc && (
                  <SpecItem>
                    NFC: {nfc}
                  </SpecItem>
                )}

                {/* USB OTG */}

                {usbOtg && (
                  <SpecItem>
                    USB OTG: {usbOtg}
                  </SpecItem>
                )}

                {/* DUAL SIM */}

                {(dualSim || numberOfSims) && (
                  <SpecItem>
                    SIM:{" "}
                    {[
                      numberOfSims,
                      dualSim,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </SpecItem>
                )}

              </div>

              {/* =================================================
                  RIGHT COLUMN
              ================================================= */}

              <div className="space-y-2.5">

                {/* DISPLAY */}

                <SpecItem available={Boolean(display)}>
                  {display
                    ? `Display: ${display}`
                    : "Display information unavailable"}
                </SpecItem>

                {/* CAMERA */}

                <SpecItem available={Boolean(camera)}>
                  {camera
                    ? `${camera} Rear Camera${
                        frontCamera
                          ? `, ${frontCamera} Front Camera`
                          : ""
                      }`
                    : "Camera information unavailable"}
                </SpecItem>

                {/* CAMERA FEATURES */}

                {(ois || autofocus) && (
                  <SpecItem>
                    Camera:{" "}
                    {[
                      ois
                        ? `OIS ${ois}`
                        : null,
                      autofocus
                        ? `Autofocus ${autofocus}`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </SpecItem>
                )}

                {/* MEMORY CARD */}

                {hasMemoryCard ? (
                  <SpecItem>
                    Memory Card Supported
                    {memoryCard
                      ? `: ${memoryCard}`
                      : ""}
                  </SpecItem>
                ) : (
                  <div className="flex items-start gap-2 text-red-500">
                    <span className="mt-[1px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-red-50 text-[9px] font-black">
                      ×
                    </span>

                    <span>
                      Memory Card Not Supported
                    </span>
                  </div>
                )}

                {/* OPERATING SYSTEM */}

                <SpecItem
                  available={Boolean(
                    operatingSystem,
                  )}
                >
                  {operatingSystem
                    ? operatingSystem
                    : "Operating system information unavailable"}
                </SpecItem>

                {/* IP RATING */}

                {ipRating && (
                  <SpecItem>
                    IP Rating: {ipRating}
                  </SpecItem>
                )}

                {/* WIRELESS CHARGING */}

                {wirelessCharging && (
                  <SpecItem>
                    {wirelessCharging}
                  </SpecItem>
                )}

                {/* REVERSE WIRELESS CHARGING */}

                {reverseWirelessCharging && (
                  <SpecItem>
                    {reverseWirelessCharging}
                  </SpecItem>
                )}

                {/* HDR */}

                {hdr && (
                  <SpecItem>
                    HDR: {hdr}
                  </SpecItem>
                )}

                {/* STEREO SPEAKERS */}

                {stereoSpeakers && (
                  <SpecItem>
                    Stereo Speakers:{" "}
                    {stereoSpeakers}
                  </SpecItem>
                )}

                {/* DOLBY ATMOS */}

                {dolbyAtmos && (
                  <SpecItem>
                    Dolby Atmos:{" "}
                    {dolbyAtmos}
                  </SpecItem>
                )}

              </div>
            </div>

            {/* =================================================
                DESCRIPTION
            ================================================= */}

            {mobile.description && (
              <p className="mt-4 line-clamp-2 text-[11px] leading-5 text-slate-400">
                {stripHtml(
                  mobile.description,
                )}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* =====================================================
          PREMIUM HOVER LINE
      ===================================================== */}

      <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-500 group-hover:w-full" />
    </article>
  );
}

/* =========================================================
   SPEC ITEM
========================================================= */

function SpecItem({
  children,
  available = true,
}: {
  children: ReactNode;
  available?: boolean;
}) {
  if (!available) {
    return (
      <div className="flex items-start gap-2 text-slate-400">
        <span className="mt-[1px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[9px] font-black">
          –
        </span>

        <span>{children}</span>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2">
      <span className="mt-[1px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[9px] font-black text-emerald-600">
        ✓
      </span>

      <span>{children}</span>
    </div>
  );
}

/* =========================================================
   HTML CLEANER
========================================================= */

function stripHtml(
  value: string,
): string {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}