"use client";

interface Mobile {
  id: string;
  slug: string;
  name: string;
  price: string;
  score: number;
  rating: number;
  image: string;
  display: string;
  battery: string;
  camera: string;
  storage: string;
  ram?: string | null;
}

export default function MobileCard({
  mobile,
}: {
  mobile: Mobile;
}) {
  return (
    <article className="relative border-b border-gray-200 bg-white px-3 py-4 sm:px-4">
      {/* Product Content */}
      <div className="flex gap-4 sm:gap-6">
        {/* Product Image */}
        <div className="flex w-[120px] shrink-0 items-start justify-center sm:w-[135px]">
          <img
            src={mobile.image}
            alt={mobile.name}
            className="h-[165px] w-[110px] object-contain sm:h-[175px] sm:w-[120px]"
          />
        </div>

        {/* Right Content */}
        <div className="min-w-0 flex-1">
          {/* Name + Price */}
          <div className="flex items-start justify-between gap-4">
            <h3 className="pt-1 text-[16px] font-semibold leading-6 text-gray-900 sm:text-[17px]">
              {mobile.name}
            </h3>

            <div className="shrink-0 text-right">
              <div className="text-[19px] font-bold text-green-700 sm:text-[20px]">
                {mobile.price}
              </div>
            </div>
          </div>

          {/* Rating + Spec Score */}
          <div className="mt-1 flex items-center gap-2">
            <div className="flex items-center text-[17px] leading-none tracking-[-2px] text-yellow-500">
              ★★★★★
            </div>

            <span className="rounded-sm bg-lime-500 px-2 py-1 text-[12px] font-semibold leading-none text-white">
              {mobile.score} Spec Score
            </span>
          </div>

          {/* Action Bar */}
          <div className="mt-3 flex h-[37px] items-center gap-7 rounded bg-[#f3f1f5] px-3 text-[13px] text-gray-500">
            <button
              type="button"
              className="flex items-center gap-1.5 transition-colors hover:text-blue-600"
            >
              <span className="flex h-[17px] w-[17px] items-center justify-center rounded-full bg-blue-500 text-[13px] font-bold text-white">
                +
              </span>
              Compare
            </button>

            <button
              type="button"
              className="flex items-center gap-1.5 transition-colors hover:text-pink-500"
            >
              <span className="text-[20px] leading-none text-pink-400">
                ♡
              </span>
              Like
            </button>

            <button
              type="button"
              className="flex items-center gap-1.5 transition-colors hover:text-gray-800"
            >
              <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-yellow-400 text-[11px]">
                🌐
              </span>
              View →
            </button>
          </div>

          {/* Specifications */}
          <div className="mt-3 grid grid-cols-1 gap-x-8 gap-y-1.5 text-[12px] leading-[18px] text-gray-600 sm:grid-cols-2">
            {/* Left Column */}
            <div className="space-y-1.5">
              <SpecItem>
                Dual Sim, 5G, VoLTE, Vo5G, Wi-Fi, IR Blaster
              </SpecItem>

              <SpecItem>
                Snapdragon 7 Gen 4, Octa Core, 2.8 GHz Processor
              </SpecItem>

              <SpecItem>
                {mobile.ram
                  ? `${mobile.ram} RAM, ${mobile.storage} inbuilt`
                  : `${mobile.storage} inbuilt`}
              </SpecItem>

              <SpecItem>
                {mobile.battery} mAh Battery with 90W Fast Charging
              </SpecItem>
            </div>

            {/* Right Column */}
            <div className="space-y-1.5">
              <SpecItem>
                {mobile.display} Display with Punch Hole
              </SpecItem>

              <SpecItem>
                {mobile.camera} Rear & Front Camera
              </SpecItem>

              {/* Memory Card */}
              <div className="flex items-start gap-2 text-red-500">
                <span className="mt-[2px] text-[11px]">✖</span>
                <span>Memory Card Not Supported</span>
              </div>

              <SpecItem>
                Android v15
              </SpecItem>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

/* Specification item */
function SpecItem({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-[1px] text-[12px] text-gray-500">✓</span>
      <span>{children}</span>
    </div>
  );
}