"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5000/api";

const BACKEND_URL = API_URL.replace(/\/api\/?$/, "");

const getImageUrl = (url: string) => {
  if (!url) return "/placeholder-product.png";

  if (
    url.startsWith("http://") ||
    url.startsWith("https://")
  ) {
    return url;
  }

  if (url.startsWith("/")) {
    return `${BACKEND_URL}${url}`;
  }

  return `${BACKEND_URL}/${url}`;
};

interface LaptopImage {
  id: string;
  url: string;
  altText?: string | null;
  isPrimary?: boolean;
  sortOrder?: number;
}

interface LaptopBrand {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
}

interface LaptopSeller {
  id: string;
  name: string;
  logoUrl?: string | null;
}

interface LaptopPrice {
  id: string;
  amount: number | string;
  currency: string;
  inStock: boolean;
  seller?: LaptopSeller | null;
  variant?: {
    id: string;
    name: string;
  } | null;
}

interface LaptopVariant {
  id: string;
  name: string;
  storage?: string | null;
  ram?: string | null;
  color?: string | null;
}

interface LaptopSpecification {
  id: string;
  productId: string;
  specificationId: string;
  valueId: string | null;
  customValue: string | null;

  specification: {
    id: string;
    name: string;
    slug: string;
    unit: string | null;
    dataType: string;
    group: string;
  };

  value: {
    id: string;
    specificationId: string;
    value: string;
  } | null;
}

interface LaptopProduct {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  shortDescription?: string | null;
  releaseDate?: string | null;
  brand?: LaptopBrand | null;
  images?: LaptopImage[];
  variants?: LaptopVariant[];
  prices?: LaptopPrice[];
  specifications?: LaptopSpecification[];
}

interface ReviewUser {
  id: string;
  name?: string | null;
}

interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title?: string | null;
  content?: string | null;
  isVerified?: boolean;
  isPublished?: boolean;
  createdAt: string;
  updatedAt: string;
  user?: ReviewUser | null;
}

interface ReviewResponse {
  success: boolean;
  reviews?: Review[];
  message?: string;
}

interface LoginUser {
  id: string;
  email: string;
  name?: string;
  role: string;
  permissions?: string[];
}

const formatPrice = (
  value: number | string,
  currency = "INR",
) => {
  const amount =
    typeof value === "string"
      ? Number(value)
      : value;

  if (!Number.isFinite(amount)) {
    return "Price unavailable";
  }

  if (currency === "INR") {
    return `₹${amount.toLocaleString("en-IN")}`;
  }

  return `${currency} ${amount.toLocaleString(
    "en-IN",
  )}`;
};

const getSpecification = (
  product: LaptopProduct,
  keywords: string[],
) => {
  const specification =
    product.specifications?.find((item) => {
      const name =
        `${item.specification.name} ${item.specification.slug}`.toLowerCase();

      return keywords.some((keyword) =>
        name.includes(keyword.toLowerCase()),
      );
    });

  if (!specification) {
    return null;
  }

  return (
    specification.customValue ||
    specification.value?.value ||
    null
  );
};

