import { Suspense } from "react";
import HomeFeed from "@/components/HomeFeed";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-6">
      <Suspense fallback={<p className="text-gray-400">Loading...</p>}>
        <HomeFeed />
      </Suspense>
    </main>
  );
}
