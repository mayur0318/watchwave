import type { VideoComment } from "@/types/comment";
import { formatDate } from "@/lib/format";

type CommentItemProps = {
  comment: VideoComment;
  isOwn: boolean;
  onDelete: (id: string) => void;
};

export default function CommentItem({
  comment,
  isOwn,
  onDelete,
}: CommentItemProps) {
  return (
    <li className="flex gap-3">
      {comment.owner ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={comment.owner.avatar}
          alt=""
          className="h-9 w-9 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div className="h-9 w-9 shrink-0 rounded-full bg-gray-700" />
      )}

      <div className="min-w-0 flex-1">
        <p className="text-sm">
          <span className="font-semibold">
            @{comment.owner?.userName ?? "deleted-user"}
          </span>{" "}
          <span className="text-gray-500">{formatDate(comment.createdAt)}</span>
        </p>
        <p className="whitespace-pre-wrap break-words text-gray-200">
          {comment.content}
        </p>
        {isOwn && (
          <button
            onClick={() => onDelete(comment._id)}
            className="mt-1 text-xs text-gray-500 hover:text-red-400"
          >
            Delete
          </button>
        )}
      </div>
    </li>
  );
}
