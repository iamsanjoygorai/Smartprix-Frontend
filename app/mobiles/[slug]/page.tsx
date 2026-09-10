"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useParams, useRouter } from "next/navigation";

/* =========================================================
   TYPES
========================================================= */

interface ProductImage {
  id: string;
  url: string;
  altText?: string | null;
  sortOrder?: number | null;
  isPrimary?: boolean;
}

interface Brand {
  id: string;
  name: string;
  slug: string;
}

interface Seller {
  id: string;
  name: string;
  slug?: string;
}

interface Price {
  id: string;
  amount: number | string;
  currency?: string;
  url?: string | null;
  inStock?: boolean;
  seller?: Seller | null;
}

interface ProductVariant {
  id: string;
  name?: string | null;
  color?: string | null;
  storage?: string | null;
  ram?: string | null;
  price?: number | string | null;
  sku?: string | null;
}

interface Specification {
  id?: string;
  name?: string;
  slug?: string;
  value?: unknown;
  unit?: string | null;
  dataType?: string;
  group?: string;
  column?: string | null;
  groupOrder?: number | null;
  sortOrder?: number | null;
}

type ProductSpecification = Specification;

interface Review {
  id: string;
  rating: number;
  title?: string | null;
  comment?: string | null;
  createdAt: string;
  updatedAt?: string | null;

  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
  } | null;
}

interface Product {
  id: string;
  slug: string;
  name: string;

  shortDescription?: string | null;
  description?: string | null;

  brand?: Brand | null;

  category?: {
    id?: string;
    name?: string;
    slug?: string;
  } | null;

  images?: ProductImage[];
  prices?: Price[];
  variants?: ProductVariant[];
  specifications?: ProductSpecification[];

  createdAt?: string;
  updatedAt?: string;
}

interface LoginUser {
  id: string;
  name?: string | null;
  email?: string | null;
}


/* =========================================================
   CONSTANTS
========================================================= */

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5000/api";

const BACKEND_URL = API_URL.replace(/\/api\/?$/, "");

const PLACEHOLDER_IMAGE =
  "/images/mobile-placeholder.png";

/* =========================================================
   IMAGE
========================================================= */

function getImageUrl(url?: string | null) {
  if (!url) {
    return PLACEHOLDER_IMAGE;
  }

  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:")
  ) {
    return url;
  }

  if (url.startsWith("/")) {
    return `${BACKEND_URL}${url}`;
  }

  return `${BACKEND_URL}/${url}`;
}

/* =========================================================
   PRICE
========================================================= */

function formatPrice(
  value?: number | string | null,
  currency = "INR"
) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "—";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(numericValue);
}

/* =========================================================
   SAFE OBJECT → TEXT
========================================================= */

function stringifyValue(value: unknown): string {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  if (
    typeof value === "string" ||
    typeof value === "number"
  ) {
    return String(value).trim();
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => stringifyValue(item))
      .filter(Boolean)
      .join(", ");
  }

  if (typeof value === "object") {
    const objectValue =
      value as Record<string, unknown>;

    /*
      Prefer common human-readable fields.
    */
    const preferredKeys = [
      "name",
      "title",
      "label",
      "value",
      "text",
      "display",
      "model",
      "brand",
    ];

    for (const key of preferredKeys) {
      if (
        objectValue[key] !== undefined &&
        objectValue[key] !== null
      ) {
        const result =
          stringifyValue(objectValue[key]);

        if (result) {
          return result;
        }
      }
    }

    /*
      If no preferred field exists,
      flatten the object intelligently.
    */
    return Object.entries(objectValue)
      .map(([key, val]) => {
        const formatted =
          stringifyValue(val);

        if (!formatted) {
          return "";
        }

        const prettyKey = key
          .replace(/[-_]/g, " ")
          .replace(/\b\w/g, (char) =>
            char.toUpperCase()
          );

        return `${prettyKey}: ${formatted}`;
      })
      .filter(Boolean)
      .join(" • ");
  }

  return String(value);
}

/* =========================================================
   SPEC VALUE
========================================================= */

function getSpecValue(item: ProductSpecification): string {
  return stringifyValue(item.value);
}

/* =========================================================
   TEXT
========================================================= */

