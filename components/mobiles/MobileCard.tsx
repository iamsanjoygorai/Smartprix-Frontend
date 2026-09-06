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
    <article className="border-b border-gray-200 px-4 py-4 last:border-b-0">
      <div className="flex gap-4">
        <div className="flex w-[130px] shrink-0 items-center justify-center">
          <img
            src={mobile.image}
            alt={mobile.name}
            className="h-[150px] w-[100px] object-contain"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
            <div>
              <h3 className="text-[17px] font-semibold text-gray-900">
                {mobile.name}
              </h3>

              <div className="mt-2 flex items-center gap-1">
                <span className="text-gray-300">
                  ★★★★★
                </span>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <div className="text-xl font-bold text-green-600">
                {mobile.price}
              </div>

              <button className="mt-1 text-xs text-blue-600 hover:underline">
                See Prices
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-x-5 gap-y-2 text-xs text-gray-600 sm:grid-cols-4">
            <span>📱 {mobile.display}</span>

            <span>⚡ {mobile.battery} mAh</span>

            <span>📷 {mobile.camera}</span>

            <span>
              💾 {mobile.storage}
              {mobile.ram
                ? ` • ${mobile.ram} RAM`
                : ""}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button className="rounded border border-blue-200 px-3 py-1.5 text-xs text-blue-600 hover:bg-blue-50">
              Compare
            </button>

            <button className="rounded border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50">
              Full Specs
            </button>

            <button className="rounded border border-pink-200 px-3 py-1.5 text-xs text-pink-500 hover:bg-pink-50">
              ♡ Like
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}