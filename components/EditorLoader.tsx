"use client";

import Link from "next/link";
import { ResumeEditor } from "@/components/ResumeEditor";
import { useResume, useResumeStore } from "@/lib/store/context";

export function EditorLoader({ resumeId }: { resumeId: string }) {
  const store = useResumeStore();
  const { value: resume, loading, error, refresh } = useResume(resumeId);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl p-4" aria-busy>
        <div className="h-10 w-64 animate-pulse rounded-md bg-zinc-200" />
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="h-96 animate-pulse rounded-lg bg-zinc-200" />
          <div className="h-96 animate-pulse rounded-lg bg-zinc-200" />
        </div>
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="text-xl font-semibold text-zinc-900">
          {error ? "Could not load this resume" : "Resume not found"}
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          {error ??
            (store.kind === "cloud"
              ? "It may have been deleted, or it was saved in this browser before you logged in. Log out to see browser-only resumes."
              : "It may have been deleted, or it was created on another device or browser.")}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          {error && (
            <button type="button" onClick={refresh} className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50">
              Try again
            </button>
          )}
          <Link href="/resumes" className="inline-block rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white">
            Go to my resumes
          </Link>
        </div>
      </div>
    );
  }

  // Keyed by store too: logging in or out swaps the backing store, and the
  // editor must remount rather than save a cloud id into local storage.
  return <ResumeEditor key={`${store.kind}:${resume.id}`} resume={resume} />;
}
