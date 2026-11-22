"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [text, setText] = useState(searchParams.get("q") ?? "");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = text.trim();
    router.push(trimmed ? `/?q=${encodeURIComponent(trimmed)}` : "/");
  }

  return (
    <form onSubmit={handleSubmit} role="search" className="flex gap-2">
      <input
        type="search"
        aria-label="Search videos"
        placeholder="Search videos"
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full rounded border border-gray-600 bg-gray-900 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none sm:w-64"
      />
      <button
        type="submit"
        className="rounded bg-cyan-700 px-4 py-2 text-white hover:bg-cyan-600"
      >
        Search
      </button>
    </form>
  );
}
