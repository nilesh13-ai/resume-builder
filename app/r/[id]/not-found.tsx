import Link from "next/link";

export default function PublicResumeNotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="text-xl font-semibold text-zinc-900">This resume isn&apos;t available</h1>
      <p className="mt-2 text-sm text-zinc-600">
        The link may be wrong, or the owner has made the resume private.
      </p>
      <Link href="/" className="mt-6 inline-block rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white">
        Build your own resume
      </Link>
    </div>
  );
}
