# Review notes

Things I would flag or call out in a PR review of this codebase. Updated as
phases land; the security section is filled in after the Supabase verification.

## Security review

### Keys in the client
- The browser bundle only ever receives `NEXT_PUBLIC_SUPABASE_URL` and
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (`lib/supabase/env.ts`). There is no
  service-role key in the repo, in `.env.example`, or in any server code.
- `.env*` is gitignored. `.env.example` documents the two public values only.
- The optional `TEST_USER*` variables used for the RLS check have no
  `NEXT_PUBLIC_` prefix, so Next.js never inlines them into client code.

### Row-level security (`supabase/migrations/001_init.sql`)
- RLS is enabled on `public.resumes`. All four policies are granted to the
  `authenticated` role only and compare `(select auth.uid())` with `user_id`,
  so the `anon` role has no access at all and a signed-in user cannot select,
  update, or delete another user's rows. `insert` has a `with check`, so a user
  cannot insert rows attributed to someone else.
- `user_id` defaults to `auth.uid()`. The client also sends it explicitly
  (`lib/store/cloud.ts`), which is redundant but harmless; the `with check`
  policy is what actually enforces it.
- The `update` policy has both `using` and `with check`, so a user cannot move
  a row to another `user_id`.
- The `updated_at` trigger runs as the table owner; it only touches
  `new.updated_at`, so it cannot be abused to change other columns.
- Verification status: see "RLS verification" below.

### Auth flow
- `app/auth/callback/route.ts` only redirects to same-origin relative paths
  (`safeNext` rejects absolute URLs and protocol-relative `//` paths), so the
  `next` parameter cannot be used for open redirects.
- The proxy (`proxy.ts`) refreshes session cookies but does not gate any route.
  There are no server-rendered private pages, so nothing depends on it for
  access control; RLS is the only authorization layer, which is the right
  place for it.
- Sessions live in cookies managed by `@supabase/ssr`. Because there is no
  server-side data fetching yet, the cookie is mostly there so the callback
  route can complete the PKCE exchange.

### Things I would still flag
- **Data column is untyped JSON.** Any authenticated user can write arbitrary
  JSON into their own `data` column. That is fine for authorization but the
  client re-validates on read (`lib/store/validate.ts`), and a malformed row
  is silently dropped from the list rather than surfaced. Consider a Postgres
  `check` constraint with `jsonb_typeof(data) = 'object'` and a size cap.
- **No rate limiting on magic links** beyond Supabase's defaults. Fine for a
  hobby deployment; production should tighten the auth rate limits in the
  Supabase dashboard.
- **Titles and resume content are rendered as text**, never as HTML, so there
  is no XSS path from stored data. Links in templates use `href` from user
  input after prefixing `https://` when a scheme is missing; a `javascript:`
  URL would currently be rendered as `https://javascript:...`, which is inert,
  but an explicit allowlist of `http`/`https`/`mailto` would be cleaner.
- **Import prompt removes local copies after upload.** If the tab closes
  mid-import, some resumes may already be in the account and some still local;
  re-running the import creates no duplicates for the already-removed ones,
  but the user sees the prompt again for the rest. Acceptable, worth knowing.

## Engineering notes
- `next dev` regenerates the managed block in `AGENTS.md`; don't edit it.
- The React Compiler lint rules forbid `setState` directly inside an effect
  body and reading refs during render. All async state uses promise callbacks;
  derived state replaces the ref-based flags used in earlier versions.
- PDF output relies on the browser print dialog, so it was tested in headless
  Chrome only. Safari was not driven automatically; the print CSS uses only
  `@page`, `break-inside`, and `break-after`, which Safari supports.
- Thumbnails render the full template DOM scaled with a CSS transform. With
  many resumes on the dashboard this is heavier than a rasterized thumbnail;
  fine up to a few dozen.
