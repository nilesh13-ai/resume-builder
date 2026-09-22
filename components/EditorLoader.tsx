"use client";

import Link from "next/link";
import { ResumeEditor } from "@/components/ResumeEditor";
import { useResume } from "@/lib/store/context";

export function EditorLoader({ resumeId }: { resumeId: string }) {
  const { value: resume, loading, error } = useResume(resumeId);

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
          {error ?? "It may have been deleted, or it was created on another device or browser."}
        </p>
        <Link href="/resumes" className="mt-6 inline-block rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white">
          Go to my resumes
        </Link>
      </div>
    );
  }

  return <ResumeEditor key={resume.id} resume={resume} />;
}
