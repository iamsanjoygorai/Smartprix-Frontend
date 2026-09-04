"use client";

import { useEffect, useState } from "react";
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
  const [slideDirection, setSlideDirection] = useState<"left" | "right">(
    "left",
  );
  const [isSliding, setIsSliding] = useState(false);

  const selectedImage = images[selectedIndex];

  // Reset selected image if images change
  useEffect(() => {
    if (selectedIndex >= images.length) {
      setSelectedIndex(0);
    }

    if (thumbnailStart >= images.length) {
      setThumbnailStart(0);
    }
  }, [images.length, selectedIndex, thumbnailStart]);

  const updateThumbnailPosition = (index: number) => {
  if (images.length <= 4) {
    setThumbnailStart(0);
    return;
  }

  setThumbnailStart((current) => {
    // Going from last image to first
    if (index === 0) {
      return 0;
    }

    // Going from first image to last
    if (index === images.length - 1) {
      return images.length - 4;
    }

    // Keep selected image visible
    if (index < current) {
      return index;
    }

    if (index >= current + 4) {
      return index - 3;
    }

    return current;
  });
};

  const changeImage = (newIndex: number) => {
    if (
      newIndex < 0 ||
      newIndex >= images.length ||
      newIndex === selectedIndex
    ) {
      return;
    }

    setSlideDirection(
      newIndex > selectedIndex ? "left" : "right",
    );

    setIsSliding(false);

    // Restart animation
    requestAnimationFrame(() => {
      setSelectedIndex(newIndex);
      setIsSliding(true);
    });
  };

  const handlePrevious = () => {
  if (images.length <= 1) return;

  const newIndex =
    selectedIndex === 0
      ? images.length - 1
      : selectedIndex - 1;

  changeImage(newIndex);
};

  const handleNext = () => {
  if (images.length <= 1) return;

  const newIndex =
    selectedIndex === images.length - 1
      ? 0
      : selectedIndex + 1;

  changeImage(newIndex);
};

  const canGoPrevious = thumbnailStart > 0;
  const canGoNext = thumbnailStart + 4 < images.length;

  const handleThumbnailPrevious = () => {
  if (images.length <= 1) return;

  const newIndex =
    selectedIndex === 0
      ? images.length - 1
      : selectedIndex - 1;

  changeImage(newIndex);
};

const handleThumbnailNext = () => {
  if (images.length <= 1) return;

  const newIndex =
    selectedIndex === images.length - 1
      ? 0
      : selectedIndex + 1;

  changeImage(newIndex);
};

  const handleThumbnailClick = (index: number) => {
    const actualIndex = thumbnailStart + index;

    if (actualIndex < images.length) {
      changeImage(actualIndex);
    }
  };

  const thumbnailSlots = Array.from({ length: 4 }, (_, index) => {
    const actualIndex = thumbnailStart + index;
    return images[actualIndex] ?? null;
  });

  return (
    <div className="mx-auto w-full max-w-[500px]">
      {/* Main Image */}
      <div className="relative h-[450px] w-full overflow-hidden rounded-xl bg-gray-50 p-6">
        {selectedImage ? (
          <div
            key={selectedImage.id}
            className={`flex h-full w-full items-center justify-center ${
              isSliding
                ? slideDirection === "left"
                  ? "animate-slide-left"
                  : "animate-slide-right"
                : ""
            }`}
            onAnimationEnd={() => setIsSliding(false)}
          >
            <img
              src={selectedImage.url}
              alt={selectedImage.altText ?? productName}
              className="max-h-full max-w-full object-contain"
            />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            No image available
          </div>
        )}

        {/* Main image arrows */}
        {images.length > 1 && (
          <>
            <button
  type="button"
  onClick={handlePrevious}
  aria-label="Previous image"
  className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-2xl text-gray-700 shadow-md transition hover:bg-gray-100"
>
  ‹
</button>

<button
  type="button"
  onClick={handleNext}
  aria-label="Next image"
  className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-2xl text-gray-700 shadow-md transition hover:bg-gray-100"
>
  ›
</button>
          </>
        )}
      </div>

      {/* Thumbnail Navigation */}
      <div className="mt-4 flex w-full items-center justify-center gap-3">
        <button
  type="button"
  onClick={handleThumbnailPrevious}
  aria-label="Previous thumbnails"
  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-2xl text-gray-700 shadow-sm transition hover:bg-gray-50"
>
  ‹
</button>

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

        <button
  type="button"
  onClick={handleThumbnailNext}
  aria-label="Next thumbnails"
  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-2xl text-gray-700 shadow-sm transition hover:bg-gray-50"
>
  ›
</button>
      </div>  

      {/* Animation */}
      <style jsx>{`
  @keyframes slideLeft {
  from {
    transform: translateX(60px);
    opacity: 0;
  }

  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideRight {
  from {
    transform: translateX(-60px);
    opacity: 0;
  }

  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-left {
  animation: slideLeft 450ms cubic-bezier(0.22, 1, 0.36, 1);
}

.animate-slide-right {
  animation: slideRight 450ms cubic-bezier(0.22, 1, 0.36, 1);
}
`}</style>
    </div>
  );
}