function cleanText(
  value?: string | null
) {
  if (!value) {
    return "";
  }

  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function htmlToPlainText(
  html?: string | null
) {
  if (!html) {
    return "";
  }

  if (
    typeof window === "undefined"
  ) {
    return cleanText(html);
  }

  try {
    const parser =
      new DOMParser();

    const doc =
      parser.parseFromString(
        html,
        "text/html"
      );

    return (
      doc.body.textContent || ""
    )
      .replace(/\s+/g, " ")
      .trim();
  } catch {
    return cleanText(html);
  }
}

/* =========================================================
   SPEC SEARCH
========================================================= */

function findSpecification(
  product: Product | null,
  options: string[]
) {
  if (!product?.specifications?.length) {
    return "";
  }

  const normalizedOptions = options.map((item) =>
    item.toLowerCase().trim()
  );

  /* Exact match */
  for (const item of product.specifications) {
    const slug = String(item.slug ?? "")
      .toLowerCase()
      .trim();

    const name = String(item.name ?? "")
      .toLowerCase()
      .trim();

    if (
      normalizedOptions.includes(slug) ||
      normalizedOptions.includes(name)
    ) {
      const value = getSpecValue(item);

      if (value) {
        return value;
      }
    }
  }

  /* Partial match */
  for (const item of product.specifications) {
    const slug = String(item.slug ?? "")
      .toLowerCase()
      .trim();

    const name = String(item.name ?? "")
      .toLowerCase()
      .trim();

    const matched = normalizedOptions.some(
      (option) =>
        (slug && slug.includes(option)) ||
        (slug && option.includes(slug)) ||
        (name && name.includes(option)) ||
        (name && option.includes(name))
    );

    if (matched) {
      const value = getSpecValue(item);

      if (value) {
        return value;
      }
    }
  }

  return "";
}

function getSpecText(
  product: Product | null,
  options: string[],
  fallback = "—"
) {
  return (
    findSpecification(
      product,
      options
    ) || fallback
  );
}

/* =========================================================
   DATE
========================================================= */

function formatReviewDate(
  date?: string | null
) {
  if (!date) {
    return "";
  }

  const parsed =
    new Date(date);

  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {
    return "";
  }

  return parsed.toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

/* =========================================================
   ICON
========================================================= */

function Icon({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center justify-center ${className}`}
    >
      {children}
    </span>
  );
}

/* =========================================================
   SPEC ROW
========================================================= */

function SpecRow({
  name,
  value,
  slug,
}: {
  name: string;
  value: string;
  slug?: string;
}) {
  const normalized = `${name} ${slug ?? ""}`.toLowerCase();

  const negative = [
    "no",
    "none",
    "false",
    "not supported",
  ].includes(value.toLowerCase().trim());

  const positive = [
    "yes",
    "true",
    "supported",
    "available",
  ].includes(value.toLowerCase().trim());

  let icon = "✦";

  if (
    normalized.includes("processor") ||
    normalized.includes("cpu") ||
    normalized.includes("chipset")
  ) {
    icon = "⚙";
  } else if (
    normalized.includes("ram") ||
    normalized.includes("memory")
  ) {
    icon = "◫";
  } else if (
    normalized.includes("storage") ||
    normalized.includes("rom")
  ) {
    icon = "▤";
  } else if (
    normalized.includes("display") ||
    normalized.includes("screen") ||
    normalized.includes("resolution")
  ) {
    icon = "▣";
  } else if (
    normalized.includes("camera") ||
    normalized.includes("ois") ||
    normalized.includes("flash")
  ) {
    icon = "◉";
  } else if (
    normalized.includes("battery") ||
    normalized.includes("charging")
  ) {
    icon = "⚡";
  } else if (
    normalized.includes("network") ||
    normalized.includes("connectivity") ||
    normalized.includes("wifi") ||
    normalized.includes("bluetooth") ||
    normalized.includes("5g")
  ) {
    icon = "⌁";
  } else if (
    normalized.includes("audio") ||
    normalized.includes("speaker") ||
    normalized.includes("music")
  ) {
    icon = "♫";
  } else if (
    normalized.includes("video") ||
    normalized.includes("multimedia")
  ) {
    icon = "▶";
  } else if (
    normalized.includes("android") ||
    normalized.includes("operating system") ||
    normalized.includes("software") ||
    normalized.includes("os")
  ) {
    icon = "◈";
  } else if (
    normalized.includes("dimension") ||
    normalized.includes("weight") ||
    normalized.includes("design") ||
    normalized.includes("material")
  ) {
    icon = "◇";
  } else if (
    normalized.includes("ip rating") ||
    normalized.includes("water")
  ) {
    icon = "◌";
  } else if (
    normalized.includes("gps") ||
    normalized.includes("location")
  ) {
    icon = "⌖";
  }

  return (
    <div className="grid grid-cols-[135px_minmax(0,1fr)] border-b border-slate-100 last:border-b-0">
      {/* NAME */}
      <div className="flex items-center gap-2 bg-slate-50/70 px-3 py-2.5">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white text-[12px] font-black text-blue-600 shadow-sm ring-1 ring-slate-100">
          {icon}
        </span>

        <span className="min-w-0 text-[11px] font-bold leading-4 text-slate-500">
          {name}
        </span>
      </div>

      {/* VALUE */}
      <div className="flex items-center px-3 py-2.5 text-[12px] font-semibold leading-5 text-slate-700">
        {positive && (
          <span className="mr-2 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-black text-emerald-600">
            ✓
          </span>
        )}

        {negative && (
          <span className="mr-2 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-100 text-[10px] font-black text-rose-500">
            ×
          </span>
        )}

        <span className="break-words">
          {value || "—"}
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   SPEC GROUP
========================================================= */

function SpecificationGroup({
  title,
  items,
}: {
  title: string;
  items?: ProductSpecification[] | null;
}) {
  const groupIcons: Record<string, string> = {
    General: "◈",
    Design: "◇",
    Display: "▣",
    Memory: "▤",
    Connectivity: "⌁",
    Extra: "✦",
    Camera: "◉",
    Technical: "⚙",
    Multimedia: "♫",
    Battery: "⚡",
  };

  const sortedItems = Array.isArray(items)
    ? [...items].sort(
        (a, b) =>
          (a.sortOrder ?? 0) -
          (b.sortOrder ?? 0)
      )
    : [];

  if (sortedItems.length === 0) {
    return null;
  }

  return (
    <fieldset className="relative min-w-0 rounded-xl border border-slate-200 bg-white px-3 pb-3 pt-2 shadow-sm transition-all duration-300 hover:border-slate-300 hover:shadow-md">
      {/* =================================================
          LEGEND / TITLE
      ================================================= */}

      <legend className="ml-2 px-2">
        <span className="inline-flex items-center gap-1.5 rounded-md bg-white px-1">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-50 text-[12px] font-black text-blue-600">
            {groupIcons[title] ?? "✦"}
          </span>

          <span className="text-[14px] font-black tracking-tight text-slate-800">
            {title}
          </span>
        </span>
      </legend>

      {/* =================================================
          SPECIFICATION TABLE
      ================================================= */}

      <div className="mt-1 overflow-hidden rounded-lg border border-slate-100">
        {sortedItems.map((item, index) => {
          const name =
            item.name?.trim() ||
            item.slug
              ?.replace(/[-_]/g, " ")
              .replace(/\b\w/g, (char) =>
                char.toUpperCase()
              ) ||
            "Specification";

          const value = getSpecValue(item);

          const unit =
            item.unit &&
            value &&
            !value
              .toLowerCase()
              .includes(
                item.unit.toLowerCase()
              )
              ? ` ${item.unit}`
              : "";

          const displayValue =
            `${value}${unit}`.trim();

          const normalizedValue =
            value.trim().toLowerCase();

          const positive = [
            "yes",
            "true",
            "supported",
            "available",
          ].includes(normalizedValue);

          const negative = [
            "no",
            "false",
            "not supported",
            "not available",
          ].includes(normalizedValue);

          let icon = "✦";

          const normalizedName =
            `${name} ${item.slug ?? ""}`.toLowerCase();

          if (
            normalizedName.includes("processor") ||
            normalizedName.includes("cpu") ||
            normalizedName.includes("chipset")
          ) {
            icon = "⚙";
          } else if (
            normalizedName.includes("ram") ||
            normalizedName.includes("memory")
          ) {
            icon = "◫";
          } else if (
            normalizedName.includes("storage") ||
            normalizedName.includes("rom")
          ) {
            icon = "▤";
          } else if (
            normalizedName.includes("display") ||
            normalizedName.includes("screen") ||
            normalizedName.includes("resolution")
          ) {
            icon = "▣";
          } else if (
            normalizedName.includes("camera") ||
            normalizedName.includes("ois") ||
            normalizedName.includes("flash")
          ) {
            icon = "◉";
          } else if (
            normalizedName.includes("battery") ||
            normalizedName.includes("charging")
          ) {
            icon = "⚡";
          } else if (
            normalizedName.includes("network") ||
            normalizedName.includes("connectivity") ||
            normalizedName.includes("wifi") ||
            normalizedName.includes("bluetooth") ||
            normalizedName.includes("5g")
          ) {
            icon = "⌁";
          } else if (
            normalizedName.includes("speaker") ||
            normalizedName.includes("audio") ||
            normalizedName.includes("music")
          ) {
            icon = "♫";
          } else if (
            normalizedName.includes("video") ||
            normalizedName.includes("multimedia")
          ) {
            icon = "▶";
          } else if (
            normalizedName.includes("android") ||
            normalizedName.includes("operating system") ||
            normalizedName.includes("software") ||
            normalizedName === "os"
          ) {
            icon = "◈";
          } else if (
            normalizedName.includes("weight") ||
            normalizedName.includes("dimension") ||
            normalizedName.includes("material")
          ) {
            icon = "◇";
          } else if (
            normalizedName.includes("ip rating") ||
            normalizedName.includes("water")
          ) {
            icon = "◌";
          } else if (
            normalizedName.includes("gps") ||
            normalizedName.includes("location")
          ) {
            icon = "⌖";
          }

          return (
            <div
              key={
                item.id ??
                `${item.slug ?? "spec"}-${index}`
              }
              className={`grid grid-cols-[135px_minmax(0,1fr)] transition-colors duration-200 hover:bg-blue-50/40 ${
                index !== sortedItems.length - 1
                  ? "border-b border-slate-100"
                  : ""
              }`}
            >
              {/* =================================================
                  SPEC NAME
              ================================================= */}

              <div className="flex min-w-0 items-center gap-2 bg-slate-50/70 px-3 py-2.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white text-[11px] font-black text-blue-600 shadow-sm ring-1 ring-slate-100">
                  {icon}
                </span>

                <span className="min-w-0 text-[11px] font-bold leading-4 text-slate-500">
                  {name}
                </span>
              </div>

              {/* =================================================
                  SPEC VALUE
              ================================================= */}

              <div className="flex min-w-0 items-center px-3 py-2.5 text-[12px] font-semibold leading-5 text-slate-700">
                {positive && (
                  <span className="mr-2 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-black text-emerald-600">
                    ✓
                  </span>
                )}

                {negative && (
                  <span className="mr-2 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-100 text-[10px] font-black text-rose-500">
                    ×
                  </span>
                )}

                <span className="break-words">
                  {displayValue || "—"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}

/* =========================================================
   SELLER
========================================================= */

function SellerRow({
  price,
  best,
}: {
  price: Price;
  best?: boolean;
}) {
  const seller =
    price.seller?.name ||
    "Seller";

  return (
    <div className="flex items-center gap-3 border-b border-slate-100 px-3 py-2.5 last:border-b-0">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-black text-slate-700">
        {seller
          .slice(0, 1)
          .toUpperCase()}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-slate-700">
          {seller}
        </p>

        <p
          className={`text-[10px] ${
            price.inStock === false
              ? "text-red-500"
              : "text-green-600"
          }`}
        >
          {price.inStock === false
            ? "Out of stock"
            : "In stock"}
        </p>
      </div>

      <div className="text-right">
        <p
          className={`text-sm font-extrabold ${
            best
              ? "text-green-700"
              : "text-slate-800"
          }`}
        >
          {formatPrice(
            price.amount,
            price.currency ?? "INR"
          )}
        </p>

        {price.url && (
          <a
            href={price.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-bold text-blue-600 hover:underline"
          >
            View →
          </a>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function MobileDetailPage() {
  const params = useParams();
  const router = useRouter();

  const slug = Array.isArray(
    params?.slug
  )
    ? params.slug[0]
    : String(
        params?.slug ?? ""
      );

  const [product, setProduct] =
    useState<Product | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [reviews, setReviews] =
    useState<Review[]>([]);

  const [currentUser, setCurrentUser] =
    useState<LoginUser | null>(null);

  const [reviewRating, setReviewRating] =
    useState(5);

  const [reviewTitle, setReviewTitle] =
    useState("");

  const [reviewComment, setReviewComment] =
    useState("");

  const [
    submittingReview,
    setSubmittingReview,
  ] = useState(false);

  const [
    reviewMessage,
    setReviewMessage,
  ] = useState("");

  const [
    editingReviewId,
    setEditingReviewId,
  ] = useState<string | null>(null);

  /* =======================================================
     LOAD PRODUCT
  ======================================================= */

  useEffect(() => {
    if (!slug) {
      return;
    }

    let active = true;

    async function loadProduct() {
      try {
        setLoading(true);
        setError("");

        const response =
          await fetch(
            `${API_URL}/products/${encodeURIComponent(
              slug
            )}`
          );

        if (!response.ok) {
          throw new Error(
            `Failed to load product (${response.status})`
          );
        }

        const data =
          await response.json();

        const loadedProduct =
          data?.product ??
          data?.data ??
          data;

        if (!loadedProduct?.id) {
          throw new Error(
            "Product not found"
          );
        }

        if (active) {
          setProduct(
            loadedProduct
          );
        }
      } catch (err) {
        console.error(
          "Product detail error:",
          err
        );

        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load product"
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      active = false;
    };
  }, [slug]);

  /* =======================================================
     USER
  ======================================================= */

  useEffect(() => {
    try {
      const storedUser =
        localStorage.getItem(
          "smartprix_user"
        );

      if (!storedUser) {
        return;
      }

      const parsed =
        JSON.parse(storedUser);

      if (parsed?.id) {
        setCurrentUser(parsed);
      }
    } catch {
      // Ignore invalid local storage
    }
  }, []);

  /* =======================================================
     REVIEWS
  ======================================================= */

  useEffect(() => {
    if (!product?.id) {
      return;
    }

    let active = true;

    async function loadReviews() {
      try {
        const response =
          await fetch(
            `${API_URL}/reviews/product/${product.id}`
          );

        if (!response.ok) {
          return;
        }

        const data =
          await response.json();

        const loadedReviews =
          data?.reviews ??
          data?.data ??
          data ??
          [];

        if (
          active &&
          Array.isArray(
            loadedReviews
          )
        ) {
          setReviews(
            loadedReviews
          );
        }
      } catch (err) {
        console.error(
          "Failed to load reviews:",
          err
        );
      }
    }

    loadReviews();

    return () => {
      active = false;
    };
  }, [product?.id]);
  

  /* =======================================================
     IMAGES
  ======================================================= */

  const images = useMemo(() => {
    const source = [
      ...(product?.images ?? []),
    ];

    source.sort((a, b) => {
      if (
        a.isPrimary &&
        !b.isPrimary
      ) {
        return -1;
      }

      if (
        !a.isPrimary &&
        b.isPrimary
      ) {
        return 1;
      }

      return (
        Number(
          a.sortOrder ?? 0
        ) -
        Number(
          b.sortOrder ?? 0
        )
      );
    });

    return source;
  }, [product?.images]);

  const [selectedImage, setSelectedImage] =
    useState(0);

  const activeImage =
    images[selectedImage];

  /* =======================================================
     PRICES
  ======================================================= */

  const sortedPrices = useMemo(() => {
    return [
      ...(product?.prices ?? []),
    ].sort(
      (a, b) =>
        Number(a.amount) -
        Number(b.amount)
    );
  }, [product?.prices]);

  const primaryPrice =
    sortedPrices[0];

 /* =======================================================
   SPEC GROUPS
======================================================= */

const specificationGroups = useMemo(() => {
  const groups = new Map<string, ProductSpecification[]>();

  for (const item of product?.specifications ?? []) {
    const group = item.group?.trim() || "General";

    const existing = groups.get(group) ?? [];
    existing.push(item);

    groups.set(group, existing);
  }

  return groups;
}, [product?.specifications]);

  /* =======================================================
     KEY SPECS
  ======================================================= */

  const processor =
    getSpecText(product, [
      "processor",
      "cpu",
      "chipset",
      "soc",
    ]);

  const ram =
    getSpecText(product, [
      "ram",
      "ram-capacity",
    ]);

  const storage =
    getSpecText(product, [
      "storage",
      "internal-storage",
      "inbuilt-memory",
      "rom",
    ]);

  const display =
    getSpecText(product, [
      "display",
      "screen",
      "display-size",
      "screen-size",
    ]);

  const resolution =
    getSpecText(product, [
      "screen-resolution",
      "display-resolution",
      "resolution",
    ]);

  const battery =
    getSpecText(product, [
      "battery",
      "battery-capacity",
      "battery-size",
    ]);

  const charging =
    getSpecText(product, [
      "charging",
      "fast-charging",
      "charging-speed",
    ]);

  const rearCamera =
    getSpecText(product, [
      "rear-camera",
      "main-camera",
      "primary-camera",
      "camera",
    ]);

  const frontCamera =
    getSpecText(product, [
      "front-camera",
      "selfie-camera",
    ]);

  const operatingSystem =
    getSpecText(product, [
      "operating-system",
      "os",
      "android-version",
      "software",
    ]);

  const refreshRate =
    getSpecText(product, [
      "refresh-rate",
      "screen-refresh-rate",
    ]);

  const connectivity =
    getSpecText(product, [
      "connectivity",
      "network",
      "network-type",
      "5g",
    ]);

  const ipRating =
    getSpecText(product, [
      "ip-rating",
      "water-resistance",
      "waterproof",
    ]);

  const nfc =
    getSpecText(product, [
      "nfc",
    ]);

  const ois =
    getSpecText(product, [
      "ois",
      "optical-image-stabilization",
    ]);

  /* =======================================================
     FEATURES
  ======================================================= */

  const features = useMemo(() => {
    const result: string[] =
      [];

    const add = (
      value: string,
      label: string
    ) => {
      if (
        value &&
        value !== "—" &&
        ![
          "no",
          "none",
          "false",
          "not supported",
        ].includes(
          value
            .toLowerCase()
            .trim()
        )
      ) {
        if (!result.includes(label)) {
          result.push(label);
        }
      }
    };

    add(nfc, "NFC");
    add(ois, "OIS");
    add(ipRating, ipRating);

    return result;
  }, [
    nfc,
    ois,
    ipRating,
  ]);

  /* =======================================================
     REVIEWS
  ======================================================= */

  const averageRating =
    useMemo(() => {
      if (!reviews.length) {
        return 0;
      }

      return (
        reviews.reduce(
          (sum, review) =>
            sum +
            Number(
              review.rating || 0
            ),
          0
        ) / reviews.length
      );
    }, [reviews]);

  const ratingDistribution =
    useMemo(() => {
      const distribution = {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
      };

      for (const review of reviews) {
        const rating =
          Math.round(
            Number(
              review.rating
            )
          ) as keyof typeof distribution;

        if (
          rating >= 1 &&
          rating <= 5
        ) {
          distribution[rating]++;
        }
      }

      return distribution;
    }, [reviews]);

  /* =======================================================
     REVIEW ACTIONS
  ======================================================= */

  function resetReviewForm() {
    setReviewRating(5);
    setReviewTitle("");
    setReviewComment("");
    setEditingReviewId(null);
  }

  async function submitReview() {
    if (!product?.id) {
      return;
    }

    if (!currentUser) {
      setReviewMessage(
        "Please login to write a review."
      );
      return;
    }

    if (!reviewComment.trim()) {
      setReviewMessage(
        "Please write a review comment."
      );
      return;
    }

    try {
      setSubmittingReview(true);
      setReviewMessage("");

      const token =
        localStorage.getItem(
          "smartprix_token"
        );

      const editing =
        Boolean(
          editingReviewId
        );

      const url = editing
        ? `${API_URL}/reviews/${editingReviewId}`
        : `${API_URL}/reviews`;

      const response =
        await fetch(url, {
          method: editing
            ? "PUT"
            : "POST",

          headers: {
            "Content-Type":
              "application/json",

            ...(token
              ? {
                  Authorization:
                    `Bearer ${token}`,
                }
              : {}),
          },

          body: JSON.stringify({
            productId:
              product.id,
            rating:
              reviewRating,
            title:
              reviewTitle.trim(),
            comment:
              reviewComment.trim(),
          }),
        });

      const data =
        await response
          .json()
          .catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Failed to submit review"
        );
      }

      setReviewMessage(
        editing
          ? "Review updated successfully."
          : "Review submitted successfully."
      );

      resetReviewForm();

      const reviewResponse =
        await fetch(
          `${API_URL}/reviews/product/${product.id}`
        );

      if (
        reviewResponse.ok
      ) {
        const reviewData =
          await reviewResponse.json();

        const updatedReviews =
          reviewData?.reviews ??
          reviewData?.data ??
          reviewData ??
          [];

        if (
          Array.isArray(
            updatedReviews
          )
        ) {
          setReviews(
            updatedReviews
          );
        }
      }
    } catch (err) {
      setReviewMessage(
        err instanceof Error
          ? err.message
          : "Failed to submit review."
      );
    } finally {
      setSubmittingReview(false);
    }
  }

  function editReview(
    review: Review
  ) {
    setEditingReviewId(
      review.id
    );

    setReviewRating(
      Number(review.rating)
    );

    setReviewTitle(
      review.title ?? ""
    );

    setReviewComment(
      review.comment ?? ""
    );

    document
      .getElementById(
        "write-review"
      )
      ?.scrollIntoView({
        behavior: "smooth",
      });
  }

  async function deleteReview(
    reviewId: string
  ) {
    if (
      !confirm(
        "Delete this review?"
      )
    ) {
      return;
    }

    try {
      const token =
        localStorage.getItem(
          "smartprix_token"
        );

      const response =
        await fetch(
          `${API_URL}/reviews/${reviewId}`,
          {
            method: "DELETE",

            headers: token
              ? {
                  Authorization:
                    `Bearer ${token}`,
                }
              : {},
          }
        );

      const data =
        await response
          .json()
          .catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Failed to delete review"
        );
      }

      setReviews(
        (previous) =>
          previous.filter(
            (review) =>
              review.id !==
              reviewId
          )
      );
    } catch (err) {
      setReviewMessage(
        err instanceof Error
          ? err.message
          : "Failed to delete review."
      );
    }
  }

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f1f3f6]">
        <div className="mx-auto max-w-[1180px] px-4 py-8">
          <div className="h-5 w-72 animate-pulse rounded bg-slate-200" />

          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_285px]">
            <div className="h-[700px] animate-pulse rounded-xl bg-white" />

            <div className="space-y-4">
              <div className="h-48 animate-pulse rounded-xl bg-white" />
              <div className="h-80 animate-pulse rounded-xl bg-white" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

 if (error || !product) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f1f3f6] px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-2xl">
          ⚠️
        </div>

        <h1 className="mt-4 text-lg font-extrabold text-slate-900">
          Unable to load product
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          {error || "Product not found."}
        </p>

        <button
          type="button"
          onClick={() => router.refresh()}
          className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-extrabold text-white transition hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    </main>
  );
}

  /* =======================================================
     MAIN
  ======================================================= */

  return (
    <main className="min-h-screen bg-[#eef1f4] text-slate-900">

      {/* =================================================
          BREADCRUMB
      ================================================= */}

      <div className="mx-auto max-w-[1320px] px-4 pt-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
          <Link
            href="/"
            className="font-medium hover:text-blue-600"
          >
            Home
          </Link>

          <span>›</span>

          <Link
            href="/mobiles"
            className="font-medium hover:text-blue-600"
          >
            Mobiles
          </Link>

          <span>›</span>

          <span className="truncate font-semibold text-slate-700">
            {product.name}
          </span>
        </div>
      </div>

      {/* =================================================
          PRODUCT TITLE BAR
      ================================================= */}

      <div className="mx-auto mt-3 max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

            <div>
              <div className="flex flex-wrap items-center gap-2">
                {product.brand?.name && (
                  <span className="rounded bg-blue-50 px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide text-blue-700">
                    {product.brand.name}
                  </span>
                )}

                {product.category?.name && (
                  <span className="rounded bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">
                    {product.category.name}
                  </span>
                )}
              </div>

              <h1 className="mt-2 text-xl font-extrabold tracking-tight text-slate-950 sm:text-2xl">
                {product.name}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50"
              >
                <Icon>＋</Icon>
                Compare
              </button>

              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-pink-300 hover:bg-pink-50"
              >
                <span className="text-base text-pink-500">
                  ♡
                </span>
                Like
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =================================================
          MAIN TWO COLUMN
      ================================================= */}

      <div className="mx-auto mt-4 max-w-[1320px] px-4 pb-12 sm:px-6 lg:px-8">
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_285px]">

          {/* =============================================
              LEFT MAIN
          ============================================= */}

          <div className="min-w-0 space-y-4">

            {/* ===========================================
                QUICK PRODUCT CARD
            =========================================== */}

            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

                <div className="grid md:grid-cols-[420px_minmax(0,1fr)]">

                {/* IMAGE */}
<div className="border-b border-slate-200 p-4 md:border-b-0 md:border-r">
      <div className="flex h-[300px] items-center justify-center rounded-2xl bg-slate-50 md:h-[360px]">
    <img
      src={getImageUrl(activeImage?.url)}
      alt={activeImage?.altText || product.name}
      className="h-full w-full object-contain p-8"
      onError={(event) => {
        event.currentTarget.src = PLACEHOLDER_IMAGE;
      }}
    />
  </div>

  {images.length > 0 && (
    <div className="mt-4 flex gap-2 overflow-x-auto px-1 pb-2 justify-center">
      {images.slice(0, 5).map((image, index) => (
        <button
          key={image.id ?? `${image.url}-${index}`}
          type="button"
          onClick={() => setSelectedImage(index)}
          className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 bg-white ${
            selectedImage === index
              ? "border-blue-600 shadow-md"
              : "border-slate-200"
          }`}
        >
          <img
            src={getImageUrl(image.url)}
            alt=""
            className="h-full w-full object-contain p-1"
          />
        </button>
      ))}
    </div>
  )}
