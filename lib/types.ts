export type TemplateId = "classic" | "modern";

export interface ExperienceEntry {
  id: string;
  company: string;
  role: string;
  /** "YYYY-MM" from a month input, or free text. */
  startDate: string;
  /** "YYYY-MM" from a month input, or free text. Ignored when `current` is true. */
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

export interface ResumeData {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  summary: string;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  /** Comma-separated. */
  skills: string;
}
