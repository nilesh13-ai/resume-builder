import { newId } from "@/lib/format";
import { sampleResume } from "@/lib/sample-data";
import type { Resume } from "@/lib/types";
import type { CreateResumeInput } from "./types";

/** Fills in defaults for a new resume: sample data, a title from the name, a fresh id. */
export function buildNewResume(input: CreateResumeInput = {}): Resume {
  const now = new Date().toISOString();
  const data = input.data ?? structuredClone(sampleResume);
  return {
    id: input.id ?? newId(),
    title: input.title ?? (data.fullName ? `${data.fullName}'s resume` : "Untitled resume"),
    templateId: input.templateId ?? "classic",
    data,
    createdAt: now,
    updatedAt: now,
  };
}

/** A copy with a new id, "(copy)" suffix, and fresh timestamps. */
export function buildCopy(source: Resume): Resume {
  const now = new Date().toISOString();
  return {
    ...structuredClone(source),
    id: newId(),
    title: `${source.title} (copy)`,
    createdAt: now,
    updatedAt: now,
  };
}
