"use client";

import { useState } from "react";
import type { ProductImage } from "@/types/product";

interface ProductImageGalleryProps {
  images: ProductImage[];
  productName: string;
}

export default function ProductImageGallery({
  images,
  productName,
}: ProductImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [thumbnailStart, setThumbnailStart] = useState(0);

  const selectedImage = images[selectedIndex];

  // Always show 4 thumbnail slots
  const thumbnailSlots = Array.from({ length: 4 }, (_, index) => {
    const actualIndex = thumbnailStart + index;
    return images[actualIndex] ?? null;
  });

  const canGoPrevious = thumbnailStart > 0;
  const canGoNext = thumbnailStart + 4 < images.length;

  const handlePrevious = () => {
    if (canGoPrevious) {
      setThumbnailStart((current) => current - 1);
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      setThumbnailStart((current) => current + 1);
    }
  };

  const handleThumbnailClick = (index: number) => {
    const actualIndex = thumbnailStart + index;

    if (actualIndex < images.length) {
      setSelectedIndex(actualIndex);
    }
  };

  return (
    <div className="w-full">
      {/* Main Image */}
      <div className="flex h-[450px] w-full items-center justify-center rounded-xl bg-gray-50 p-6">
        {selectedImage ? (
          <img
            src={selectedImage.url}
            alt={selectedImage.altText ?? productName}
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <div className="text-sm text-gray-400">
            No image available
          </div>
        )}
      </div>

      {/* Thumbnail Row */}
      <div className="mt-4 flex w-full items-center justify-center gap-3">
        {/* Left Arrow */}
        <button
          type="button"
          onClick={handlePrevious}
          disabled={!canGoPrevious}
          aria-label="Previous thumbnails"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-2xl text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30"
        >
          ‹
        </button>

        {/* Exactly 4 Thumbnail Slots */}
        <div className="flex gap-3 overflow-hidden">
          {thumbnailSlots.map((image, index) => {
            const actualIndex = thumbnailStart + index;
            const isSelected = actualIndex === selectedIndex;

            return (
              <button
                key={image?.id ?? `placeholder-${actualIndex}`}
                type="button"
                onClick={() => handleThumbnailClick(index)}
                disabled={!image}
                aria-label={
                  image
                    ? `View image ${actualIndex + 1}`
                    : "Image placeholder"
                }
                className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-white p-2 transition ${
                  image
                    ? isSelected
                      ? "border-2 border-blue-600"
                      : "border border-gray-200 hover:border-gray-400"
                    : "cursor-default border border-dashed border-gray-300"
                }`}
              >
                {image ? (
                  <img
                    src={image.url}
                    alt={
                      image.altText ??
                      `${productName} image ${actualIndex + 1}`
                    }
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <span className="text-2xl text-gray-300">
                    +
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Arrow */}
        <button
          type="button"
          onClick={handleNext}
          disabled={!canGoNext}
          aria-label="Next thumbnails"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-2xl text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30"
        >
          ›
        </button>
      </div>
    </div>
  );
}