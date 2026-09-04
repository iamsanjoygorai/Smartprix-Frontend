"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { apiFetch } from "@/lib/api/client";
import { getBrands } from "@/lib/api/brands";
import { getCategories } from "@/lib/api/categories";
import { getSellers } from "@/lib/api/sellers";

import type { ApiResponse } from "@/types/api";
import type { Product } from "@/types/product";

import type { AdminBrand } from "@/lib/api/brands";
import type { AdminCategory } from "@/lib/api/categories";
import type { AdminSeller } from "@/lib/api/sellers";

type SectionId =
  | "basic"
  | "media"
  | "variants"
  | "general"
  | "design"
  | "display"
  | "hardware"
  | "memory"
  | "camera"
  | "video"
  | "connectivity"
  | "battery"
  | "software"
  | "features"
  | "sensors"
  | "ai"
  | "seo";

interface Section {
  id: SectionId;
  label: string;
  group: "product" | "specifications";
}

interface FormOptions {
  brands: AdminBrand[];
  categories: AdminCategory[];
  sellers: AdminSeller[];
}

interface SpecificationField {
  key: string;
  label: string;
  placeholder?: string;
  unit?: string;
  type?: "text" | "number" | "textarea" | "select" | "boolean";
  options?: string[];
}

const sections: Section[] = [
  { id: "basic", label: "Basic Information", group: "product" },
  { id: "media", label: "Media", group: "product" },
  { id: "variants", label: "Variants & Pricing", group: "product" },

  { id: "general", label: "General", group: "specifications" },
  { id: "design", label: "Design & Build", group: "specifications" },
  { id: "display", label: "Display", group: "specifications" },
  { id: "hardware", label: "Performance", group: "specifications" },
  { id: "memory", label: "Memory & Storage", group: "specifications" },
  { id: "camera", label: "Camera", group: "specifications" },
  { id: "video", label: "Video", group: "specifications" },
  { id: "connectivity", label: "Connectivity", group: "specifications" },
  { id: "battery", label: "Battery & Charging", group: "specifications" },
  { id: "software", label: "Software", group: "specifications" },
  { id: "features", label: "Features", group: "specifications" },
  { id: "sensors", label: "Sensors", group: "specifications" },
  { id: "ai", label: "AI Features", group: "specifications" },

  { id: "seo", label: "SEO", group: "product" },
];

const specificationFields: Record<
  Exclude<SectionId, "basic" | "media" | "variants" | "seo">,
  SpecificationField[]
