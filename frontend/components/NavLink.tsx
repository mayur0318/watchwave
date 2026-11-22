import Link from "next/link";

type NavLinkProps = {
  href: string;
  label: string;
};

export default function NavLink({ href, label }: NavLinkProps) {
  return (
    <Link href={href} className="text-gray-300 hover:text-white">
      {label}
    </Link>
  );
}
