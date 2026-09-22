# Review notes

What a senior-engineer review of this codebase found, what was fixed, and what
was deliberately left. Kept current as phases land.

## Fixed in the review pass

- **Autosave could lose the last edits.** The debounce timer was cleared on
  unmount, so typing and then immediately navigating away dropped up to 600ms
  of edits. The editor now flushes unsaved changes on unmount and on `pagehide`.
- **Autosave could apply saves out of order.** Two in-flight updates could
  resolve in either order, leaving an older draft persisted and the indicator
  stuck on "Saving". Saves are now serialized: one in flight at a time, and a
  newer draft triggers exactly one follow-up save.
- **Logging out with the editor open** swapped the backing store under the
  editor, which then tried to save a cloud id into localStorage. The editor is
  now keyed by store kind and remounts; the not-found page explains why.
- **Clicking the "Skills"/"Languages" label removed a tag.** A wrapping
  `<label>` activates its first labelable descendant, which was a tag's remove
  button. Those fields use `htmlFor` now.
- **Layout shift on the landing page.** Thumbnails rendered at full size for one
  frame before being scaled. The wrapper reserves the A4 aspect ratio and the
  sheet stays invisible until measured.
- **Import could duplicate resumes.** If the local delete failed after the
  cloud insert, a retry inserted again. Imports now keep the local id, and a
  unique-violation is treated as "already imported".
- **Any URL scheme became a link.** `javascript:` and similar now render as
  plain text; only `http(s)` links get an `href`.
- **Proxy ran a Supabase round-trip on every request**, including static
  pages that never read the session. Its matcher is now `/auth/*` only.
- **`lib` depended on `components`** (template ids). `TEMPLATE_IDS` moved to
  `lib/types.ts`; the registry checks it stays in sync.
- **Dead code**: unused `ClearAllButton`, `emptyResume`, and several exports
  that were only used in their own file.
- Smaller: `ResumeTemplate` is memoized so the preview's own resize
  measurement doesn't re-render the template; `useResume` has a retry;
  duplicated "new resume" defaults live in one helper; the cloud store no
  longer relies on `this`; `document.title` is restored even if `afterprint`
  never fires; the tab bar has proper `tab`/`tablist` roles; the header
  reserves space for the Login button while the session loads.

## Security review

### Keys in the client
- The browser bundle only ever receives `NEXT_PUBLIC_SUPABASE_URL` and
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (`lib/supabase/env.ts`). There is no
  service-role key in the repo, in `.env.example`, or in any server code.
- `.env*` is gitignored. A scan of the full git history found no keys and no
  env file ever committed.
- The optional `TEST_USER*` variables for the RLS check have no
  `NEXT_PUBLIC_` prefix, so Next.js never inlines them into client code.

### Row-level security (`supabase/migrations/001_init.sql`)
- RLS is enabled on `public.resumes`. All four policies are granted to the
  `authenticated` role only and compare `(select auth.uid())` with `user_id`,
  so the `anon` role has no access at all and a signed-in user cannot select,
  update, or delete another user's rows. `insert` has a `with check`, so a user
  cannot insert rows attributed to someone else.
- `user_id` defaults to `auth.uid()`. The client also sends it explicitly
  (`lib/store/cloud.ts`); the database does not trust that value, the
  `with check` policy is what enforces it.
- The `update` policy has both `using` and `with check`, so a user cannot move
  a row to another `user_id`.
- The `updated_at` trigger only touches `new.updated_at`.
- Verification status: pending the table being created in the project (the
  REST API still reports it missing) and two test accounts. See the end of
  this file for the exact check that will run.

### Auth flow
- `app/auth/callback/route.ts` only redirects to same-origin relative paths;
  `safeNext` rejects absolute URLs, protocol-relative `//` paths, and
  backslashes, so the `next` parameter cannot be used for open redirects.
- The proxy refreshes session cookies for `/auth/*` only and gates nothing.
  There are no server-rendered private pages, so nothing depends on it for
  access control; RLS is the only authorization layer.
- Resume content is rendered as text, never as HTML, so there is no XSS path
  from stored data. Links are limited to `http(s)` and `mailto:` built from
  the email field.

## Left as-is, with recommendations

- **Cloud flush on tab close is best-effort.** `pagehide` triggers a save, but
  a Supabase request started during unload can be cancelled by the browser.
  Local saves complete synchronously. Recommendation: if this matters, send
  the final save through a `fetch` with `keepalive: true` to a small route
  handler, or shorten the debounce further.
- **No `beforeunload` warning while a save is pending.** Deliberate: the
  prompt is intrusive and the flush above covers the common case.
- **`data` column is untyped JSON.** Authorization is fine, but the client
  re-validates on read and silently drops a malformed row from the list.
  Recommendation: add a `check (jsonb_typeof(data) = 'object')` constraint
  and a size cap (e.g. `octet_length(data::text) < 200000`).
- **Magic-link rate limiting** relies on Supabase defaults. Tighten in the
  dashboard before a public launch.
- **Supabase JS is in the initial bundle on every page** (~40 KB gzipped of a
  ~250 KB total). Acceptable now; lazy-load the client from `AuthProvider`
  if the landing page's bundle becomes a concern.
- **The form re-renders fully on each keystroke.** Fine at resume sizes
  (tens of fields). If it grows, memoize entry sub-forms by id.
- **Thumbnails are live DOM, not images.** Each dashboard card renders a full
  template scaled with a transform. Fine for dozens of resumes; rasterize
  server-side if the dashboard needs to show hundreds.
- **Safari printing** was not driven automatically. The print CSS uses only
  `@page`, `break-inside`, and `break-after`. Safari ignores `@page { size }`
  and uses the paper size from its dialog, so users there should pick A4 in
  the dialog; margins and page breaks behave the same.
- **Import prompt dismissal is per user, per browser** (`localStorage` flag).
  If a user dismisses and later wants to import, they must delete the flag or
  the local resumes stay browser-only. Recommendation: expose "Import from
  this browser" as a dashboard action instead of a one-time banner.
- **`next dev` regenerates the managed block in `AGENTS.md`**; don't edit it.

## Sharing and sections (feature notes)

- **Public links** read through the `resumes_select_public` policy with the
  publishable key and no session (`lib/store/public.ts`). Anonymous access is
  further limited to the columns the page needs; `user_id` is not granted to
  `anon` (see `002_public_sharing.sql`), so a public page never reveals the
  owner's id. Public pages are `noindex`.
- **Local resumes cannot be public.** The local store forces `isPublic` to
  false on every write and the share panel shows a login prompt instead.
- **Section order** is stored as `data.sections` (`lib/sections.ts`). It is
  normalized on every read, so older resumes without it, or rows with unknown
  ids, always come back complete. Two-column templates (Modern, Compact) keep
  a fixed column assignment and apply the order within each column; hidden
  and empty sections are skipped everywhere.
- **Drag and drop** uses native HTML drag events plus up/down buttons for
  keyboard and touch users; there is no pointer-based fallback on touch
  devices, where the buttons are the intended path.

## Engineering notes
- The React Compiler lint rules forbid `setState` directly inside an effect
  body and reading refs during render. All async state uses promise callbacks;
  the editor syncs refs inside effects rather than in render.
- PDF output relies on the browser print dialog and was tested in headless
  Chrome for all five templates, single and multi-page.
