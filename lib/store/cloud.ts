import type { SupabaseClient } from "@supabase/supabase-js";
import type { Resume } from "@/lib/types";
import { buildCopy, buildNewResume } from "./shared";
import type { CreateResumeInput, ResumePatch, ResumeStore } from "./types";
import { DuplicateResumeError, ResumeNotFoundError } from "./types";
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
const PG_UNIQUE_VIOLATION = "23505";

function fromRow(row: ResumeRow): Resume {
  const resume = normalizeResume({
    id: row.id,
    title: row.title,
    templateId: row.template_id,
    data: row.data,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
  if (!resume) throw new Error("The server returned a resume in an unexpected format.");
  return resume;
}

function toRowPatch(patch: ResumePatch): Partial<Pick<ResumeRow, "title" | "template_id" | "data">> {
  const row: Partial<Pick<ResumeRow, "title" | "template_id" | "data">> = {};
  if (patch.title !== undefined) row.title = patch.title;
  if (patch.templateId !== undefined) row.template_id = patch.templateId;
  if (patch.data !== undefined) row.data = patch.data;
  return row;
}

/**
 * Supabase-backed store. Row-level security is the authorization layer: the
 * `user_id` column defaults to `auth.uid()` server-side and the insert policy
 * rejects any other value, so nothing here is trusted by the database.
 */
export function createCloudStore(supabase: SupabaseClient, userId: string): ResumeStore {
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((l) => l());
  const table = () => supabase.from("resumes");

  async function get(id: string): Promise<Resume | null> {
    const { data, error } = await table().select(COLUMNS).eq("id", id).maybeSingle<ResumeRow>();
    if (error) throw new Error(error.message);
    return data ? fromRow(data) : null;
  }

  async function insert(resume: Resume): Promise<Resume> {
    const { data, error } = await table()
      .insert({ id: resume.id, user_id: userId, title: resume.title, template_id: resume.templateId, data: resume.data })
      .select(COLUMNS)
      .single<ResumeRow>();
    if (error) {
      if (error.code === PG_UNIQUE_VIOLATION) throw new DuplicateResumeError(resume.id);
      throw new Error(error.message);
    }
    notify();
    return fromRow(data);
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
      return data.map(fromRow);
    },
    get,
    async create(input: CreateResumeInput = {}) {
      return insert(buildNewResume(input));
    },
    async update(id, patch) {
      const { data, error } = await table()
        .update(toRowPatch(patch))
        .eq("id", id)
        .select(COLUMNS)
        .maybeSingle<ResumeRow>();
      if (error) throw new Error(error.message);
      if (!data) throw new ResumeNotFoundError(id);
      notify();
      return fromRow(data);
    },
    async remove(id) {
      const { error } = await table().delete().eq("id", id);
      if (error) throw new Error(error.message);
      notify();
    },
    async duplicate(id) {
      const source = await get(id);
      if (!source) throw new ResumeNotFoundError(id);
      return insert(buildCopy(source));
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
