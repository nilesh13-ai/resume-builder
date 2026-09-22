/** Public site origin used for absolute URLs in metadata (OG tags, canonical). */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const SITE_NAME = "Resume Builder";
export const SITE_DESCRIPTION =
  "Pick a template, fill in a form with a live preview, and download a clean A4 PDF resume. Free, no account needed to start.";
