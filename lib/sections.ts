import type { ResumeData } from "./types";

/** Resume sections that can be reordered and hidden, in default order. */
export const SECTION_IDS = ["summary", "experience", "education", "projects", "skills", "languages"] as const;
export type SectionId = (typeof SECTION_IDS)[number];

export interface SectionConfig {
  id: SectionId;
  visible: boolean;
}

export const SECTION_LABELS: Record<SectionId, string> = {
  summary: "Summary",
  experience: "Experience",
  education: "Education",
  projects: "Projects",
  skills: "Skills",
  languages: "Languages",
};

export const defaultSections = (): SectionConfig[] => SECTION_IDS.map((id) => ({ id, visible: true }));

const isSectionId = (v: unknown): v is SectionId => typeof v === "string" && (SECTION_IDS as readonly string[]).includes(v);

/**
 * Accepts anything and returns a complete, duplicate-free section list:
 * known entries keep their order and visibility, unknown ids are dropped,
 * and missing sections are appended (visible) in default order.
 */
export function normalizeSections(value: unknown): SectionConfig[] {
  const result: SectionConfig[] = [];
  const seen = new Set<SectionId>();
  if (Array.isArray(value)) {
    for (const item of value) {
      if (typeof item !== "object" || item === null) continue;
      const { id, visible } = item as { id?: unknown; visible?: unknown };
      if (!isSectionId(id) || seen.has(id)) continue;
      seen.add(id);
      result.push({ id, visible: visible !== false });
    }
  }
  for (const id of SECTION_IDS) {
    if (!seen.has(id)) result.push({ id, visible: true });
  }
  return result;
}

/** Whether a section has anything to render. Empty sections are always skipped. */
export function sectionHasContent(data: ResumeData, id: SectionId): boolean {
  switch (id) {
    case "summary":
      return data.summary.trim().length > 0;
    case "experience":
      return data.experience.length > 0;
    case "education":
      return data.education.length > 0;
    case "projects":
      return data.projects.length > 0;
    case "skills":
      return data.skills.length > 0;
    case "languages":
      return data.languages.length > 0;
  }
}

/** Section ids to render, in the user's order, skipping hidden and empty ones. */
export function visibleSections(data: ResumeData): SectionId[] {
  return data.sections.filter((s) => s.visible && sectionHasContent(data, s.id)).map((s) => s.id);
}