const formatReviewDate = (date: string) => {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function LaptopProductPage() {
  const params = useParams();
  const router = useRouter();

  const slug = Array.isArray(params.slug)
    ? params.slug[0]
    : params.slug;

  const [product, setProduct] =
    useState<LaptopProduct | null>(null);

  const [reviews, setReviews] = useState<Review[]>([]);

  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [reviewError, setReviewError] =
    useState("");

  const [selectedImage, setSelectedImage] =
    useState(0);

  const [isWishlisted, setIsWishlisted] =
    useState(false);

  const [isCompared, setIsCompared] =
    useState(false);

  const [currentUser, setCurrentUser] =
    useState<LoginUser | null>(null);

  const [showReviewForm, setShowReviewForm] =
    useState(false);

  const [editingReviewId, setEditingReviewId] =
    useState<string | null>(null);

  const [reviewRating, setReviewRating] =
    useState(5);

  const [reviewTitle, setReviewTitle] =
    useState("");

  const [reviewContent, setReviewContent] =
    useState("");

  const [submittingReview, setSubmittingReview] =
    useState(false);

  /*
   * ==================================================
   * GROUP SPECIFICATIONS
   * ==================================================
   */

  const groupedSpecifications =
    (product?.specifications ?? []).reduce<
      Record<string, LaptopSpecification[]>
    >((groups, item) => {
      const group =
        item.specification.group || "General";

      if (!groups[group]) {
        groups[group] = [];
      }

      groups[group].push(item);

      return groups;
    }, {});

  const leftGroups = [
    "General",
    "Display",
    "Connectivity",
  ];

  const rightGroups = [
    "Input",
    "Processor",
    "Graphics",
    "Memory",
    "Battery",
    "Extra",
  ];

  /*
   * ==================================================
   * FETCH PRODUCT
   * ==================================================
   */

  useEffect(() => {
    if (!slug) {
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${API_URL}/products/${slug}`,
          {
            cache: "no-store",
          },
        );

        const responseText =
          await response.text();

        if (!response.ok) {
          console.error(
            "Product API error:",
            response.status,
            responseText,
          );

          throw new Error(
            `Product API returned ${response.status}`,
          );
        }

        const result = JSON.parse(
          responseText,
        );

        if (!result.success || !result.data) {
          throw new Error(
            result.message ||
              "Product not found",
          );
        }

        setProduct(result.data);
      } catch (err) {
        console.error(
          "Failed to load laptop:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load product",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  /*
   * ==================================================
   * CURRENT USER
   * ==================================================
   */

  useEffect(() => {
    const token = localStorage.getItem(
      "smartprix_token",
    );

    const userData = localStorage.getItem(
      "smartprix_user",
    );

    if (!token || !userData) {
      return;
    }

    try {
      const user: LoginUser =
        JSON.parse(userData);

      setCurrentUser(user);
    } catch {
      localStorage.removeItem(
        "smartprix_user",
      );

      localStorage.removeItem(
        "smartprix_token",
      );
    }
  }, []);

  /*
   * ==================================================
   * FETCH REVIEWS
   * ==================================================
   */

  useEffect(() => {
    if (!product?.id) {
      return;
    }

    const fetchReviews = async () => {
      try {
        setReviewsLoading(true);
        setReviewError("");

        const response = await fetch(
          `${API_URL}/reviews/product/${product.id}`,
          {
            cache: "no-store",
          },
        );

        const responseText =
          await response.text();

        if (!response.ok) {
          throw new Error(
            `Review API returned ${response.status}`,
          );
        }

        const result: ReviewResponse =
          JSON.parse(responseText);

        if (!result.success) {
          throw new Error(
            result.message ||
              "Failed to load reviews",
          );
        }

        setReviews(result.reviews ?? []);
      } catch (err) {
        console.error(
          "Failed to load reviews:",
          err,
        );

        setReviewError(
          err instanceof Error
            ? err.message
            : "Failed to load reviews",
        );
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [product?.id]);

  /*
   * ==================================================
   * IMAGES
   * ==================================================
   */

  const images = useMemo(() => {
    if (!product?.images?.length) {
      return [
        {
          id: "placeholder",
          url: "/placeholder-product.png",
          altText:
            product?.name || "Laptop",
        },
      ];
    }

    return [...product.images].sort(
      (a, b) =>
        (a.sortOrder ?? 0) -
        (b.sortOrder ?? 0),
    );
  }, [product]);

  /*
   * ==================================================
   * PRICES
   * ==================================================
   */

  const prices = useMemo(() => {
    return [...(product?.prices ?? [])]
      .filter((price) => price.inStock)
      .sort(
        (a, b) =>
          Number(a.amount) -
          Number(b.amount),
      );
  }, [product]);

  const lowestPrice = prices[0];

  /*
   * ==================================================
   * KEY SPECIFICATIONS
   * ==================================================
   */

  const processor = product
    ? getSpecification(product, [
        "processor",
        "cpu",
        "chipset",
      ])
    : null;

  const ram = product
    ? getSpecification(product, [
        "ram",
        "memory",
      ])
    : null;

  const storage = product
    ? getSpecification(product, [
        "storage",
      ])
    : null;

  const screenSize = product
    ? getSpecification(product, [
        "screen-size",
        "screen size",
        "display size",
      ])
    : null;

  const operatingSystem = product
    ? getSpecification(product, [
        "operating-system",
        "operating system",
        "os",
      ])
    : null;

  const graphics = product
    ? getSpecification(product, [
        "graphics",
        "gpu",
      ])
    : null;

  /*
   * ==================================================
   * RATING
   * ==================================================
   */

  const averageRating = useMemo(() => {
    if (reviews.length === 0) {
      return 0;
    }

    const total = reviews.reduce(
      (sum, review) =>
        sum + review.rating,
      0,
    );

    return Number(
      (total / reviews.length).toFixed(1),
    );
  }, [reviews]);

  const ratingCounts = useMemo(() => {
    return {
      5: reviews.filter(
        (review) => review.rating === 5,
      ).length,

      4: reviews.filter(
        (review) => review.rating === 4,
      ).length,

      3: reviews.filter(
        (review) => review.rating === 3,
      ).length,

      2: reviews.filter(
        (review) => review.rating === 2,
      ).length,

      1: reviews.filter(
        (review) => review.rating === 1,
      ).length,
    };
  }, [reviews]);

  /*
   * ==================================================
   * REVIEW FORM
   * ==================================================
   */

  const resetReviewForm = () => {
    setReviewRating(5);
    setReviewTitle("");
    setReviewContent("");
    setEditingReviewId(null);
    setShowReviewForm(false);
  };

  const handleWriteReview = () => {
    const token = localStorage.getItem(
      "smartprix_token",
    );

    if (!token || !currentUser) {
      router.push(
        `/login?redirect=/laptops/${product?.slug}`,
      );

      return;
    }

    setEditingReviewId(null);
    setReviewRating(5);
    setReviewTitle("");
    setReviewContent("");
    setReviewError("");
    setShowReviewForm(true);
  };

  const handleEditReview = (
    review: Review,
  ) => {
    setEditingReviewId(review.id);
    setReviewRating(review.rating);
    setReviewTitle(review.title ?? "");
    setReviewContent(
      review.content ?? "",
    );
    setReviewError("");
    setShowReviewForm(true);
  };

  const handleSubmitReview = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const token = localStorage.getItem(
      "smartprix_token",
    );

    if (!token) {
      router.push(
        `/login?redirect=/laptops/${product?.slug}`,
      );

      return;
    }

    if (!product?.id) {
      return;
    }

    if (
      reviewRating < 1 ||
      reviewRating > 5
    ) {
      setReviewError(
        "Please select a rating between 1 and 5.",
      );

      return;
    }

    if (!reviewContent.trim()) {
      setReviewError(
        "Please write your review.",
      );

      return;
    }

    try {
      setSubmittingReview(true);
      setReviewError("");

      const isEditing =
        Boolean(editingReviewId);

      const url = isEditing
        ? `${API_URL}/reviews/${editingReviewId}`
        : `${API_URL}/reviews`;

      const response = await fetch(url, {
        method: isEditing
          ? "PATCH"
          : "POST",

        headers: {
          "Content-Type":
            "application/json",

          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify(
          isEditing
            ? {
                rating: reviewRating,

                title:
                  reviewTitle.trim() ||
                  undefined,

                content:
                  reviewContent.trim(),
              }
            : {
                productId: product.id,

                rating: reviewRating,

                title:
                  reviewTitle.trim() ||
                  undefined,

                content:
                  reviewContent.trim(),
              },
        ),
      });

      const responseText =
        await response.text();

      let result: {
        success?: boolean;
        message?: string;
        review?: Review;
      };

      try {
        result = JSON.parse(
          responseText,
        );
      } catch {
        throw new Error(
          "Invalid response from server.",
        );
      }

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Failed to save review",
        );
      }

      if (result.review) {
        if (isEditing) {
          setReviews((previous) =>
            previous.map((review) =>
              review.id ===
              result.review!.id
                ? result.review!
                : review,
            ),
          );
        } else {
          setReviews((previous) => [
            result.review!,
            ...previous,
          ]);
        }
      }

      resetReviewForm();
    } catch (err) {
      console.error(
        "Failed to submit review:",
        err,
      );

      setReviewError(
        err instanceof Error
          ? err.message
          : "Failed to save review",
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (
    reviewId: string,
  ) => {
    const token = localStorage.getItem(
      "smartprix_token",
    );

    if (!token) {
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
      setReviewError("");

      const response = await fetch(
        `${API_URL}/reviews/${reviewId}`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Failed to delete review",
        );
      }

      setReviews((previous) =>
        previous.filter(
          (review) =>
            review.id !== reviewId,
        ),
      );
    } catch (err) {
      console.error(
        "Failed to delete review:",
        err,
      );

      setReviewError(
        err instanceof Error
          ? err.message
          : "Failed to delete review",
      );
    }
  };

  /*
   * ==================================================
   * LOADING
   * ==================================================
   */

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="mb-6 h-5 w-64 rounded bg-gray-200" />

            <div className="grid gap-6 lg:grid-cols-[44%_56%]">
              <div className="rounded-xl bg-white p-6">
                <div className="h-[420px] rounded-lg bg-gray-200" />
              </div>

              <div className="space-y-4">
                <div className="h-10 w-3/4 rounded bg-gray-200" />

                <div className="h-6 w-1/3 rounded bg-gray-200" />

                <div className="h-32 rounded bg-gray-200" />

                <div className="h-24 rounded bg-gray-200" />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /*
   * ==================================================
   * ERROR
   * ==================================================
   */

  if (error || !product) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <div className="rounded-xl border border-red-200 bg-white p-10">
            <div className="mb-4 text-5xl">
              😕
            </div>

            <h1 className="text-2xl font-bold text-gray-900">
              Product not found
            </h1>

            <p className="mt-2 text-gray-500">
              {error ||
                "We couldn't find this laptop."}
            </p>

            <Link
              href="/laptops"
              className="mt-6 inline-flex rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Back to Laptops
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /*
   * ==================================================
   * PAGE
   * ==================================================
   */

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">

        {/* ==================================================
            BREADCRUMB
        ================================================== */}

        <nav className="mb-5 flex flex-wrap items-center gap-2 text-sm text-gray-500">
          <Link
            href="/"
            className="hover:text-blue-600"
          >
            Home
          </Link>

          <span>/</span>

          <Link
            href="/laptops"
            className="hover:text-blue-600"
          >
            Laptops
          </Link>

          <span>/</span>

          <span className="truncate text-gray-800">
            {product.name}
          </span>
        </nav>

        {/* ==================================================
            PRODUCT TOP SECTION

            LEFT  = IMAGE GALLERY
            RIGHT = PRODUCT INFORMATION
        ================================================== */}

        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="grid lg:grid-cols-[44%_56%]">

            {/* ==================================================
                IMAGE GALLERY
            ================================================== */}

            <div className="border-b border-gray-200 p-5 lg:border-b-0 lg:border-r">
              <div className="flex flex-col gap-5 sm:flex-row">

                {/* Thumbnails */}

                <div className="order-2 flex gap-3 overflow-x-auto sm:order-1 sm:w-20 sm:flex-col">
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
                        className={`relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-white p-1 transition ${
                          selectedImage ===
                          index
                            ? "border-blue-600 ring-2 ring-blue-100"
                            : "border-gray-200 hover:border-blue-400"
                        }`}
                      >
                        <img
                          src={getImageUrl(
                            image.url,
                          )}
                          alt={
                            image.altText ||
                            product.name
                          }
                          className="h-full w-full object-contain"
                        />
                      </button>
                    ),
                  )}
                </div>

                {/* Main Image */}

                <div className="order-1 flex min-h-[380px] flex-1 items-center justify-center sm:order-2">
                  <div className="relative h-[360px] w-full max-w-[500px]">
                    <img
                      src={getImageUrl(
                        images[
                          selectedImage
                        ]?.url ||
                          "/placeholder-product.png",
                      )}
                      alt={
                        images[
                          selectedImage
                        ]?.altText ||
                        product.name
                      }
                      className="h-full w-full object-contain"
                    />
                  </div>
                </div>
              </div>

              {/* Wishlist / Compare */}

              <div className="mt-5 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setIsWishlisted(
                      !isWishlisted,
                    )
                  }
                  className={`inline-flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-medium transition ${
                    isWishlisted
                      ? "border-red-200 bg-red-50 text-red-600"
                      : "border-gray-300 text-gray-700 hover:border-red-300 hover:text-red-600"
                  }`}
                >
                  <span className="text-lg">
                    {isWishlisted
                      ? "♥"
                      : "♡"}
                  </span>

                  {isWishlisted
                    ? "Wishlisted"
                    : "Add to Wishlist"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setIsCompared(
                      !isCompared,
                    )
                  }
                  className={`inline-flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-medium transition ${
                    isCompared
                      ? "border-blue-200 bg-blue-50 text-blue-600"
                      : "border-gray-300 text-gray-700 hover:border-blue-300 hover:text-blue-600"
                  }`}
                >
                  <span>⚖</span>

                  {isCompared
                    ? "Added to Compare"
                    : "Compare"}
                </button>
              </div>
            </div>

            {/* ==================================================
                PRODUCT INFORMATION
            ================================================== */}

            <div className="p-5 sm:p-7">

              {/* Brand */}

              {product.brand && (
                <div className="mb-2 text-sm font-medium text-blue-600">
                  {product.brand.name}
                </div>
              )}

              {/* Product Heading */}

              <h1 className="text-2xl font-bold leading-tight text-gray-900 sm:text-3xl">
                {product.name}
              </h1>

              {/* Description */}

              {(product.shortDescription ||
                product.description) && (
                <p className="mt-4 text-sm leading-6 text-gray-600">
                  {product.shortDescription ||
                    product.description}
                </p>
              )}

              {/* Rating */}

              <div className="mt-4 flex flex-wrap items-center gap-3">
                {reviews.length > 0 ? (
                  <>
                    <span className="inline-flex items-center gap-1 rounded bg-green-600 px-3 py-1 text-sm font-bold text-white">
                      ★{" "}
                      {averageRating.toFixed(
                        1,
                      )}
                    </span>

                    <span className="text-sm text-gray-600">
                      {reviews.length}{" "}
                      {reviews.length === 1
                        ? "Review"
                        : "Reviews"}
                    </span>
                  </>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded bg-gray-100 px-3 py-1 text-sm font-medium text-gray-500">
                    ★ No reviews yet
                  </span>
                )}
              </div>

              {/* Price */}

              <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-5">
                <div className="text-sm text-gray-500">
                  Starting price
                </div>

                <div className="mt-1 flex flex-wrap items-end gap-3">
                  <span className="text-3xl font-bold text-gray-900">
                    {lowestPrice
                      ? formatPrice(
                          lowestPrice.amount,
                          lowestPrice.currency,
                        )
                      : "Price unavailable"}
                  </span>

                  {lowestPrice?.seller && (
                    <span className="mb-1 text-sm text-gray-500">
                      at{" "}
                      <span className="font-semibold text-gray-700">
                        {
                          lowestPrice
                            .seller.name
                        }
                      </span>
                    </span>
                  )}
                </div>

                {lowestPrice && (
                  <button
                    type="button"
                    className="mt-4 w-full rounded-lg bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-600 sm:w-auto"
                  >
                    View Best Deal
                  </button>
                )}
              </div>

              {/* ==================================================
                  VARIANTS
              ================================================== */}

              {product.variants &&
                product.variants.length >
                  0 && (
                  <div className="mt-7">
                    <h2 className="text-lg font-bold text-gray-900">
                      Available Variants
                    </h2>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {product.variants.map(
                        (variant) => (
                          <button
                            key={variant.id}
                            type="button"
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600"
                          >
                            {variant.name}
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </section>

        {/* ==================================================
            SPECIFICATIONS
        ================================================== */}

        {product.specifications &&
          product.specifications.length >
            0 && (
            <section className="mt-6 rounded-xl border border-gray-200 bg-white">
              <div className="border-b border-gray-200 px-5 py-4 sm:px-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Specifications
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 sm:p-6">
                {[
                  {
                    label: "Processor",
                    value: processor,
                  },
                  {
                    label: "RAM",
                    value: ram,
                  },
                  {
                    label: "Storage",
                    value: storage,
                  },
                  {
                    label: "Display",
                    value: screenSize,
                  },
                  {
                    label: "Operating System",
                    value: operatingSystem,
                  },
                  {
                    label: "Graphics",
                    value: graphics,
                  },
                ]
                  .filter(
                    (item) =>
                      item.value,
                  )
                  .map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3"
                    >
                      <span className="text-sm text-gray-500">
                        {item.label}
                      </span>

                      <span className="text-right text-sm font-semibold text-gray-900">
                        {item.value}
                      </span>
                    </div>
                  ))}
              </div>
            </section>
          )}

        {/* ==================================================
            FULL SPECIFICATIONS
        ================================================== */}

        {product.specifications &&
          product.specifications.length >
            0 && (
            <section className="mt-6 rounded-xl border border-gray-200 bg-white">

              {/* Header */}

              <div className="border-b border-gray-200 px-5 py-4 sm:px-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Full Specifications
                </h2>
              </div>

              {/* Two Columns */}

              <div className="grid grid-cols-1 gap-6 p-5 sm:p-6 lg:grid-cols-2">

                {/* ==================================================
                    LEFT COLUMN
                    General
                    Display
                    Connectivity
                ================================================== */}

                <div className="space-y-6">
                  {leftGroups.map(
                    (group) => {
                      const specifications =
                        groupedSpecifications[
                          group
                        ] ?? [];

                      if (
                        specifications.length ===
                        0
                      ) {
                        return null;
                      }

                      return (
                        <div
                          key={group}
                          className="overflow-hidden rounded-xl border border-gray-200 bg-white"
                        >
                          {/* Group Heading */}

                          <div className="border-b border-gray-200 bg-gray-50 px-5 py-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {group}
                            </h3>
                          </div>

                          {/* Rows */}

                          <div className="divide-y divide-gray-100">
                            {specifications.map(
                              (item) => (
                                <div
                                  key={
                                    item.id
                                  }
                                  className="grid grid-cols-1 sm:grid-cols-[45%_55%]"
                                >
                                  <div className="bg-gray-50 px-5 py-3 text-sm text-gray-500">
                                    {
                                      item
                                        .specification
                                        .name
                                    }
                                  </div>

                                  <div className="px-5 py-3 text-sm font-medium text-gray-900">
                                    {item
                                      .value
                                      ?.value ??
                                      item.customValue ??
                                      "-"}
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

                {/* ==================================================
                    RIGHT COLUMN
                    Input
                    Processor
                    Graphics
                    Memory
                    Battery
                    Extra
                ================================================== */}

                <div className="space-y-6">
                  {rightGroups.map(
                    (group) => {
                      const specifications =
                        groupedSpecifications[
                          group
                        ] ?? [];

                      if (
                        specifications.length ===
                        0
                      ) {
                        return null;
                      }

                      return (
                        <div
                          key={group}
                          className="overflow-hidden rounded-xl border border-gray-200 bg-white"
                        >
                          {/* Group Heading */}

                          <div className="border-b border-gray-200 bg-gray-50 px-5 py-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {group}
                            </h3>
                          </div>

                          {/* Rows */}

                          <div className="divide-y divide-gray-100">
                            {specifications.map(
                              (item) => (
                                <div
                                  key={
                                    item.id
                                  }
                                  className="grid grid-cols-1 sm:grid-cols-[45%_55%]"
                                >
                                  <div className="bg-gray-50 px-5 py-3 text-sm text-gray-500">
                                    {
                                      item
                                        .specification
                                        .name
                                    }
                                  </div>

                                  <div className="px-5 py-3 text-sm font-medium text-gray-900">
                                    {item
                                      .value
                                      ?.value ??
                                      item.customValue ??
                                      "-"}
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
          )}

        {/* ==================================================
            PRICE COMPARISON
        ================================================== */}

        {prices.length > 0 && (
          <section className="mt-6 rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-5 py-4 sm:px-6">
              <h2 className="text-xl font-bold text-gray-900">
                Price Comparison
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Compare prices from available
                sellers.
              </p>
            </div>

            <div className="divide-y divide-gray-200">
              {prices.map(
                (price, index) => (
                  <div
                    key={price.id}
                    className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-sm font-bold text-gray-500">
                        {index + 1}
                      </div>

                      <div>
                        <div className="font-semibold text-gray-900">
                          {price.seller
                            ?.name ||
                            "Seller"}
                        </div>

                        {price.variant
                          ?.name && (
                          <div className="mt-1 text-xs text-gray-500">
                            {
                              price
                                .variant
                                .name
                            }
                          </div>
                        )}

                        <div className="mt-1 text-xs text-green-600">
                          In Stock
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-5 sm:justify-end">
                      <div className="text-xl font-bold text-gray-900">
                        {formatPrice(
                          price.amount,
                          price.currency,
                        )}
                      </div>

                      <button
                        type="button"
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                      >
                        View Deal
                      </button>
                    </div>
                  </div>
                ),
              )}
            </div>
          </section>
        )}

        {/* ==================================================
            ABOUT PRODUCT
        ================================================== */}

        {product.description && (
          <section className="mt-6 rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
            <h2 className="text-xl font-bold text-gray-900">
              About {product.name}
            </h2>

            <div className="mt-4 whitespace-pre-line text-sm leading-7 text-gray-600">
              {product.description}
            </div>
          </section>
        )}

        {/* ==================================================
            RATINGS & REVIEWS
        ================================================== */}

        <section className="mt-6 rounded-xl border border-gray-200 bg-white">

          {/* Header */}

          <div className="border-b border-gray-200 px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Ratings & Reviews
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {reviews.length > 0
                    ? `${reviews.length} ${
                        reviews.length ===
                        1
                          ? "review"
                          : "reviews"
                      }`
                    : "Be the first to review this laptop"}
                </p>
              </div>

              <button
                type="button"
                onClick={
                  handleWriteReview
                }
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Write a Review
              </button>
            </div>
          </div>

          {/* Rating Summary */}

          {reviews.length > 0 && (
            <div className="grid gap-6 border-b border-gray-200 p-5 sm:p-6 lg:grid-cols-[220px_1fr]">

              {/* Average */}

              <div className="flex flex-col items-center justify-center rounded-xl bg-gray-50 p-5">
                <div className="text-4xl font-bold text-gray-900">
                  {averageRating.toFixed(
                    1,
                  )}
                </div>

                <div className="mt-2 text-xl tracking-wide text-yellow-500">
                  {"★".repeat(
                    Math.round(
                      averageRating,
                    ),
                  )}

                  <span className="text-gray-300">
                    {"★".repeat(
                      5 -
                        Math.round(
                          averageRating,
                        ),
                    )}
                  </span>
                </div>

                <div className="mt-2 text-sm text-gray-500">
                  Based on{" "}
                  {reviews.length}{" "}
                  {reviews.length ===
                  1
                    ? "review"
                    : "reviews"}
                </div>
              </div>

              {/* Distribution */}

              <div className="flex flex-col justify-center gap-2">
                {[5, 4, 3, 2, 1].map(
                  (rating) => {
                    const count =
                      ratingCounts[
                        rating as
                          | 1
                          | 2
                          | 3
                          | 4
                          | 5
                      ];

                    const percentage =
                      reviews.length > 0
                        ? (count /
                            reviews.length) *
                          100
                        : 0;

                    return (
                      <div
                        key={rating}
                        className="flex items-center gap-3"
                      >
                        <span className="w-10 text-sm font-medium text-gray-600">
                          {rating} ★
                        </span>

                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                          <div
                            className="h-full rounded-full bg-yellow-400"
                            style={{
                              width: `${percentage}%`,
                            }}
                          />
                        </div>

                        <span className="w-8 text-right text-xs text-gray-500">
                          {count}
                        </span>
                      </div>
                    );
                  },
                )}
              </div>
            </div>
          )}

          {/* Review Form */}

          {showReviewForm && (
            <div className="border-b border-gray-200 bg-gray-50 p-5 sm:p-6">
              <div className="mx-auto max-w-2xl">

                <div className="mb-5 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">
                    {editingReviewId
                      ? "Edit your review"
                      : "Write a review"}
                  </h3>

                  <button
                    type="button"
                    onClick={
                      resetReviewForm
                    }
                    className="text-sm font-medium text-gray-500 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                </div>

                <form
                  onSubmit={
                    handleSubmitReview
                  }
                  className="space-y-5"
                >
                  {/* Rating */}

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Your Rating
                    </label>

                    <div className="flex gap-2">
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
                            className={`text-3xl transition ${
                              rating <=
                              reviewRating
                                ? "text-yellow-400"
                                : "text-gray-300"
                            } hover:text-yellow-400`}
                            aria-label={`${rating} star`}
                          >
                            ★
                          </button>
                        ),
                      )}
                    </div>
                  </div>

                  {/* Title */}

                  <div>
                    <label
                      htmlFor="review-title"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Review Title
                      <span className="ml-1 text-gray-400">
                        (optional)
                      </span>
                    </label>

                    <input
                      id="review-title"
                      type="text"
                      value={reviewTitle}
                      onChange={(event) =>
                        setReviewTitle(
                          event.target.value,
                        )
                      }
                      maxLength={120}
                      placeholder="Summarize your experience"
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Content */}

                  <div>
                    <label
                      htmlFor="review-content"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Your Review
                    </label>

                    <textarea
                      id="review-content"
                      value={reviewContent}
                      onChange={(event) =>
                        setReviewContent(
                          event.target.value,
                        )
                      }
                      rows={5}
                      maxLength={2000}
                      placeholder="Tell other buyers what you think about this laptop..."
                      className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />

                    <div className="mt-1 text-right text-xs text-gray-400">
                      {reviewContent.length}
                      /2000
                    </div>
                  </div>

                  {/* Error */}

                  {reviewError && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {reviewError}
                    </div>
                  )}

                  {/* Submit */}

                  <button
                    type="submit"
                    disabled={
                      submittingReview
                    }
                    className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submittingReview
                      ? "Saving..."
                      : editingReviewId
                        ? "Update Review"
                        : "Submit Review"}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Review Error */}

          {!showReviewForm &&
            reviewError && (
              <div className="m-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {reviewError}
              </div>
            )}

          {/* Reviews List */}

          <div>
            {reviewsLoading ? (
              <div className="space-y-5 p-5 sm:p-6">
                {[1, 2].map(
                  (item) => (
                    <div
                      key={item}
                      className="animate-pulse border-b border-gray-100 pb-5"
                    >
                      <div className="h-5 w-32 rounded bg-gray-200" />

                      <div className="mt-3 h-4 w-48 rounded bg-gray-200" />

                      <div className="mt-3 h-12 w-full rounded bg-gray-200" />
                    </div>
                  ),
                )}
              </div>
            ) : reviews.length === 0 ? (
              <div className="px-5 py-12 text-center sm:px-6">
                <div className="text-4xl">
                  ⭐
                </div>

                <h3 className="mt-3 text-lg font-semibold text-gray-900">
                  No reviews yet
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Be the first person to
                  review this laptop.
                </p>

                <button
                  type="button"
                  onClick={
                    handleWriteReview
                  }
                  className="mt-5 rounded-lg border border-blue-600 px-5 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50"
                >
                  Write the First Review
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {reviews.map(
                  (review) => {
                    const isOwner =
                      currentUser?.id ===
                      review.userId;

                    return (
                      <article
                        key={review.id}
                        className="p-5 sm:p-6"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="inline-flex items-center rounded bg-green-600 px-2 py-1 text-xs font-bold text-white">
                                {
                                  review.rating
                                }
                                ★
                              </span>

                              {review.title && (
                                <h3 className="font-semibold text-gray-900">
                                  {
                                    review.title
                                  }
                                </h3>
                              )}

                              {review.isVerified && (
                                <span className="rounded bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600">
                                  Verified
                                </span>
                              )}
                            </div>

                            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                              <span className="font-medium text-gray-700">
                                {review
                                  .user
                                  ?.name ||
                                  "User"}
                              </span>

                              <span>
                                •
                              </span>

                              <span>
                                {formatReviewDate(
                                  review.createdAt,
                                )}
                              </span>
                            </div>
                          </div>

                          {isOwner && (
                            <div className="flex gap-3">
                              <button
                                type="button"
                                onClick={() =>
                                  handleEditReview(
                                    review,
                                  )
                                }
                                className="text-sm font-medium text-blue-600 hover:underline"
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteReview(
                                    review.id,
                                  )
                                }
                                className="text-sm font-medium text-red-600 hover:underline"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>

                        {review.content && (
                          <p className="mt-4 whitespace-pre-line text-sm leading-7 text-gray-600">
                            {
                              review.content
                            }
                          </p>
                        )}
                      </article>
                    );
                  },
                )}
              </div>
            )}
          </div>
        </section>

        {/* ==================================================
            BACK
        ================================================== */}

        <div className="py-8 text-center">
          <Link
            href="/laptops"
            className="text-sm font-semibold text-blue-600 hover:underline"
          >
            ← Back to all laptops
          </Link>
        </div>
      </div>
    </main>
  );
}