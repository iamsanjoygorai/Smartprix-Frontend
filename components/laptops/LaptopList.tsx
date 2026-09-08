"use client";

import Image from "next/image";
import { useState } from "react";

import LaptopCard, {
  Laptop,
} from "./LaptopCard";

interface LaptopListProps {
  laptops: Laptop[];
  loading?: boolean;
}

function CompareIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect
        x="3"
        y="4"
        width="7"
        height="16"
        rx="1"
      />
      <rect
        x="14"
        y="4"
        width="7"
        height="16"
        rx="1"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-7 w-7"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4.3-4.3" />
    </svg>
  );
}

export default function LaptopList({
  laptops,
  loading = false,
}: LaptopListProps) {
  const [comparedLaptops, setComparedLaptops] =
    useState<Laptop[]>([]);

  const handleCompareChange = (
    laptop: Laptop,
    selected: boolean,
  ) => {
    setComparedLaptops((current) => {
      if (selected) {
        if (
          current.some(
            (item) => item.id === laptop.id,
          )
        ) {
          return current;
        }

        if (current.length >= 4) {
          return current;
        }

        return [...current, laptop];
      }

      return current.filter(
        (item) => item.id !== laptop.id,
      );
    });
  };

  const removeFromCompare = (id: string) => {
    setComparedLaptops((current) =>
      current.filter(
        (laptop) => laptop.id !== id,
      ),
    );
  };

  const clearCompare = () => {
    setComparedLaptops([]);
  };

  /*
   * ======================================================
   * LOADING
   * ======================================================
   */

  if (loading) {
    return (
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        {Array.from({ length: 5 }).map(
          (_, index) => (
            <div
              key={index}
              className="flex animate-pulse flex-col gap-5 border-b border-gray-200 px-4 py-6 last:border-b-0 sm:px-6 lg:flex-row"
            >
              {/* Image skeleton */}
              <div className="flex w-full shrink-0 justify-center lg:w-56">
                <div className="h-52 w-52 rounded-lg bg-gray-200" />
              </div>

              {/* Information skeleton */}
              <div className="min-w-0 flex-1 space-y-4">
                <div className="h-3 w-20 rounded bg-gray-200" />

                <div className="h-6 w-3/4 rounded bg-gray-200" />

                <div className="h-5 w-24 rounded bg-gray-200" />

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="h-4 rounded bg-gray-200" />
                  <div className="h-4 rounded bg-gray-200" />
                  <div className="h-4 rounded bg-gray-200" />
                  <div className="h-4 rounded bg-gray-200" />
                </div>

                <div className="h-4 w-2/3 rounded bg-gray-200" />
              </div>

              {/* Price skeleton */}
              <div className="w-full space-y-4 border-t border-gray-100 pt-5 lg:w-48 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                <div className="ml-auto h-7 w-28 rounded bg-gray-200" />

                <div className="ml-auto h-3 w-20 rounded bg-gray-200" />

                <div className="h-9 rounded bg-gray-200" />

                <div className="h-10 rounded bg-gray-200" />
              </div>
            </div>
          ),
        )}
      </div>
    );
  }

  /*
   * ======================================================
   * EMPTY STATE
   * ======================================================
   */

  if (!laptops.length) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white px-6 py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
          <SearchIcon />
        </div>

        <h3 className="mt-5 text-lg font-semibold text-gray-900">
          No laptops found
        </h3>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
          We couldn't find any laptops matching
          your current search or filters. Try
          removing some filters or using a
          different search term.
        </p>
      </div>
    );
  }

  /*
   * ======================================================
   * PRODUCT LIST
   * ======================================================
   */

  return (
    <>
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        {laptops.map((laptop) => (
          <LaptopCard
            key={laptop.id}
            laptop={laptop}
            isCompared={comparedLaptops.some(
              (item) =>
                item.id === laptop.id,
            )}
            onCompareChange={
              handleCompareChange
            }
          />
        ))}
      </div>

      {/*
       * ==================================================
       * COMPARE BAR
       * ==================================================
       */}

      {comparedLaptops.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-[300] border-t border-gray-200 bg-white shadow-[0_-6px_24px_rgba(0,0,0,0.12)]">
          <div className="mx-auto max-w-7xl px-3 py-3 sm:px-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              {/* Compare heading */}
              <div className="flex shrink-0 items-center justify-between lg:w-40">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                    <CompareIcon />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Compare laptops
                    </p>

                    <p className="text-xs text-gray-500">
                      {comparedLaptops.length}/4
                      selected
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={clearCompare}
                  className="text-xs font-medium text-gray-500 hover:text-gray-900 lg:hidden"
                >
                  Clear
                </button>
              </div>

              {/* Selected products */}
              <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto pb-1">
                {comparedLaptops.map(
                  (laptop) => {
                    const image =
                      laptop.images?.find(
                        (item) =>
                          item.isPrimary,
                      ) ??
                      laptop.images?.[0];

                    return (
                      <div
                        key={laptop.id}
                        className="flex min-w-[210px] items-center gap-2.5 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-2"
                      >
                        {/* Thumbnail */}
                        <div className="relative h-11 w-11 shrink-0 rounded bg-white">
                          {image?.url ? (
                            <Image
                              src={image.url}
                              alt={laptop.name}
                              fill
                              sizes="44px"
                              className="object-contain p-1"
                            />
                          ) : (
                            <div className="h-full w-full rounded bg-gray-200" />
                          )}
                        </div>

                        {/* Name */}
                        <span className="min-w-0 flex-1 truncate text-xs font-medium text-gray-700">
                          {laptop.name}
                        </span>

                        {/* Remove */}
                        <button
                          type="button"
                          onClick={() =>
                            removeFromCompare(
                              laptop.id,
                            )
                          }
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-200 hover:text-gray-700"
                          aria-label={`Remove ${laptop.name} from comparison`}
                        >
                          <CloseIcon />
                        </button>
                      </div>
                    );
                  },
                )}

                {/* Empty comparison slots */}
                {Array.from({
                  length:
                    4 -
                    comparedLaptops.length,
                }).map((_, index) => (
                  <div
                    key={`empty-${index}`}
                    className="hidden min-w-[150px] items-center justify-center rounded-lg border border-dashed border-gray-200 px-3 py-2 text-xs text-gray-400 sm:flex"
                  >
                    Add laptop
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={clearCompare}
                  className="hidden px-3 py-2 text-xs font-medium text-gray-500 hover:text-gray-900 lg:block"
                >
                  Clear all
                </button>

                <button
                  type="button"
                  disabled={
                    comparedLaptops.length < 2
                  }
                  className="flex-1 rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 lg:flex-none"
                >
                  Compare Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
