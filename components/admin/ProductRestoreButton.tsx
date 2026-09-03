"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { restoreProduct } from "@/lib/api/adminProducts";

interface ProductRestoreButtonProps {
  productId: string;
  productName: string;
}

export default function ProductRestoreButton({
  productId,
  productName,
}: ProductRestoreButtonProps) {
  const router = useRouter();
  const [restoring, setRestoring] = useState(false);

  async function handleRestore() {
    const confirmed = window.confirm(
      `Are you sure you want to restore "${productName}"?`,
    );

    if (!confirmed) {
      return;
    }

    setRestoring(true);

    try {
      await restoreProduct(productId);
      router.refresh();
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Failed to restore product.",
      );
    } finally {
      setRestoring(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleRestore}
      disabled={restoring}
      className="rounded-md bg-green-600 px-3 py-2 text-xs font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {restoring ? "Restoring..." : "Restore"}
    </button>
  );
}