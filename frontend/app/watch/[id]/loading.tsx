export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-5xl animate-pulse px-6 py-6">
      <div className="aspect-video w-full rounded-lg bg-gray-800" />
      <div className="mt-4 h-6 w-2/3 rounded bg-gray-800" />
      <div className="mt-2 h-4 w-1/3 rounded bg-gray-800" />
    </main>
  );
}
