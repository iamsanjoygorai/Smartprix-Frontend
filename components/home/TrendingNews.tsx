import Link from "next/link";

import type { NewsItem } from "@/types/news";

type TrendingNewsProps = { items: NewsItem[] };

export default function TrendingNews({ items }: TrendingNewsProps) {
  const stories = items.slice(0, 6);

  return (
    <section className="rounded-md border border-slate-200 bg-white p-4" aria-labelledby="trending-news-heading">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 id="trending-news-heading" className="text-lg font-semibold text-slate-800">Trending News</h2>
        <Link href="/news" className="text-sm font-medium text-blue-600">View All&nbsp; →</Link>
      </div>
      {stories.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-500">Trending stories will appear here when the news API returns results.</p>
      ) : (
        <div className="grid grid-cols-1 gap-2 pt-3 sm:grid-cols-2 lg:grid-cols-3">
          {stories.map((story) => (
            <Link key={story.id} href={`/news/${story.slug}`} className="group relative flex h-[150px] items-end overflow-hidden rounded bg-slate-800 p-3 text-white">
              {story.imageUrl ? <img src={story.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105" /> : null}
              <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
              <h3 className="relative line-clamp-2 text-sm font-bold leading-5 drop-shadow-sm">{story.title}</h3>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
