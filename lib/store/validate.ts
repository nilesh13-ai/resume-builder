import {
  TEMPLATE_IDS,
  type EducationEntry,
  type ExperienceEntry,
  type ProjectEntry,
  type Resume,
  type ResumeData,
  type TemplateId,
} from "@/lib/types";

const isString = (v: unknown): v is string => typeof v === "string";
const isStringArray = (v: unknown): v is string[] => Array.isArray(v) && v.every(isString);
const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null;

export const isTemplateId = (v: unknown): v is TemplateId =>
  isString(v) && (TEMPLATE_IDS as readonly string[]).includes(v);

function isExperience(v: unknown): v is ExperienceEntry {
  return (
    isRecord(v) &&
    isString(v.id) &&
    isString(v.company) &&
    isString(v.role) &&
    isString(v.startDate) &&
    isString(v.endDate) &&
    typeof v.current === "boolean" &&
    isStringArray(v.bullets)
  );
}

function isEducation(v: unknown): v is EducationEntry {
  return (
    isRecord(v) && isString(v.id) && isString(v.institution) && isString(v.degree) && isString(v.year)
  );
}

function isProject(v: unknown): v is ProjectEntry {
  return (
    isRecord(v) && isString(v.id) && isString(v.name) && isString(v.description) && isString(v.link)
  );
}

function isResumeData(v: unknown): v is ResumeData {
  return (
    isRecord(v) &&
    isString(v.fullName) &&
    isString(v.jobTitle) &&
    isString(v.email) &&
    isString(v.phone) &&
    isString(v.location) &&
    isString(v.linkedin) &&
    isString(v.website) &&
    isString(v.summary) &&
    Array.isArray(v.experience) &&
    v.experience.every(isExperience) &&
    Array.isArray(v.education) &&
    v.education.every(isEducation) &&
    Array.isArray(v.projects) &&
    v.projects.every(isProject) &&
    isStringArray(v.skills) &&
    isStringArray(v.languages)
  );
}

/**
 * Accepts stored data that may predate newer fields and fills them in.
 * Returns null when the core shape is wrong.
 */
export function normalizeResumeData(v: unknown): ResumeData | null {
  if (!isRecord(v)) return null;
  const candidate = {
    ...v,
    website: isString(v.website) ? v.website : "",
    projects: Array.isArray(v.projects) ? v.projects : [],
    skills: isStringArray(v.skills)
      ? v.skills
      : isString(v.skills)
        ? v.skills.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
    languages: isStringArray(v.languages) ? v.languages : [],
  };
  return isResumeData(candidate) ? candidate : null;
}

export function normalizeResume(v: unknown): Resume | null {
  if (!isRecord(v) || !isString(v.id)) return null;
  const data = normalizeResumeData(v.data);
  if (!data) return null;
  const now = new Date().toISOString();
  return {
    id: v.id,
    title: isString(v.title) && v.title.trim() ? v.title : "Untitled resume",
    templateId: isTemplateId(v.templateId) ? v.templateId : "classic",
    data,
    createdAt: isString(v.createdAt) ? v.createdAt : now,
    updatedAt: isString(v.updatedAt) ? v.updatedAt : now,
  };
}
