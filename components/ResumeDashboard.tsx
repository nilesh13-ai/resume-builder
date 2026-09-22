"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ImportLocalPrompt } from "@/components/ImportLocalPrompt";
import { ResumeSheet } from "@/components/ResumeSheet";
import { useToast } from "@/components/Toaster";
import { getTemplate } from "@/components/templates";
import { formatRelativeTime } from "@/lib/format";
import { errorMessage, useResumeList, useResumeStore } from "@/lib/store/context";
import type { Resume } from "@/lib/types";

export function ResumeDashboard() {
  const store = useResumeStore();
  const router = useRouter();
  const toast = useToast();
  const { value: resumes, loading, error, refresh } = useResumeList();
  const [creating, setCreating] = useState(false);

  async function createNew() {
    setCreating(true);
    try {
      const resume = await store.create();
      router.push(`/editor/${resume.id}`);
    } catch (e) {
      toast({ variant: "error", title: "Could not create a resume", description: errorMessage(e) });
      setCreating(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">My resumes</h1>
          <p className="mt-1 text-sm text-zinc-600">
            {store.kind === "cloud" ? "Saved to your account." : "Saved in this browser."} Everything auto-saves as you type.
          </p>
        </div>
        <button
          type="button"
          onClick={createNew}
          disabled={creating}
          className="rounded-md bg-sky-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-sky-700 disabled:opacity-60"
        >
          {creating ? "Creating…" : "+ New resume"}
        </button>
      </div>

      <ImportLocalPrompt onImported={refresh} />

      {error && (
        <div role="alert" className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <span>Could not load your resumes: {error}</span>
          <button type="button" onClick={refresh} className="rounded bg-white px-2.5 py-1 text-xs font-medium text-red-700 ring-1 ring-red-200 hover:bg-red-100">
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <ul className="grid grid-cols-[minmax(0,1fr)] gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy>
          {[0, 1, 2].map((i) => (
            <li key={i} className="h-80 animate-pulse rounded-xl bg-zinc-200" />
          ))}
        </ul>
      ) : resumes.length === 0 && !error ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
          <h2 className="text-lg font-semibold text-zinc-900">No resumes yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-zinc-600">
            Start from a template and your resume will show up here, ready to edit or download any time.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/#templates" className="rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800">
              Browse templates
            </Link>
            <button type="button" onClick={createNew} className="rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50">
              Start with sample data
            </button>
          </div>
        </div>
      ) : (
        <ul className="grid grid-cols-[minmax(0,1fr)] gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {resumes.map((resume) => (
            <ResumeCard key={resume.id} resume={resume} />
          ))}
        </ul>
      )}
    </div>
  );
}

function ResumeCard({ resume }: { resume: Resume }) {
  const store = useResumeStore();
  const router = useRouter();
  const toast = useToast();
  const [mode, setMode] = useState<"view" | "rename" | "confirm-delete">("view");
  const [title, setTitle] = useState(resume.title);
  const [busy, setBusy] = useState(false);
  // Optimistic delete: the card disappears immediately and comes back on failure.
  const [removed, setRemoved] = useState(false);

  if (removed) return null;

  const rename = async () => {
    const next = title.trim();
    setMode("view");
    if (!next || next === resume.title) {
      setTitle(resume.title);
      return;
    }
    // Optimistic: the input already shows the new title.
    try {
      await store.update(resume.id, { title: next });
    } catch (e) {
      setTitle(resume.title);
      toast({ variant: "error", title: "Could not rename", description: errorMessage(e) });
    }
  };

  const remove = async () => {
    setRemoved(true);
    try {
      await store.remove(resume.id);
    } catch (e) {
      setRemoved(false);
      setMode("view");
      toast({ variant: "error", title: "Could not delete", description: errorMessage(e) });
    }
  };

  const duplicate = async () => {
    setBusy(true);
    try {
      const copy = await store.duplicate(resume.id);
      router.push(`/editor/${copy.id}`);
    } catch (e) {
      setBusy(false);
      toast({ variant: "error", title: "Could not duplicate", description: errorMessage(e) });
    }
  };

  const linkButton = "rounded px-2 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-50";

  return (
    <li data-resume-id={resume.id} className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div
        role="link"
        tabIndex={0}
        aria-label={`Open ${title}`}
        onClick={() => router.push(`/editor/${resume.id}`)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            router.push(`/editor/${resume.id}`);
          }
        }}
        className="block cursor-pointer bg-zinc-100 p-3 transition hover:bg-zinc-200/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
      >
        <ResumeSheet data={resume.data} templateId={resume.templateId} fixedAspect />
      </div>
      <div className="flex flex-1 flex-col p-4">
        {mode === "rename" ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              rename();
            }}
          >
            <input
              autoFocus
              aria-label="Resume title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={rename}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setTitle(resume.title);
                  setMode("view");
                }
              }}
              className="w-full rounded-md border border-sky-500 px-2 py-1 text-base font-semibold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
            />
          </form>
        ) : (
          <h2 className="truncate text-base font-semibold text-zinc-900">
            <Link href={`/editor/${resume.id}`} className="hover:underline">
              {title}
            </Link>
          </h2>
        )}
        <p className="mt-1 text-xs text-zinc-500">
          {getTemplate(resume.templateId).name} &middot; edited {formatRelativeTime(resume.updatedAt)}
          {resume.isPublic && (
            <span className="ml-2 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-200">
              Public
            </span>
          )}
        </p>

        {mode === "confirm-delete" ? (
          <div role="alertdialog" aria-label="Confirm delete" className="mt-3 flex flex-wrap items-center gap-2 rounded-md border border-red-200 bg-red-50 px-2.5 py-2 text-sm">
            <span className="text-red-800">Delete this resume?</span>
            <button type="button" autoFocus onClick={remove} className="rounded bg-red-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-red-700">
              Delete
            </button>
            <button type="button" onClick={() => setMode("view")} className="rounded px-2 py-1.5 text-xs font-medium text-zinc-600 hover:bg-white">
              Cancel
            </button>
          </div>
        ) : (
          <div className="mt-3 flex flex-wrap items-center gap-1">
            <Link href={`/editor/${resume.id}`} className="rounded bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800">
              Open
            </Link>
            <button type="button" disabled={busy} onClick={() => setMode("rename")} className={linkButton}>
              Rename
            </button>
            <button type="button" disabled={busy} onClick={duplicate} className={linkButton}>
              {busy ? "Duplicating…" : "Duplicate"}
            </button>
            <button type="button" disabled={busy} onClick={() => setMode("confirm-delete")} className={`${linkButton} text-red-600 hover:bg-red-50 hover:text-red-700`}>
              Delete
            </button>
          </div>
        )}
      </div>
    </li>
  );
}
