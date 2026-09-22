import type { Resume, ResumeData, TemplateId } from "@/lib/types";

export interface CreateResumeInput {
  /** Supply to keep an existing id (used when importing local resumes into an account). */
  id?: string;
  title?: string;
  templateId?: TemplateId;
  data?: ResumeData;
}

export type ResumePatch = Partial<Pick<Resume, "title" | "templateId" | "data" | "isPublic">>;

/**
 * Persistence for resumes. There is a localStorage implementation and a
 * Supabase implementation with the same shape; the provider picks one based
 * on whether the user is logged in.
 */
export interface ResumeStore {
  readonly kind: "local" | "cloud";
  list(): Promise<Resume[]>;
  get(id: string): Promise<Resume | null>;
  create(input?: CreateResumeInput): Promise<Resume>;
  update(id: string, patch: ResumePatch): Promise<Resume>;
  remove(id: string): Promise<void>;
  duplicate(id: string): Promise<Resume>;
  /** Called after any change made through this store. */
  subscribe(listener: () => void): () => void;
}

export class ResumeNotFoundError extends Error {
  constructor(id: string) {
    super("Resume not found. It may have been deleted.");
    this.name = "ResumeNotFoundError";
    this.resumeId = id;
  }
  readonly resumeId: string;
}

/** Thrown by `create` when a resume with the supplied id already exists. */
export class DuplicateResumeError extends Error {
  constructor(id: string) {
    super("A resume with this id already exists.");
    this.name = "DuplicateResumeError";
    this.resumeId = id;
  }
  readonly resumeId: string;
}
