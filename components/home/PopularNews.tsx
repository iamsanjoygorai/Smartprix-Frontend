import Link from "next/link";

const popularStories = [
  ["vivo Confirms X500 Camera Specs: Same Main Sensor as X300 Pro, New Telephoto", "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=160&q=80"],
  ["vivo T5x and iQOO Z11x Get Costlier Again, This Time by Up to ₹4,000", "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=160&q=80"],
  ["Apple’s M4 MacBook Air is Under Rs 1 Lakh, With a Catch", "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=160&q=80"],
  ["Mivi One 5G Design and Chipset Details Revealed", "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=160&q=80"],
  ["Filmyzilla Website to Download Movies & TV Shows: Is it safe?", "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=160&q=80"],
  ["The Hyundai Bayon Has Been Spied With a Feature Even the Creta Lacks", "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=160&q=80"],
] as const;

export default function PopularNews() {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-3">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="text-lg font-semibold">Popular News</h2>
        <Link href="/news" className="text-sm font-medium text-blue-600">View All&nbsp; →</Link>
      </div>
      {popularStories.map(([title, image]) => (
        <Link key={title} href="/news" className="flex gap-2 border-b border-slate-100 py-2.5 last:border-0 last:pb-0">
          <img className="h-10 w-[70px] shrink-0 rounded object-cover" src={image} alt="" />
          <span className="line-clamp-2 text-sm leading-5 text-slate-700 hover:text-blue-600">{title}</span>
        </Link>
      ))}
    </section>
  );
}
