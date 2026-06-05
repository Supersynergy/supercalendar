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

## P2 — Stack modernization — ⏳ on branch `chore/modernize-next16-react19` (build green, pending DnD QA)

Target: Next.js 16.2 · React 19.2 · TypeScript 6 · Tailwind v4.

- [x] **Async `cookies()`** — `getTheme()` is now `async`/`await`ed in `app/layout.tsx`.
- [x] Bump `next` → 16.2.7, `react`/`react-dom` → 19.2.
- [x] **react-day-picker 8 → 9** — `single-calendar.tsx` rewritten for v9 API.
- [x] Turbopack build (default in 16; ~3.4s).
- [x] `tsconfig` `target: es5` → `es2022`.
- [ ] **Manual browser QA of drag-and-drop** under React 19 (react-dnd@16 unmaintained) — blocker for merge.
- [ ] Evaluate `react-dnd` → `@dnd-kit` if DnD regressions surface (see P3).
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
