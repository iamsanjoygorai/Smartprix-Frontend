import { getProduct } from "@/lib/api/products";
import { getProductSpecifications } from "@/lib/api/specifications";
import { getProductPriceHistory } from "@/lib/api/priceHistory";
import ProductImageGallery from "@/components/products/ProductImageGallery";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

interface SpecificationItem {
  id: string;
  key: string;
  value: string;
}

interface SpecificationGroup {
  title: string;
  icon: string;
  keys: string[];
}

const specificationGroups: SpecificationGroup[] = [
  {
    title: "General",
    icon: "⚙️",
    keys: [
      "launch-date",
      "announced-date",
      "operating-system",
      "os-version",
      "sim-type",
      "number-of-sims",
      "network",
      "5g",
      "4g",
      "model-number",
    ],
  },
  {
    title: "Design",
    icon: "📐",
    keys: [
      "height",
      "width",
      "thickness",
      "weight",
      "build-material",
      "frame-material",
      "back-material",
      "water-resistance",
      "ip-rating",
      "colors",
    ],
  },
  {
    title: "Display",
    icon: "🖥️",
    keys: [
      "display-type",
      "screen-size",
      "resolution",
      "resolution-type",
      "refresh-rate",
      "touch-sampling-rate",
      "peak-brightness",
      "hdr",
      "hdr10",
      "hdr10+",
      "display-protection",
      "always-on-display",
      "screen-to-body-ratio",
    ],
  },
  {
    title: "Performance",
    icon: "⚡",
    keys: [
      "processor",
      "chipset",
      "cpu",
      "cpu-architecture",
      "cpu-speed",
      "cpu-cores",
      "gpu",
      "cooling-system",
      "antutu-score",
      "geekbench-single-core",
      "geekbench-multi-core",
    ],
  },
  {
    title: "Memory",
    icon: "💾",
    keys: [
      "ram",
      "internal-storage",
      "storage-type",
      "memory-card",
      "expandable-storage",
    ],
  },
  {
    title: "Camera",
    icon: "📷",
    keys: [
      "rear-camera",
      "main-camera",
      "ultra-wide",
      "telephoto",
      "periscope",
      "macro",
      "ois",
      "autofocus",
      "laser-autofocus",
      "flash",
      "front-camera",
    ],
  },
  {
    title: "Video",
    icon: "🎥",
    keys: [
      "rear-video",
      "front-video",
      "8k-video",
      "4k-video",
      "slow-motion",
      "video-stabilization",
    ],
  },
  {
    title: "Connectivity",
    icon: "📡",
    keys: [
      "wi-fi",
      "wi-fi-version",
      "bluetooth",
      "bluetooth-version",
      "nfc",
      "gps",
      "usb-type",
      "usb-version",
      "usb-otg",
      "infrared",
      "headphone-jack",
    ],
  },
  {
    title: "Battery",
    icon: "🔋",
    keys: [
      "battery-capacity",
      "battery-type",
      "removable",
      "fast-charging",
      "charging-wattage",
      "wireless-charging",
      "wireless-charging-wattage",
      "reverse-wireless-charging",
    ],
  },
  {
    title: "Software",
    icon: "🤖",
    keys: [
      "android-version",
      "ui",
      "major-android-updates",
      "security-updates",
      "update-support-until",
    ],
  },
  {
    title: "Features",
    icon: "✨",
    keys: [
      "fingerprint-sensor",
      "face-unlock",
      "stereo-speakers",
      "dolby-atmos",
      "dual-sim",
      "esim",
      "desktop-mode",
      "fm-radio",
    ],
  },
  {
    title: "Sensors",
    icon: "🧭",
    keys: [
      "accelerometer",
      "gyroscope",
      "proximity",
      "compass",
      "barometer",
      "ambient-light-sensor",
    ],
  },
  {
    title: "AI Features",
    icon: "🧠",
    keys: [
      "ai-assistant",
      "circle-to-search",
      "ai-eraser",
      "generative-edit",
      "live-translate",
      "interpreter",
      "writing-assist",
      "note-assist",
      "transcript-assist",
      "browsing-assist",
    ],
  },
];

