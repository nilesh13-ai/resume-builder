-- Public share links: a resume with is_public = true is readable by anyone at /r/<id>.
-- Run after 001_init.sql.

alter table public.resumes
  add column if not exists is_public boolean not null default false;

-- Anyone (signed in or not) may read a public resume. Owners keep full access
-- through the existing *_own policies; nothing else changes.
drop policy if exists "resumes_select_public" on public.resumes;
create policy "resumes_select_public" on public.resumes
  for select to anon, authenticated
  using (is_public = true);

-- Don't expose the owner's user_id to anonymous viewers of public resumes.
-- The app never selects user_id from the browser, so this is safe.
revoke select on public.resumes from anon;
grant select (id, title, template_id, data, is_public, created_at, updated_at)
  on public.resumes to anon;
