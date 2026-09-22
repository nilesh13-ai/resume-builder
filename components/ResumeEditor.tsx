"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ResumeForm } from "@/components/ResumeForm";
import { ResumeSheet } from "@/components/ResumeSheet";
import { ResumeTemplate } from "@/components/ResumeTemplate";
import { SharePanel } from "@/components/SharePanel";
import { TemplateSwitcher } from "@/components/TemplateSwitcher";
import { useToast } from "@/components/Toaster";
import { printResume } from "@/lib/print";
import { useResumeStore } from "@/lib/store/context";
import type { Resume, ResumeData, TemplateId } from "@/lib/types";

type Tab = "edit" | "preview";
type SaveState = "idle" | "saving" | "saved" | "error";

const SAVE_DEBOUNCE_MS = 600;

interface Draft {
  title: string;
  templateId: TemplateId;
  data: ResumeData;
}

interface SaveResult {
  draft: Draft;
  ok: boolean;
  message?: string;
}

export function ResumeEditor({ resume }: { resume: Resume }) {
  const store = useResumeStore();
  const toast = useToast();
  const [draft, setDraft] = useState<Draft>({ title: resume.title, templateId: resume.templateId, data: resume.data });
  const [tab, setTab] = useState<Tab>("edit");
  const [lastSave, setLastSave] = useState<SaveResult | null>(null);

  // Refs let the save queue and the unmount flush see the latest values
  // without re-creating callbacks on every keystroke.
  const draftRef = useRef(draft);
  const savedDraftRef = useRef<Draft>(draft); // last draft confirmed persisted
  const inFlightRef = useRef(false);
  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  /**
   * Persist the latest draft. Saves are serialized: if the draft changes while
   * a save is in flight, one more save runs afterwards with the newest draft,
   * so the store always ends up with the last edit and never an older one.
   */
  const save = useCallback(async (): Promise<void> => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    try {
      // Loop rather than recurse: keep saving while edits arrive during a save.
      while (draftRef.current !== savedDraftRef.current) {
        const snapshot = draftRef.current;
        try {
          await store.update(resume.id, snapshot);
          savedDraftRef.current = snapshot;
          setLastSave({ draft: snapshot, ok: true });
        } catch (e) {
          const message = e instanceof Error ? e.message : "Save failed";
          setLastSave({ draft: snapshot, ok: false, message });
          toast({ variant: "error", title: "Could not save your changes", description: message });
          break; // the next edit will trigger another attempt
        }
      }
    } finally {
      inFlightRef.current = false;
    }
  }, [store, resume.id, toast]);

  // Debounced autosave while typing.
  useEffect(() => {
    if (draft === savedDraftRef.current) return;
    const timer = setTimeout(() => void save(), SAVE_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [draft, save]);

  // Flush unsaved edits when leaving the editor (navigation, tab close) so the
  // last few hundred milliseconds of typing are never lost.
  useEffect(() => {
    const flush = () => void save();
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, [save]);

  const saveState: SaveState = (() => {
    if (lastSave && lastSave.draft === draft) return lastSave.ok ? "saved" : "error";
    if (lastSave) return "saving";
    const untouched =
      draft.title === resume.title && draft.templateId === resume.templateId && draft.data === resume.data;
    return untouched ? "idle" : "saving";
  })();

  return (
    <>
      <div className="flex min-h-[calc(100vh-3.5rem)] flex-col bg-zinc-100 print:hidden">
        <div className="border-b border-zinc-200 bg-white/90 backdrop-blur md:sticky md:top-0 md:z-10">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3">
            <div className="mr-auto flex min-w-0 basis-full items-center gap-2 sm:basis-auto">
              <Link
                href="/resumes"
                className="shrink-0 rounded-md px-2 py-2 text-sm text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                aria-label="Back to my resumes"
              >
                &larr;
              </Link>
              <input
                aria-label="Resume title"
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                className="min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-2 py-1.5 text-base font-semibold text-zinc-900 hover:border-zinc-300 focus:border-sky-500 focus:outline-none sm:w-64"
              />
              <SaveIndicator state={saveState} message={lastSave?.message} />
            </div>
            <button
              type="button"
              onClick={() => printResume(draft.data.fullName)}
              className="rounded-md bg-sky-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-700 md:order-last"
            >
              Download PDF
            </button>
            <TemplateSwitcher value={draft.templateId} onChange={(templateId) => setDraft({ ...draft, templateId })} />
            <SharePanel resume={resume} />
          </div>
        </div>
        {/* Mobile-only Edit/Preview tabs; the only sticky element on small screens. */}
        <div className="sticky top-0 z-10 border-b border-zinc-200 bg-white/90 backdrop-blur md:hidden">
          <div className="mx-auto flex max-w-7xl gap-1 px-4 py-2" role="tablist" aria-label="Editor view">
            {(["edit", "preview"] as const).map((id) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id}
                onClick={() => setTab(id)}
                className={`flex-1 rounded-md py-2 text-sm font-medium capitalize ${
                  tab === id ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                }`}
              >
                {id}
              </button>
            ))}
          </div>
        </div>

        <main className="mx-auto grid w-full max-w-7xl flex-1 grid-cols-[minmax(0,1fr)] gap-6 p-4 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
          <div className={tab === "edit" ? "block" : "hidden md:block"}>
            <ResumeForm data={draft.data} onChange={(data) => setDraft({ ...draft, data })} />
          </div>
          <div
            className={`${tab === "preview" ? "block" : "hidden md:block"} md:sticky md:top-20 md:max-h-[calc(100vh-6rem)] md:self-start md:overflow-auto`}
          >
            <ResumeSheet data={draft.data} templateId={draft.templateId} />
          </div>
        </main>
      </div>

      {/* Print-only copy of the resume. The @page rule in globals.css supplies A4 size and margins. */}
      <div className="hidden print:block">
        <ResumeTemplate data={draft.data} templateId={draft.templateId} />
      </div>
    </>
  );
}

function SaveIndicator({ state, message }: { state: SaveState; message?: string }) {
  if (state === "idle") return null;
  const styles: Record<Exclude<SaveState, "idle">, { text: string; className: string }> = {
    saving: { text: "Saving…", className: "text-zinc-400" },
    saved: { text: "Saved", className: "text-emerald-600" },
    error: { text: "Not saved", className: "text-red-600" },
  };
  const { text, className } = styles[state];
  return (
    <span
      role="status"
      aria-live="polite"
      title={state === "error" ? message : undefined}
      className={`flex shrink-0 items-center gap-1 text-xs font-medium ${className}`}
    >
      {state === "saved" && (
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M3 8.5l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {text}
    </span>
  );
}
