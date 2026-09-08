"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const ProductTinyEditor = dynamic(
  () => import("@/components/admin/products/ProductTinyEditor"),
  {
    ssr: false,
  },
);

interface ProductEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function ProductEditor({
  value,
  onChange,
}: ProductEditorProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-900">
          Product Description
        </h2>

        <p className="mt-1 text-xs text-gray-500">
          Create a rich product description using the visual editor.
        </p>
      </div>

      <ProductTinyEditor value={value} onChange={onChange} />
    </div>
  );
}