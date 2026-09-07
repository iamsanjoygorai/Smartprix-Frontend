"use client";

import { useState } from "react";
import LaptopCard, {
  Laptop,
} from "./LaptopCard";

interface LaptopListProps {
  laptops: Laptop[];
  loading?: boolean;
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

        // Maximum 4 products for comparison
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

  if (loading) {
    return (
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        {Array.from({ length: 5 }).map(
          (_, index) => (
            <div
              key={index}
              className="flex animate-pulse gap-6 border-b border-gray-200 px-5 py-6"
            >
              <div className="h-48 w-52 rounded bg-gray-200" />

              <div className="flex-1 space-y-4">
                <div className="h-4 w-24 rounded bg-gray-200" />
                <div className="h-6 w-3/5 rounded bg-gray-200" />
                <div className="h-4 w-2/5 rounded bg-gray-200" />
                <div className="h-4 w-4/5 rounded bg-gray-200" />
                <div className="h-4 w-3/5 rounded bg-gray-200" />
              </div>

              <div className="w-44 space-y-4">
                <div className="ml-auto h-7 w-28 rounded bg-gray-200" />
                <div className="ml-auto h-4 w-20 rounded bg-gray-200" />
                <div className="h-10 rounded bg-gray-200" />
              </div>
            </div>
          ),
        )}
      </div>
    );
  }

  if (!laptops.length) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white px-6 py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-400"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>

        <h3 className="mt-4 text-lg font-semibold text-gray-900">
          No laptops found
        </h3>

        <p className="mt-2 text-sm text-gray-500">
          Try changing your filters or search
          terms.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        {laptops.map((laptop) => (
          <LaptopCard
            key={laptop.id}
            laptop={laptop}
            isCompared={comparedLaptops.some(
              (item) => item.id === laptop.id,
            )}
            onCompareChange={
              handleCompareChange
            }
          />
        ))}
      </div>

      {/* Compare Bar */}
      {comparedLaptops.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-[300] border-t border-gray-200 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.12)]">
          <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
            <div className="shrink-0">
              <p className="text-sm font-semibold text-gray-900">
                Compare laptops
              </p>

              <p className="text-xs text-gray-500">
                {comparedLaptops.length}/4 selected
              </p>
            </div>

            <div className="flex min-w-0 flex-1 gap-3 overflow-x-auto">
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
                      className="flex min-w-[190px] items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
                    >
                      <div className="relative h-10 w-10 shrink-0">
                        {image?.url ? (
                          <img
                            src={image.url}
                            alt={laptop.name}
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <div className="h-full w-full rounded bg-gray-200" />
                        )}
                      </div>

                      <span className="min-w-0 flex-1 truncate text-xs font-medium text-gray-700">
                        {laptop.name}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          removeFromCompare(
                            laptop.id,
                          )
                        }
                        className="shrink-0 text-lg leading-none text-gray-400 hover:text-gray-700"
                        aria-label={`Remove ${laptop.name} from comparison`}
                      >
                        ×
                      </button>
                    </div>
                  );
                },
              )}
            </div>

            <button
              type="button"
              disabled={
                comparedLaptops.length < 2
              }
              className="shrink-0 rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              Compare Now
            </button>
          </div>
        </div>
      )}
    </>
  );
}

