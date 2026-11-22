import Link from "next/link";
import type { Video } from "@/types/video";
import { formatDate, formatDuration, formatViews } from "@/lib/format";

type VideoCardProps = {
  video: Video;
};

export default function VideoCard({ video }: VideoCardProps) {
  return (
    <Link href={`/watch/${video._id}`} className="group flex flex-col gap-2">
      <div className="relative aspect-video overflow-hidden rounded-lg bg-gray-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={video.thumbnail}
          alt={video.title}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
        <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-xs text-white">
          {formatDuration(video.duration)}
        </span>
      </div>

      <div className="flex gap-3">
        {video.owner && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={video.owner.avatar}
            alt=""
            className="h-9 w-9 shrink-0 rounded-full object-cover"
          />
        )}
        <div className="min-w-0">
          <h3 className="line-clamp-2 font-semibold text-white">
            {video.title}
          </h3>
          <p className="text-sm text-gray-400">
            {video.owner?.userName ?? "Unknown channel"}
          </p>
          <p className="text-sm text-gray-500">
            {formatViews(video.views)} · {formatDate(video.createdAt)}
          </p>
        </div>
      </div>
    </Link>
  );
}
