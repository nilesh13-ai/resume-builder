"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ResumeSheet } from "@/components/ResumeSheet";
import { useToast } from "@/components/Toaster";
import { TEMPLATES } from "@/components/templates";
import { sampleResume } from "@/lib/sample-data";
import { useResumeStore } from "@/lib/store/context";
import type { TemplateId } from "@/lib/types";

export function TemplateGallery() {
  const store = useResumeStore();
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState<TemplateId | null>(null);

  async function use(templateId: TemplateId) {
    setBusy(templateId);
    try {
      const resume = await store.create({ templateId });
      router.push(`/editor/${resume.id}`);
    } catch (e) {
      toast({ variant: "error", title: "Could not create the resume", description: e instanceof Error ? e.message : undefined });
      setBusy(null);
    }
  }

  return (
    <div id="templates" className="scroll-mt-20">
      <ul className="grid grid-cols-[minmax(0,1fr)] gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {TEMPLATES.map((t) => (
          <li key={t.id} data-template={t.id} className="flex min-w-0 flex-col rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="overflow-hidden rounded-md bg-zinc-100 p-3">
              <ResumeSheet data={sampleResume} templateId={t.id} fixedAspect />
            </div>
            <div className="mt-4 flex flex-1 flex-col">
              <h3 className="text-base font-semibold text-zinc-900">{t.name}</h3>
              <p className="mt-1 flex-1 text-sm text-zinc-600">{t.description}</p>
              <button
                type="button"
                data-action="use-template"
                onClick={() => use(t.id)}
                disabled={busy !== null}
                className="mt-4 w-full rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
              >
                {busy === t.id ? "Creating…" : "Use this template"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
