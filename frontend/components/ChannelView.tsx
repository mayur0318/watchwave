"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SubscribeButton from "@/components/SubscribeButton";
import VideoGrid from "@/components/VideoGrid";
import { useAuth } from "@/context/AuthContext";
import { getChannelProfile, ApiClientError } from "@/lib/api";
import type { ChannelProfile } from "@/types/channel";

type State =
  | { status: "loading" }
  | { status: "error"; message: string; notFound: boolean }
  | { status: "success"; profile: ChannelProfile };

type ChannelViewProps = {
  userName: string;
};

export default function ChannelView({ userName }: ChannelViewProps) {
  const { user } = useAuth();
  const [state, setState] = useState<State>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await getChannelProfile(userName);
        if (!cancelled) {
          setState({ status: "success", profile: res.data });
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
  }, [userName, attempt]);

  if (state.status === "loading") {
    return <p className="p-6 text-gray-400">Loading channel...</p>;
  }

  if (state.status === "error") {
    return (
      <main
        role="alert"
        className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-6 py-16"
      >
        <p className="text-red-500">
          {state.notFound ? "Channel not found." : state.message}
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

  const { profile } = state;
  const isOwnChannel = user?._id === profile._id;

  return (
    <main className="mx-auto w-full max-w-5xl">
      {profile.coverImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={profile.coverImage}
          alt=""
          className="h-40 w-full object-cover"
        />
      ) : (
        <div className="h-40 w-full bg-gray-800" />
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={profile.avatar}
            alt={profile.userName}
            className="-mt-10 h-24 w-24 rounded-full border-4 border-black object-cover"
          />
          <div>
            <h1 className="text-2xl font-bold">{profile.fullName}</h1>
            <p className="text-gray-400">@{profile.userName}</p>
            <p className="text-sm text-gray-500">
              {profile.channelSubscribedToCount} subscribed channels
            </p>
          </div>
        </div>

        {!isOwnChannel && (
          <SubscribeButton
            channelId={profile._id}
            initialSubscribed={profile.isSubscribed}
            initialCount={profile.subscribersCount}
          />
        )}
      </div>

      <section aria-labelledby="channel-videos" className="px-6 pb-10">
        <h2 id="channel-videos" className="mb-4 text-lg font-semibold">
          Videos
        </h2>
        <VideoGrid
          key={`${profile._id}-${page}`}
          userId={profile._id}
          page={page}
          onPageChange={setPage}
        />
      </section>
    </main>
  );
}
