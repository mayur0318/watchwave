"use client";

import { useRouter, useSearchParams } from "next/navigation";
import SearchBar from "@/components/SearchBar";
import VideoGrid from "@/components/VideoGrid";

export default function HomeFeed() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);

  function goToPage(newPage: number) {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (newPage > 1) params.set("page", String(newPage));
    const qs = params.toString();
    router.push(qs ? `/?${qs}` : "/");
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">
          {query ? `Results for "${query}"` : "Latest videos"}
        </h1>
        <SearchBar key={query} />
      </div>
      <VideoGrid
        key={`${query}-${page}`}
        query={query}
        page={page}
        onPageChange={goToPage}
      />
    </>
  );
}