> = {
  general: [
    {
      key: "launch-date",
      label: "Launch Date",
      type: "text",
      placeholder: "e.g. January 2025",
    },
    {
      key: "announced-date",
      label: "Announced Date",
      type: "text",
      placeholder: "e.g. January 2025",
    },
    {
      key: "operating-system",
      label: "Operating System",
      type: "text",
      placeholder: "e.g. Android",
    },
    {
      key: "os-version",
      label: "OS Version",
      type: "text",
      placeholder: "e.g. Android 15",
    },
    {
      key: "sim-type",
      label: "SIM Type",
      type: "select",
      options: ["Nano SIM", "eSIM", "Nano SIM + eSIM", "Dual Nano SIM"],
    },
    {
      key: "number-of-sims",
      label: "Number of SIMs",
      type: "number",
      placeholder: "2",
    },
    {
      key: "network",
      label: "Network",
      type: "text",
      placeholder: "e.g. 2G, 3G, 4G, 5G",
    },
    {
      key: "5g",
      label: "5G",
      type: "boolean",
    },
    {
      key: "4g",
      label: "4G",
      type: "boolean",
    },
    {
      key: "model-number",
      label: "Model Number",
      type: "text",
      placeholder: "e.g. SM-S938B",
    },
  ],

  design: [
    {
      key: "height",
      label: "Height",
      type: "number",
      unit: "mm",
    },
    {
      key: "width",
      label: "Width",
      type: "number",
      unit: "mm",
    },
    {
      key: "thickness",
      label: "Thickness",
      type: "number",
      unit: "mm",
    },
    {
      key: "weight",
      label: "Weight",
      type: "number",
      unit: "g",
    },
    {
      key: "build-material",
      label: "Build Material",
      type: "text",
      placeholder: "e.g. Titanium",
    },
    {
      key: "frame-material",
      label: "Frame Material",
      type: "text",
      placeholder: "e.g. Titanium",
    },
    {
      key: "back-material",
      label: "Back Material",
      type: "text",
      placeholder: "e.g. Glass",
    },
    {
      key: "water-resistance",
      label: "Water Resistance",
      type: "boolean",
    },
    {
      key: "ip-rating",
      label: "IP Rating",
      type: "select",
      options: ["IP54", "IP55", "IP57", "IP58", "IP67", "IP68", "IP69"],
    },
    {
      key: "colors",
      label: "Colors",
      type: "text",
      placeholder: "e.g. Titanium Black, Titanium Gray",
    },
  ],

  display: [
    {
      key: "display-type",
      label: "Display Type",
      type: "text",
      placeholder: "e.g. Dynamic AMOLED 2X",
    },
    {
      key: "screen-size",
      label: "Screen Size",
      type: "number",
      unit: "inch",
    },
    {
      key: "resolution",
      label: "Resolution",
      type: "text",
      placeholder: "e.g. 3120 × 1440",
    },
    {
      key: "resolution-type",
      label: "Resolution Type",
      type: "select",
      options: ["HD+", "Full HD+", "QHD+", "2K", "4K"],
    },
    {
      key: "refresh-rate",
      label: "Refresh Rate",
      type: "number",
      unit: "Hz",
    },
    {
      key: "touch-sampling-rate",
      label: "Touch Sampling Rate",
      type: "number",
      unit: "Hz",
    },
    {
      key: "peak-brightness",
      label: "Peak Brightness",
      type: "number",
      unit: "nits",
    },
    {
      key: "hdr",
      label: "HDR",
      type: "boolean",
    },
    {
      key: "hdr10-plus",
      label: "HDR10+",
      type: "boolean",
    },
    {
      key: "display-protection",
      label: "Display Protection",
      type: "text",
      placeholder: "e.g. Gorilla Armor",
    },
    {
      key: "always-on-display",
      label: "Always On Display",
      type: "boolean",
    },
    {
      key: "screen-to-body-ratio",
      label: "Screen-to-Body Ratio",
      type: "number",
      unit: "%",
    },
  ],

  hardware: [
    {
      key: "processor",
      label: "Processor",
      type: "text",
      placeholder: "e.g. Snapdragon 8 Elite",
    },
    {
      key: "chipset",
      label: "Chipset",
      type: "text",
      placeholder: "e.g. Snapdragon 8 Elite",
    },
    {
      key: "cpu",
      label: "CPU",
      type: "text",
      placeholder: "e.g. Octa Core",
    },
    {
      key: "cpu-architecture",
      label: "CPU Architecture",
      type: "text",
      placeholder: "e.g. 64-bit",
    },
    {
      key: "cpu-speed",
      label: "CPU Speed",
      type: "number",
      unit: "GHz",
    },
    {
      key: "cpu-cores",
      label: "CPU Cores",
      type: "number",
    },
    {
      key: "gpu",
      label: "GPU",
      type: "text",
      placeholder: "e.g. Adreno",
    },
    {
      key: "cooling-system",
      label: "Cooling System",
      type: "text",
      placeholder: "e.g. Vapor Chamber",
    },
    {
      key: "antutu-score",
      label: "AnTuTu Score",
      type: "number",
    },
    {
      key: "geekbench-single",
      label: "Geekbench Single Core",
      type: "number",
    },
    {
      key: "geekbench-multi",
      label: "Geekbench Multi Core",
      type: "number",
    },
  ],

  memory: [
    {
      key: "ram",
      label: "RAM",
      type: "text",
      placeholder: "e.g. 12 GB",
    },
    {
      key: "internal-storage",
      label: "Internal Storage",
      type: "text",
      placeholder: "e.g. 256 GB",
    },
    {
      key: "storage-type",
      label: "Storage Type",
      type: "select",
      options: ["UFS 3.1", "UFS 4.0", "UFS 4.1", "NVMe"],
    },
    {
      key: "memory-card",
      label: "Memory Card",
      type: "boolean",
    },
    {
      key: "expandable-storage",
      label: "Expandable Storage",
      type: "text",
      placeholder: "e.g. Up to 1 TB",
    },
  ],

  camera: [
    {
      key: "rear-camera",
      label: "Rear Camera Setup",
      type: "text",
      placeholder: "e.g. Triple Camera",
    },
    {
      key: "main-camera",
      label: "Main Camera",
      type: "text",
      placeholder: "e.g. 200 MP",
    },
    {
      key: "ultra-wide",
      label: "Ultra Wide",
      type: "text",
      placeholder: "e.g. 50 MP",
    },
    {
      key: "telephoto",
      label: "Telephoto",
      type: "text",
      placeholder: "e.g. 50 MP",
    },
    {
      key: "periscope",
      label: "Periscope",
      type: "text",
      placeholder: "e.g. 50 MP",
    },
    {
      key: "macro",
      label: "Macro",
      type: "text",
      placeholder: "e.g. 2 MP",
    },
    {
      key: "ois",
      label: "Optical Image Stabilization",
      type: "boolean",
    },
    {
      key: "autofocus",
      label: "Autofocus",
      type: "boolean",
    },
    {
      key: "laser-autofocus",
      label: "Laser Autofocus",
      type: "boolean",
    },
    {
      key: "flash",
      label: "Flash",
      type: "text",
      placeholder: "e.g. LED",
    },
    {
      key: "front-camera",
      label: "Front Camera",
      type: "text",
      placeholder: "e.g. 12 MP",
    },
  ],

  video: [
    {
      key: "rear-video",
      label: "Rear Video",
      type: "text",
      placeholder: "e.g. 8K @ 30fps",
    },
    {
      key: "front-video",
      label: "Front Video",
      type: "text",
      placeholder: "e.g. 4K @ 60fps",
    },
    {
      key: "8k-video",
      label: "8K Video",
      type: "boolean",
    },
    {
      key: "4k-video",
      label: "4K Video",
      type: "boolean",
    },
    {
      key: "slow-motion",
      label: "Slow Motion",
      type: "text",
      placeholder: "e.g. 1080p @ 240fps",
    },
    {
      key: "video-stabilization",
      label: "Video Stabilization",
      type: "boolean",
    },
  ],

  connectivity: [
    {
      key: "wifi",
      label: "Wi-Fi",
      type: "text",
      placeholder: "e.g. Wi-Fi 7",
    },
    {
      key: "wifi-version",
      label: "Wi-Fi Version",
      type: "text",
      placeholder: "e.g. 802.11be",
    },
    {
      key: "bluetooth",
      label: "Bluetooth",
      type: "boolean",
    },
    {
      key: "bluetooth-version",
      label: "Bluetooth Version",
      type: "text",
      placeholder: "e.g. 5.4",
    },
    {
      key: "nfc",
      label: "NFC",
      type: "boolean",
    },
    {
      key: "gps",
      label: "GPS",
      type: "boolean",
    },
    {
      key: "usb-type",
      label: "USB Type",
      type: "text",
      placeholder: "e.g. USB Type-C",
    },
    {
      key: "usb-version",
      label: "USB Version",
      type: "text",
      placeholder: "e.g. USB 3.2",
    },
    {
      key: "usb-otg",
      label: "USB OTG",
      type: "boolean",
    },
    {
      key: "infrared",
      label: "Infrared",
      type: "boolean",
    },
    {
      key: "headphone-jack",
      label: "Headphone Jack",
      type: "boolean",
    },
  ],

  battery: [
    {
      key: "battery-capacity",
      label: "Battery Capacity",
      type: "number",
      unit: "mAh",
    },
    {
      key: "battery-type",
      label: "Battery Type",
      type: "text",
      placeholder: "e.g. Li-Ion",
    },
    {
      key: "removable-battery",
      label: "Removable",
      type: "boolean",
    },
    {
      key: "fast-charging",
      label: "Fast Charging",
      type: "boolean",
    },
    {
      key: "charging-wattage",
      label: "Charging Wattage",
      type: "number",
      unit: "W",
    },
    {
      key: "wireless-charging",
      label: "Wireless Charging",
      type: "boolean",
    },
    {
      key: "wireless-charging-wattage",
      label: "Wireless Charging Wattage",
      type: "number",
      unit: "W",
    },
    {
      key: "reverse-wireless-charging",
      label: "Reverse Wireless Charging",
      type: "boolean",
    },
  ],

  software: [
    {
      key: "android-version",
      label: "Android Version",
      type: "text",
      placeholder: "e.g. Android 15",
    },
    {
      key: "ui",
      label: "User Interface",
      type: "text",
      placeholder: "e.g. One UI 7",
    },
    {
      key: "major-android-updates",
      label: "Major Android Updates",
      type: "number",
    },
    {
      key: "security-updates",
      label: "Security Updates",
      type: "text",
      placeholder: "e.g. 7 years",
    },
    {
      key: "update-support-until",
      label: "Update Support Until",
      type: "text",
      placeholder: "e.g. 2032",
    },
  ],

  features: [
    {
      key: "fingerprint-sensor",
      label: "Fingerprint Sensor",
      type: "boolean",
    },
    {
      key: "face-unlock",
      label: "Face Unlock",
      type: "boolean",
    },
    {
      key: "stereo-speakers",
      label: "Stereo Speakers",
      type: "boolean",
    },
    {
      key: "dolby-atmos",
      label: "Dolby Atmos",
      type: "boolean",
    },
    {
      key: "dual-sim",
      label: "Dual SIM",
      type: "boolean",
    },
    {
      key: "esim",
      label: "eSIM",
      type: "boolean",
    },
    {
      key: "desktop-mode",
      label: "Desktop Mode",
      type: "boolean",
    },
    {
      key: "fm-radio",
      label: "FM Radio",
      type: "boolean",
    },
  ],

  sensors: [
    {
      key: "accelerometer",
      label: "Accelerometer",
      type: "boolean",
    },
    {
      key: "gyroscope",
      label: "Gyroscope",
      type: "boolean",
    },
    {
      key: "proximity",
      label: "Proximity Sensor",
      type: "boolean",
    },
    {
      key: "compass",
      label: "Compass",
      type: "boolean",
    },
    {
      key: "barometer",
      label: "Barometer",
      type: "boolean",
    },
    {
      key: "ambient-light-sensor",
      label: "Ambient Light Sensor",
      type: "boolean",
    },
  ],

  ai: [
    {
      key: "ai-assistant",
      label: "AI Assistant",
      type: "text",
      placeholder: "e.g. Gemini",
    },
    {
      key: "circle-to-search",
      label: "Circle to Search",
      type: "boolean",
    },
    {
      key: "ai-eraser",
      label: "AI Eraser",
      type: "boolean",
    },
    {
      key: "generative-edit",
      label: "Generative Edit",
      type: "boolean",
    },
    {
      key: "live-translate",
      label: "Live Translate",
      type: "boolean",
    },
    {
      key: "interpreter",
      label: "Interpreter",
      type: "boolean",
    },
    {
      key: "writing-assist",
      label: "Writing Assist",
      type: "boolean",
    },
    {
      key: "note-assist",
      label: "Note Assist",
      type: "boolean",
    },
    {
      key: "transcript-assist",
      label: "Transcript Assist",
      type: "boolean",
    },
    {
      key: "browsing-assist",
      label: "Browsing Assist",
      type: "boolean",
    },
  ],
};

