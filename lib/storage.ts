import type { EducationEntry, ExperienceEntry, ResumeData, TemplateId } from "./types";

const STORAGE_KEY = "resume-builder:v1";

export interface StoredState {
  data: ResumeData;
  template: TemplateId;
}

const isString = (v: unknown): v is string => typeof v === "string";
const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null;

function isExperience(v: unknown): v is ExperienceEntry {
  return (
    isRecord(v) &&
    isString(v.id) &&
    isString(v.company) &&
    isString(v.role) &&
    isString(v.startDate) &&
    isString(v.endDate) &&
    typeof v.current === "boolean" &&
    Array.isArray(v.bullets) &&
    v.bullets.every(isString)
  );
}

function isEducation(v: unknown): v is EducationEntry {
  return (
    isRecord(v) &&
    isString(v.id) &&
    isString(v.institution) &&
    isString(v.degree) &&
    isString(v.year)
  );
}

const TEMPLATE_IDS: readonly TemplateId[] = ["classic", "modern", "minimal"];
const isTemplateId = (v: unknown): v is TemplateId =>
  isString(v) && (TEMPLATE_IDS as readonly string[]).includes(v);

function isResumeData(v: unknown): v is ResumeData {
  return (
    isRecord(v) &&
    isString(v.fullName) &&
    isString(v.jobTitle) &&
    isString(v.email) &&
    isString(v.phone) &&
    isString(v.location) &&
    isString(v.linkedin) &&
    isString(v.summary) &&
    isString(v.skills) &&
    Array.isArray(v.experience) &&
    v.experience.every(isExperience) &&
    Array.isArray(v.education) &&
    v.education.every(isEducation)
  );
}

/** Returns the saved state, or null when nothing valid is stored or storage is unavailable. */
export function loadStoredState(): StoredState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || !isResumeData(parsed.data)) return null;
    return {
      data: parsed.data,
      template: isTemplateId(parsed.template) ? parsed.template : "classic",
    };
  } catch {
    return null;
  }
}

/** Returns false when storage is unavailable or full. */
export function saveStoredState(state: StoredState): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function clearStoredState(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage unavailable; nothing to clear.
  }
}
