import Link from "next/link";

const mobiles = [
  ["Boltt Ace 5G", "₹12,999", 4.6, "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=300&q=85"],
  ["Realme P4s 5G", "₹34,999", 4.8, "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=300&q=85"],
  ["Boltt Ace 5G (8GB RAM + 128GB)", "₹14,999", 4.5, "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=300&q=85"],
  ["iQOO Z11 5G", "₹34,999", 4.6, "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=300&q=85"],
  ["Vivo S2 5G", "₹39,999", 4.4, "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=300&q=85"],
  ["Philips S7221 5G", "₹22,499", 4.7, "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=300&q=85"],
  ["Motorola Moto G37 Power 5G", "₹15,668", 4.3, "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=300&q=85"],
  ["Boltt Evo", "₹9,999", 4.5, "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=300&q=85"],
] as const;

export default function PopularMobiles() {
  return (
    <section className="rounded-md border border-slate-200 bg-white" aria-labelledby="popular-mobiles-heading">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3"><h2 id="popular-mobiles-heading" className="text-lg font-semibold text-slate-800">Popular Mobiles</h2><Link href="/products?category=mobile" className="text-sm font-medium text-blue-600">View All&nbsp; →</Link></div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
        {mobiles.map(([name, price, rating, image]) => <article key={name} className="border-b border-r border-slate-200 p-4"><Link href="/products" className="group block"><div className="flex h-48 items-center justify-center"><img src={image} alt="" className="max-h-full max-w-full object-contain transition group-hover:scale-105" /></div><h3 className="mt-4 line-clamp-2 min-h-10 text-sm leading-5 text-slate-800 group-hover:text-blue-600">{name}</h3></Link><p className="mt-2 text-base font-bold text-emerald-700">{price}</p><div className="mt-1 flex items-center gap-1" aria-label={`${rating} out of 5 stars`}><span className="text-base tracking-tight text-amber-400" aria-hidden="true">{"★".repeat(Math.round(rating))}{"☆".repeat(5 - Math.round(rating))}</span><span className="text-xs text-slate-500">{rating.toFixed(1)}</span></div><Link href="/products" className="mt-3 inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-600"><span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">+</span> Compare</Link></article>)}
      </div>
    </section>
  );
}
