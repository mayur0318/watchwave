export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-5xl animate-pulse">
      <div className="h-40 w-full bg-gray-800" />
      <div className="flex items-center gap-4 px-6 py-4">
        <div className="-mt-10 h-24 w-24 rounded-full bg-gray-700" />
        <div className="flex flex-col gap-2">
          <div className="h-5 w-40 rounded bg-gray-800" />
          <div className="h-4 w-24 rounded bg-gray-800" />
        </div>
      </div>
    </main>
  );
}
