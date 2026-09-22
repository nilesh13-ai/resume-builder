/** Template ids in gallery order. The registry in components/templates/index.ts must match. */
export const TEMPLATE_IDS = ["classic", "modern", "minimal", "bold", "compact"] as const;
export type TemplateId = (typeof TEMPLATE_IDS)[number];

export interface ExperienceEntry {
  id: string;
  company: string;
  role: string;
  /** "YYYY-MM" or free text. */
  startDate: string;
  /** "YYYY-MM" or free text. Ignored when `current` is true. */
  endDate: string;
  current: boolean;
  bullets: string[];
}

export interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  year: string;
}

export interface ProjectEntry {
  id: string;
  name: string;
  description: string;
  link: string;
}

export interface ResumeData {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
  summary: string;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  projects: ProjectEntry[];
  skills: string[];
  languages: string[];
}

/** A saved resume document. */
export interface Resume {
  id: string;
  title: string;
  templateId: TemplateId;
  data: ResumeData;
  createdAt: string;
  updatedAt: string;
}
