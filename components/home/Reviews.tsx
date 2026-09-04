import Link from "next/link";

const reviews = [
  ["Samsung Galaxy S26 Ultra Review: A refined flagship", "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=500&q=85"],
  ["MacBook Air M4 Review: The laptop to beat", "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=500&q=85"],
  ["Sony WH-1000XM6 Review: Silence, perfected", "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=85"],
] as const;

export default function Reviews() {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-4" aria-labelledby="reviews-heading">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3"><h2 id="reviews-heading" className="text-lg font-semibold text-slate-800">Reviews</h2><Link href="/reviews" className="text-sm font-medium text-blue-600">View All&nbsp; →</Link></div>
      <div className="grid gap-3 pt-4 sm:grid-cols-3">{reviews.map(([title, image]) => <Link key={title} href="/reviews" className="group overflow-hidden rounded border border-slate-100"><img src={image} alt="" className="h-32 w-full object-cover transition group-hover:scale-105" /><h3 className="p-3 text-sm font-semibold leading-5 text-slate-800 group-hover:text-blue-600">{title}</h3></Link>)}</div>
    </section>
  );
}
