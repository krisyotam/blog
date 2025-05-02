"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";

export function Logo() {
  const pathname = usePathname();
  let href: string | null;
  if (pathname === "/") {
    href = null;
  } else if (pathname === "/categories") {
    href = "/";
  } else if (pathname.startsWith("/categories/") || pathname.startsWith("/tags/")) {
    href = "/categories";
  } else {
    href = "/";
  }
  return (
    <span className="text-md md:text-lg whitespace-nowrap font-bold">
      {href === null ? (
        <span className="cursor-default pr-2">Kris Yotam</span>
      ) : (
        <Link
          href={href}
          className="hover:bg-gray-200 dark:hover:bg-[#313131] active:bg-gray-300 dark:active:bg-[#242424] p-2 rounded-sm -ml-2 transition-[background-color]"
        >
          Kris Yotam
        </Link>
      )}
    </span>
  );
}