const specificationSectionIds = sections
  .filter((section) => section.group === "specifications")
  .map((section) => section.id);

export default function NewProductPage() {
  const [activeSection, setActiveSection] =
    useState<SectionId>("basic");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [brandSlug, setBrandSlug] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [sellerSlug, setSellerSlug] = useState("");

  const [price, setPrice] = useState("");
  const [images, setImages] = useState<string[]>([]);

  const [specifications, setSpecifications] = useState<
    Record<string, string>
  >({});

  const [options, setOptions] =
    useState<FormOptions>({
      brands: [],
      categories: [],
      sellers: [],
    });

  const [loadingOptions, setLoadingOptions] =
    useState(true);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOptions() {
      try {
        const [
          brandsResponse,
          categoriesResponse,
          sellersResponse,
        ] = await Promise.all([
          getBrands(),
          getCategories(),
          getSellers(),
        ]);

        setOptions({
          brands: brandsResponse.data,
          categories: categoriesResponse.data,
          sellers: sellersResponse.data,
        });
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load product options.",
        );
      } finally {
        setLoadingOptions(false);
      }
    }

    loadOptions();
  }, []);

  function updateSpecification(
    key: string,
    value: string,
  ) {
    setSpecifications((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function toggleBoolean(key: string) {
    setSpecifications((current) => ({
      ...current,
      [key]:
        current[key] === "true"
          ? "false"
          : "true",
    }));
  }

  function getSectionCompletion(
    sectionId: SectionId,
  ) {
    if (
      sectionId === "basic"
    ) {
      const fields = [
        name,
        description,
        brandSlug,
        categorySlug,
        sellerSlug,
      ];

      return fields.filter(
        Boolean,
      ).length;
    }

    if (
      sectionId === "media"
    ) {
      return images.length;
    }

    if (
      sectionId === "variants"
    ) {
      return price ? 1 : 0;
    }

    if (
      sectionId === "seo"
    ) {
      return 0;
    }

    const fields =
      specificationFields[
        sectionId as keyof typeof specificationFields
      ];

    if (!fields) {
      return 0;
    }

    return fields.filter(
      (field) =>
        specifications[field.key] !==
          undefined &&
        specifications[field.key] !== "",
    ).length;
  }

  function getSectionTotal(
    sectionId: SectionId,
  ) {
    if (sectionId === "basic") {
      return 5;
    }

    if (sectionId === "media") {
      return 10;
    }

    if (sectionId === "variants") {
      return 1;
    }

    if (sectionId === "seo") {
      return 0;
    }

    return (
      specificationFields[
        sectionId as keyof typeof specificationFields
      ]?.length ?? 0
    );
  }

  const completedSpecifications =
    useMemo(() => {
      return specificationSectionIds.filter(
        (sectionId) =>
          getSectionCompletion(sectionId) >
          0,
      ).length;
    }, [specifications]);

  const totalSpecificationSections =
    specificationSectionIds.length;

  async function handleSubmit(
    publish = false,
  ) {
    setMessage("");
    setError("");

    if (!name.trim()) {
      setError("Product name is required.");
      setActiveSection("basic");
      return;
    }

    if (!brandSlug) {
      setError("Please select a brand.");
      setActiveSection("basic");
      return;
    }

    if (!categorySlug) {
      setError("Please select a category.");
      setActiveSection("basic");
      return;
    }

    if (!sellerSlug) {
      setError("Please select a seller.");
      setActiveSection("basic");
      return;
    }

    if (!price || Number(price) <= 0) {
      setError("Please enter a valid price.");
      setActiveSection("variants");
      return;
    }

    setSaving(true);

    try {
      const response = await apiFetch<
        ApiResponse<Product>
      >("/admin/products", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          brandSlug,
          categorySlug,
          sellerSlug,
          price: Number(price),
          images:
            images.length > 0
              ? images
              : undefined,
          specifications,
          isActive: publish,
        }),
      });

      setMessage(
        response.message ??
          (publish
            ? "Product published successfully."
            : "Product saved successfully."),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save product.",
      );
    } finally {
      setSaving(false);
    }
  }

  const activeSectionInfo = sections.find(
    (section) =>
      section.id === activeSection,
  );

  return (
    <div className="min-h-full">
      {/* Top Header */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Link
            href="/admin/products"
            className="text-sm font-medium text-gray-500 hover:text-gray-900"
          >
            ← Products
          </Link>

          <div className="mt-2 flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-gray-950">
              Add New Product
            </h1>

            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
              Draft
            </span>
          </div>

          <p className="mt-1 text-sm text-gray-500">
            Create a detailed product profile with
            specifications, variants and pricing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={saving}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Draft"}
          </button>

          <button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={saving}
            className="rounded-lg bg-gray-950 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            Publish Product
          </button>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* Main Workspace */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* Progress Bar */}
        <div className="border-b border-gray-200 bg-gray-50 px-5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Product Setup
              </p>

              <p className="mt-1 text-sm font-semibold text-gray-900">
                {completedSpecifications} of{" "}
                {totalSpecificationSections}{" "}
                specification sections started
              </p>
            </div>

            <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-gray-950 transition-all"
                style={{
                  width: `${
                    totalSpecificationSections
                      ? (completedSpecifications /
                          totalSpecificationSections) *
                        100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="grid min-h-[720px] lg:grid-cols-[250px_minmax(0,1fr)_230px]">
          {/* Left Navigation */}
          <aside className="border-b border-gray-200 bg-gray-50 lg:border-b-0 lg:border-r">
            <div className="p-4">
              <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-widest text-gray-400">
                Product
              </p>

              <nav className="space-y-1">
                {sections
                  .filter(
                    (section) =>
                      section.group ===
                      "product",
                  )
                  .map((section) => (
                    <SectionButton
                      key={section.id}
                      section={section}
                      active={
                        activeSection ===
                        section.id
                      }
                      completed={getSectionCompletion(
                        section.id,
                      )}
                      total={getSectionTotal(
                        section.id,
                      )}
                      onClick={() =>
                        setActiveSection(
                          section.id,
                        )
                      }
                    />
                  ))}
              </nav>

              <p className="mb-3 mt-7 px-3 text-[11px] font-bold uppercase tracking-widest text-gray-400">
                Specifications
              </p>

              <nav className="space-y-1">
                {sections
                  .filter(
                    (section) =>
                      section.group ===
                      "specifications",
                  )
                  .map((section) => (
                    <SectionButton
                      key={section.id}
                      section={section}
                      active={
                        activeSection ===
                        section.id
                      }
                      completed={getSectionCompletion(
                        section.id,
                      )}
                      total={getSectionTotal(
                        section.id,
                      )}
                      onClick={() =>
                        setActiveSection(
                          section.id,
                        )
                      }
                    />
                  ))}
              </nav>
            </div>
          </aside>

          {/* Center Editor */}
          <main className="min-w-0 bg-white">
            <div className="border-b border-gray-200 px-6 py-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                {activeSectionInfo?.group ===
                "specifications"
                  ? "Specifications"
                  : "Product"}
              </p>

              <h2 className="mt-1 text-xl font-bold text-gray-950">
                {activeSectionInfo?.label}
              </h2>
            </div>

            <div className="p-6">
              {activeSection === "basic" && (
                <BasicInformation
                  name={name}
                  description={description}
                  brandSlug={brandSlug}
                  categorySlug={categorySlug}
                  sellerSlug={sellerSlug}
                  options={options}
                  loadingOptions={
                    loadingOptions
                  }
                  setName={setName}
                  setDescription={
                    setDescription
                  }
                  setBrandSlug={
                    setBrandSlug
                  }
                  setCategorySlug={
                    setCategorySlug
                  }
                  setSellerSlug={
                    setSellerSlug
                  }
                />
              )}

              {activeSection === "media" && (
                <MediaSection
                  images={images}
                  setImages={setImages}
                />
              )}

              {activeSection ===
                "variants" && (
                <VariantsSection
                  price={price}
                  setPrice={setPrice}
                />
              )}

              {activeSection === "seo" && (
                <SEOSection />
              )}

              {specificationFields[
                activeSection as keyof typeof specificationFields
              ] && (
                <SpecificationSection
                  sectionId={activeSection}
                  fields={
                    specificationFields[
                      activeSection as keyof typeof specificationFields
                    ]
                  }
                  values={specifications}
                  onChange={
                    updateSpecification
                  }
                  onToggle={
                    toggleBoolean
                  }
                />
              )}
            </div>
          </main>

          {/* Right Summary */}
          <aside className="border-t border-gray-200 bg-gray-50 lg:border-l lg:border-t-0">
            <div className="p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Product Summary
              </p>

              <div className="mt-5 rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex h-28 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">
                  Product Preview
                </div>

                <h3 className="mt-4 line-clamp-2 text-sm font-bold text-gray-900">
                  {name ||
                    "Your product name"}
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  {brandSlug
                    ? options.brands.find(
                        (brand) =>
                          brand.slug ===
                          brandSlug,
                      )?.name
                    : "Brand"}
                </p>

                <div className="mt-4 border-t border-gray-100 pt-4">
                  <p className="text-xs text-gray-400">
                    Starting Price
                  </p>

                  <p className="mt-1 text-lg font-bold text-gray-950">
                    {price
                      ? `₹${Number(
                          price,
                        ).toLocaleString(
                          "en-IN",
                        )}`
                      : "₹ —"}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-xs font-bold text-gray-900">
                  Completion
                </p>

                <div className="mt-4 space-y-3">
                  <SummaryRow
                    label="Basic"
                    completed={
                      getSectionCompletion(
                        "basic",
                      )
                    }
                    total={5}
                  />

                  <SummaryRow
                    label="Media"
                    completed={
                      getSectionCompletion(
                        "media",
                      )
                    }
                    total={10}
                  />

                  <SummaryRow
                    label="Variants"
                    completed={
                      getSectionCompletion(
                        "variants",
                      )
                    }
                    total={1}
                  />

                  <SummaryRow
                    label="Specifications"
                    completed={
                      completedSpecifications
                    }
                    total={
                      totalSpecificationSections
                    }
                  />
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-xs font-bold text-gray-900">
                  Publishing Checklist
                </p>

                <ChecklistItem
                  done={Boolean(name)}
                  label="Product name"
                />

                <ChecklistItem
                  done={Boolean(brandSlug)}
                  label="Brand selected"
                />

                <ChecklistItem
                  done={Boolean(categorySlug)}
                  label="Category selected"
                />

                <ChecklistItem
                  done={Boolean(price)}
                  label="Price added"
                />

                <ChecklistItem
                  done={images.length > 0}
                  label="Product image"
                />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function SectionButton({
  section,
  active,
  completed,
  total,
  onClick,
}: {
  section: Section;
  active: boolean;
  completed: number;
  total: number;
  onClick: () => void;
}) {
  const complete =
    total > 0 && completed >= total;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition ${
        active
          ? "bg-gray-950 text-white shadow-sm"
          : "text-gray-600 hover:bg-gray-200/70 hover:text-gray-950"
      }`}
    >
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-bold ${
          active
            ? "bg-white/15 text-white"
            : complete
              ? "bg-gray-950 text-white"
              : "bg-gray-200 text-gray-500"
        }`}
      >
        {complete ? "✓" : completed}
      </span>

      <span className="min-w-0 flex-1 truncate text-xs font-semibold">
        {section.label}
      </span>

      {total > 0 && (
        <span
          className={`text-[10px] ${
            active
              ? "text-gray-400"
              : "text-gray-400"
          }`}
        >
          {completed}/{total}
        </span>
      )}
    </button>
  );
}

function BasicInformation({
  name,
  description,
  brandSlug,
  categorySlug,
  sellerSlug,
  options,
  loadingOptions,
  setName,
  setDescription,
  setBrandSlug,
  setCategorySlug,
  setSellerSlug,
}: {
  name: string;
  description: string;
  brandSlug: string;
  categorySlug: string;
  sellerSlug: string;
  options: FormOptions;
  loadingOptions: boolean;
  setName: (value: string) => void;
  setDescription: (value: string) => void;
  setBrandSlug: (value: string) => void;
  setCategorySlug: (value: string) => void;
  setSellerSlug: (value: string) => void;
}) {
  return (
    <div className="space-y-7">
      <div>
        <h3 className="text-sm font-bold text-gray-900">
          Product Identity
        </h3>

        <p className="mt-1 text-xs text-gray-500">
          Basic information used throughout
          your product pages.
        </p>
      </div>

      <Field
        label="Product Name"
        required
        hint="Use the official product name."
      >
        <input
          value={name}
          onChange={(event) =>
            setName(event.target.value)
          }
          placeholder="Samsung Galaxy S25 Ultra"
          className={inputClass}
        />
      </Field>

      <Field
        label="Description"
        required
        hint="Write a concise product description."
      >
        <textarea
          value={description}
          onChange={(event) =>
            setDescription(
              event.target.value,
            )
          }
          rows={6}
          placeholder="Enter product description..."
          className={textareaClass}
        />
      </Field>

      <div className="grid gap-5 md:grid-cols-3">
        <Field label="Brand" required>
          <select
            value={brandSlug}
            onChange={(event) =>
              setBrandSlug(
                event.target.value,
              )
            }
            disabled={loadingOptions}
            className={selectClass}
          >
            <option value="">
              Select brand
            </option>

            {options.brands.map((brand) => (
              <option
                key={brand.id}
                value={brand.slug}
              >
                {brand.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Category" required>
          <select
            value={categorySlug}
            onChange={(event) =>
              setCategorySlug(
                event.target.value,
              )
            }
            disabled={loadingOptions}
            className={selectClass}
          >
            <option value="">
              Select category
            </option>

            {options.categories.map(
              (category) => (
                <option
                  key={category.id}
                  value={category.slug}
                >
                  {category.name}
                </option>
              ),
            )}
          </select>
        </Field>

        <Field label="Seller" required>
          <select
            value={sellerSlug}
            onChange={(event) =>
              setSellerSlug(
                event.target.value,
              )
            }
            disabled={loadingOptions}
            className={selectClass}
          >
            <option value="">
              Select seller
            </option>

            {options.sellers.map((seller) => (
              <option
                key={seller.id}
                value={seller.slug}
              >
                {seller.name}
              </option>
            ))}
          </select>
        </Field>
      </div>
    </div>
  );
}

function MediaSection({
  images,
  setImages,
}: {
  images: string[];
  setImages: React.Dispatch<
    React.SetStateAction<string[]>
  >;
}) {
  const [url, setUrl] = useState("");

  function addImage() {
    const trimmed = url.trim();

    if (!trimmed) {
      return;
    }

    setImages((current) => [
      ...current,
      trimmed,
    ]);

    setUrl("");
  }

  function removeImage(index: number) {
    setImages((current) =>
      current.filter(
        (_, imageIndex) =>
          imageIndex !== index,
      ),
    );
  }

  return (
    <div className="space-y-7">
      <div>
        <h3 className="text-sm font-bold text-gray-900">
          Product Media
        </h3>

        <p className="mt-1 text-xs text-gray-500">
          Add product images. The first image
          will be treated as the primary image.
        </p>
      </div>

      <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
          +
        </div>

        <p className="mt-3 text-sm font-semibold text-gray-900">
          Add product image
        </p>

        <p className="mt-1 text-xs text-gray-500">
          Enter an image URL for now. File upload
          can be connected to your existing
          upload endpoint next.
        </p>

        <div className="mx-auto mt-5 flex max-w-xl gap-2">
          <input
            value={url}
            onChange={(event) =>
              setUrl(event.target.value)
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addImage();
              }
            }}
            placeholder="https://example.com/product.jpg"
            className={inputClass}
          />

          <button
            type="button"
            onClick={addImage}
            className="rounded-lg bg-gray-950 px-5 text-sm font-semibold text-white hover:bg-black"
          >
            Add
          </button>
        </div>
      </div>

      {images.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image, index) => (
            <div
              key={`${image}-${index}`}
              className="overflow-hidden rounded-xl border border-gray-200 bg-white"
            >
              <div className="aspect-square bg-gray-100">
                <img
                  src={image}
                  alt={`Product image ${
                    index + 1
                  }`}
                  className="h-full w-full object-contain"
                />
              </div>

              <div className="flex items-center justify-between border-t border-gray-100 p-3">
                <span className="text-xs font-semibold text-gray-600">
                  {index === 0
                    ? "Primary Image"
                    : `Image ${index + 1}`}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    removeImage(index)
                  }
                  className="text-xs font-semibold text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function VariantsSection({
  price,
  setPrice,
}: {
  price: string;
  setPrice: (value: string) => void;
}) {
  return (
    <div className="space-y-7">
      <div>
        <h3 className="text-sm font-bold text-gray-900">
          Variants & Pricing
        </h3>

        <p className="mt-1 text-xs text-gray-500">
          Start with the base product price.
          Variant management can be expanded
          with RAM, storage, color, SKU and stock.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200">
        <div className="border-b border-gray-200 bg-gray-50 px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-900">
                Base Variant
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Default product configuration
              </p>
            </div>

            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-500">
              Variant 01
            </span>
          </div>
        </div>

        <div className="grid gap-5 p-5 md:grid-cols-2">
          <Field
            label="Starting Price"
            required
            hint="Price in Indian Rupees."
          >
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">
                ₹
              </span>

              <input
                type="number"
                min="0"
                value={price}
                onChange={(event) =>
                  setPrice(
                    event.target.value,
                  )
                }
                placeholder="74999"
                className={`${inputClass} pl-8`}
              />
            </div>
          </Field>

          <Field label="Currency">
            <input
              value="INR"
              disabled
              className={`${inputClass} bg-gray-50 text-gray-500`}
            />
          </Field>
        </div>
      </div>

      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-5">
        <p className="text-sm font-bold text-gray-900">
          Variant expansion
        </p>

        <p className="mt-1 text-xs leading-5 text-gray-500">
          The next stage will add multiple
          configurations such as 12 GB + 256 GB,
          12 GB + 512 GB and different colors,
          each with its own SKU, price and stock.
        </p>
      </div>
    </div>
  );
}

function SpecificationSection({
  sectionId,
  fields,
  values,
  onChange,
  onToggle,
}: {
  sectionId: string;
  fields: SpecificationField[];
  values: Record<string, string>;
  onChange: (
    key: string,
    value: string,
  ) => void;
  onToggle: (key: string) => void;
}) {
  return (
    <div className="space-y-7">
      <div className="grid gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 sm:grid-cols-3">
        <InfoStat
          label="Fields"
          value={String(fields.length)}
        />

        <InfoStat
          label="Completed"
          value={String(
            fields.filter(
              (field) =>
                values[field.key] !==
                  undefined &&
                values[field.key] !== "",
            ).length,
          )}
        />

        <InfoStat
          label="Remaining"
          value={String(
            fields.filter(
              (field) =>
                !values[field.key],
            ).length,
          )}
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {fields.map((field) => {
          const value =
            values[field.key] ?? "";

          if (field.type === "boolean") {
            const checked =
              value === "true";

            return (
              <button
                type="button"
                key={field.key}
                onClick={() =>
                  onToggle(field.key)
                }
                className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 text-left transition hover:border-gray-400"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {field.label}
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    {checked
                      ? "Supported"
                      : "Not specified"}
                  </p>
                </div>

                <span
                  className={`relative h-6 w-11 rounded-full transition ${
                    checked
                      ? "bg-gray-950"
                      : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                      checked
                        ? "left-6"
                        : "left-1"
                    }`}
                  />
                </span>
              </button>
            );
          }

          return (
            <Field
              key={field.key}
              label={field.label}
            >
              <div className="relative">
                {field.type ===
                "textarea" ? (
                  <textarea
                    value={value}
                    onChange={(event) =>
                      onChange(
                        field.key,
                        event.target.value,
                      )
                    }
                    placeholder={
                      field.placeholder
                    }
                    rows={4}
                    className={textareaClass}
                  />
                ) : field.type ===
                  "select" ? (
                  <select
                    value={value}
                    onChange={(event) =>
                      onChange(
                        field.key,
                        event.target.value,
                      )
                    }
                    className={selectClass}
                  >
                    <option value="">
                      Select...
                    </option>

                    {field.options?.map(
                      (option) => (
                        <option
                          key={option}
                          value={option}
                        >
                          {option}
                        </option>
                      ),
                    )}
                  </select>
                ) : (
                  <input
                    type={
                      field.type ===
                      "number"
                        ? "number"
                        : "text"
                    }
                    value={value}
                    onChange={(event) =>
                      onChange(
                        field.key,
                        event.target.value,
                      )
                    }
                    placeholder={
                      field.placeholder
                    }
                    className={`${inputClass} ${
                      field.unit
                        ? "pr-16"
                        : ""
                    }`}
                  />
                )}

                {field.unit &&
                  field.type !==
                    "textarea" && (
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">
                      {field.unit}
                    </span>
                  )}
              </div>
            </Field>
          );
        })}
      </div>

      <div className="flex justify-end border-t border-gray-200 pt-5">
        <span className="text-xs text-gray-400">
          Changes are kept in this product draft.
        </span>
      </div>
    </div>
  );
}

function SEOSection() {
  return (
    <div className="space-y-7">
      <div>
        <h3 className="text-sm font-bold text-gray-900">
          Search Engine Optimization
        </h3>

        <p className="mt-1 text-xs text-gray-500">
          SEO fields can be connected to your
          product SEO model next.
        </p>
      </div>

      <Field label="SEO Title">
        <input
          placeholder="Samsung Galaxy S25 Ultra Price in India"
          className={inputClass}
        />
      </Field>

      <Field label="Meta Description">
        <textarea
          rows={5}
          placeholder="Enter the search engine description..."
          className={textareaClass}
        />
      </Field>

      <Field label="Canonical URL">
        <input
          placeholder="https://example.com/products/samsung-galaxy-s25-ultra"
          className={inputClass}
        />
      </Field>
    </div>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <label className="text-xs font-bold text-gray-700">
          {label}
          {required && (
            <span className="ml-1 text-red-500">
              *
            </span>
          )}
        </label>

        {hint && (
          <span className="text-[10px] text-gray-400">
            {hint}
          </span>
        )}
      </div>

      {children}
    </div>
  );
}

function InfoStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg bg-white px-4 py-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
        {label}
      </p>

      <p className="mt-1 text-lg font-bold text-gray-950">
        {value}
      </p>
    </div>
  );
}

function SummaryRow({
  label,
  completed,
  total,
}: {
  label: string;
  completed: number;
  total: number;
}) {
  const done =
    total > 0 && completed >= total;

  return (
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium text-gray-600">
        {label}
      </span>

      <span
        className={`text-xs font-bold ${
          done
            ? "text-gray-950"
            : "text-gray-400"
        }`}
      >
        {completed}/{total}
      </span>
    </div>
  );
}

function ChecklistItem({
  done,
  label,
}: {
  done: boolean;
  label: string;
}) {
  return (
    <div className="mt-3 flex items-center gap-2">
      <span
        className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold ${
          done
            ? "bg-gray-950 text-white"
            : "border border-gray-300 bg-white text-transparent"
        }`}
      >
        ✓
      </span>

      <span
        className={`text-xs ${
          done
            ? "text-gray-700"
            : "text-gray-400"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-950 focus:ring-1 focus:ring-gray-950";

const textareaClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-950 focus:ring-1 focus:ring-gray-950";

const selectClass =
  "w-full appearance-none rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition focus:border-gray-950 focus:ring-1 focus:ring-gray-950";
