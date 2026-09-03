export default function Header() {
  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="text-2xl font-bold text-gray-900">
          Smartprix
        </div>

        <nav className="flex items-center gap-6 text-sm font-medium text-gray-700">
          <a href="/">Home</a>
          <a href="/products">Products</a>
          <a href="/compare">Compare</a>
          <a href="/login">Login</a>
        </nav>
      </div>
    </header>
  );
}