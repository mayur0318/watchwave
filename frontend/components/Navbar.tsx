import Link from "next/link";
import NavLink from "@/components/NavLink";
import AuthMenu from "@/components/AuthMenu";
import ThemeToggle from "@/components/ThemeToggle";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
      <Link href={"/"} className="text-xl font-bold ">
        WatchWave
      </Link>
      <div className="flex gap-6">
        <NavLink href="/" label="Home"></NavLink>
        <NavLink href="/about" label="About"></NavLink>
        <AuthMenu />
        <ThemeToggle />
      </div>
    </nav>
  );
}
