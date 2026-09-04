import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Website Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="Smartprix"
            width={150}
            height={40}
            priority
            className="h-10 w-auto object-contain"
          />
        </Link>

        {/* Main Menu */}
        <nav className="flex items-center gap-6 text-sm font-medium text-gray-700">
          <Link href="/">Home</Link>
          <Link href="/products">Products</Link>
          <Link href="/compare">Compare</Link>
          <Link href="/login">Login</Link>
        </nav>
      </div>
    </header>
  );
}