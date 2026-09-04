import Link from "next/link";

const articles = [
  { title: "The iPhone 18 Pro Max’s Rumoured Camera Upgrade Could Fix Apple’s Biggest Photo Problem", description: "Apple rarely rushes to add hardware features that Android phones have had for years. With the iPhone 18 Pro Max, though, Apple looks ready to borrow a feature from Samsung and Xiaomi.", image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=300&q=85" },
  { title: "OPPO Find X10 Series India Launch Imminent as Both Models Get BIS Certified", description: "OPPO’s Find X10 series is getting closer to an India launch. The Find X10 received BIS certification, while the Pro model has also appeared in the certification pipeline.", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=300&q=85" },
  { title: "Qualcomm’s Next Flagship Chip Gets AI-Powered Upscaling To Rival Nvidia’s DLSS", description: "As Qualcomm prepares for its Snapdragon Summit, it has begun announcing key technologies ahead of it. The latest reveal is about software that improves graphics performance.", image: "https://images.unsplash.com/photo-1583394293214-28ded15ee548?auto=format&fit=crop&w=300&q=85" },
  { title: "Apple’s First Foldable iPhone Could Bring MagSafe to a 4.5mm-Thick Body", description: "Apple is gearing up for one of its biggest iPhone launch events in years. The date is already official, but the devices themselves remain a mystery for now.", image: "https://images.unsplash.com/photo-1603899122634-f086ca5f5ddd?auto=format&fit=crop&w=300&q=85" },
  { title: "ChatGPT, Claude, Grok, Cursor, and Other AI Apps are Down", description: "It was a strange evening for AI users. ChatGPT, Claude, and Grok all started throwing errors around the same time, leaving users unable to access services through their websites and apps.", image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=300&q=85" },
];

export default function LatestNews() {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="text-lg font-semibold">Latest News</h2>
        <Link href="/news" className="text-sm font-medium text-blue-600">View All&nbsp; →</Link>
      </div>
      <div>
        {articles.map((article) => (
          <article key={article.title} className="flex gap-3 border-b border-slate-100 py-3 last:border-0 last:pb-0">
            <img className="h-[82px] w-[108px] shrink-0 rounded object-cover" src={article.image} alt="" />
            <div className="min-w-0">
              <Link href="/news" className="line-clamp-2 text-sm font-bold leading-5 text-slate-800 hover:text-blue-600">{article.title}</Link>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{article.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
