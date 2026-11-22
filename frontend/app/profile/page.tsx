"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return <p className="p-6 text-gray-400">Loading...</p>;
  }

  return (
    <main className="mx-auto w-full max-w-3xl">
      {user.coverImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={user.coverImage}
          alt=""
          className="h-48 w-full object-cover"
        />
      ) : (
        <div className="h-48 w-full bg-gray-800" />
      )}

      <div className="flex items-center gap-4 px-6 py-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={user.avatar}
          alt={user.userName}
          className="-mt-12 h-24 w-24 rounded-full border-4 border-black object-cover"
        />
        <div>
          <h1 className="text-2xl font-bold">{user.fullName}</h1>
          <p className="text-gray-400">@{user.userName}</p>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
      </div>
    </main>
  );
}
