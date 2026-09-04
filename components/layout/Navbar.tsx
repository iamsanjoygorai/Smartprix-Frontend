
export default function Navbar() {
  return (
    <nav className="border-b bg-gray-50">
      
      <div className="mx-auto flex h-12 max-w-7xl items-center gap-8 px-4">
        <a
          href="/products"
          className="text-sm font-medium text-gray-700 hover:text-black"
        >
          Mobiles
        </a>

        <a
          href="/categories/laptops"
          className="text-sm font-medium text-gray-700 hover:text-black"
        >
          Laptops
        </a>

        <a
          href="/compare"
          className="text-sm font-medium text-gray-700 hover:text-black"
        >
          Compare
        </a>

        <a
          href="/brands/samsung"
          className="text-sm font-medium text-gray-700 hover:text-black"
        >
          Brands
        </a>
      </div>
    </nav>
  );
}