function formatSpecificationName(value: string) {
  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatSpecificationValue(value: string) {
  if (value === "true") return "Yes";
  if (value === "false") return "No";

  return value;
}

function getImageUrl(url: string) {
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:5000/api";

  const API_SERVER_URL = API_URL.replace(/\/api\/?$/, "");

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return `${API_SERVER_URL}${url.startsWith("/") ? url : `/${url}`}`;
}

function SpecificationSection({
  group,
  specifications,
}: {
  group: SpecificationGroup;
  specifications: SpecificationItem[];
}) {
  const groupSpecifications = specifications.filter((item) =>
    group.keys.includes(item.key),
  );

  if (groupSpecifications.length === 0) {
    return null;
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50/80 px-5 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
          {group.icon}
        </div>

        <div>
          <h3 className="text-lg font-bold text-gray-900">
            {group.title}
          </h3>

          <p className="text-xs text-gray-500">
            {groupSpecifications.length} specifications
          </p>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {groupSpecifications.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-1 gap-1 px-5 py-4 transition hover:bg-gray-50 sm:grid-cols-3 sm:gap-4"
          >
            <div className="text-sm font-medium text-gray-500">
              {formatSpecificationName(item.key)}
            </div>

            <div className="text-sm font-semibold text-gray-900 sm:col-span-2">
              {formatSpecificationValue(item.value)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { slug } = await params;

  const [
    productResponse,
    specificationsResponse,
    priceHistoryResponse,
  ] = await Promise.all([
    getProduct(slug),
    getProductSpecifications(slug),
    getProductPriceHistory(slug),
  ]);

  const product = productResponse.data;

  const rawSpecifications =
    specificationsResponse.data ?? [];

  const specifications: SpecificationItem[] =
    rawSpecifications.map((item: any) => ({
      id: item.id,
      key:
        item.specification?.slug ??
        item.specification?.name ??
        "",
      value:
        item.customValue ??
        item.value?.value ??
        "N/A",
    }));

  const priceHistory =
    priceHistoryResponse.data.history ?? [];

  const startingPrice = product.prices[0]?.amount
    ? Number(product.prices[0].amount)
    : null;

  const primaryImage =
    product.images.find((image) => image.isPrimary) ??
    product.images[0];

  const specificationCount = specifications.length;

  const groupedSpecifications =
    specificationGroups.filter((group) =>
      specifications.some((specification) =>
        group.keys.includes(specification.key),
      ),
    );

  return (
    <main className="min-h-screen bg-[#f5f6f8]">
      {/* Breadcrumb */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-hidden text-sm">
            <span className="shrink-0 text-gray-400">
              Home
            </span>

            <span className="text-gray-300">/</span>

            <span className="shrink-0 text-gray-400">
              {product.category.name}
            </span>

            <span className="text-gray-300">/</span>

            <span className="truncate font-medium text-gray-700">
              {product.name}
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Product Hero */}
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="grid lg:grid-cols-[480px_1fr]">
            {/* Gallery */}
            <div className="border-b border-gray-100 p-5 lg:border-b-0 lg:border-r">
              <ProductImageGallery
                images={product.images}
                productName={product.name}
              />
            </div>

            {/* Product Info */}
            <div className="p-6 lg:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                  {product.brand.name}
                </span>

                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                  Available
                </span>
              </div>

              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-gray-950 sm:text-4xl">
                {product.name}
              </h1>

              {product.description && (
                <p className="mt-4 max-w-3xl text-[15px] leading-7 text-gray-600">
                  {product.description}
                </p>
              )}

              {/* Quick highlights */}
              <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-gray-200 p-4">
                  <p className="text-xs text-gray-500">
                    Category
                  </p>

                  <p className="mt-1 text-sm font-bold text-gray-900">
                    {product.category.name}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 p-4">
                  <p className="text-xs text-gray-500">
                    Specifications
                  </p>

                  <p className="mt-1 text-sm font-bold text-gray-900">
                    {specificationCount}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 p-4">
                  <p className="text-xs text-gray-500">
                    Sellers
                  </p>

                  <p className="mt-1 text-sm font-bold text-gray-900">
                    {product.prices.length}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 p-4">
                  <p className="text-xs text-gray-500">
                    Images
                  </p>

                  <p className="mt-1 text-sm font-bold text-gray-900">
                    {product.images.length}
                  </p>
                </div>
              </div>

              {/* Price */}
              <div className="mt-7 rounded-2xl bg-gray-950 p-5 text-white">
                <p className="text-sm text-gray-400">
                  Starting price
                </p>

                <div className="mt-1 flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <span className="text-3xl font-extrabold">
                      {startingPrice
                        ? `₹${startingPrice.toLocaleString(
                            "en-IN",
                          )}`
                        : "N/A"}
                    </span>

                    <p className="mt-1 text-xs text-gray-400">
                      Compare prices from multiple sellers
                    </p>
                  </div>

                  {product.prices[0]?.inStock && (
                    <span className="rounded-full bg-green-500/15 px-3 py-1.5 text-xs font-bold text-green-400">
                      ✓ In Stock
                    </span>
                  )}
                </div>
              </div>

              {/* Seller */}
              {product.prices[0]?.seller && (
                <div className="mt-4 flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3">
                  <div>
                    <p className="text-xs text-gray-500">
                      Best available seller
                    </p>

                    <p className="mt-1 font-bold text-gray-900">
                      {product.prices[0].seller.name}
                    </p>
                  </div>

                  <span className="text-sm font-semibold text-blue-600">
                    View deal →
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Quick Specification Preview */}
        {specifications.length > 0 && (
          <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  At a glance
                </p>

                <h2 className="mt-1 text-2xl font-extrabold text-gray-950">
                  Key specifications
                </h2>
              </div>

              <span className="text-sm text-gray-500">
                {specificationCount} available
              </span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {specifications.slice(0, 8).map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                >
                  <p className="text-xs text-gray-500">
                    {formatSpecificationName(item.key)}
                  </p>

                  <p className="mt-1 truncate text-sm font-bold text-gray-900">
                    {formatSpecificationValue(item.value)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Specifications */}
        <section className="mt-6">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Complete information
            </p>

            <h2 className="mt-1 text-2xl font-extrabold text-gray-950 sm:text-3xl">
              Specifications
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Detailed technical specifications of the{" "}
              {product.name}.
            </p>
          </div>

          {specifications.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
              <div className="text-4xl">📋</div>

              <h3 className="mt-3 font-bold text-gray-900">
                No specifications available
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Product specifications have not been added yet.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
  {groupedSpecifications.map((group) => (
    <SpecificationSection
      key={group.title}
      group={group}
      specifications={specifications}
    />
  ))}

  {/* Specifications not mapped to a category */}
  ...
</div>
          )}
        </section>

        {/* Price History */}
        <section className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-5">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Price tracking
            </p>

            <h2 className="mt-1 text-2xl font-extrabold text-gray-950">
              Price History
            </h2>
          </div>

          {priceHistory.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">
              No price history available.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-gray-50">
                  <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wider text-gray-500">
                    <th className="px-6 py-4">
                      Date
                    </th>

                    <th className="px-6 py-4">
                      Price
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {priceHistory.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(
                          item.recordedAt,
                        ).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      <td className="px-6 py-4 text-lg font-extrabold text-gray-950">
                        ₹
                        {Number(
                          item.price,
                        ).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Seller Comparison */}
        <section className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-5">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Best deals
            </p>

            <h2 className="mt-1 text-2xl font-extrabold text-gray-950">
              Price Comparison
            </h2>
          </div>

          <div className="divide-y divide-gray-100">
            {product.prices.map((price) => (
              <div
                key={price.id}
                className="flex flex-col gap-4 px-6 py-5 transition hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 font-bold text-gray-700">
                    {price.seller.name.charAt(0)}
                  </div>

                  <div>
                    <p className="font-bold text-gray-900">
                      {price.seller.name}
                    </p>

                    <p
                      className={`mt-1 text-xs font-semibold ${
                        price.inStock
                          ? "text-green-600"
                          : "text-red-500"
                      }`}
                    >
                      {price.inStock
                        ? "✓ In Stock"
                        : "✕ Out of Stock"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-6 sm:justify-end">
                  <div className="text-right">
                    <p className="text-xl font-extrabold text-gray-950">
                      ₹
                      {Number(
                        price.amount,
                      ).toLocaleString("en-IN")}
                    </p>

                    <p className="text-xs text-gray-400">
                      {price.currency}
                    </p>
                  </div>

                  <button
                    type="button"
                    className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
                  >
                    View Deal
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}