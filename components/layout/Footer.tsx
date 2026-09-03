export default function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Smartprix
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Compare products, prices, specifications and deals.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900">
              Explore
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li>Mobiles</li>
              <li>Laptops</li>
              <li>Compare</li>
              <li>Brands</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900">
              Account
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li>Login</li>
              <li>Register</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-4 text-sm text-gray-500">
          © 2026 Smartprix Clone. All rights reserved.
        </div>
      </div>
    </footer>
  );
}