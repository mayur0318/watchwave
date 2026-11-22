"use client";

import { useState } from "react";
import { toggleVideoLike } from "@/lib/api";

type LikeButtonProps = {
  videoId: string;
  initialLiked: boolean;
  initialCount: number;
};

export default function LikeButton({
  videoId,
  initialLiked,
  initialCount,
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isPending, setIsPending] = useState(false);

  async function handleClick() {
    if (isPending) return;

    const previous = { liked, count };
    setLiked(!liked);
    setCount(liked ? count - 1 : count + 1);
    setIsPending(true);

    try {
      const res = await toggleVideoLike(videoId);
      setLiked(res.data.isLiked);
      setCount(res.data.likesCount);
    } catch {
      setLiked(previous.liked);
      setCount(previous.count);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={liked}
      aria-label={liked ? "Unlike this video" : "Like this video"}
      className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm transition-colors disabled:opacity-60 ${
        liked
          ? "border-cyan-500 bg-cyan-700 text-white"
          : "border-gray-600 text-gray-300 hover:border-gray-400"
      }`}
    >
      <span aria-hidden="true">{liked ? "♥" : "♡"}</span>
      {count}
    </button>
  );
}
