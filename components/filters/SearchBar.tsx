"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar() {
  const [search, setSearch] = useState("");
  const router = useRouter();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const value = search.trim();

    if (!value) {
      router.push("/products");
      return;
    }

    router.push(`/products?search=${encodeURIComponent(value)}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-2xl"
    >
      <input
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search mobiles, laptops and more..."
        className="h-12 flex-1 rounded-l-lg border border-gray-300 bg-white px-4 text-gray-900 outline-none focus:border-gray-500"
      />

      <button
        type="submit"
        className="rounded-r-lg bg-black px-6 font-medium text-white hover:bg-gray-800"
      >
        Search
      </button>
    </form>
  );
}