</div>

                {/* SUMMARY */}

                <div className="p-5">

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="rounded-md bg-green-600 px-2 py-1 text-xs font-extrabold text-white">
                      {averageRating
                        ? averageRating.toFixed(
                            1
                          )
                        : "—"}{" "}
                      ★
                    </div>

                    <span className="text-xs font-semibold text-slate-500">
                      {reviews.length} Reviews
                    </span>
                  </div>

                  {product.shortDescription && (
                    <p className="mt-3 max-w-3xl text-xs leading-5 text-slate-500">
                      {htmlToPlainText(
                        product.shortDescription
                      )}
                    </p>
                  )}

                  <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {[
                      {
                        icon: "⚡",
                        label: "Processor",
                        value: processor,
                      },
                      {
                        icon: "🧠",
                        label: "RAM",
                        value: ram,
                      },
                      {
                        icon: "💾",
                        label: "Storage",
                        value: storage,
                      },
                      {
                        icon: "📱",
                        label: "Display",
                        value: display,
                      },
                      {
                        icon: "📷",
                        label: "Rear Camera",
                        value: rearCamera,
                      },
                      {
                        icon: "🤳",
                        label: "Front Camera",
                        value: frontCamera,
                      },
                      {
                        icon: "🔋",
                        label: "Battery",
                        value: battery,
                      },
                      {
                        icon: "⚡",
                        label: "Charging",
                        value: charging,
                      },
                    ].map(
                      (item) => (
                       <div
  key={item.label}
  className="group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-3 transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:bg-blue-50 hover:shadow-lg"
>
  <div className="text-lg transition-transform duration-300 group-hover:scale-125">
    {item.icon}
  </div>

  <p className="mt-1 text-[9px] font-bold uppercase tracking-wide text-slate-400 transition-colors duration-300 group-hover:text-blue-500">
    {item.label}
  </p>

  <p className="mt-1 line-clamp-2 text-[11px] font-bold leading-4 text-slate-700 transition-colors duration-300 group-hover:text-blue-700">
    {item.value || "—"}
  </p>
</div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* =========================================
                FULL SPECS
            ========================================= */}

            <section
              id="specifications"
              className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="border-b border-slate-200 px-4 py-3">
                <h2 className="text-lg font-extrabold text-slate-900">
                  {product.name} Full Specs
                </h2>

                <p className="mt-0.5 text-[11px] text-slate-500">
                  Complete technical specifications
                </p>
              </div>

              {specificationGroups.size === 0 ? (
                <div className="p-10 text-center text-sm text-slate-500">
                  No specifications available.
                </div>
              ) : (
                <div className="grid items-start gap-5 lg:grid-cols-2">
  
  {/* ==========================================
      LEFT COLUMN
  ========================================== */}

  <div className="space-y-5">
    {[
      "General",
      "Design",
      "Display",
      "Memory",
      "Connectivity",
    ].map((groupName) => {
      const specifications =
        specificationGroups.get(groupName);

      if (
        !specifications ||
        specifications.length === 0
      ) {
        return null;
      }

      return (
        <SpecificationGroup
          key={groupName}
          title={groupName}
          items={specifications}
        />
      );
    })}
  </div>

  {/* ==========================================
      RIGHT COLUMN
  ========================================== */}

  <div className="space-y-5">
    {[
      "Extra",
      "Camera",
      "Technical",
      "Multimedia",
      "Battery",
    ].map((groupName) => {
      const specifications =
        specificationGroups.get(groupName);

      if (
        !specifications ||
        specifications.length === 0
      ) {
        return null;
      }

      return (
        <SpecificationGroup
          key={groupName}
          title={groupName}
          items={specifications}
        />
      );
    })}
  </div>

</div>
              )}
            </section>

            {/* =========================================
                PRICE COMPARISON
            ========================================= */}

            <section
              id="price-comparison"
              className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">
                    Price Comparison
                  </h2>

                  <p className="text-[11px] text-slate-500">
                    Compare prices from sellers
                  </p>
                </div>

                {primaryPrice && (
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase text-slate-400">
                      Lowest price
                    </p>

                    <p className="text-lg font-black text-green-700">
                      {formatPrice(
                        primaryPrice.amount,
                        primaryPrice.currency ??
                          "INR"
                      )}
                    </p>
                  </div>
                )}
              </div>

              {sortedPrices.length ===
              0 ? (
                <div className="p-8 text-center text-sm text-slate-500">
                  No seller prices available.
                </div>
              ) : (
                <div>
                  {sortedPrices.map(
                    (price, index) => (
                      <SellerRow
                        key={price.id}
                        price={price}
                        best={
                          index === 0
                        }
                      />
                    )
                  )}
                </div>
              )}
            </section>

           {/* =========================================
    PREMIUM HIGHLIGHTS
========================================= */}

{features.length > 0 && (
  <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
    {/* HEADER */}

    <div className="border-b border-slate-200 bg-gradient-to-r from-blue-50/70 via-white to-indigo-50/40 px-5 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-lg text-white shadow-md">
            ✦
          </div>

          <div>
            <h2 className="text-lg font-black tracking-tight text-slate-950">
              Highlights
            </h2>

            <p className="mt-0.5 text-[11px] font-medium text-slate-500">
              Key features of {product.name}
            </p>
          </div>
        </div>

        <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[10px] font-extrabold text-blue-700">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
          {features.length} Key Features
        </div>
      </div>
    </div>

    {/* HIGHLIGHT CARDS */}

    <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
      {features.map((feature, index) => {
        const normalized =
          feature.toLowerCase();

        let icon = "✦";
        let description =
          "Useful feature";

        if (
          normalized.includes("nfc")
        ) {
          icon = "⌁";
          description =
            "Contactless connectivity";
        } else if (
          normalized.includes("ois")
        ) {
          icon = "◉";
          description =
            "Optical image stabilization";
        } else if (
          normalized.includes("ip")
        ) {
          icon = "◌";
          description =
            "Water & dust protection";
        }

        return (
          <div
            key={feature}
            className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
          >
            {/* TOP ACCENT */}

            <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-lg font-black text-blue-600 transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white">
                {icon}
              </div>

              <div className="min-w-0">
                <p className="text-[12px] font-black text-slate-800">
                  {feature}
                </p>

                <p className="mt-1 text-[10px] leading-4 text-slate-400">
                  {description}
                </p>
              </div>

              <span className="ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[10px] font-black text-emerald-600">
                ✓
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Feature {index + 1}
              </span>

              <span className="text-[10px] font-bold text-blue-500 transition-transform duration-300 group-hover:translate-x-1">
                View →
              </span>
            </div>
          </div>
        );
      })}
    </div>
  </section>
)}

            {/* =========================================
                ABOUT
            ========================================= */}

            {product.description && (
              <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-extrabold">
                  About {product.name}
                </h2>

                <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-600">
                  {htmlToPlainText(
                    product.description
                  )}
                </p>
              </section>
            )}

            {/* =========================================
                REVIEWS
            ========================================= */}

            <section
              id="reviews"
              className="rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="border-b border-slate-200 px-4 py-3">
                <h2 className="text-lg font-extrabold">
                  Ratings & Reviews
                </h2>
              </div>

              <div className="grid gap-5 p-5 lg:grid-cols-[190px_1fr]">

                <div className="rounded-xl bg-slate-50 p-5 text-center">
                  <div className="text-4xl font-black text-slate-900">
                    {averageRating
                      ? averageRating.toFixed(
                          1
                        )
                      : "—"}
                  </div>

                  <div className="mt-1 text-lg tracking-wider text-amber-400">
                    ★★★★★
                  </div>

                  <p className="mt-2 text-xs text-slate-500">
                    {reviews.length} reviews
                  </p>
                </div>

                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map(
                    (rating) => {
                      const count =
                        ratingDistribution[
                          rating as keyof typeof ratingDistribution
                        ];

                      const percentage =
                        reviews.length
                          ? (count /
                              reviews.length) *
                            100
                          : 0;

                      return (
                        <div
                          key={rating}
                          className="flex items-center gap-3"
                        >
                          <span className="w-8 text-[11px] font-bold">
                            {rating}★
                          </span>

                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-amber-400"
                              style={{
                                width: `${percentage}%`,
                              }}
                            />
                          </div>

                          <span className="w-5 text-right text-[10px] text-slate-400">
                            {count}
                          </span>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>

              <div className="border-t border-slate-200 p-5">
                {reviews.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
                    <div className="text-3xl">
                      ⭐
                    </div>

                    <h3 className="mt-2 font-bold">
                      No reviews yet
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Be the first to review this product.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reviews.map(
                      (review) => {
                        const isOwner =
                          Boolean(
                            currentUser?.id &&
                              review.user?.id &&
                              currentUser.id ===
                                review.user.id
                          );

                        return (
                          <article
                            key={
                              review.id
                            }
                            className="rounded-xl border border-slate-200 p-4"
                          >
                            <div className="flex justify-between gap-3">
                              <div>
                                <p className="text-sm font-bold">
                                  {review.user
                                    ?.name ||
                                    "Anonymous User"}
                                </p>

                                <div className="mt-1 text-xs text-amber-400">
                                  {"★".repeat(
                                    Math.round(
                                      Number(
                                        review.rating
                                      )
                                    )
                                  )}
                                </div>
                              </div>

                              <span className="text-[10px] text-slate-400">
                                {formatReviewDate(
                                  review.createdAt
                                )}
                              </span>
                            </div>

                            {review.title && (
                              <h3 className="mt-3 text-sm font-extrabold">
                                {review.title}
                              </h3>
                            )}

                            {review.comment && (
                              <p className="mt-1 text-sm leading-6 text-slate-600">
                                {review.comment}
                              </p>
                            )}

                            {isOwner && (
                              <div className="mt-3 flex gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    editReview(
                                      review
                                    )
                                  }
                                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-bold"
                                >
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    deleteReview(
                                      review.id
                                    )
                                  }
                                  className="rounded-lg border border-red-200 px-3 py-1.5 text-[11px] font-bold text-red-600"
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </article>
                        );
                      }
                    )}
                  </div>
                )}

                {/* WRITE REVIEW */}

                <div
                  id="write-review"
                  className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5"
                >
                  <h3 className="font-extrabold">
                    {editingReviewId
                      ? "Edit your review"
                      : "Write a review"}
                  </h3>

                  {!currentUser ? (
                    <p className="mt-3 rounded-lg bg-blue-50 p-3 text-xs font-medium text-blue-700">
                      Please login to write a review.
                    </p>
                  ) : (
                    <>
                      <div className="mt-4 flex gap-1">
                        {[1, 2, 3, 4, 5].map(
                          (rating) => (
                            <button
                              key={
                                rating
                              }
                              type="button"
                              onClick={() =>
                                setReviewRating(
                                  rating
                                )
                              }
                              className={`text-2xl ${
                                rating <=
                                reviewRating
                                  ? "text-amber-400"
                                  : "text-slate-300"
                              }`}
                            >
                              ★
                            </button>
                          )
                        )}
                      </div>

                      <input
                        value={
                          reviewTitle
                        }
                        onChange={(event) =>
                          setReviewTitle(
                            event.target
                              .value
                          )
                        }
                        placeholder="Review title"
                        className="mt-4 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                      />

                      <textarea
                        value={
                          reviewComment
                        }
                        onChange={(event) =>
                          setReviewComment(
                            event.target
                              .value
                          )
                        }
                        rows={4}
                        placeholder="Write your review..."
                        className="mt-3 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400"
                      />

                      {reviewMessage && (
                        <p className="mt-2 text-xs font-medium text-slate-600">
                          {reviewMessage}
                        </p>
                      )}

                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          disabled={
                            submittingReview
                          }
                          onClick={
                            submitReview
                          }
                          className="rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-extrabold text-white transition hover:bg-blue-700 disabled:opacity-50"
                        >
                          {submittingReview
                            ? "Submitting..."
                            : editingReviewId
                            ? "Update Review"
                            : "Submit Review"}
                        </button>

                        {editingReviewId && (
                          <button
                            type="button"
                            onClick={
                              resetReviewForm
                            }
                            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* =============================================
              RIGHT SIDEBAR
          ============================================= */}

          <aside className="space-y-4 lg:sticky lg:top-4">

            {/* PRODUCT PRICE CARD */}

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-3 py-3">
                <h2 className="text-sm font-extrabold text-slate-900">
                  {product.name}
                </h2>

                <div className="mt-2 flex gap-1">
                  <button className="flex-1 rounded-lg border border-slate-200 py-2 text-[10px] font-bold text-slate-600">
                    ＋ Compare
                  </button>

                  <button className="flex-1 rounded-lg border border-slate-200 py-2 text-[10px] font-bold text-pink-500">
                    ♡ Like
                  </button>
                </div>
              </div>

              {sortedPrices.length >
              0 ? (
                sortedPrices
                  .slice(0, 3)
                  .map(
                    (price, index) => (
                      <SellerRow
                        key={
                          price.id
                        }
                        price={
                          price
                        }
                        best={
                          index ===
                          0
                        }
                      />
                    )
                  )
              ) : (
                <div className="p-4 text-xs text-slate-500">
                  Price unavailable
                </div>
              )}

              <button
                type="button"
                onClick={() =>
                  document
                    .getElementById(
                      "price-comparison"
                    )
                    ?.scrollIntoView({
                      behavior:
                        "smooth",
                    })
                }
                className="m-3 w-[calc(100%-24px)] rounded-lg bg-blue-600 py-2.5 text-xs font-extrabold text-white hover:bg-blue-700"
              >
                View All Prices →
              </button>
            </div>

            {/* QUICK SPECS */}

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 bg-slate-50 px-3 py-2.5">
                <h2 className="text-sm font-extrabold">
                  Quick Specs
                </h2>
              </div>

              <div className="divide-y divide-slate-100">
                {[
                  [
                    "Processor",
                    processor,
                  ],
                  [
                    "Display",
                    display,
                  ],
                  [
                    "Resolution",
                    resolution,
                  ],
                  [
                    "Refresh Rate",
                    refreshRate,
                  ],
                  [
                    "Rear Camera",
                    rearCamera,
                  ],
                  [
                    "Battery",
                    battery,
                  ],
                  [
                    "OS",
                    operatingSystem,
                  ],
                  [
                    "Connectivity",
                    connectivity,
                  ],
                  [
                    "IP Rating",
                    ipRating,
                  ],
                  [
                    "NFC",
                    nfc,
                  ],
                ].map(
                  ([label, value]) => (
                    <div
                      key={label}
                      className="grid grid-cols-[88px_1fr] px-3 py-2"
                    >
                      <span className="text-[10px] font-bold text-slate-400">
                        {label}
                      </span>

                      <span className="text-right text-[10px] font-semibold text-slate-700">
                        {value}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* PRODUCT VARIANTS */}

            {product.variants &&
              product.variants.length >
                0 && (
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-200 bg-slate-50 px-3 py-2.5">
                    <h2 className="text-sm font-extrabold">
                      Variants
                    </h2>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {product.variants
                      .slice(0, 5)
                      .map(
                        (
                          variant
                        ) => (
                          <div
                            key={
                              variant.id
                            }
                            className="px-3 py-3"
                          >
                            <p className="text-xs font-extrabold text-slate-800">
                              {variant.name ||
                                "Variant"}
                            </p>

                            <div className="mt-1 space-y-0.5 text-[10px] text-slate-500">
                              {variant.ram && (
                                <p>
                                  RAM:{" "}
                                  <b className="text-slate-700">
                                    {
                                      variant.ram
                                    }
                                  </b>
                                </p>
                              )}

                              {variant.storage && (
                                <p>
                                  Storage:{" "}
                                  <b className="text-slate-700">
                                    {
                                      variant.storage
                                    }
                                  </b>
                                </p>
                              )}

                              {variant.color && (
                                <p>
                                  Color:{" "}
                                  <b className="text-slate-700">
                                    {
                                      variant.color
                                    }
                                  </b>
                                </p>
                              )}
                            </div>

                            {variant.price !=
                              null && (
                              <p className="mt-2 text-sm font-black text-green-700">
                                {formatPrice(
                                  variant.price
                                )}
                              </p>
                            )}
                          </div>
                        )
                      )}
                  </div>
                </div>
              )}

            {/* EXPLORE */}

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="bg-gradient-to-r from-blue-700 to-blue-500 p-4 text-white">
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-100">
                  Smartprix
                </p>

                <h2 className="mt-1 text-lg font-black">
                  Explore Mobiles
                </h2>

                <p className="mt-1 text-[11px] leading-4 text-blue-100">
                  Compare specifications,
                  prices and features.
                </p>

                <Link
                  href="/mobiles"
                  className="mt-3 inline-flex rounded-lg bg-white px-3 py-2 text-[10px] font-extrabold text-blue-700"
                >
                  Browse Mobiles →
                </Link>
              </div>
            </div>

          </aside>
        </div>
      </div>
    </main>
  );
}