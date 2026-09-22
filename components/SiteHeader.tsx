"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Templates" },
  { href: "/resumes", label: "My resumes" },
];

export function SiteHeader() {
  const pathname = usePathname();
  return (
    <header className="border-b border-zinc-200 bg-white print:hidden">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 text-base font-semibold text-zinc-900">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-sky-600 text-sm font-bold text-white" aria-hidden>
            R
          </span>
          <span className="hidden sm:inline">Resume Builder</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          {NAV.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap rounded-md px-3 py-2 font-medium ${
                  active ? "bg-zinc-100 text-zinc-900" : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
