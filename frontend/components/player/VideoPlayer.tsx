"use client";

import { useRef, useState } from "react";
import { formatDuration } from "@/lib/format";

type VideoPlayerProps = {
  src: string;
  poster?: string;
};

function getBufferedEnd(video: HTMLVideoElement): number {
  const { buffered, currentTime } = video;
  for (let i = 0; i < buffered.length; i++) {
    if (buffered.start(i) <= currentTime && currentTime <= buffered.end(i)) {
      return buffered.end(i);
    }
  }
  return 0;
}

export default function VideoPlayer({ src, poster }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedEnd, setBufferedEnd] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [hasError, setHasError] = useState(false);

  async function togglePlay() {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (video.paused) {
        await video.play();
      } else {
        video.pause();
      }
    } catch {
      // play() can be rejected (for example blocked or interrupted)
    }
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const video = videoRef.current;
    if (!video) return;

    const time = Number(e.target.value);
    video.currentTime = time;
    setCurrentTime(time);
  }

  const hasDuration = Number.isFinite(duration) && duration > 0;
  const remaining = hasDuration ? Math.max(0, duration - currentTime) : 0;
  const playedPercent = hasDuration
    ? Math.min(100, (currentTime / duration) * 100)
    : 0;
  const bufferedPercent = hasDuration
    ? Math.min(100, (bufferedEnd / duration) * 100)
    : 0;

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        preload="metadata"
        playsInline
        onClick={togglePlay}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onTimeUpdate={(e) => {
          setCurrentTime(e.currentTarget.currentTime);
          setBufferedEnd(getBufferedEnd(e.currentTarget));
        }}
        onProgress={(e) => setBufferedEnd(getBufferedEnd(e.currentTarget))}
        onLoadedMetadata={(e) => {
          setDuration(e.currentTarget.duration);
          setHasError(false);
        }}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onCanPlay={() => setIsBuffering(false)}
        onError={() => {
          setHasError(true);
          setIsBuffering(false);
        }}
        className="h-full w-full cursor-pointer"
      />

      {isBuffering && !hasError && (
        <div
          role="status"
          aria-label="Buffering"
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/30 border-t-white" />
        </div>
      )}

      {hasError && (
        <div
          role="alert"
          className="absolute inset-0 flex items-center justify-center bg-black/80 px-4 text-center text-gray-200"
        >
          Sorry, this video could not be played.
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 bg-gradient-to-t from-black/80 to-transparent px-4 pb-3 pt-10 text-white">
        <div className="relative flex h-4 items-center">
          <div className="absolute inset-x-0 h-1.5 rounded bg-white/25" />
          <div
            className="absolute h-1.5 rounded bg-white/40"
            style={{ width: `${bufferedPercent}%` }}
          />
          <div
            className="absolute h-1.5 rounded bg-cyan-500"
            style={{ width: `${playedPercent}%` }}
          />
          <input
            type="range"
            className="seek relative w-full"
            min={0}
            max={hasDuration ? duration : 0}
            step="any"
            value={Math.min(currentTime, hasDuration ? duration : 0)}
            onChange={handleSeek}
            disabled={!hasDuration || hasError}
            aria-label="Seek"
            aria-valuetext={
              hasDuration
                ? `${formatDuration(currentTime)} of ${formatDuration(duration)}`
                : undefined
            }
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            disabled={hasError}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-lg hover:bg-white/30 disabled:opacity-50"
          >
            <span aria-hidden="true">{isPlaying ? "❚❚" : "▶"}</span>
          </button>

          <span className="text-sm tabular-nums">
            {formatDuration(currentTime)} /{" "}
            {hasDuration ? formatDuration(duration) : "--:--"}
          </span>

          <span className="ml-auto text-sm tabular-nums text-gray-300">
            {hasDuration ? `-${formatDuration(remaining)}` : ""}
          </span>
        </div>
      </div>
    </div>
  );
}
