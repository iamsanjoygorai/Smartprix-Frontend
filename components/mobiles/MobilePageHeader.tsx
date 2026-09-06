export default function MobilePageHeader() {
  return (
    <section className="rounded-sm border border-gray-300 bg-white">
      <div className="px-4 py-3">
        <h1 className="text-[24px] font-semibold leading-tight text-gray-900">
          Mobile Phones Price List
        </h1>

        <p className="mt-2 text-[13px] leading-5 text-gray-600">
          Discover the complete list of mobile phones in India with latest
          prices, full specifications, specs score, and user ratings. Compare
          phones side-by-side, track price drops, and explore historical
          pricing trends.
        </p>

        <div className="mt-1 text-right">
          <button className="text-xs font-medium text-blue-600 hover:underline">
            Read More
          </button>
        </div>
      </div>

      {/* ACTION BAR */}
      <div className="flex items-center justify-end gap-8 border-t bg-[#edf6ff] px-4 py-2.5 text-sm">
        <button className="text-pink-500 hover:text-pink-600">
          ♡ <span className="ml-1">Like</span>
        </button>

        <button className="text-pink-500 hover:text-pink-600">
          ▣ <span className="ml-1">Comment</span>
        </button>

        <button className="text-pink-500 hover:text-pink-600">
          ♧ <span className="ml-1">Share</span>
        </button>
      </div>
    </section>
  );
}