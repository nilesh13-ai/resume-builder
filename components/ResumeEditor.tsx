"use client";

import { useEffect, useRef, useState } from "react";
import { ClearAllButton } from "@/components/ClearAllButton";
import { ResumeDocument } from "@/components/ResumeDocument";
import { ResumeForm } from "@/components/ResumeForm";
import { ResumePreview } from "@/components/ResumePreview";
import { TemplateToggle } from "@/components/TemplateToggle";
import { resumeFileName } from "@/lib/format";
import { sampleResume } from "@/lib/sample-data";
import { clearStoredState, saveStoredState, type StoredState } from "@/lib/storage";
import type { ResumeData, TemplateId } from "@/lib/types";

type Tab = "edit" | "preview";
type SaveState = "idle" | "saving" | "saved" | "error";

const SAVE_DEBOUNCE_MS = 500;

interface SavedSnapshot extends StoredState {
  ok: boolean;
}

export function ResumeEditor({
  initial,
  persist,
}: {
  /** State to start from (the stored state on the client, sample data during prerender). */
  initial: StoredState;
  /** False during prerender/hydration, when localStorage must not be touched. */
  persist: boolean;
}) {
  const [data, setData] = useState<ResumeData>(initial.data);
  const [template, setTemplate] = useState<TemplateId>(initial.template);
  const [tab, setTab] = useState<Tab>("edit");
  const [saved, setSaved] = useState<SavedSnapshot | null>(null);
  const isFirstRun = useRef(true);

  // Auto-save on change, debounced. The mount run is skipped: it only reflects `initial`.
  useEffect(() => {
    if (!persist) return;
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    const timer = setTimeout(() => {
      const ok = saveStoredState({ data, template });
      setSaved({ data, template, ok });
    }, SAVE_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [data, template, persist]);

  const saveState: SaveState = (() => {
    if (!persist) return "idle";
    if (saved) {
      if (saved.data === data && saved.template === template) return saved.ok ? "saved" : "error";
      return "saving";
    }
    return data === initial.data && template === initial.template ? "idle" : "saving";
  })();

  function handleClearAll() {
    clearStoredState();
    setData(sampleResume);
  }

  function handleDownload() {
    // Browsers use document.title as the default file name in the print-to-PDF dialog.
    const previousTitle = document.title;
    const restore = () => {
      document.title = previousTitle;
      window.removeEventListener("afterprint", restore);
    };
    window.addEventListener("afterprint", restore);
    document.title = resumeFileName(data.fullName);
    window.print();
  }

  return (
    <>
      <div className="flex min-h-screen flex-col bg-zinc-100 print:hidden">
        <header className="border-b border-zinc-200 bg-white/90 backdrop-blur md:sticky md:top-0 md:z-10">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3">
            <div className="mr-auto flex items-center gap-3">
              <h1 className="text-lg font-semibold text-zinc-900">Resume Builder</h1>
              <SaveIndicator state={saveState} />
            </div>
            <button
              type="button"
              onClick={handleDownload}
              className="rounded-md bg-sky-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-700 md:order-last"
            >
              Download PDF
            </button>
            <div className="flex flex-wrap items-center gap-3">
              <TemplateToggle value={template} onChange={setTemplate} />
              <ClearAllButton onConfirm={handleClearAll} />
            </div>
          </div>
        </header>
        {/* Mobile-only Edit/Preview tabs; the only sticky element on small screens. */}
        <div className="sticky top-0 z-10 border-b border-zinc-200 bg-white/90 backdrop-blur md:hidden">
          <div className="mx-auto flex max-w-7xl gap-1 px-4 py-2">
            {(["edit", "preview"] as const).map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`flex-1 rounded-md py-2 text-sm font-medium capitalize ${
                  tab === id
                    ? "bg-zinc-900 text-white"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                }`}
              >
                {id}
              </button>
            ))}
          </div>
        </div>

        <main className="mx-auto grid w-full max-w-7xl flex-1 grid-cols-[minmax(0,1fr)] gap-6 p-4 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
          <div className={tab === "edit" ? "block" : "hidden md:block"}>
            <ResumeForm data={data} onChange={setData} />
          </div>
          <div
            className={`${tab === "preview" ? "block" : "hidden md:block"} md:sticky md:top-20 md:max-h-[calc(100vh-6rem)] md:self-start md:overflow-auto`}
          >
            <ResumePreview data={data} template={template} />
          </div>
        </main>
      </div>

      {/* Print-only copy of the resume. The @page rule in globals.css supplies A4 size and margins. */}
      <div className="hidden print:block">
        <ResumeDocument data={data} template={template} />
      </div>
    </>
  );
}

function SaveIndicator({ state }: { state: SaveState }) {
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
      className={`flex items-center gap-1 text-xs font-medium ${className}`}
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
