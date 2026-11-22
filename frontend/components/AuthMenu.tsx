"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import NavLink from "@/components/NavLink";
import { useAuth } from "@/context/AuthContext";

export default function AuthMenu() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push("/");
    router.refresh();
  }

  if (isLoading) {
    return <div className="h-8 w-24" aria-hidden="true" />;
  }

  if (!user) {
    return (
      <>
        <NavLink href="/login" label="Login" />
        <NavLink href="/register" label="Register" />
      </>
    );
  }

  return (
    <>
      <NavLink href="/upload" label="Upload" />

      <Link href="/profile" className="flex items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={user.avatar}
          alt={user.userName}
          className="h-8 w-8 rounded-full object-cover"
        />
        <span className="text-sm text-gray-300">{user.userName}</span>
      </Link>

      <button onClick={handleLogout} className="text-gray-300 hover:text-white">
        Logout
      </button>
    </>
  );
}
