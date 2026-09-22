import type { SupabaseClient } from "@supabase/supabase-js";
import { sampleResume } from "@/lib/sample-data";
import type { Resume } from "@/lib/types";
import type { CreateResumeInput, ResumePatch, ResumeStore } from "./types";
import { ResumeNotFoundError } from "./types";
import { normalizeResume } from "./validate";

/** Shape of a row in the `resumes` table (see supabase/migrations/001_init.sql). */
interface ResumeRow {
  id: string;
  user_id: string;
  title: string;
  template_id: string;
  data: unknown;
  created_at: string;
  updated_at: string;
}

const COLUMNS = "id, user_id, title, template_id, data, created_at, updated_at";

function fromRow(row: ResumeRow): Resume | null {
  return normalizeResume({
    id: row.id,
    title: row.title,
    templateId: row.template_id,
    data: row.data,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

function toRowPatch(patch: ResumePatch): Partial<Pick<ResumeRow, "title" | "template_id" | "data">> {
  const row: Partial<Pick<ResumeRow, "title" | "template_id" | "data">> = {};
  if (patch.title !== undefined) row.title = patch.title;
  if (patch.templateId !== undefined) row.template_id = patch.templateId;
  if (patch.data !== undefined) row.data = patch.data;
  return row;
}

/**
 * Supabase-backed store. Row-level security guarantees the user only ever
 * sees their own rows; the explicit user_id filter is belt and braces.
 */
export function createCloudStore(supabase: SupabaseClient, userId: string): ResumeStore {
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((l) => l());
  const table = () => supabase.from("resumes");

  async function insert(input: Required<Pick<CreateResumeInput, "title" | "templateId" | "data">>): Promise<Resume> {
    const { data, error } = await table()
      .insert({ user_id: userId, title: input.title, template_id: input.templateId, data: input.data })
      .select(COLUMNS)
      .single<ResumeRow>();
    if (error) throw new Error(error.message);
    const resume = fromRow(data);
    if (!resume) throw new Error("Server returned an invalid resume");
    notify();
    return resume;
  }

  return {
    kind: "cloud",
    async list() {
      const { data, error } = await table()
        .select(COLUMNS)
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })
        .returns<ResumeRow[]>();
      if (error) throw new Error(error.message);
      return data.map(fromRow).filter((r): r is Resume => r !== null);
    },
    async get(id) {
      const { data, error } = await table().select(COLUMNS).eq("id", id).maybeSingle<ResumeRow>();
      if (error) throw new Error(error.message);
      return data ? fromRow(data) : null;
    },
    async create(input: CreateResumeInput = {}) {
      const data = input.data ?? structuredClone(sampleResume);
      return insert({
        title: input.title ?? (data.fullName ? `${data.fullName}'s resume` : "Untitled resume"),
        templateId: input.templateId ?? "classic",
        data,
      });
    },
    async update(id, patch) {
      const { data, error } = await table()
        .update(toRowPatch(patch))
        .eq("id", id)
        .select(COLUMNS)
        .maybeSingle<ResumeRow>();
      if (error) throw new Error(error.message);
      if (!data) throw new ResumeNotFoundError(id);
      const resume = fromRow(data);
      if (!resume) throw new Error("Server returned an invalid resume");
      notify();
      return resume;
    },
    async remove(id) {
      const { error } = await table().delete().eq("id", id);
      if (error) throw new Error(error.message);
      notify();
    },
    async duplicate(id) {
      const source = await this.get(id);
      if (!source) throw new ResumeNotFoundError(id);
      return insert({
        title: `${source.title} (copy)`,
        templateId: source.templateId,
        data: structuredClone(source.data),
      });
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
