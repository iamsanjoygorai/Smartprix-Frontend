import Link from "next/link";

const categories = [
  ["News", "📰", "/news"], ["Deals", "🏷️", "/products"], ["Grocery", "🛍️", "/products"], ["Flights", "✈️", "/flights"], ["Mobiles", "📱", "/products?category=mobile"], ["Laptops", "💻", "/products?category=laptop"], ["TVs", "📺", "/products?category=tv"], ["Tablets", "🖥️", "/products?category=tablet"], ["Bikes", "🏍️", "/auto"], ["Cars", "🚗", "/auto"], ["Cameras", "📷", "/electronics/camera"], ["Earphones", "🎧", "/accessories"], ["Smartwatch", "⌚", "/products?category=smartwatch"], ["ACs", "❄️", "/appliances"],
] as const;

export default function CategoryStrip() {
  return (
    <section className="mt-4 flex gap-2 overflow-x-auto rounded-md border border-[#d9d7ee] bg-gradient-to-r from-cyan-50 to-violet-200 px-3 py-3" aria-label="Browse categories">
      {categories.map(([name, icon, href]) => (
        <Link key={name} href={href} className="group flex min-w-[70px] flex-1 flex-col items-center gap-1.5 text-xs font-medium text-slate-800 hover:text-blue-600">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/70 text-3xl shadow-sm transition group-hover:-translate-y-0.5 group-hover:ring-2 group-hover:ring-blue-400">{icon}</span>
          <span>{name}</span>
        </Link>
      ))}
    </section>
  );
}
