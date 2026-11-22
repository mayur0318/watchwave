"use client";

import { useEffect, useState } from "react";
import CommentItem from "@/components/CommentItem";
import { useAuth } from "@/context/AuthContext";
import {
  addComment,
  deleteComment,
  getComments,
  ApiClientError,
} from "@/lib/api";
import type { VideoComment } from "@/types/comment";

const PAGE_SIZE = 10;
const MAX_LENGTH = 500;

type ListState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready" };

type CommentSectionProps = {
  videoId: string;
};

export default function CommentSection({ videoId }: CommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<VideoComment[]>([]);
  const [listState, setListState] = useState<ListState>({ status: "loading" });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [text, setText] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await getComments(videoId, 1, PAGE_SIZE);
        if (!cancelled) {
          setComments(res.data);
          setHasMore(res.data.length === PAGE_SIZE);
          setPage(1);
          setListState({ status: "ready" });
        }
      } catch (error) {
        if (!cancelled) {
          setListState({
            status: "error",
            message:
              error instanceof ApiClientError
                ? error.message
                : "Could not load comments.",
          });
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [videoId, attempt]);

  async function handleLoadMore() {
    setIsLoadingMore(true);
    setMessage("");
    try {
      const res = await getComments(videoId, page + 1, PAGE_SIZE);
      setComments((prev) => {
        const known = new Set(prev.map((c) => c._id));
        return [...prev, ...res.data.filter((c) => !known.has(c._id))];
      });
      setPage((p) => p + 1);
      setHasMore(res.data.length === PAGE_SIZE);
    } catch {
      setMessage("Could not load more comments.");
    } finally {
      setIsLoadingMore(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    const content = text.trim();
    if (!content || !user) {
      setMessage("Write something first.");
      return;
    }

    setIsPosting(true);
    try {
      const res = await addComment(videoId, content);
      const created: VideoComment = {
        ...res.data,
        owner: {
          _id: user._id,
          fullName: user.fullName,
          userName: user.userName,
          avatar: user.avatar,
        },
      };
      setComments((prev) => [created, ...prev]);
      setText("");
    } catch (error) {
      setMessage(
        error instanceof ApiClientError
          ? error.message
          : "Could not post your comment.",
      );
    } finally {
      setIsPosting(false);
    }
  }

  async function handleDelete(commentId: string) {
    if (!window.confirm("Delete this comment?")) return;

    const previous = comments;
    setComments((prev) => prev.filter((c) => c._id !== commentId));
    setMessage("");

    try {
      await deleteComment(commentId);
    } catch {
      setComments(previous);
      setMessage("Could not delete the comment.");
    }
  }

  return (
    <section aria-labelledby="comments-heading" className="mt-8">
      <h2 id="comments-heading" className="mb-4 text-lg font-semibold">
        Comments
      </h2>

      <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-2">
        <label htmlFor="comment-text" className="sr-only">
          Add a comment
        </label>
        <textarea
          id="comment-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={MAX_LENGTH}
          rows={2}
          placeholder="Add a comment"
          className="w-full rounded border border-gray-600 bg-gray-900 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {text.length}/{MAX_LENGTH}
          </span>
          <button
            type="submit"
            disabled={isPosting}
            className="rounded bg-cyan-700 px-4 py-1.5 text-sm font-semibold text-white hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPosting ? "Posting..." : "Comment"}
          </button>
        </div>
      </form>

      {message && (
        <p role="alert" className="mb-4 text-sm text-red-500">
          {message}
        </p>
      )}

      {listState.status === "loading" && (
        <p className="text-gray-400">Loading comments...</p>
      )}

      {listState.status === "error" && (
        <div role="alert" className="flex items-center gap-3">
          <p className="text-red-500">{listState.message}</p>
          <button
            onClick={() => {
              setListState({ status: "loading" });
              setAttempt((a) => a + 1);
            }}
            className="rounded border border-gray-600 px-3 py-1 text-sm hover:border-gray-400"
          >
            Try again
          </button>
        </div>
      )}

      {listState.status === "ready" && comments.length === 0 && (
        <p className="text-gray-400">No comments yet. Be the first.</p>
      )}

      {listState.status === "ready" && comments.length > 0 && (
        <>
          <ul className="flex flex-col gap-5">
            {comments.map((comment) => (
              <CommentItem
                key={comment._id}
                comment={comment}
                isOwn={comment.owner?._id === user?._id}
                onDelete={handleDelete}
              />
            ))}
          </ul>
          {hasMore && (
            <button
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="mt-6 rounded border border-gray-600 px-4 py-2 text-sm hover:border-gray-400 disabled:opacity-60"
            >
              {isLoadingMore ? "Loading..." : "Load more"}
            </button>
          )}
        </>
      )}
    </section>
  );
}
