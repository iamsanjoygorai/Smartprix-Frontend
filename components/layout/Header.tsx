import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-blue-950 bg-[#08366f]">
      <div className="mx-auto flex h-16 max-w-7xl items-center px-4">

        {/* Logo - Left */}
        <Link href="/" className="flex shrink-0 items-center">
          <Image
            src="/logo.png"
            alt="Smartprix"
            width={150}
            height={40}
            priority
            className="h-10 w-auto object-contain"
          />
        </Link>

        {/* Search - Center */}
        <div className="mx-auto w-full max-w-xl px-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for products, brands and more..."
              className="h-10 w-full rounded-full border border-gray-300 bg-white pl-5 pr-12 text-sm text-gray-800 outline-none transition focus:border-gray-500"
            />

            <button
              type="button"
              className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
              aria-label="Search"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </button>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex shrink-0 items-center gap-5">

          {/* Login + Profile */}
          <Link
            href="/login"
            className="flex items-center gap-2 text-sm font-bold text-white transition hover:text-gray-200"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/30">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" />
              </svg>
            </span>

            <span>Login</span>
          </Link>

          {/* More Dropdown */}
          <div className="group relative">
            <button
              type="button"
              className="flex items-center gap-1 text-sm font-bold text-white transition hover:text-gray-200"
            >
              <span>More</span>

              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform duration-200 group-hover:rotate-180"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {/* Dropdown */}
            <div
              className="
                invisible absolute right-0 top-full z-[100]
                mt-3 w-52 rounded-lg border border-gray-200
                bg-white py-2 opacity-0 shadow-xl
                transition-all duration-200
                group-hover:visible group-hover:opacity-100
              "
            >
              <Link
                href="#"
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
              >
                <span>▶️</span>
                <span>YouTube</span>
              </Link>

              <Link
                href="#"
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
              >
                <span>𝕏</span>
                <span>Twitter / X</span>
              </Link>

              <Link
                href="#"
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
              >
                <span>📷</span>
                <span>Instagram</span>
              </Link>

              <Link
                href="#"
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
              >
                <span>f</span>
                <span>Facebook</span>
              </Link>

              <Link
                href="#"
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
              >
                <span>✈️</span>
                <span>Telegram</span>
              </Link>

              <Link
                href="#"
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
              >
                <span>💬</span>
                <span>WhatsApp</span>
              </Link>

              <Link
                href="#"
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100"
              >
                <span>in</span>
                <span>LinkedIn</span>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}