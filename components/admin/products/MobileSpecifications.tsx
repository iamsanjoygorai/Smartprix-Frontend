"use client";

import { useState } from "react";

export interface MobileSpecification {
  slug: string;
  label: string;
  group: string;
  value: string;
}

interface MobileSpecificationsProps {
  value?: Record<string, string>;
  onChange: (
    value: Record<string, string>,
  ) => void;
}

interface SpecificationField {
  slug: string;
  label: string;
  placeholder?: string;
  type?: "text" | "textarea";
}

interface SpecificationGroup {
  name: string;
  fields: SpecificationField[];
}

/*
 * These slugs are matched against the Specification table
 * already present in the database.
 */
const MOBILE_SPECIFICATION_GROUPS: SpecificationGroup[] = [
  {
    name: "General",
    fields: [
      {
        slug: "launch-date",
        label: "Launch Date",
        placeholder: "e.g. July 29, 2025 (Official)",
      },
      {
        slug: "operating-system",
        label: "Operating System",
        placeholder: "e.g. Android v15",
      },
      {
        slug: "major-android-updates",
        label: "OS Updates",
        placeholder: "e.g. 3 Year",
      },
      {
        slug: "security-updates",
        label: "Security Updates",
        placeholder: "e.g. 4 Year",
      },
      {
        slug: "ui",
        label: "Custom UI",
        placeholder: "e.g. Realme UI",
      },
      {
        slug: "model",
        label: "Model",
        placeholder: "e.g. Realme 15 Pro 5G",
      },
      {
        slug: "model-number",
        label: "Model Number",
        placeholder: "e.g. RMXxxxx",
      },
    ],
  },

  {
    name: "Performance",
    fields: [
      {
        slug: "chipset",
        label: "Chipset",
        placeholder: "e.g. Qualcomm Snapdragon 7 Gen 4",
      },
      {
        slug: "processor",
        label: "Processor",
        type: "textarea",
        placeholder: "Enter processor configuration",
      },
      {
        slug: "cpu-architecture",
        label: "Architecture",
        placeholder: "e.g. 64 bit",
      },
      {
        slug: "cpu-cores",
        label: "CPU Cores",
        placeholder: "e.g. Octa core",
      },
      {
        slug: "cpu-speed",
        label: "CPU Speed",
        placeholder: "e.g. 2.8 GHz",
      },
      {
        slug: "gpu",
        label: "Graphics (GPU)",
        placeholder: "e.g. Adreno 722",
      },
      {
        slug: "ram",
        label: "RAM",
        placeholder: "e.g. 8 GB / 12 GB",
      },
      {
        slug: "cooling-system",
        label: "Cooling Technology",
        placeholder: "e.g. Vapor Chamber",
      },
    ],
  },

  {
    name: "Display",
    fields: [
      {
        slug: "display-type",
        label: "Display Type",
        placeholder: "e.g. AMOLED (Curved Display)",
      },
      {
        slug: "screen-size",
        label: "Screen Size",
        placeholder: "e.g. 6.8 inches (17.27 cm)",
      },
      {
        slug: "resolution",
        label: "Resolution",
        placeholder: "e.g. 1280x2800 px (FHD+)",
      },
      {
        slug: "peak-brightness",
        label: "Peak Brightness",
        placeholder: "e.g. 6500 nits",
      },
      {
        slug: "refresh-rate",
        label: "Refresh Rate",
        placeholder: "e.g. 144 Hz",
      },
      {
        slug: "touch-sampling-rate",
        label: "Touch Sampling Rate",
        placeholder: "e.g. 240 Hz",
      },
      {
        slug: "ppi",
        label: "Pixel Density",
        placeholder: "e.g. 453 ppi",
      },
      {
        slug: "screen-to-body-ratio",
        label: "Screen to Body Ratio",
        placeholder: "e.g. 91.66 %",
      },
      {
        slug: "display-protection",
        label: "Screen Protection",
        placeholder: "e.g. Corning Gorilla Glass 7i",
      },
      {
        slug: "hdr",
        label: "HDR Support",
        placeholder: "e.g. Yes",
      },
      {
        slug: "hdr10-plus",
        label: "HDR10+",
        placeholder: "e.g. Yes",
      },
      {
        slug: "anti-glare-screen",
        label: "Anti Glare Screen",
        placeholder: "e.g. Yes",
      },
      {
        slug: "touch",
        label: "Touch",
        placeholder: "e.g. Capacitive",
      },
    ],
  },

  {
    name: "Design",
    fields: [
      {
        slug: "height",
        label: "Height",
        placeholder: "e.g. 162.26 mm",
      },
      {
        slug: "width",
        label: "Width",
        placeholder: "e.g. 76.15 mm",
      },
      {
        slug: "thickness",
        label: "Thickness",
        placeholder: "e.g. 7.69 mm",
      },
      {
        slug: "weight",
        label: "Weight",
        placeholder: "e.g. 187 grams",
      },
      {
        slug: "build-material",
        label: "Build Material",
        placeholder: "e.g. Back: Plastic",
      },
      {
        slug: "back-material",
        label: "Back Material",
        placeholder: "e.g. Plastic",
      },
      {
        slug: "water-resistance",
        label: "Water Resistance",
        type: "textarea",
        placeholder:
          "e.g. Yes, Water resistant, IP68, IP66, IP69",
      },
      {
        slug: "ip-rating",
        label: "IP Rating",
        placeholder: "e.g. IP68 / IP66 / IP69",
      },
    ],
  },

  {
    name: "Rear Camera",
    fields: [
      {
        slug: "main-camera",
        label: "Primary Camera",
        type: "textarea",
        placeholder:
          "Enter primary camera specifications",
      },
      {
        slug: "ultra-wide",
        label: "Ultra Wide Camera",
        type: "textarea",
        placeholder:
          "Enter ultra-wide camera specifications",
      },
      {
        slug: "autofocus",
        label: "Autofocus",
        placeholder: "e.g. Yes",
      },
      {
        slug: "ois",
        label: "OIS",
        placeholder: "e.g. Yes",
      },
      {
        slug: "flash",
        label: "Flash",
        placeholder: "e.g. Yes, Dual LED Flash",
      },
      {
        slug: "rear-video",
        label: "Video Recording",
        type: "textarea",
        placeholder:
          "e.g. 4K @30 fps, Full HD @120 fps, HD @240 fps",
      },
      {
        slug: "4k-video",
        label: "4K Video",
        placeholder: "e.g. 4K @30 fps",
      },
      {
        slug: "slow-motion",
        label: "Slow Motion",
        placeholder: "e.g. Full HD @120 fps, HD @240 fps",
      },
      {
        slug: "video-stabilization",
        label: "Video Stabilization",
        placeholder: "e.g. Yes",
      },
    ],
  },

  {
    name: "Front Camera",
    fields: [
      {
        slug: "front-camera",
        label: "Front Camera",
        placeholder: "e.g. 50 MP",
      },
      {
        slug: "front-video",
        label: "Front Video",
        placeholder: "Enter front camera video specifications",
      },
    ],
  },

  {
    name: "Network & Connectivity",
    fields: [
      {
        slug: "number-of-sims",
        label: "SIM Slot(s)",
        placeholder: "e.g. Dual SIM",
      },
      {
        slug: "sim-type",
        label: "SIM Type",
        placeholder: "e.g. SIM1: Nano, SIM2: Nano",
      },
      {
        slug: "network",
        label: "Network Support",
        placeholder: "e.g. 5G, 4G",
      },
      {
        slug: "4g",
        label: "4G",
        placeholder: "e.g. Yes",
      },
      {
        slug: "5g",
        label: "5G",
        placeholder: "e.g. Yes",
      },
      {
        slug: "dual-sim",
        label: "Dual SIM",
        placeholder: "e.g. Yes",
      },
      {
        slug: "wifi",
        label: "Wi-Fi",
        placeholder: "e.g. Wi-Fi 6 (802.11 a/b/g/n/ac/ax) 5GHz",
      },
      {
        slug: "wifi-version",
        label: "Wi-Fi Version",
        placeholder: "e.g. Wi-Fi 6",
      },
      {
        slug: "bluetooth",
        label: "Bluetooth",
        placeholder: "e.g. v5.4",
      },
      {
        slug: "gps",
        label: "GPS",
        placeholder: "e.g. Yes with A-GPS, Glonass",
      },
      {
        slug: "nfc",
        label: "NFC",
        placeholder: "e.g. No",
      },
      {
        slug: "usb-type",
        label: "USB Type",
        placeholder: "e.g. USB Type-C",
      },
      {
        slug: "usb-otg",
        label: "USB OTG",
        placeholder: "e.g. Yes",
      },
    ],
  },

  {
    name: "Multimedia",
    fields: [
      {
        slug: "stereo-speakers",
        label: "Stereo Speakers",
        placeholder: "e.g. Yes",
      },
      {
        slug: "headphone-jack",
        label: "Audio Jack",
        placeholder: "e.g. USB Type-C",
      },
      {
        slug: "dolby-atmos",
        label: "Dolby Atmos",
        placeholder: "e.g. Yes",
      },
    ],
  },

  {
    name: "Sensors",
    fields: [
      {
        slug: "fingerprint-sensor",
        label: "Fingerprint Sensor",
        placeholder: "e.g. Yes",
      },
      {
        slug: "proximity",
        label: "Proximity",
        placeholder: "e.g. Yes",
      },
      {
        slug: "ambient-light-sensor",
        label: "Light Sensor",
        placeholder: "e.g. Yes",
      },
      {
        slug: "accelerometer",
        label: "Accelerometer",
        placeholder: "e.g. Yes",
      },
      {
        slug: "compass",
        label: "Compass",
        placeholder: "e.g. Yes",
      },
      {
        slug: "gyroscope",
        label: "Gyroscope",
        placeholder: "e.g. Yes",
      },
      {
        slug: "barometer",
        label: "Barometer",
        placeholder: "e.g. Yes",
      },
    ],
  },

  {
    name: "Battery",
    fields: [
      {
        slug: "battery-capacity",
        label: "Battery",
        placeholder: "e.g. 7000 mAh",
      },
      {
        slug: "battery",
        label: "Battery Type",
        placeholder: "e.g. Li-Polymer",
      },
      {
        slug: "fast-charging",
        label: "Fast Charging",
        placeholder: "e.g. 80W",
      },
      {
        slug: "wireless-charging",
        label: "Wireless Charging",
        placeholder: "e.g. No",
      },
      {
        slug: "charging-wattage",
        label: "Charging Wattage",
        placeholder: "e.g. 80W",
      },
      {
        slug: "wireless-charging-wattage",
        label: "Wireless Charging Wattage",
        placeholder: "e.g. 0W",
      },
    ],
  },
];

