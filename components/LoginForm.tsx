"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/context";
import { getBrowserSupabase } from "@/lib/supabase/client";

const ERRORS: Record<string, string> = {
  link: "That sign-in link is invalid or has expired. Request a new one below.",
  not_configured: "Sign-in is not configured on this deployment.",
};

export function LoginForm() {
  const { configured, user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  // Already signed in: go straight to the dashboard.
  useEffect(() => {
    if (!loading && user) router.replace("/resumes");
  }, [loading, user, router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    setStatus("sending");
    setMessage(null);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/resumes` },
    });
    if (error) {
      setStatus("error");
      setMessage(error.message);
    } else {
      setStatus("sent");
    }
  }

  if (!configured) {
    return (
      <Notice title="Sign-in is not set up">
        Add <code className="rounded bg-zinc-100 px-1">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
        <code className="rounded bg-zinc-100 px-1">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> to{" "}
        <code className="rounded bg-zinc-100 px-1">.env.local</code>. Until then, resumes are saved in this browser only.
      </Notice>
    );
  }

  if (status === "sent") {
    return (
      <Notice title="Check your email">
        We sent a sign-in link to <strong>{email.trim()}</strong>. Open it on this device to finish signing in.
        <button type="button" onClick={() => setStatus("idle")} className="mt-4 block text-sm font-medium text-sky-700 hover:underline">
          Use a different email
        </button>
      </Notice>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h1 className="text-xl font-semibold text-zinc-900">Log in or sign up</h1>
      <p className="mt-1 text-sm text-zinc-600">
        We&apos;ll email you a magic link. No password needed.
      </p>
      {(urlError || status === "error") && (
        <p role="alert" className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {status === "error" ? message : (ERRORS[urlError ?? ""] ?? "Sign-in failed. Please try again.")}
        </p>
      )}
      <label className="mt-5 block">
        <span className="mb-1 block text-xs font-medium text-zinc-600">Email</span>
        <input
          type="email"
          required
          autoComplete="email"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-zinc-300 px-3 py-2.5 text-base text-zinc-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30 md:text-sm"
          placeholder="you@example.com"
        />
      </label>
      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-4 w-full rounded-md bg-sky-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-sky-700 disabled:opacity-60"
      >
        {status === "sending" ? "Sending link…" : "Send magic link"}
      </button>
      <p className="mt-4 text-center text-xs text-zinc-500">
        Prefer not to sign in? <Link href="/resumes" className="text-sky-700 hover:underline">Keep working locally</Link>.
      </p>
    </form>
  );
}

function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h1 className="text-xl font-semibold text-zinc-900">{title}</h1>
      <div className="mt-2 text-sm leading-relaxed text-zinc-600">{children}</div>
    </div>
  );
}
