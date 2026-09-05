"use client";

export default function ImageSkeleton({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden bg-red-500 ${className}`}
    >
      <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-red-500 via-red-300 to-red-500" />
    </div>
  );
}