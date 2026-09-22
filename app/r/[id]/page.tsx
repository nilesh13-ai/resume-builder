import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicResumeView } from "@/components/PublicResumeView";
import { fetchPublicResume } from "@/lib/store/public";

// Public pages reflect the latest saved state; never prerender or cache them.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/r/[id]">): Promise<Metadata> {
  const { id } = await params;
  const resume = await fetchPublicResume(id).catch(() => null);
  const name = resume?.data.fullName || resume?.title;
  return {
    title: name ? `${name} – Resume` : "Resume",
    description: resume?.data.jobTitle ? `${name}, ${resume.data.jobTitle}` : undefined,
    // Shared resumes are for people with the link, not search engines.
    robots: { index: false, follow: false },
  };
}

export default async function PublicResumePage({ params }: PageProps<"/r/[id]">) {
  const { id } = await params;
  let resume;
  try {
    resume = await fetchPublicResume(id);
  } catch (e) {
    console.error("Public resume fetch failed:", e instanceof Error ? e.message : e);
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="text-xl font-semibold text-zinc-900">This resume is temporarily unavailable</h1>
        <p className="mt-2 text-sm text-zinc-600">Something went wrong loading it. Please try again in a moment.</p>
        <Link href="/" className="mt-6 inline-block rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white">
          Build your own resume
        </Link>
      </div>
    );
  }
  if (!resume) notFound();
  return <PublicResumeView resume={resume} />;
}
