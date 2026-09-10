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
  const specifications = mobile.specifications ?? {};

  for (const slug of slugs) {
    const value = specifications[slug];

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

function isNegativeSpec(
  value: string | null | undefined,
): boolean {
  if (!value) return false;

  return /^(no|none|not supported|unsupported|false|n\/a)$/i.test(
    value.trim(),
  );
}

function formatRam(
  mobile: Mobile,
): string | null {
  const ram =
    getSpec(mobile, ["ram", "memory"]) ??
    mobile.ram;

  if (!ram) return null;

  return /\b(GB|MB)\b/i.test(ram)
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
    ]) ?? mobile.storage;

  if (!storage) return null;

  return /\b(GB|TB)\b/i.test(storage)
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
    ]) ?? mobile.battery;

  if (!battery) return null;

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
      "display-size",
      "size",
      "screen",
    ]) ?? mobile.display;

  return size || null;
}

function formatCamera(
  mobile: Mobile,
): string | null {
  const camera =
    getSpec(mobile, [
      "rear-camera",
      "main-camera",
      "primary-camera",
      "camera",
    ]) ?? mobile.camera;

  return camera || null;
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
      "soc",
    ]) ??
    mobile.processor ??
    null
  );
}

function formatDisplay(
  mobile: Mobile,
): string | null {
  const size = formatScreenSize(mobile);

  const type =
    getSpec(mobile, [
      "display-type",
      "screen-type",
      "panel-type",
    ]) ?? mobile.displayType;

  const refreshRate =
    getSpec(mobile, [
      "refresh-rate",
      "display-refresh-rate",
    ]) ?? mobile.refreshRate;

  const parts: string[] = [];

  if (size) parts.push(size);
  if (type) parts.push(type);
  if (refreshRate) parts.push(refreshRate);

  return parts.length > 0
    ? parts.join(" • ")
    : null;
}

function formatConnectivity(
  mobile: Mobile,
): string | null {
  const network =
    getSpec(mobile, [
      "network",
      "connectivity",
      "network-type",
    ]) ?? mobile.connectivity;

  const fiveG = getSpec(mobile, ["5g"]);
  const fourG = getSpec(mobile, ["4g"]);

  const parts: string[] = [];

  if (network) {
    parts.push(network);
  }

  if (
    fiveG &&
    !parts.some((part) => /5G/i.test(part))
  ) {
    parts.push("5G");
  }

  if (
    fourG &&
    !parts.some((part) => /4G/i.test(part))
  ) {
    parts.push("4G");
  }

  return parts.length > 0
    ? parts.join(", ")
    : null;
}

function getFeature(
  mobile: Mobile,
  slugs: string[],
): string | null {
  const value = getSpec(mobile, slugs);

  if (!value || isNegativeSpec(value)) {
    return null;
  }

  return value;
}

