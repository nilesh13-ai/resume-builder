import { createClient } from "@supabase/supabase-js";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, supabaseConfigured } from "@/lib/supabase/env";
import type { Resume } from "@/lib/types";
import { RESUME_COLUMNS, rowToResume, type ResumeRow } from "./cloud";

/**
 * Reads a shared resume without a session. The `resumes_select_public` RLS
 * policy only exposes rows with `is_public = true`, so a private id yields null.
 * Server-side only (called from the /r/[id] page).
 */
export async function fetchPublicResume(id: string): Promise<Resume | null> {
  if (!supabaseConfigured) return null;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase
    .from("resumes")
    .select(RESUME_COLUMNS)
    .eq("id", id)
    .eq("is_public", true)
    .maybeSingle<ResumeRow>();
  if (error) throw new Error(error.message);
  return data ? rowToResume(data) : null;
}
