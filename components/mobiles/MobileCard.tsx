"use client";

import Link from "next/link";

interface Mobile {
  id: string;
  slug: string;
  name: string;
  price: string;
  score: number;
  rating: number;
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

  connectivity?: string | null;
  processor?: string | null;

  memoryCard?: string | null;
  operatingSystem?: string | null;
}

export default function MobileCard({
  mobile,
}: {
  mobile: Mobile;
}) {
  const hasMemoryCard =
    mobile.memoryCard &&
    !/not supported|no|none/i.test(mobile.memoryCard);

  return (
    <article className="group relative overflow-hidden border-b border-slate-200 bg-white transition-colors hover:bg-slate-50/40">
      <div className="p-4 sm:p-5 lg:p-6">
        <div className="flex gap-4 sm:gap-6">
          {/* =====================================================
              PRODUCT IMAGE
          ====================================================== */}

          <div className="relative flex w-[105px] shrink-0 items-start justify-center sm:w-[135px]">
            <Link
              href={`/mobiles/${mobile.slug}`}
              className="relative flex h-[165px] w-[100px] items-center justify-center rounded-2xl bg-gradient-to-b from-slate-50 to-white transition-transform duration-300 group-hover:-translate-y-1 sm:h-[190px] sm:w-[120px]"
            >
              <div className="absolute inset-x-3 bottom-2 h-8 rounded-full bg-slate-300/30 blur-xl" />

              <img
                src={mobile.image}
                alt={mobile.name}
                className="relative z-10 h-[155px] w-[92px] object-contain drop-shadow-[0_8px_10px_rgba(15,23,42,0.12)] transition-transform duration-300 group-hover:scale-[1.04] sm:h-[180px] sm:w-[110px]"
              />
            </Link>

            {/* Compare button */}

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

          {/* =====================================================
              PRODUCT CONTENT
          ====================================================== */}

          <div className="min-w-0 flex-1">
            {/* Product name + price */}

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
                  Smartphone
                </p>
              </div>

              <div className="shrink-0 text-right">
                <div className="text-[19px] font-black tracking-tight text-slate-900 sm:text-[21px]">
                  {mobile.price}
                </div>

                <div className="mt-0.5 text-[10px] font-semibold text-emerald-600">
                  Best Price
                </div>
              </div>
            </div>

            {/* Rating + Spec Score */}

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="rounded-md bg-amber-400 px-1.5 py-1 text-[11px] font-black text-white">
                  {Number(mobile.rating).toFixed(1)}
                </span>

                <span className="text-[12px] font-bold tracking-tight text-amber-500">
                  ★★★★★
                </span>
              </div>

              <span className="h-4 w-px bg-slate-200" />

              <span className="rounded-md bg-gradient-to-r from-lime-500 to-emerald-500 px-2 py-1 text-[11px] font-bold text-white shadow-sm shadow-lime-100">
                {mobile.score} Spec Score
              </span>
            </div>

            {/* =================================================
                ACTION BAR
            ================================================== */}

            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-slate-100 py-2.5">
              <button
                type="button"
                className="group/action inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-500 transition-colors hover:text-indigo-600"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-50 text-[14px] font-black text-indigo-500 transition-colors group-hover/action:bg-indigo-500 group-hover/action:text-white">
                  +
                </span>
                Compare
              </button>

              <button
                type="button"
                className="group/action inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-500 transition-colors hover:text-pink-500"
              >
                <span className="text-[19px] leading-none text-pink-400 transition-transform group-hover/action:scale-110">
                  ♡
                </span>
                Like
              </button>

              <Link
                href={`/mobiles/${mobile.slug}`}
                className="group/action inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-500 transition-colors hover:text-indigo-600"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-50 text-[10px] text-amber-500">
                  ↗
                </span>

                View Details

                <span className="transition-transform group-hover/action:translate-x-0.5">
                  →
                </span>
              </Link>
            </div>

            {/* =================================================
                SPECIFICATIONS
            ================================================== */}

            <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-2.5 text-[12px] leading-[18px] text-slate-600 sm:grid-cols-2">
              {/* LEFT COLUMN */}

              <div className="space-y-2.5">
                <SpecItem>
                  {mobile.connectivity
                    ? mobile.connectivity
                    : "Connectivity information unavailable"}
                </SpecItem>

                <SpecItem>
                  {mobile.processor
                    ? mobile.processor
                    : "Processor information unavailable"}
                </SpecItem>

                <SpecItem>
                  {mobile.ram
                    ? `${mobile.ram} RAM, ${mobile.storage} inbuilt`
                    : `${mobile.storage} inbuilt`}
                </SpecItem>

                <SpecItem>
                  {mobile.battery
                    ? `${mobile.battery} Battery${
                        mobile.charging
                          ? ` with ${mobile.charging} Charging`
                          : ""
                      }`
                    : "Battery information unavailable"}
                </SpecItem>
              </div>

              {/* RIGHT COLUMN */}

              <div className="space-y-2.5">
                <SpecItem>
                  {mobile.display
                    ? `${mobile.display}${
                        mobile.displayType
                          ? ` ${mobile.displayType}`
                          : ""
                      } Display${
                        mobile.refreshRate
                          ? `, ${mobile.refreshRate}`
                          : ""
                      }`
                    : "Display information unavailable"}
                </SpecItem>

                <SpecItem>
                  {mobile.camera
                    ? `${mobile.camera} Rear Camera${
                        mobile.frontCamera
                          ? `, ${mobile.frontCamera} Front Camera`
                          : ""
                      }`
                    : "Camera information unavailable"}
                </SpecItem>

                {hasMemoryCard ? (
                  <SpecItem>
                    Memory Card Supported
                    {mobile.memoryCard
                      ? `: ${mobile.memoryCard}`
                      : ""}
                  </SpecItem>
                ) : (
                  <div className="flex items-start gap-2 text-red-500">
                    <span className="mt-[1px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-red-50 text-[9px] font-black">
                      ×
                    </span>

                    <span>Memory Card Not Supported</span>
                  </div>
                )}

                <SpecItem>
                  {mobile.operatingSystem
                    ? mobile.operatingSystem
                    : "Operating system information unavailable"}
                </SpecItem>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom hover accent */}

      <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-500 group-hover:w-full" />
    </article>
  );
}

/* =============================================================
   SPECIFICATION ITEM
============================================================= */

function SpecItem({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-[1px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[9px] font-black text-emerald-600">
        ✓
      </span>

      <span>{children}</span>
    </div>
  );
}