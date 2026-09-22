import type { ExperienceEntry } from "./types";

export const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** "2022-03" -> "Mar 2022". Anything else is returned unchanged. */
export function formatMonth(value: string): string {
  const match = /^(\d{4})-(\d{2})$/.exec(value.trim());
  if (!match) return value.trim();
  const month = MONTHS[Number(match[2]) - 1];
  return month ? `${month} ${match[1]}` : value.trim();
}

export function formatDateRange(entry: ExperienceEntry): string {
  const start = formatMonth(entry.startDate);
  const end = entry.current ? "Present" : formatMonth(entry.endDate);
  return [start, end].filter(Boolean).join(" – ");
}

export function splitSkills(skills: string): string[] {
  return skills
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function cleanBullets(bullets: string[]): string[] {
  return bullets.map((b) => b.trim()).filter(Boolean);
}

/** "https://www.linkedin.com/in/jane/" -> "linkedin.com/in/jane" */
export function linkedinLabel(url: string): string {
  return url
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/+$/, "");
}

export function linkedinHref(url: string): string {
  const trimmed = url.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

/** "Nilesh Naraniwal" -> "Nilesh_Naraniwal_Resume" (the browser appends ".pdf"). */
export function resumeFileName(fullName: string): string {
  const safe = fullName
    .trim()
    .split(/\s+/)
    .map((part) => part.replace(/[^\p{L}\p{N}-]/gu, ""))
    .filter(Boolean)
    .join("_");
  return `${safe || "Resume"}_Resume`;
}

export function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 10);
}
