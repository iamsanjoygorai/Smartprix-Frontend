import PopularMobiles from "@/components/home/PopularMobiles";
import TrendingNews from "@/components/home/TrendingNews";
import Link from "next/link";

const trends = [
  { title: "Best Smartphones Under ₹35,000 in India (August 2026)", image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1200&q=85", className: "md:row-span-2", tint: "bg-cyan-700/55", large: true, tag: "Trending" },
  { title: "vivo Confirms X500 Camera Specs: Same Main Sensor as X300 Pro, New Telephoto", image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=900&q=85", tint: "bg-amber-600/55" },
  { title: "OPPO Find X10 Series India Launch Imminent as Both Models Get BIS Certified", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=85", tint: "bg-red-700/50" },
  { title: "Qualcomm’s Next Flagship Chip Gets AI-Powered Upscaling To Rival Nvidia’s DLSS", image: "https://images.unsplash.com/photo-1583394293214-28ded15ee548?auto=format&fit=crop&w=900&q=85", tint: "bg-fuchsia-800/50" },
  { title: "Apple’s First Foldable iPhone Could Bring MagSafe to a 4.5mm-Thick Body", image: "https://images.unsplash.com/photo-1603899122634-f086ca5f5ddd?auto=format&fit=crop&w=900&q=85", tint: "bg-yellow-900/60" },
  { title: "vivo T5x and iQOO Z11x Get Costlier Again, This Time by Up to ₹4,000", image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=900&q=85", tint: "bg-rose-700/50" },
  { title: "Apple’s M4 MacBook Air is Under Rs 1 Lakh, With a Catch", image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=85", className: "md:col-start-3 md:row-start-2 md:row-span-2", tint: "bg-lime-800/45", large: true },
];

const products: Product[] = [
  {
    id: "1",
    name: "Samsung Galaxy S25",
    slug: "samsung-galaxy-s25",
    description: "Samsung flagship smartphone",
    isActive: true,

    brand: {
      id: "brand-samsung",
      name: "Samsung",
      slug: "samsung",
    },

    category: {
      id: "cat-mobile",
      name: "Mobile",
      slug: "mobile",
    },

    images: [
      {
        url: "https://images.samsung.com/is/image/samsung/p6pim/in/sm-s931bzydins/gallery/in-galaxy-s25-s931-sm-s931bzydins-thumb-544533695",
        altText: "Samsung Galaxy S25",
      },
    ],

    prices: [
      {
        amount: 74999,
        inStock: true,
      },
    ],

    averageRating: 4.5,
    rating: 4.5,
    reviewCount: 245,
  },

  {
    id: "2",
    name: "OnePlus 13",
    slug: "oneplus-13",
    description: "OnePlus flagship smartphone",
    isActive: true,

    brand: {
      id: "brand-oneplus",
      name: "OnePlus",
      slug: "oneplus",
    },

    category: {
      id: "cat-mobile",
      name: "Mobile",
      slug: "mobile",
    },

    images: [
      {
        url: "https://image01.oneplus.net/ebp/202412/10/1-m00-46-7c-rb8bwm5w5g6ac1b7aaan5f.jpg",
        altText: "OnePlus 13",
      },
    ],

    prices: [
      {
        amount: 69999,
        inStock: true,
      },
    ],

    averageRating: 4.6,
    rating: 4.6,
    reviewCount: 312,
  },

  {
    id: "3",
    name: "iPhone 16",
    slug: "apple-iphone-16",
    description: "Apple iPhone 16",
    isActive: true,

    brand: {
      id: "brand-apple",
      name: "Apple",
      slug: "apple",
    },

    category: {
      id: "cat-mobile",
      name: "Mobile",
      slug: "mobile",
    },

    images: [
      {
        url: "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-16-ultramarine-select-202409",
        altText: "Apple iPhone 16",
      },
    ],

    prices: [
      {
        amount: 69900,
        inStock: true,
      },
    ],

    averageRating: 4.7,
    rating: 4.7,
    reviewCount: 521,
  },

  {
    id: "4",
    name: "Google Pixel 9",
    slug: "google-pixel-9",
    description: "Google Pixel 9 smartphone",
    isActive: true,

    brand: {
      id: "brand-google",
      name: "Google",
      slug: "google",
    },

    category: {
      id: "cat-mobile",
      name: "Mobile",
      slug: "mobile",
    },

    images: [
      {
        url: "https://lh3.googleusercontent.com/ggs/AF1Qip",
        altText: "Google Pixel 9",
      },
    ],

    prices: [
      {
        amount: 64999,
        inStock: true,
      },
    ],

    averageRating: 4.4,
    rating: 4.4,
    reviewCount: 187,
  },
];

const categories = [
  ["News", "📰", "/news"], ["Deals", "🏷️", "/products"], ["Grocery", "🛍️", "/products"], ["Flights", "✈️", "/flights"], ["Mobiles", "📱", "/products?category=mobile"], ["Laptops", "💻", "/products?category=laptop"], ["TVs", "📺", "/products?category=tv"], ["Tablets", "🖥️", "/products?category=tablet"], ["Bikes", "🏍️", "/auto"], ["Cars", "🚗", "/auto"], ["Cameras", "📷", "/electronics/camera"], ["Earphones", "🎧", "/accessories"], ["Smartwatch", "⌚", "/products?category=smartwatch"], ["ACs", "❄️", "/appliances"],
] as const;

export default function HomePage() {
  return (
    <main className="bg-[#f3f5f8] pb-10">
      <div className="mx-auto max-w-7xl px-4 pt-4">
        <section className="grid grid-cols-1 gap-1 overflow-hidden rounded-md md:h-[480px] md:grid-cols-3 md:grid-rows-3" aria-label="Trending news">
          {trends.map((story) => (
            <Link key={story.title} href="/news" className={`group relative flex min-h-[170px] items-end overflow-hidden rounded-[3px] p-3 text-white md:min-h-0 ${story.className ?? ""}`}>
              <div className="absolute inset-0 bg-cover bg-center transition duration-300 group-hover:scale-105" style={{ backgroundImage: `url(${story.image})` }} />
              <div className={`absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent ${story.tint}`} />
              {story.tag && <span className="absolute left-0 top-0 bg-[#087be7] px-3 py-1.5 text-xs font-bold">{story.tag}</span>}
              <h1 className={`relative font-extrabold leading-[1.45] drop-shadow-sm ${story.large ? "text-[22px] sm:text-[28px]" : "text-sm sm:text-[15px]"}`}>{story.title}</h1>
            </Link>
          ))}
        </section>

        <section className="mt-4 flex gap-2 overflow-x-auto rounded-md border border-[#d9d7ee] bg-gradient-to-r from-cyan-50 to-violet-200 px-3 py-3" aria-label="Browse categories">
          {categories.map(([name, icon, href]) => (
            <Link key={name} href={href} className="group flex min-w-[70px] flex-1 flex-col items-center gap-1.5 text-xs font-medium text-slate-800 hover:text-blue-600">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/70 text-3xl shadow-sm transition group-hover:-translate-y-0.5 group-hover:ring-2 group-hover:ring-blue-400">{icon}</span><span>{name}</span>
            </Link>
          ))}
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,2fr)_360px]">
          <div className="space-y-4">
            <aside className="flex min-h-[90px] items-center overflow-hidden rounded-md bg-gradient-to-r from-[#f3f3f3] from-[40%] to-[#057d77] to-[40%] px-5"><div className="w-[42%] text-center"><p className="text-lg font-semibold text-slate-800">Searching For AC?</p><p className="mt-1 text-xs text-slate-500">Find the perfect cooling match</p></div><div className="flex flex-1 items-center justify-around gap-4 pl-5 text-white"><p className="text-center text-lg font-bold">Compare Before You Buy</p><Link href="/products?category=ac" className="shrink-0 rounded bg-[#00534f] px-4 py-2 text-sm font-bold hover:bg-[#003f3c]">Compare Now</Link></div></aside>
            <section className="rounded-md border border-slate-200 bg-white p-4"><div className="flex items-center justify-between border-b border-slate-100 pb-3"><h2 className="text-lg font-semibold">Latest News</h2><Link href="/news" className="text-sm font-medium text-blue-600">View All&nbsp; →</Link></div><article className="flex gap-3 pt-3"><img className="h-16 w-28 rounded object-cover" src="https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=300&q=80" alt="Phone camera lenses" /><div><Link href="/news" className="text-sm font-bold leading-6 text-slate-800 hover:text-blue-600">OPPO Find X10 Series India Launch Imminent as Both Models Get BIS Certified</Link><p className="mt-1 line-clamp-1 text-xs text-slate-500">OPPO’s Find X10 series is getting closer to launch with fresh certification details emerging.</p></div></article></section>
          </div>
          <aside className="min-h-[220px] rounded-md border border-slate-200 bg-white p-2"><div className="flex h-[172px] flex-col justify-between bg-gradient-to-br from-[#1b2d60] via-[#4f5d99] to-[#9d9fbd] p-6 text-right text-xs text-white"><b className="text-left text-4xl tracking-widest text-white/65">FOLD</b><span>The all-new Galaxy Z Fold8<br />Starting at ₹1,39,999</span></div><p className="pt-2 text-sm font-bold text-slate-900">₹7000 instant bank discount</p></aside>
        </section>

          <PopularMobiles
  products={products}
/>
          <TrendingNews items={trends} />
      </div>
    </main>
  );

  
}

