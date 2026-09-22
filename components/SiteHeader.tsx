"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useToast } from "@/components/Toaster";
import { useAuth } from "@/lib/auth/context";

const NAV = [
  { href: "/", label: "Templates" },
  { href: "/resumes", label: "My resumes" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { configured, loading, user, signOut } = useAuth();
  const toast = useToast();

  async function logout() {
    const error = await signOut();
    if (error) {
      toast({ variant: "error", title: "Could not log out", description: error });
      return;
    }
    router.push("/");
  }

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
          {configured && loading && <span className="ml-2 h-8 w-16" aria-hidden />}
          {configured && !loading && (
            user ? (
              <div className="ml-2 flex items-center gap-2 border-l border-zinc-200 pl-3">
                <span className="hidden max-w-48 truncate text-xs text-zinc-500 md:inline" title={user.email ?? undefined}>
                  {user.email}
                </span>
                <button
                  type="button"
                  onClick={logout}
                  className="whitespace-nowrap rounded-md border border-zinc-300 px-3 py-1.5 font-medium text-zinc-700 hover:bg-zinc-50"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="ml-2 whitespace-nowrap rounded-md bg-zinc-900 px-3 py-1.5 font-medium text-white hover:bg-zinc-800"
              >
                Login
              </Link>
            )
          )}
        </nav>
      </div>
    </header>
  );
}
