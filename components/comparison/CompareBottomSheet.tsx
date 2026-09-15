"use client";

import { X, Sparkles, GitCompareArrows } from "lucide-react";
import { useEffect } from "react";

import { useCompare } from "./CompareProvider";
import CompareProductPicker from "./CompareProductPicker";
import CompareProductSlot from "./CompareProductSlot";

/* =========================================================
   COMPONENT
========================================================= */

export default function CompareBottomSheet() {
  const {
  products,
  availableProducts,
  selectedProductIds,
  maxProducts,
  canAddProduct,
  canCompare,

  removeProduct,

  isCompareSheetOpen,
  closeCompareSheet,

  openProductPicker,

  isProductPickerOpen,
  closeProductPicker,

  addProduct,

  compareNow,
} = useCompare();

  /* =======================================================
     ESCAPE KEY
  ======================================================= */

  useEffect(() => {
    if (!isCompareSheetOpen || isProductPickerOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeCompareSheet();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    isCompareSheetOpen,
    isProductPickerOpen,
    closeCompareSheet,
  ]);

  /* =======================================================
     CLOSED
  ======================================================= */

  if (!isCompareSheetOpen) {
    return null;
  }

  /* =======================================================
     EMPTY QUEUE SAFETY
  ======================================================= */

  const productSlots = Array.from(
    { length: maxProducts },
    (_, index) => products[index] ?? null,
  );

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      {/* ===================================================
          BACKDROP
      =================================================== */}

      <div
        className="fixed inset-0 z-[80] bg-slate-950/45 backdrop-blur-[2px]"
        onClick={closeCompareSheet}
        aria-hidden="true"
      />

      {/* ===================================================
          BOTTOM SHEET
      =================================================== */}

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="compare-queue-title"
        className="fixed inset-x-0 bottom-0 z-[90] flex max-h-[92vh] justify-center"
      >
        <div className="flex w-full max-w-5xl flex-col overflow-hidden rounded-t-[30px] border border-white/70 bg-white shadow-[0_-25px_80px_rgba(15,23,42,0.28)]">
          {/* ===============================================
              TOP ACCENT
          =============================================== */}

          <div className="h-1.5 w-full bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600" />

          {/* ===============================================
              HEADER
          =============================================== */}

          <div className="flex items-center justify-between gap-4 px-5 pb-4 pt-5 sm:px-7 sm:pt-6">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-500/20">
                <GitCompareArrows
                  size={21}
                  strokeWidth={2.3}
                />
              </div>

              <div className="min-w-0">
                <h2
                  id="compare-queue-title"
                  className="text-base font-extrabold tracking-tight text-slate-950 sm:text-lg"
                >
                  {products.length} product
                  {products.length === 1 ? "" : "s"} in your
                  compare queue
                </h2>

                <p className="mt-0.5 text-xs font-medium text-slate-500">
                  Choose up to {maxProducts} products to
                  compare side by side.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={closeCompareSheet}
              aria-label="Close comparison queue"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 active:scale-95"
            >
              <X size={19} />
            </button>
          </div>

          {/* ===============================================
              QUEUE CONTENT
          =============================================== */}

          <div className="min-h-0 overflow-y-auto bg-slate-50/70 px-4 pb-5 sm:px-6">
            <div className="grid grid-cols-2 gap-3 pt-1 sm:grid-cols-4">
              {productSlots.map((product, index) => (
                <CompareProductSlot
                  key={
                    product?.id ??
                    `empty-compare-slot-${index}`
                  }
                  product={product}
                  isPrimary={index === 0 && Boolean(product)}
                  onRemove={
                    product
                      ? removeProduct
                      : undefined
                  }
                  onAdd={
                    !product && canAddProduct
                      ? openProductPicker
                      : undefined
                  }
                  disabled={!product && !canAddProduct}
                />
              ))}
            </div>

            {/* =============================================
                STATUS
            ============================================= */}

            <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className={[
                    "h-2.5 w-2.5 shrink-0 rounded-full",
                    canCompare
                      ? "bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]"
                      : "bg-amber-400 shadow-[0_0_0_4px_rgba(251,191,36,0.12)]",
                  ].join(" ")}
                />

                <p className="truncate text-xs font-semibold text-slate-600">
                  {canCompare
                    ? "Ready to compare"
                    : "Add at least one more product to compare"}
                </p>
              </div>

              <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-extrabold text-slate-500">
                {products.length}/{maxProducts}
              </span>
            </div>
          </div>

          {/* ===============================================
              FOOTER
          =============================================== */}

          <div className="border-t border-slate-200 bg-white px-5 py-4 sm:px-7">
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              {/* LEFT */}

              <div className="flex items-center gap-2">
                <Sparkles
                  size={16}
                  className="text-violet-500"
                />

                <p className="text-xs font-medium text-slate-500">
                  Compare specifications, prices and ratings
                  side by side.
                </p>
              </div>

              {/* RIGHT */}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={openProductPicker}
                  disabled={!canAddProduct}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  + Add Product
                </button>

                <button
                  type="button"
                  onClick={compareNow}
                  disabled={!canCompare}
                  className={[
                    "rounded-xl px-5 py-2.5 text-xs font-extrabold text-white shadow-lg transition active:scale-[0.98]",
                    canCompare
                      ? "bg-gradient-to-r from-blue-600 to-violet-600 shadow-blue-500/20 hover:from-blue-700 hover:to-violet-700"
                      : "cursor-not-allowed bg-slate-300 shadow-none",
                  ].join(" ")}
                >
                  Compare Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
          PRODUCT PICKER
      =================================================== */}

     <CompareProductPicker
  open={isProductPickerOpen}
  products={availableProducts}
  selectedProductIds={selectedProductIds}
  onSelect={(product) => {
    addProduct(product);
    closeProductPicker();
  }}
  onClose={closeProductPicker}
  maxProducts={maxProducts}
/>
    </>
  );
}