export default function MobileSpecifications({
  value = {},
  onChange,
}: MobileSpecificationsProps) {
  const values = value;

  const [openGroups, setOpenGroups] =
    useState<Record<string, boolean>>(
      Object.fromEntries( 
        MOBILE_SPECIFICATION_GROUPS.map(
          (group, index) => [
            group.name,
            index < 2,
          ],
        ),
      ),
    );

  const updateValue = (
    slug: string,
    value: string,
  ) => {
    onChange({
      ...values,
      [slug]: value,
    });
  };

  const toggleGroup = (groupName: string) => {
    setOpenGroups((current) => ({
      ...current,
      [groupName]: !current[groupName],
    }));
  };

  return (
    <div className="space-y-3">
      {MOBILE_SPECIFICATION_GROUPS.map(
        (group) => {
          const filledCount =
            group.fields.filter(
              (field) =>
                values[field.slug]?.trim(),
            ).length;

          const isOpen =
            openGroups[group.name] ?? false;

          return (
            <div
              key={group.name}
              className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
            >
              <button
                type="button"
                onClick={() =>
                  toggleGroup(group.name)
                }
                className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-gray-50"
              >
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    {group.name}
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    {filledCount} /{" "}
                    {group.fields.length} fields
                    completed
                  </p>
                </div>

                <span className="text-lg text-gray-500">
                  {isOpen ? "−" : "+"}
                </span>
              </button>

              {isOpen && (
                <div className="border-t border-gray-200 p-5">
                  <div className="grid gap-5 md:grid-cols-2">
                    {group.fields.map(
                      (field, index) => (
                        <div
                          key={`${field.slug}-${index}`}
                          className={
                            field.type ===
                            "textarea"
                              ? "md:col-span-2"
                              : ""
                          }
                        >
                          <label className="mb-2 block text-sm font-medium text-gray-700">
                            {field.label}
                          </label>

                          {field.type ===
                          "textarea" ? (
                            <textarea
                              value={
                                values[
                                  field.slug
                                ] ?? ""
                              }
                              onChange={(event) =>
                                updateValue(
                                  field.slug,
                                  event.target
                                    .value,
                                )
                              }
                              placeholder={
                                field.placeholder
                              }
                              rows={3}
                              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                          ) : (
                            <input
                              type="text"
                              value={
                                values[
                                  field.slug
                                ] ?? ""
                              }
                              onChange={(event) =>
                                updateValue(
                                  field.slug,
                                  event.target
                                    .value,
                                )
                              }
                              placeholder={
                                field.placeholder
                              }
                              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                          )}
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        },
      )}
    </div>
  );
}