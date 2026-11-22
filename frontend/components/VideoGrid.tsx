"use client";

import { useEffect, useState } from "react";
import VideoCard from "@/components/VideoCard";
import { getVideos, ApiClientError } from "@/lib/api";
import type { Video } from "@/types/video";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; videos: Video[] };

const gridClasses = "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

function SkeletonCard() {
  return (
    <div className="flex animate-pulse flex-col gap-2">
      <div className="aspect-video rounded-lg bg-gray-800" />
      <div className="flex gap-3">
        <div className="h-9 w-9 rounded-full bg-gray-800" />
        <div className="flex flex-1 flex-col gap-2">
          <div className="h-4 w-3/4 rounded bg-gray-800" />
          <div className="h-3 w-1/2 rounded bg-gray-800" />
        </div>
      </div>
    </div>
  );
}

type VideoGridProps = {
  query?: string;
  userId?: string;
  page: number;
  onPageChange: (page: number) => void;
};

const VIDEOS_PER_PAGE = 12;

export default function VideoGrid({
  query = "",
  userId,
  page,
  onPageChange,
}: VideoGridProps) {
  const [state, setState] = useState<State>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await getVideos({
          query,
          userId,
          page,
          limit: VIDEOS_PER_PAGE,
        });
        if (!cancelled) {
          setState({ status: "success", videos: res.data });
        }
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof ApiClientError
              ? error.message
              : "Could not reach the server. Please try again.";
          setState({ status: "error", message });
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [query, userId, page, attempt]);

  if (state.status === "loading") {
    return (
      <div className={gridClasses} aria-busy="true">
        {Array.from({ length: 8 }, (_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex flex-col items-center gap-3 py-16" role="alert">
        <p className="text-red-500">{state.message}</p>
        <button
          onClick={() => {
            setState({ status: "loading" });
            setAttempt((a) => a + 1);
          }}
          className="rounded bg-cyan-700 px-4 py-2 text-white hover:bg-cyan-600"
        >
          Try again
        </button>
      </div>
    );
  }

  if (state.videos.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-gray-400">
        <p>
          {query
            ? `No videos found for "${query}".`
            : page > 1
              ? "No more videos."
              : "No videos yet."}
        </p>
        {page > 1 && (
          <button
            onClick={() => onPageChange(page - 1)}
            className="rounded border border-gray-600 px-4 py-2 hover:border-gray-400"
          >
            Previous page
          </button>
        )}
      </div>
    );
  }

  const hasNext = state.videos.length === VIDEOS_PER_PAGE;

  return (
    <>
      <div className={gridClasses}>
        {state.videos.map((video) => (
          <VideoCard key={video._id} video={video} />
        ))}
      </div>

      <nav
        aria-label="Pagination"
        className="mt-8 flex items-center justify-center gap-4"
      >
        <button
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded border border-gray-600 px-4 py-2 hover:border-gray-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>
        <span className="text-sm text-gray-400">Page {page}</span>
        <button
          disabled={!hasNext}
          onClick={() => onPageChange(page + 1)}
          className="rounded border border-gray-600 px-4 py-2 hover:border-gray-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </nav>
    </>
  );
}