function stripHtml(value: string): string {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

/* =========================================================
   SPEC ITEM
========================================================= */

function SpecItem({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value?: string | null;
}) {
  if (!value) return null;

  return (
    <div className="flex min-w-0 items-start gap-2.5">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-[13px] text-slate-500 ring-1 ring-slate-100">
        {icon}
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p
          className="mt-0.5 truncate text-[12px] font-semibold text-slate-700"
          title={value}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   COMPONENT
========================================================= */

export default function MobileCard({
  mobile,
}: MobileCardProps) {
  const rating = Number(mobile.rating) || 0;

  const ratingPercentage = Math.min(
    100,
    Math.max(0, (rating / 5) * 100),
  );

  /* =======================================================
     DATABASE SPECIFICATIONS
  ======================================================= */

  const display = formatDisplay(mobile);

  const processor = formatProcessor(mobile);

  const ram = formatRam(mobile);

  const storage = formatStorage(mobile);

  const battery = formatBattery(mobile);

  const camera = formatCamera(mobile);

  const frontCamera =
    getSpec(mobile, [
      "front-camera",
      "selfie-camera",
    ]) ?? mobile.frontCamera;

  const charging =
    getSpec(mobile, [
      "charging-wattage",
      "fast-charging",
      "charging",
      "charging-speed",
    ]) ?? mobile.charging;

  const connectivity =
    formatConnectivity(mobile);

  const wifi =
    getFeature(mobile, [
      "wifi",
      "wi-fi",
      "wifi-version",
      "wi-fi-version",
    ]) ?? mobile.wifi;

  const bluetooth =
    getFeature(mobile, [
      "bluetooth",
      "bluetooth-version",
    ]) ?? mobile.bluetooth;

  const operatingSystem =
    getSpec(mobile, [
      "operating-system",
      "os",
      "os-version",
      "android-version",
    ]) ?? mobile.operatingSystem;

  const memoryCard =
    getSpec(mobile, [
      "memory-card",
      "expandable-storage",
      "card-slot",
    ]) ?? mobile.memoryCard;

  const reverseWirelessCharging =
    getFeature(mobile, [
      "reverse-wireless-charging",
      "reverse-charging",
    ]) ??
    mobile.reverseWirelessCharging;

  const nfc = getFeature(mobile, ["nfc"]);

  const ipRating = getFeature(mobile, [
    "ip-rating",
  ]);

  const usbOtg = getFeature(mobile, [
    "usb-otg",
  ]);

  const ois = getFeature(mobile, ["ois"]);

  const autofocus = getFeature(mobile, [
    "autofocus",
  ]);

  const dualSim = getFeature(mobile, [
    "dual-sim",
  ]);

  const numberOfSims = getFeature(mobile, [
    "number-of-sims",
  ]);

  const stereoSpeakers = getFeature(
    mobile,
    ["stereo-speakers"],
  );

  const dolbyAtmos = getFeature(mobile, [
    "dolby-atmos",
  ]);

  const hdr = getFeature(mobile, [
    "hdr",
    "hdr10-plus",
  ]);

  const wirelessCharging = getFeature(
    mobile,
    ["wireless-charging"],
  );

  const hasMemoryCard =
    Boolean(memoryCard) &&
    !isNegativeSpec(memoryCard);

  const description = mobile.description
    ? stripHtml(mobile.description)
    : null;

  return (
    <article
      className="
        group relative overflow-hidden
        border-b border-slate-200
        bg-white
        transition-all duration-300
        hover:bg-slate-50/50
      "
    >
      <div className="p-4 sm:p-5 lg:p-6">
        <div className="flex flex-col gap-5 md:flex-row md:gap-6">
          {/* =================================================
              IMAGE
          ================================================= */}

          <div className="relative flex shrink-0 justify-center md:w-[185px] lg:w-[205px]">
            <div className="relative">
              {/* Wishlist */}

              <button
                type="button"
                aria-label={`Add ${mobile.name} to wishlist`}
                className="
                  absolute right-1 top-1 z-30
                  flex h-9 w-9 items-center justify-center
                  rounded-full
                  border border-slate-200
                  bg-white/95
                  text-lg text-slate-400
                  shadow-sm
                  backdrop-blur
                  transition-all duration-200
                  hover:border-pink-200
                  hover:bg-pink-50
                  hover:text-pink-500
                "
              >
                ♡
              </button>

              {/* Image box */}

              <Link
                href={`/mobiles/${mobile.slug}`}
                className="
                  relative flex
                  h-[230px] w-[170px]
                  items-center justify-center
                  overflow-hidden
                  rounded-2xl
                  bg-gradient-to-b
                  from-slate-50
                  via-white
                  to-slate-50
                  ring-1 ring-slate-100
                  transition-all duration-300
                  group-hover:ring-indigo-100
                  sm:h-[250px]
                  sm:w-[185px]
                "
              >
                {/* soft background */}

                <div className="absolute inset-x-5 bottom-5 h-9 rounded-full bg-slate-300/30 blur-2xl" />

                <div className="absolute left-3 top-3 rounded-full bg-white px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-400 shadow-sm ring-1 ring-slate-100">
                  Mobile
                </div>

                <img
                  src={mobile.image}
                  alt={mobile.name}
                  className="
                    relative z-10
                    h-[195px] w-[155px]
                    object-contain
                    drop-shadow-[0_16px_18px_rgba(15,23,42,0.16)]
                    transition-transform duration-500
                    group-hover:scale-[1.06]
                    sm:h-[215px]
                    sm:w-[170px]
                  "
                />
              </Link>

              {/* Compare */}

              <button
                type="button"
                aria-label={`Compare ${mobile.name}`}
                className="
                  absolute -bottom-3 left-1/2 z-20
                  flex -translate-x-1/2
                  items-center gap-1.5
                  whitespace-nowrap
                  rounded-full
                  border border-indigo-100
                  bg-white
                  px-3.5 py-1.5
                  text-[11px] font-bold
                  text-indigo-600
                  shadow-md shadow-slate-200/60
                  transition-all duration-200
                  hover:border-indigo-300
                  hover:bg-indigo-50
                "
              >
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-black text-white">
                  +
                </span>

                Compare
              </button>
            </div>
          </div>

          {/* =================================================
              CONTENT
          ================================================= */}

          <div className="min-w-0 flex-1">
            {/* HEADER */}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-500">
                  {mobile.brand ??
                    mobile.category ??
                    "Smartphone"}
                </p>

                <Link
                  href={`/mobiles/${mobile.slug}`}
                  className="group/title"
                >
                  <h3
                    className="
                      text-[18px] font-extrabold
                      leading-6 text-slate-900
                      transition-colors
                      group-hover/title:text-indigo-600
                      sm:text-[20px]
                    "
                  >
                    {mobile.name}
                  </h3>
                </Link>
              </div>

              {/* SCORE */}

              {mobile.score > 0 && (
                <div className="flex shrink-0 items-center gap-2">
                  <div className="flex h-12 w-12 flex-col items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 ring-1 ring-emerald-100">
                    <span className="text-[15px] font-black leading-none text-emerald-600">
                      {mobile.score}
                    </span>

                    <span className="mt-1 text-[8px] font-bold uppercase tracking-wide text-emerald-500">
                      Score
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* PRICE */}

            <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-[23px] font-black tracking-tight text-slate-900">
                    {mobile.price}
                  </span>

                  {mobile.price !==
                    "Price unavailable" && (
                    <span className="text-[11px] font-semibold text-slate-400">
                      onwards
                    </span>
                  )}
                </div>

                <p className="mt-0.5 text-[11px] text-slate-400">
                  Lowest price
                  {mobile.seller
                    ? ` on ${mobile.seller}`
                    : ""}
                </p>
              </div>

              <Link
                href={`/mobiles/${mobile.slug}`}
                className="
                  rounded-xl
                  bg-indigo-600
                  px-4 py-2
                  text-[11px] font-bold
                  text-white
                  shadow-sm
                  shadow-indigo-200
                  transition-all duration-200
                  hover:bg-indigo-700
                  hover:shadow-md
                "
              >
                View Prices
              </Link>
            </div>

            {/* RATING */}

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {rating > 0 ? (
                <>
                  <span className="rounded-md bg-amber-50 px-1.5 py-1 text-[11px] font-extrabold text-amber-600">
                    {rating.toFixed(1)}
                  </span>

                  <span
                    className="relative inline-block text-[14px] tracking-[1px]"
                    aria-label={`${rating} out of 5`}
                  >
                    <span className="text-slate-200">
                      ★★★★★
                    </span>

                    <span
                      className="absolute left-0 top-0 overflow-hidden whitespace-nowrap text-amber-400"
                      style={{
                        width: `${ratingPercentage}%`,
                      }}
                    >
                      ★★★★★
                    </span>
                  </span>

                  {mobile.reviewCount > 0 && (
                    <span className="text-[11px] font-medium text-slate-400">
                      {mobile.reviewCount} reviews
                    </span>
                  )}
                </>
              ) : (
                <span className="text-[11px] font-medium text-slate-400">
                  No ratings yet
                </span>
              )}
            </div>

            {/* ACTIONS */}

            <div className="mt-4 flex flex-wrap items-center gap-2 border-y border-slate-100 py-2.5">
              <button
                type="button"
                className="
                  rounded-lg px-2.5 py-1.5
                  text-[11px] font-bold
                  text-slate-500
                  transition
                  hover:bg-indigo-50
                  hover:text-indigo-600
                "
              >
                + Compare
              </button>

              <button
                type="button"
                className="
                  rounded-lg px-2.5 py-1.5
                  text-[11px] font-bold
                  text-slate-500
                  transition
                  hover:bg-pink-50
                  hover:text-pink-600
                "
              >
                ♡ Like
              </button>

              <Link
                href={`/mobiles/${mobile.slug}`}
                className="
                  rounded-lg px-2.5 py-1.5
                  text-[11px] font-bold
                  text-indigo-600
                  transition
                  hover:bg-indigo-50
                "
              >
                View Details →
              </Link>
            </div>

            {/* =================================================
                SPECIFICATIONS
            ================================================= */}

            <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-3.5 sm:p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-700">
                    Key Specifications
                  </p>

                  <p className="mt-0.5 text-[10px] text-slate-400">
                    Database verified specifications
                  </p>
                </div>

                <span className="rounded-full bg-white px-2.5 py-1 text-[9px] font-bold text-slate-400 ring-1 ring-slate-100">
                  DETAILS
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <SpecItem
                  icon="▣"
                  label="Display"
                  value={display}
                />

                <SpecItem
                  icon="⚙"
                  label="Processor"
                  value={processor}
                />

                <SpecItem
                  icon="◈"
                  label="RAM"
                  value={ram}
                />

                <SpecItem
                  icon="▤"
                  label="Storage"
                  value={storage}
                />

                <SpecItem
                  icon="◉"
                  label="Battery"
                  value={
                    battery
                      ? charging
                        ? `${battery} • ${charging}`
                        : battery
                      : null
                  }
                />

                <SpecItem
                  icon="◎"
                  label="Rear Camera"
                  value={camera}
                />

                <SpecItem
                  icon="◌"
                  label="Front Camera"
                  value={frontCamera}
                />

                <SpecItem
                  icon="▤"
                  label="Network"
                  value={connectivity}
                />

                <SpecItem
                  icon="◒"
                  label="Operating System"
                  value={operatingSystem}
                />

                <SpecItem
                  icon="◫"
                  label="Wi-Fi"
                  value={wifi}
                />

                <SpecItem
                  icon="⌁"
                  label="Bluetooth"
                  value={bluetooth}
                />

                <SpecItem
                  icon="▣"
                  label="IP Rating"
                  value={ipRating}
                />
              </div>

              {/* FEATURE BADGES */}

              {(nfc ||
                usbOtg ||
                hasMemoryCard ||
                ois ||
                autofocus ||
                dualSim ||
                numberOfSims ||
                stereoSpeakers ||
                dolbyAtmos ||
                hdr ||
                wirelessCharging ||
                reverseWirelessCharging) && (
                <div className="mt-4 border-t border-slate-200/70 pt-3">
                  <div className="flex flex-wrap gap-1.5">
                    {nfc && (
                      <FeatureBadge>
                        NFC
                      </FeatureBadge>
                    )}

                    {usbOtg && (
                      <FeatureBadge>
                        USB OTG
                      </FeatureBadge>
                    )}

                    {hasMemoryCard && (
                      <FeatureBadge>
                        Memory Card
                      </FeatureBadge>
                    )}

                    {ois && (
                      <FeatureBadge>
                        OIS
                      </FeatureBadge>
                    )}

                    {autofocus && (
                      <FeatureBadge>
                        Autofocus
                      </FeatureBadge>
                    )}

                    {(dualSim ||
                      numberOfSims) && (
                      <FeatureBadge>
                        Dual SIM
                      </FeatureBadge>
                    )}

                    {stereoSpeakers && (
                      <FeatureBadge>
                        Stereo Speakers
                      </FeatureBadge>
                    )}

                    {dolbyAtmos && (
                      <FeatureBadge>
                        Dolby Atmos
                      </FeatureBadge>
                    )}

                    {hdr && (
                      <FeatureBadge>
                        HDR
                      </FeatureBadge>
                    )}

                    {wirelessCharging && (
                      <FeatureBadge>
                        Wireless Charging
                      </FeatureBadge>
                    )}

                    {reverseWirelessCharging && (
                      <FeatureBadge>
                        Reverse Wireless Charging
                      </FeatureBadge>
                    )}
                  </div>
                </div>
              )}

              {!hasMemoryCard &&
                mobile.specifications &&
                Object.keys(
                  mobile.specifications,
                ).length > 0 && (
                  <div className="mt-3 flex items-center gap-2 text-[10px] font-medium text-red-500">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-50 font-black">
                      ×
                    </span>

                    Memory Card Not Supported
                  </div>
                )}
            </div>

            {/* DESCRIPTION */}

            {description && (
              <p className="mt-3 line-clamp-2 text-[11px] leading-5 text-slate-400">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* PREMIUM BOTTOM LINE */}

      <div
        className="
          absolute bottom-0 left-0
          h-[3px] w-0
          bg-gradient-to-r
          from-indigo-500
          via-purple-500
          to-pink-500
          transition-all duration-500
          group-hover:w-full
        "
      />
    </article>
  );
}

/* =========================================================
   FEATURE BADGE
========================================================= */

function FeatureBadge({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <span
      className="
        rounded-full
        border border-indigo-100
        bg-white
        px-2.5 py-1
        text-[9px] font-bold
        text-indigo-600
        shadow-sm
      "
    >
      ✓ {children}
    </span>
  );
}