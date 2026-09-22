import { newId } from "@/lib/format";
import { sampleResume } from "@/lib/sample-data";
import type { Resume } from "@/lib/types";
import type { CreateResumeInput, ResumePatch, ResumeStore } from "./types";
import { ResumeNotFoundError } from "./types";
import { normalizeResume, normalizeResumeData } from "./validate";

export const LOCAL_RESUMES_KEY = "resume-builder:resumes:v1";
/** Single-resume format from the first version of the app; migrated on first read. */
const LEGACY_KEY = "resume-builder:v1";

function readAll(): Resume[] {
  try {
    const raw = window.localStorage.getItem(LOCAL_RESUMES_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed)
        ? parsed.map(normalizeResume).filter((r): r is Resume => r !== null)
        : [];
    }
    return migrateLegacy();
  } catch {
    return [];
  }
}

function migrateLegacy(): Resume[] {
  try {
    const raw = window.localStorage.getItem(LEGACY_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    const legacy = typeof parsed === "object" && parsed !== null ? (parsed as Record<string, unknown>) : null;
    const data = legacy ? normalizeResumeData(legacy.data) : null;
    if (!data) return [];
    const now = new Date().toISOString();
    const resume = normalizeResume({
      id: newId(),
      title: data.fullName ? `${data.fullName}'s resume` : "My resume",
      templateId: legacy?.template,
      data,
      createdAt: now,
      updatedAt: now,
    });
    const resumes = resume ? [resume] : [];
    writeAll(resumes);
    window.localStorage.removeItem(LEGACY_KEY);
    return resumes;
  } catch {
    return [];
  }
}

function writeAll(resumes: Resume[]): void {
  // Throws when storage is unavailable or full; callers surface that as a save error.
  window.localStorage.setItem(LOCAL_RESUMES_KEY, JSON.stringify(resumes));
}

const byUpdatedDesc = (a: Resume, b: Resume) => b.updatedAt.localeCompare(a.updatedAt);

export function createLocalStore(): ResumeStore {
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((l) => l());

  return {
    kind: "local",
    async list() {
      return readAll().sort(byUpdatedDesc);
    },
    async get(id) {
      return readAll().find((r) => r.id === id) ?? null;
    },
    async create(input: CreateResumeInput = {}) {
      const now = new Date().toISOString();
      const data = input.data ?? structuredClone(sampleResume);
      const resume: Resume = {
        id: newId(),
        title: input.title ?? (data.fullName ? `${data.fullName}'s resume` : "Untitled resume"),
        templateId: input.templateId ?? "classic",
        data,
        createdAt: now,
        updatedAt: now,
      };
      writeAll([resume, ...readAll()]);
      notify();
      return resume;
    },
    async update(id, patch: ResumePatch) {
      const all = readAll();
      const index = all.findIndex((r) => r.id === id);
      if (index === -1) throw new ResumeNotFoundError(id);
      const updated: Resume = { ...all[index], ...patch, updatedAt: new Date().toISOString() };
      all[index] = updated;
      writeAll(all);
      notify();
      return updated;
    },
    async remove(id) {
      writeAll(readAll().filter((r) => r.id !== id));
      notify();
    },
    async duplicate(id) {
      const source = readAll().find((r) => r.id === id);
      if (!source) throw new ResumeNotFoundError(id);
      const now = new Date().toISOString();
      const copy: Resume = {
        ...structuredClone(source),
        id: newId(),
        title: `${source.title} (copy)`,
        createdAt: now,
        updatedAt: now,
      };
      writeAll([copy, ...readAll()]);
      notify();
      return copy;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
