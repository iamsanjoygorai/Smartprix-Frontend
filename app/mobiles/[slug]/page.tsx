"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface ProductImage {
  id: string;
  url: string;
  altText?: string | null;
  isPrimary?: boolean;
  sortOrder?: number;
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
  price: number | string;
  seller?: Seller | null;
  sellerName?: string;
  url?: string | null;
}

interface ProductVariant {
  id: string;
  name?: string | null;
  price?: number | string | null;
  storage?: string | null;
  ram?: string | null;
  color?: string | null;
}

interface Specification {
  id: string;
  name: string;
  slug: string;
  unit?: string | null;
  dataType?: string | null;
  group?: string | null;
}

interface SpecificationValue {
  id: string;
  value: string;
}

interface ProductSpecification {
  id: string;
  specification: Specification;
  value?: SpecificationValue | null;
  customValue?: string | null;
}

interface Review {
  id: string;
  rating: number;
  title?: string | null;
  comment?: string | null;
  user?: {
    name?: string | null;
  } | null;
  createdAt?: string;
  userId?: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  shortDescription?: string | null;
  releaseDate?: string | null;
  brand?: Brand | null;
  images?: ProductImage[];
  prices?: Price[];
  variants?: ProductVariant[];
  specifications?: ProductSpecification[];
  reviews?: Review[];
}

interface LoginUser {
  id: string;
  name?: string;
  email?: string;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5000/api";

const BACKEND_URL = API_URL.replace(/\/api\/?$/, "");

function getImageUrl(url: string) {
  if (!url) {
    return "/placeholder-product.png";
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  if (url.startsWith("/")) {
    return `${BACKEND_URL}${url}`;
  }

  return `${BACKEND_URL}/${url}`;
}

function formatPrice(
  value: number | string | null | undefined,
) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "₹0";
  }

  return `₹${numericValue.toLocaleString("en-IN")}`;
}

function getSpecValue(item: ProductSpecification) {
  return (
    item.customValue?.trim() ||
    item.value?.value?.trim() ||
    ""
  );
}

/**
 * Converts TinyMCE HTML into normal readable text.
 *
 * Example:
 *
 * <p>Hello &amp; welcome</p>
 *
 * becomes:
 *
 * Hello & welcome
 */
function htmlToPlainText(html: string | null | undefined) {
  if (!html) {
    return "";
  }

  if (typeof window === "undefined") {
    return html
      .replace(/<[^>]*>/g, "")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  }

  const parser = new DOMParser();
  const document = parser.parseFromString(
    html,
    "text/html",
  );

  return (
    document.body.textContent
      ?.replace(/\u00a0/g, " ")
      .replace(/\s+/g, " ")
      .trim() ?? ""
  );
}

function findSpecification(
  product: Product | null,
  options: {
    slugs?: string[];
    names?: string[];
    groups?: string[];
  },
) {
  if (!product?.specifications?.length) {
    return null;
  }

  const slugs = (options.slugs ?? []).map((item) =>
    item.toLowerCase(),
  );

  const names = (options.names ?? []).map((item) =>
    item.toLowerCase(),
  );

  const groups = (options.groups ?? []).map((item) =>
    item.toLowerCase(),
  );

  const exact = product.specifications.find((item) => {
    const slug =
      item.specification.slug.toLowerCase();

    const name =
      item.specification.name.toLowerCase();

    const group = (
      item.specification.group ?? "General"
    ).toLowerCase();

    const slugMatch = slugs.includes(slug);
    const nameMatch = names.includes(name);

    const groupMatch =
      groups.length === 0 || groups.includes(group);

    return (
      (slugMatch || nameMatch) &&
      groupMatch
    );
  });

  if (exact) {
    return exact;
  }

  const partial = product.specifications.find((item) => {
    const slug =
      item.specification.slug.toLowerCase();

    const name =
      item.specification.name.toLowerCase();

    const group = (
      item.specification.group ?? "General"
    ).toLowerCase();

    const keywordMatch = [...slugs, ...names].some(
      (keyword) =>
        slug.includes(keyword) ||
        name.includes(keyword),
    );

    const groupMatch =
      groups.length === 0 || groups.includes(group);

    return keywordMatch && groupMatch;
  });

  return partial ?? null;
}

function getSpecText(
  product: Product | null,
  options: {
    slugs?: string[];
    names?: string[];
    groups?: string[];
  },
) {
  const specification = findSpecification(
    product,
    options,
  );

  return specification
    ? getSpecValue(specification)
    : "";
}

