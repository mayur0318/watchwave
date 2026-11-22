"use client";

export default function WatchError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main
      role="alert"
      className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-6 py-16"
    >
      <p className="text-red-500">Something went wrong.</p>
      <button
        onClick={reset}
        className="rounded bg-cyan-700 px-4 py-2 text-white hover:bg-cyan-600"
      >
        Try again
      </button>
    </main>
  );
}
