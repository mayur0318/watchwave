"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getVideoById, ApiClientError } from "@/lib/api";
import { formatDate, formatViews } from "@/lib/format";
import type { Video } from "@/types/video";
import LikeButton from "@/components/LikeButton";
import type { VideoDetail } from "@/types/video";
import SubscribeButton from "@/components/SubscribeButton";
import CommentSection from "@/components/CommentSection";
import VideoPlayer from "@/components/player/VideoPlayer";

type State =
  | { status: "loading" }
  | { status: "error"; message: string; notFound: boolean }
  | { status: "success"; video: VideoDetail };

type WatchViewProps = {
  id: string;
};

export default function WatchView({ id }: WatchViewProps) {
  const [state, setState] = useState<State>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await getVideoById(id);
        if (!cancelled) {
          setState({ status: "success", video: res.data });
        }
      } catch (error) {
        if (!cancelled) {
          if (error instanceof ApiClientError) {
            setState({
              status: "error",
              message: error.message,
              notFound: error.status === 404 || error.status === 400,
            });
          } else {
            setState({
              status: "error",
              message: "Could not reach the server. Please try again.",
              notFound: false,
            });
          }
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id, attempt]);

  if (state.status === "loading") {
    return (
      <main className="mx-auto w-full max-w-5xl animate-pulse px-6 py-6">
        <div className="aspect-video w-full rounded-lg bg-gray-800" />
        <div className="mt-4 h-6 w-2/3 rounded bg-gray-800" />
      </main>
    );
  }

  if (state.status === "error") {
    return (
      <main
        role="alert"
        className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-6 py-16"
      >
        <p className="text-red-500">
          {state.notFound ? "Video not found." : state.message}
        </p>
        {state.notFound ? (
          <Link href="/" className="text-cyan-500 hover:underline">
            Back to home
          </Link>
        ) : (
          <button
            onClick={() => {
              setState({ status: "loading" });
              setAttempt((a) => a + 1);
            }}
            className="rounded bg-cyan-700 px-4 py-2 text-white hover:bg-cyan-600"
          >
            Try again
          </button>
        )}
      </main>
    );
  }

  const { video } = state;

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-6">
      <VideoPlayer src={video.videoFile} poster={video.thumbnail} />

      <h1 className="mt-4 text-xl font-bold">{video.title}</h1>
      <p className="text-sm text-gray-400">
        {formatViews(video.views)} · {formatDate(video.createdAt)}
      </p>

      <div className="mt-3">
        <LikeButton
          videoId={video._id}
          initialLiked={video.isLiked}
          initialCount={video.likesCount}
        />
      </div>

      {video.owner && (
        <div className="mt-4 flex items-center justify-between gap-3">
          <Link
            href={`/channel/${encodeURIComponent(video.owner.userName)}`}
            className="flex items-center gap-3"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={video.owner.avatar}
              alt=""
              className="h-10 w-10 rounded-full object-cover"
            />
            <div>
              <p className="font-semibold">{video.owner.fullName}</p>
              <p className="text-sm text-gray-400">@{video.owner.userName}</p>
            </div>
          </Link>

          {user?._id !== video.owner._id && (
            <SubscribeButton
              channelId={video.owner._id}
              initialSubscribed={video.isSubscribed}
              initialCount={video.subscribersCount}
            />
          )}
        </div>
      )}

      <p className="mt-4 whitespace-pre-wrap text-gray-300">
        {video.description}
      </p>
      <CommentSection videoId={video._id} />
    </main>
  );
}
