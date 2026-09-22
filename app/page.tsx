import type { Metadata } from "next";
import Link from "next/link";
import { TemplateGallery } from "@/components/TemplateGallery";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: `${SITE_NAME} – free resume templates with live preview and PDF download`,
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: SITE_NAME,
    title: `${SITE_NAME} – build a resume in minutes`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} – build a resume in minutes`,
    description: SITE_DESCRIPTION,
  },
};

export default function LandingPage() {
  return (
    <div className="bg-zinc-50">
      <section className="mx-auto max-w-7xl px-4 pb-12 pt-16 text-center sm:pt-24">
        <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
          A resume that looks like you meant it.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-zinc-600">
          Pick a template, fill in the form, watch the preview update as you type, and download a
          clean A4 PDF. No account needed to get started.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#templates"
            className="rounded-md bg-sky-600 px-5 py-3 text-sm font-medium text-white shadow-sm hover:bg-sky-700"
          >
            Choose a template
          </a>
          <Link
            href="/resumes"
            className="rounded-md border border-zinc-300 bg-white px-5 py-3 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
          >
            My resumes
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-zinc-900">Templates</h2>
          <p className="mt-1 text-zinc-600">
            Five styles, same data. Switch between them any time inside the editor.
          </p>
        </div>
        <TemplateGallery />
      </section>
    </div>
  );
}
