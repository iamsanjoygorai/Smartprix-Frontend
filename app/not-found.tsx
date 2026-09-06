import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-white px-6">
      <div className="text-center">
        <p className="text-8xl font-bold tracking-tight text-gray-200">
          404
        </p>

        <h1 className="mt-4 text-2xl font-semibold text-gray-900">
          Page not found
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Sorry, the page you are looking for doesn&apos;t exist.
        </p>

        <Link
          href="/"
          className="mt-6 inline-block rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Go to Homepage
        </Link>
      </div>
    </main>
  );
}