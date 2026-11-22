"use client";

import { useState } from "react";
import { toggleSubscription } from "@/lib/api";
import { formatSubscribers } from "@/lib/format";

type SubscribeButtonProps = {
  channelId: string;
  initialSubscribed: boolean;
  initialCount: number;
};

export default function SubscribeButton({
  channelId,
  initialSubscribed,
  initialCount,
}: SubscribeButtonProps) {
  const [subscribed, setSubscribed] = useState(initialSubscribed);
  const [count, setCount] = useState(initialCount);
  const [isPending, setIsPending] = useState(false);

  async function handleClick() {
    if (isPending) return;

    const previous = { subscribed, count };
    setSubscribed(!subscribed);
    setCount(subscribed ? count - 1 : count + 1);
    setIsPending(true);

    try {
      const res = await toggleSubscription(channelId);
      setSubscribed(res.data.isSubscribed);
      setCount(res.data.subscribersCount);
    } catch {
      setSubscribed(previous.subscribed);
      setCount(previous.count);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-400">{formatSubscribers(count)}</span>
      <button
        onClick={handleClick}
        disabled={isPending}
        className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
          subscribed
            ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
            : "bg-cyan-600 text-white hover:bg-cyan-500"
        }`}
      >
        {subscribed ? "✓ Subscribed" : "Subscribe"}
      </button>
    </div>
  );
}
