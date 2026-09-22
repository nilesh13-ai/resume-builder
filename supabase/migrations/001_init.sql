-- Resume Builder: initial schema.
-- Run this in the Supabase SQL editor (or with `supabase db push`).

create table if not exists public.resumes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade default auth.uid(),
  title       text not null default 'Untitled resume',
  template_id text not null default 'classic',
  data        jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Dashboard lists a user's resumes newest first.
create index if not exists resumes_user_id_updated_at_idx
  on public.resumes (user_id, updated_at desc);

-- Keep updated_at current on every change.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists resumes_set_updated_at on public.resumes;
create trigger resumes_set_updated_at
  before update on public.resumes
  for each row execute function public.set_updated_at();

-- Row-level security: a user can only touch their own rows. Policies are
-- granted to the `authenticated` role only, so anonymous requests get nothing.
alter table public.resumes enable row level security;

drop policy if exists "resumes_select_own" on public.resumes;
create policy "resumes_select_own" on public.resumes
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "resumes_insert_own" on public.resumes;
create policy "resumes_insert_own" on public.resumes
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "resumes_update_own" on public.resumes;
create policy "resumes_update_own" on public.resumes
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "resumes_delete_own" on public.resumes;
create policy "resumes_delete_own" on public.resumes
  for delete to authenticated
  using ((select auth.uid()) = user_id);
