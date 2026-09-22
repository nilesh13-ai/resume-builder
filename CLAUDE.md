# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project state

A fresh `create-next-app` scaffold for a resume builder. The only app code is the root layout and the placeholder home page in `app/`. There is no test runner, no CI, and no database yet.

## Commands

```bash
npm run dev      # dev server on http://localhost:3000 (Turbopack)
npm run build    # production build
npm run start    # serve the production build
npm run lint     # eslint (flat config in eslint.config.mjs)
npx tsc --noEmit # type-check; run `npx next typegen` first if .next/dev/types is missing
```

`npx next typegen` generates the route types (`LayoutProps<"/">`, `PageProps`, typed `href`s) into `.next/dev/types/` without a full build. `tsconfig.json` includes that directory, so type-checking on a clean checkout fails until `next dev`, `next build`, or `next typegen` has run once.

## Stack and conventions

- **Next.js 16.3.5, App Router only.** Bundled docs live in `node_modules/next/dist/docs/01-app/`; read the relevant page before using an API, as this version differs from older training data (see AGENTS.md).
- **Layout/page props use the global generated types** (`LayoutProps<"/">` in `app/layout.tsx`), not hand-written prop interfaces.
- **Tailwind CSS v4** via `@tailwindcss/postcss`. There is no `tailwind.config.*`; theme tokens are declared in `app/globals.css` with `@theme inline`, and dark mode follows `prefers-color-scheme` through CSS variables (`--background`, `--foreground`).
- **Fonts** are loaded with `next/font/google` (Geist and Geist Mono) in the root layout and exposed as `--font-geist-sans` / `--font-geist-mono`, mapped to Tailwind's `font-sans` / `font-mono` in `globals.css`.
- **Path alias** `@/*` resolves to the repo root, so `@/app/...` and `@/components/...` both work.
- **ESLint 9 flat config** extends `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`.

## AGENTS.md is generated

`next dev` writes and maintains the managed block in `AGENTS.md`. Do not edit or remove that block. This file is not touched by Next.js as long as `AGENTS.md` exists and hosts the block, so project-specific guidance belongs here.
