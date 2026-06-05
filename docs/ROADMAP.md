# SuperCalendar Roadmap

Where this fork is headed. Items are ordered by leverage (impact ÷ risk).
Versions reference the latest stable as of 2026-06-05.

## Done (v1.0.0)

- ✅ Fork + rebrand to SuperCalendar with full attribution.
- ✅ Memoized calendar context (kills full-tree re-renders on state change).
- ✅ Memoized, single-pass event bucketing in `client-container`.
- ✅ `React.memo` on hot leaf cells (day cell, event block, event badge, year cell).
- ✅ CI workflow + `check` / `typecheck` / `format` scripts.

## P1 — More perf, no major bumps

- [ ] Pre-parse event ISO strings to `Date` **once** at load (store on the event),
      instead of `parseISO` in render paths. Removes thousands of parses on large sets.
- [ ] `loading.tsx` + `error.tsx` per route → streaming + graceful errors.
- [ ] Virtualize Year view and Agenda list for large datasets.
- [ ] `useCallback` for click/drag handlers passed into memoized cells.

## P2 — Stack modernization (branch + verify)

Target: Next.js 16.2 · React 19.2 · TypeScript 6 · Tailwind v4.

- [ ] **Async `cookies()`** — `src/cookies/get.ts` `getTheme()` must become `async` and be
      `await`ed in `app/layout.tsx`. **This is a hard blocker** for Next 15+.
- [ ] Bump `next` → 16, `react`/`react-dom` → 19; run official codemods.
- [ ] Verify Radix UI / react-aria-components / react-dnd peer-deps under React 19.
- [ ] Turbopack build (`next build --turbopack`, stable in 16).
- [ ] `tsconfig` `target: es5` → `es2022` (smaller, faster output).
- [ ] Tailwind v4 — CSS-first config (`@import "tailwindcss"`), Oxide engine (faster builds).
- [ ] Re-enable `next/image` optimization (currently `unoptimized: true`).

## P3 — Tooling + quality

- [ ] ESLint 8 + Prettier → **Biome** (single fast tool).
- [ ] **Vitest** unit tests for date/filter helpers + DnD reducers.
- [ ] **Playwright** e2e for view switching, drag-drop, user filtering.
- [ ] `date-fns` v3 → v4 (timezone support) or evaluate Temporal API.
- [ ] Evaluate `react-dnd` → `@dnd-kit` (lighter, better a11y, actively maintained).

## P4 — Features

- [ ] Real data layer: TanStack Query + Server Actions, replacing mock `requests.ts`.
- [ ] Recurring events (RRULE).
- [ ] Timezone-aware rendering.
- [ ] iCal / `.ics` import & export.
- [ ] Keyboard navigation + improved screen-reader support.

## Principles

- Keep `main` green: every change must pass `tsc --noEmit` + `next build`.
- Adopt new framework features only when they cut code, improve safety/perf, or
  remove deprecated patterns — not for novelty.
- Preserve upstream compatibility where practical so improvements can flow back.
