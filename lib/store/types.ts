import type { Resume, ResumeData, TemplateId } from "@/lib/types";

export interface CreateResumeInput {
  title?: string;
  templateId?: TemplateId;
  data?: ResumeData;
}

export type ResumePatch = Partial<Pick<Resume, "title" | "templateId" | "data">>;

/**
 * Persistence for resumes. Phase 1 has a localStorage implementation; a
 * cloud implementation with the same shape plugs in when the user is logged in.
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
    super(`Resume ${id} not found`);
    this.name = "ResumeNotFoundError";
  }
}
