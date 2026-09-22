"use client";

import Link from "next/link";
import { ResumeSheet } from "@/components/ResumeSheet";
import { ResumeTemplate } from "@/components/ResumeTemplate";
import { printResume } from "@/lib/print";
import type { Resume } from "@/lib/types";

/** Read-only view of a shared resume: the sheet, a download button, nothing else. */
export function PublicResumeView({ resume }: { resume: Resume }) {
  return (
    <>
      <div className="mx-auto max-w-4xl px-4 py-6 print:hidden">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold text-zinc-900">{resume.data.fullName || resume.title}</h1>
            {resume.data.jobTitle && <p className="text-sm text-zinc-600">{resume.data.jobTitle}</p>}
          </div>
          <button
            type="button"
            onClick={() => printResume(resume.data.fullName)}
            className="rounded-md bg-sky-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-700"
          >
            Download PDF
          </button>
        </div>
        <ResumeSheet data={resume.data} templateId={resume.templateId} />
        <p className="mt-6 text-center text-xs text-zinc-500">
          Made with{" "}
          <Link href="/" className="font-medium text-zinc-700 hover:underline">
            Resume Builder
          </Link>
        </p>
      </div>
      <div className="hidden print:block">
        <ResumeTemplate data={resume.data} templateId={resume.templateId} />
      </div>
    </>
  );
}
