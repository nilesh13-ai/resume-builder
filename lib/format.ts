import type { ExperienceEntry, ResumeData } from "./types";

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

export function cleanBullets(bullets: string[]): string[] {
  return bullets.map((b) => b.trim()).filter(Boolean);
}

/** "https://www.linkedin.com/in/jane/" -> "linkedin.com/in/jane" */
export function urlLabel(url: string): string {
  return url
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/+$/, "");
}

export function urlHref(url: string): string {
  const trimmed = url.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export interface ContactItem {
  label: string;
  href?: string;
}

/** Contact line items in display order, skipping empty fields. */
export function contactItems(data: ResumeData): ContactItem[] {
  const items: ContactItem[] = [];
  if (data.email) items.push({ label: data.email, href: `mailto:${data.email}` });
  if (data.phone) items.push({ label: data.phone });
  if (data.location) items.push({ label: data.location });
  if (data.linkedin) items.push({ label: urlLabel(data.linkedin), href: urlHref(data.linkedin) });
  if (data.website) items.push({ label: urlLabel(data.website), href: urlHref(data.website) });
  return items;
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

/** "3 min ago", "2 h ago", "4 days ago", or a short date for older values. */
export function formatRelativeTime(iso: string, now: number = Date.now()): string {
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return "";
  const seconds = Math.max(0, Math.round((now - then) / 1000));
  if (seconds < 45) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(then).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  // RFC 4122 v4 fallback so ids are always uuid-shaped.
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

/** Immutable move of an array item. */
export function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) {
    return items;
  }
  const next = items.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}