function formatReviewDate(date?: string) {
  if (!date) {
    return "";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function ratingStars(rating: number) {
  const rounded = Math.round(rating);

  return "★".repeat(
    Math.max(0, Math.min(5, rounded)),
  );
}

export default function MobileDetailPage() {
  console.log("🔥 PRODUCT DETAIL PAGE IS RUNNING");
  const params = useParams();
  const router = useRouter();

  const slug =
    typeof params.slug === "string"
      ? params.slug
      : "";

  const [product, setProduct] =
    useState<Product | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedImage, setSelectedImage] =
    useState(0);

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

  const [submittingReview, setSubmittingReview] =
    useState(false);

  const [reviewMessage, setReviewMessage] =
    useState("");

  const [editingReviewId, setEditingReviewId] =
    useState<string | null>(null);

  /*
   * LOAD PRODUCT
   */
  useEffect(() => {
    if (!slug) {
      return;
    }

    const loadProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/products/${slug}`,
        );

        if (!response.ok) {
          throw new Error(
            "Unable to load mobile product.",
          );
        }

        const data = await response.json();

        const loadedProduct =
          data.product ?? data;

        setProduct(loadedProduct);
      } catch (err) {
        console.error(err);

        setError(
          "Unable to load this mobile product.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [slug]);

  /*
   * LOAD CURRENT USER
   */
  useEffect(() => {
    try {
      const storedUser =
        localStorage.getItem(
          "smartprix_user",
        );

      if (storedUser) {
        setCurrentUser(
          JSON.parse(storedUser),
        );
      }
    } catch {
      setCurrentUser(null);
    }
  }, []);

  /*
   * LOAD REVIEWS
   */
  useEffect(() => {
    if (!product?.id) {
      return;
    }

    const loadReviews = async () => {
      try {
        const response = await fetch(
          `${API_URL}/reviews/product/${product.id}`,
        );

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        setReviews(
          data.reviews ??
            data ??
            [],
        );
      } catch (err) {
        console.error(
          "Failed to load reviews:",
          err,
        );
      }
    };

    loadReviews();
  }, [product?.id]);

  /*
   * IMAGES
   */
  const images = useMemo(() => {
    return [...(product?.images ?? [])].sort(
      (a, b) =>
        (a.sortOrder ?? 0) -
        (b.sortOrder ?? 0),
    );
  }, [product?.images]);

  /*
   * PRIMARY PRICE
   */
  const primaryPrice = useMemo(() => {
    const prices = product?.prices ?? [];

    if (!prices.length) {
      return null;
    }

    return prices.reduce(
      (lowest, current) => {
        return Number(current.price) <
          Number(lowest.price)
          ? current
          : lowest;
      },
    );
  }, [product?.prices]);

  /*
   * GROUP SPECIFICATIONS
   */
  const groupedSpecifications = useMemo(() => {
    return (
      product?.specifications ?? []
    ).reduce<
      Record<string, ProductSpecification[]>
    >(
      (groups, item) => {
        const group =
          item.specification.group ||
          "General";

        if (!groups[group]) {
          groups[group] = [];
        }

        groups[group].push(item);

        return groups;
      },
      {},
    );
  }, [product?.specifications]);

  /*
   * AVERAGE RATING
   */
  const averageRating = useMemo(() => {
    if (!reviews.length) {
      return 0;
    }

    const total = reviews.reduce(
      (sum, review) =>
        sum + Number(review.rating || 0),
      0,
    );

    return total / reviews.length;
  }, [reviews]);

  /*
   * RATING DISTRIBUTION
   */
  const ratingDistribution = useMemo(() => {
    const counts = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    reviews.forEach((review) => {
      const rating = Math.round(
        Number(review.rating),
      ) as keyof typeof counts;

      if (rating >= 1 && rating <= 5) {
        counts[rating]++;
      }
    });

    return counts;
  }, [reviews]);

  /*
   * SPECIFICATION VALUES
   */
  const processor = getSpecText(product, {
    slugs: ["processor"],
    names: ["Processor"],
    groups: ["Performance"],
  });

  const chipset = getSpecText(product, {
    slugs: ["chipset"],
    names: ["Chipset"],
    groups: ["Performance"],
  });

  const ram = getSpecText(product, {
    slugs: ["ram"],
    names: ["RAM"],
    groups: [
      "Performance",
      "Memory",
    ],
  });

  const storage = getSpecText(product, {
    slugs: [
      "storage",
      "internal-storage",
    ],
    names: [
      "Storage",
      "Internal Storage",
    ],
  });

  const display = getSpecText(product, {
    slugs: [
      "screen-size",
      "screen_size",
      "size",
    ],
    names: [
      "Screen Size",
      "Size",
    ],
    groups: ["Display"],
  });

  const resolution = getSpecText(product, {
    slugs: ["resolution"],
    names: ["Resolution"],
    groups: ["Display"],
  });

  const operatingSystem = getSpecText(
    product,
    {
      slugs: [
        "operating-system",
        "os",
      ],
      names: [
        "Operating System",
        "OS",
      ],
      groups: ["General"],
    },
  );

  const gpu = getSpecText(product, {
    slugs: [
      "gpu",
      "graphics",
      "graphics-gpu",
    ],
    names: [
      "Graphics",
      "Graphics (GPU)",
      "GPU",
    ],
    groups: [
      "Performance",
      "Graphics",
    ],
  });

  const rearCamera = getSpecText(
    product,
    {
      slugs: [
        "rear-camera",
        "primary-camera",
        "main-camera",
      ],
      names: [
        "Rear Camera",
        "Primary Camera",
        "Main Camera",
      ],
      groups: ["Rear Camera"],
    },
  );

  const frontCamera = getSpecText(
    product,
    {
      slugs: [
        "front-camera",
        "selfie-camera",
      ],
      names: [
        "Front Camera",
        "Selfie Camera",
      ],
      groups: ["Front Camera"],
    },
  );

  const battery = getSpecText(product, {
    slugs: ["battery"],
    names: ["Battery"],
    groups: ["Battery"],
  });

  /*
   * DESCRIPTION AS NORMAL TEXT
   *
   * This converts:
   *
   * <p>Hello &amp; World</p>
   *
   * into:
   *
   * Hello & World
   */
  const plainDescription = useMemo(() => {
    return htmlToPlainText(
      product?.description,
    );
  }, [product?.description]);

  console.log("PRODUCT DESCRIPTION RAW:", product?.description);
console.log("PRODUCT DESCRIPTION PLAIN:", plainDescription);

  /*
   * KEY HIGHLIGHTS
   */
  const keyHighlights = [
    {
      label: "Processor",
      value:
        chipset ||
        processor ||
        "—",
    },
    {
      label: "RAM & Storage",
      value:
        [ram, storage]
          .filter(Boolean)
          .join(" • ") || "—",
    },
    {
      label: "Display",
      value:
        [display, resolution]
          .filter(Boolean)
          .join(", ") || "—",
    },
    {
      label: "Rear Camera",
      value:
        rearCamera || "—",
    },
    {
      label: "Front Camera",
      value:
        frontCamera || "—",
    },
    {
      label: "Battery",
      value:
        battery || "—",
    },
  ];

  const leftGroups = [
    "General",
    "Performance",
    "Display",
    "Design",
  ];

  const rightGroups = [
    "Rear Camera",
    "Front Camera",
    "Network & Connectivity",
    "Multimedia",
    "Sensors",
    "Battery",
  ];

  /*
   * SUBMIT / UPDATE REVIEW
   */
  const submitReview = async () => {
    if (!product?.id) {
      return;
    }

    if (!currentUser) {
      router.push("/login");
      return;
    }

    if (!reviewComment.trim()) {
      setReviewMessage(
        "Please write a review.",
      );
      return;
    }

    const wasEditing =
      Boolean(editingReviewId);

    try {
      setSubmittingReview(true);
      setReviewMessage("");

      const token =
        localStorage.getItem(
          "smartprix_token",
        );

      const url = editingReviewId
        ? `${API_URL}/reviews/${editingReviewId}`
        : `${API_URL}/reviews`;

      const method = editingReviewId
        ? "PUT"
        : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {}),
        },
        body: JSON.stringify({
          productId: product.id,
          rating: reviewRating,
          title:
            reviewTitle.trim() || null,
          comment:
            reviewComment.trim(),
        }),
      });

      if (!response.ok) {
        const data =
          await response
            .json()
            .catch(() => null);

        throw new Error(
          data?.message ||
            "Failed to submit review.",
        );
      }

      setReviewTitle("");
      setReviewComment("");
      setReviewRating(5);
      setEditingReviewId(null);

      setReviewMessage(
        wasEditing
          ? "Review updated successfully."
          : "Review submitted successfully.",
      );

      const reviewsResponse =
        await fetch(
          `${API_URL}/reviews/product/${product.id}`,
        );

      if (reviewsResponse.ok) {
        const data =
          await reviewsResponse.json();

        setReviews(
          data.reviews ??
            data ??
            [],
        );
      }
    } catch (err) {
      setReviewMessage(
        err instanceof Error
          ? err.message
          : "Failed to submit review.",
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  /*
   * DELETE REVIEW
   */
  const deleteReview = async (
    reviewId: string,
  ) => {
    if (!currentUser) {
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this review?",
      );

    if (!confirmed) {
      return;
    }

    try {
      const token =
        localStorage.getItem(
          "smartprix_token",
        );

      const response = await fetch(
        `${API_URL}/reviews/${reviewId}`,
        {
          method: "DELETE",
          headers: {
            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },
        },
      );

      if (!response.ok) {
        throw new Error(
          "Failed to delete review.",
        );
      }

      setReviews((current) =>
        current.filter(
          (review) =>
            review.id !== reviewId,
        ),
      );
    } catch (err) {
      console.error(err);

      setReviewMessage(
        "Failed to delete review.",
      );
    }
  };

  /*
   * START EDITING REVIEW
   */
  const startEditingReview = (
    review: Review,
  ) => {
    setEditingReviewId(review.id);

    setReviewRating(
      Number(review.rating) || 5,
    );

    setReviewTitle(
      review.title ?? "",
    );

    setReviewComment(
      review.comment ?? "",
    );

    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  };

  /*
   * LOADING
   */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f1f3f6]">
        <div className="mx-auto max-w-[1100px] px-3 py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-[420px] rounded-xl bg-white" />
            <div className="h-[300px] rounded-xl bg-white" />
          </div>
        </div>
      </div>
    );
  }

  /*
   * ERROR
   */
  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#f1f3f6]">
        <div className="mx-auto max-w-[1100px] px-3 py-12">
          <div className="rounded-xl bg-white p-10 text-center shadow-sm">
            <h1 className="text-xl font-bold text-gray-900">
              Mobile not found
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              {error ||
                "The requested mobile product could not be found."}
            </p>

            <Link
              href="/mobiles"
              className="mt-5 inline-flex rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Back to Mobiles
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f3f6]">
      <div className="mx-auto w-full max-w-[1100px] px-2 py-3">

        {/* BREADCRUMB */}
        <div className="mb-3 flex items-center gap-2 text-xs text-gray-500">
          <Link
            href="/"
            className="hover:text-blue-600"
          >
            Home
          </Link>

          <span>›</span>

          <Link
            href="/mobiles"
            className="hover:text-blue-600"
          >
            Mobiles
          </Link>

          <span>›</span>

          <span className="truncate text-gray-700">
            {product.name}
          </span>
        </div>

        {/* ======================================================
            PRODUCT TOP SECTION
        ====================================================== */}

        <section className="rounded-xl bg-white shadow-sm">
          <div className="grid gap-6 p-5 lg:grid-cols-[420px_1fr]">

            {/* IMAGE GALLERY */}
            <div>
              <div className="flex min-h-[400px] items-center justify-center rounded-xl border border-gray-100 bg-white p-6">
                {images.length > 0 ? (
                  <img
                    src={getImageUrl(
                      images[selectedImage]?.url ??
                        images[0].url,
                    )}
                    alt={
                      images[selectedImage]
                        ?.altText ||
                      product.name
                    }
                    className="max-h-[380px] w-auto max-w-full object-contain"
                  />
                ) : (
                  <div className="text-sm text-gray-400">
                    No image available
                  </div>
                )}
              </div>

              {images.length > 0 && (
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                  {images.map(
                    (image, index) => (
                      <button
                        key={image.id}
                        type="button"
                        onClick={() =>
                          setSelectedImage(
                            index,
                          )
                        }
                        className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border bg-white p-1 ${
                          selectedImage ===
                          index
                            ? "border-blue-600 ring-1 ring-blue-600"
                            : "border-gray-200"
                        }`}
                      >
                        <img
                          src={getImageUrl(
                            image.url,
                          )}
                          alt={
                            image.altText ||
                            `${product.name} ${
                              index + 1
                            }`
                          }
                          className="h-full w-full object-contain"
                        />
                      </button>
                    ),
                  )}
                </div>
              )}
            </div>

            {/* PRODUCT INFORMATION */}
            <div className="flex flex-col">

              {/* BRAND + RELEASE DATE */}
              <div className="flex items-center gap-2">
                {product.brand && (
                  <span className="text-sm font-semibold text-gray-500">
                    {product.brand.name}
                  </span>
                )}

                {product.releaseDate && (
                  <span className="text-xs text-gray-400">
                    • Released{" "}
                    {new Date(
                      product.releaseDate,
                    ).toLocaleDateString(
                      "en-IN",
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      },
                    )}
                  </span>
                )}
              </div>

              {/* PRODUCT NAME */}
              <h1 className="mt-2 text-2xl font-bold leading-tight text-gray-900 md:text-3xl">
                {product.name}
              </h1>

              {/* SHORT DESCRIPTION */}
              {product.shortDescription && (
                <p className="mt-3 text-sm leading-6 text-gray-600">
                  {product.shortDescription}
                </p>
              )}

              {/* DESCRIPTION - NORMAL TEXT */}
              {plainDescription && (
                <div className="mt-5">
                  <h2 className="text-lg font-bold text-gray-900">
                    Description
                  </h2>

                  <p className="mt-2 text-sm leading-7 text-gray-700">
                    {plainDescription}
                  </p>
                </div>
              )}

              {/* RATING */}
              <div className="mt-4 flex items-center gap-3">
                <div className="rounded-md bg-green-600 px-2.5 py-1 text-sm font-bold text-white">
                  {averageRating
                    ? averageRating.toFixed(
                        1,
                      )
                    : "—"}{" "}
                  ★
                </div>

                <span className="text-sm text-gray-500">
                  {reviews.length}{" "}
                  {reviews.length === 1
                    ? "Review"
                    : "Reviews"}
                </span>
              </div>

              {/* PRICE */}
              <div className="mt-5">
                <div className="text-3xl font-bold text-gray-900">
                  {primaryPrice
                    ? formatPrice(
                        primaryPrice.price,
                      )
                    : "Price unavailable"}
                </div>

                {primaryPrice?.seller && (
                  <div className="mt-1 text-sm text-gray-500">
                    Available at{" "}
                    <span className="font-medium text-gray-700">
                      {
                        primaryPrice
                          .seller.name
                      }
                    </span>
                  </div>
                )}
              </div>

              {/* KEY HIGHLIGHTS */}
              <div className="mt-6">
                <h2 className="text-lg font-bold text-gray-900">
                  Key Highlights
                </h2>

                <div className="mt-3 grid grid-cols-1 gap-x-5 gap-y-3 sm:grid-cols-2">
                  {keyHighlights.map(
                    (item) => (
                      <div
                        key={item.label}
                        className="rounded-lg border border-gray-100 bg-gray-50 p-3"
                      >
                        <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                          {item.label}
                        </div>

                        <div className="mt-1 text-sm font-semibold leading-5 text-gray-900">
                          {item.value}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================
            SPECIFICATIONS
        ====================================================== */}

        <section className="mt-3 rounded-xl bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="text-xl font-bold text-gray-900">
              Specifications
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Complete specifications of{" "}
              {product.name}
            </p>
          </div>

          <div className="grid gap-4 p-5 md:grid-cols-2">
            {[
              {
                label: "Processor",
                value:
                  chipset ||
                  processor ||
                  "—",
              },
              {
                label: "RAM",
                value: ram || "—",
              },
              {
                label: "Storage",
                value:
                  storage || "—",
              },
              {
                label: "Display",
                value:
                  [
                    display,
                    resolution,
                  ]
                    .filter(Boolean)
                    .join(" • ") ||
                  "—",
              },
              {
                label: "Operating System",
                value:
                  operatingSystem ||
                  "—",
              },
              {
                label: "Graphics",
                value: gpu || "—",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-gray-100 p-4"
              >
                <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  {item.label}
                </div>

                <div className="mt-1 text-sm font-semibold text-gray-900">
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ======================================================
            FULL SPECIFICATIONS
        ====================================================== */}

        <section className="mt-3 rounded-xl bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="text-xl font-bold text-gray-900">
              Full Specifications
            </h2>
          </div>

          <div className="grid gap-5 p-5 lg:grid-cols-2">

            {/* LEFT */}
            <div className="space-y-5">
              {leftGroups.map((group) => {
                const items =
                  groupedSpecifications[
                    group
                  ] ?? [];

                if (!items.length) {
                  return null;
                }

                return (
                  <div
                    key={group}
                    className="overflow-hidden rounded-xl border border-gray-200"
                  >
                    <div className="bg-gray-50 px-4 py-3">
                      <h3 className="text-base font-bold text-gray-900">
                        {group}
                      </h3>
                    </div>

                    <div className="divide-y divide-gray-100">
                      {items.map(
                        (item) => (
                          <div
                            key={item.id}
                            className="grid grid-cols-[42%_58%] px-4 py-3"
                          >
                            <div className="pr-3 text-sm text-gray-500">
                              {
                                item
                                  .specification
                                  .name
                              }
                            </div>

                            <div className="text-sm font-medium leading-5 text-gray-900">
                              {getSpecValue(
                                item,
                              ) || "—"}
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* RIGHT */}
            <div className="space-y-5">
              {rightGroups.map(
                (group) => {
                  const items =
                    groupedSpecifications[
                      group
                    ] ?? [];

                  if (!items.length) {
                    return null;
                  }

                  return (
                    <div
                      key={group}
                      className="overflow-hidden rounded-xl border border-gray-200"
                    >
                      <div className="bg-gray-50 px-4 py-3">
                        <h3 className="text-base font-bold text-gray-900">
                          {group}
                        </h3>
                      </div>

                      <div className="divide-y divide-gray-100">
                        {items.map(
                          (item) => (
                            <div
                              key={item.id}
                              className="grid grid-cols-[42%_58%] px-4 py-3"
                            >
                              <div className="pr-3 text-sm text-gray-500">
                                {
                                  item
                                    .specification
                                    .name
                                }
                              </div>

                              <div className="text-sm font-medium leading-5 text-gray-900">
                                {getSpecValue(
                                  item,
                                ) || "—"}
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          </div>
        </section>

        {/* ======================================================
            PRICE COMPARISON
        ====================================================== */}

        <section className="mt-3 rounded-xl bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="text-xl font-bold text-gray-900">
              Price Comparison
            </h2>
          </div>

          <div className="divide-y divide-gray-100">
            {(product.prices ?? []).map(
              (price) => (
                <div
                  key={price.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                >
                  <div>
                    <div className="font-semibold text-gray-900">
                      {price.seller?.name ||
                        price.sellerName ||
                        "Seller"}
                    </div>

                    <div className="mt-1 text-xs text-gray-500">
                      Online price
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-lg font-bold text-gray-900">
                      {formatPrice(
                        price.price,
                      )}
                    </span>

                    {price.url && (
                      <a
                        href={price.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                      >
                        Visit Store
                      </a>
                    )}
                  </div>
                </div>
              ),
            )}

            {!product.prices?.length && (
              <div className="px-5 py-8 text-center text-sm text-gray-500">
                No price comparison data
                available.
              </div>
            )}
          </div>
        </section>

        {/* ======================================================
            ABOUT PRODUCT
        ====================================================== */}

        <section className="mt-3 rounded-xl bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">
            About Product
          </h2>

          {plainDescription ? (
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-gray-600">
              {plainDescription}
            </p>
          ) : product.shortDescription ? (
            <p className="mt-3 text-sm leading-7 text-gray-600">
              {product.shortDescription}
            </p>
          ) : (
            <p className="mt-3 text-sm leading-7 text-gray-500">
              No product description available.
            </p>
          )}
        </section>

        {/* ======================================================
            RATINGS & REVIEWS
        ====================================================== */}

        <section className="mt-3 rounded-xl bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="text-xl font-bold text-gray-900">
              Ratings & Reviews
            </h2>
          </div>

          <div className="grid gap-6 p-5 md:grid-cols-[260px_1fr]">

            {/* RATING SUMMARY */}
            <div className="rounded-xl bg-gray-50 p-5 text-center">
              <div className="text-4xl font-bold text-gray-900">
                {reviews.length
                  ? averageRating.toFixed(
                      1,
                    )
                  : "—"}
              </div>

              <div className="mt-1 text-xl tracking-wide text-yellow-500">
                {reviews.length
                  ? ratingStars(
                      averageRating,
                    )
                  : "★★★★★"}
              </div>

              <div className="mt-2 text-sm text-gray-500">
                {reviews.length}{" "}
                {reviews.length === 1
                  ? "review"
                  : "reviews"}
              </div>

              <div className="mt-5 space-y-2 text-left">
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
                        className="flex items-center gap-2 text-xs"
                      >
                        <span className="w-5">
                          {rating}★
                        </span>

                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                          <div
                            className="h-full rounded-full bg-green-500"
                            style={{
                              width: `${percentage}%`,
                            }}
                          />
                        </div>

                        <span className="w-5 text-right text-gray-500">
                          {count}
                        </span>
                      </div>
                    );
                  },
                )}
              </div>
            </div>

            {/* REVIEWS */}
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center">
                  <div className="font-semibold text-gray-900">
                    No reviews yet
                  </div>

                  <div className="mt-1 text-sm text-gray-500">
                    Be the first to review
                    this mobile.
                  </div>
                </div>
              ) : (
                reviews.map((review) => {
                  const isOwner =
                    currentUser?.id ===
                    review.userId;

                  return (
                    <article
                      key={review.id}
                      className="rounded-xl border border-gray-100 p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="rounded bg-green-600 px-2 py-0.5 text-xs font-bold text-white">
                              {review.rating} ★
                            </span>

                            {review.title && (
                              <span className="font-semibold text-gray-900">
                                {review.title}
                              </span>
                            )}
                          </div>

                          <div className="mt-1 text-xs text-gray-500">
                            {review.user
                              ?.name ||
                              "User"}

                            {review.createdAt
                              ? ` • ${formatReviewDate(
                                  review.createdAt,
                                )}`
                              : ""}
                          </div>
                        </div>

                        {isOwner && (
                          <div className="flex gap-3 text-xs">
                            <button
                              type="button"
                              onClick={() =>
                                startEditingReview(
                                  review,
                                )
                              }
                              className="font-semibold text-blue-600"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                deleteReview(
                                  review.id,
                                )
                              }
                              className="font-semibold text-red-600"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>

                      {review.comment && (
                        <p className="mt-3 whitespace-pre-line text-sm leading-6 text-gray-600">
                          {review.comment}
                        </p>
                      )}
                    </article>
                  );
                })
              )}
            </div>
          </div>

          {/* REVIEW FORM */}
          <div className="border-t border-gray-100 p-5">
            <h3 className="text-lg font-bold text-gray-900">
              {editingReviewId
                ? "Edit your review"
                : "Write a review"}
            </h3>

            {!currentUser ? (
              <div className="mt-3 rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
                Please{" "}
                <Link
                  href="/login"
                  className="font-semibold text-blue-600"
                >
                  login
                </Link>{" "}
                to write a review.
              </div>
            ) : (
              <div className="mt-4 max-w-2xl space-y-4">

                {/* RATING */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Rating
                  </label>

                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(
                      (rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() =>
                            setReviewRating(
                              rating,
                            )
                          }
                          className={`text-2xl ${
                            rating <=
                            reviewRating
                              ? "text-yellow-500"
                              : "text-gray-300"
                          }`}
                        >
                          ★
                        </button>
                      ),
                    )}
                  </div>
                </div>

                {/* REVIEW TITLE */}
                <input
                  type="text"
                  value={reviewTitle}
                  onChange={(event) =>
                    setReviewTitle(
                      event.target.value,
                    )
                  }
                  placeholder="Review title"
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />

                {/* REVIEW COMMENT */}
                <textarea
                  value={reviewComment}
                  onChange={(event) =>
                    setReviewComment(
                      event.target.value,
                    )
                  }
                  placeholder="Write your review..."
                  rows={5}
                  className="w-full resize-none rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />

                {/* MESSAGE */}
                {reviewMessage && (
                  <div className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-600">
                    {reviewMessage}
                  </div>
                )}

                {/* BUTTONS */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    disabled={
                      submittingReview
                    }
                    onClick={submitReview}
                    className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
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
                      onClick={() => {
                        setEditingReviewId(
                          null,
                        );
                        setReviewTitle("");
                        setReviewComment("");
                        setReviewRating(5);
                      }}
                      className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* BACK */}
        <div className="py-6">
          <Link
            href="/mobiles"
            className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
          >
            ← Back to Mobiles
          </Link>
        </div>
      </div>
    </div>
  );
}