"use client";

import { useState } from "react";

export type ProductTab =
  | "latest"
  | "popular"
  | "deals"
  | "upcoming";

interface ProductTabsProps {
  value?: ProductTab;
  onChange?: (tab: ProductTab) => void;
}

const tabs: Array<{
  id: ProductTab;
  label: string;
}> = [
  {
    id: "latest",
    label: "Latest",
  },
  {
    id: "popular",
    label: "Popular",
  },
  {
    id: "deals",
    label: "Best Deals",
  },
  {
    id: "upcoming",
    label: "Upcoming",
  },
];

export default function ProductTabs({
  value,
  onChange,
}: ProductTabsProps) {
  const [internalTab, setInternalTab] =
    useState<ProductTab>("latest");

  const activeTab = value ?? internalTab;

  const handleChange = (tab: ProductTab) => {
    setInternalTab(tab);
    onChange?.(tab);
  };

  return (
    <div className="mb-5 overflow-x-auto scrollbar-none">
      <div className="flex min-w-max items-center gap-1 rounded-xl bg-slate-100 p-1">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleChange(tab.id)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                active
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}