# SuperCalendar Roadmap

Where this fork is headed. Items are ordered by leverage (impact ÷ risk).
Versions reference the latest stable as of 2026-06-05.

## Done — v1.0.0 (rebrand + render perf)

- ✅ Fork + rebrand to SuperCalendar with full attribution.
- ✅ Memoized calendar context (kills full-tree re-renders on state change).
- ✅ Memoized, single-pass event bucketing in `client-container`.
- ✅ `React.memo` on hot leaf cells (day cell, event block, event badge, year cell).
- ✅ CI workflow + `check` / `typecheck` / `format` scripts.

## Done — v2.0.0 (full modernization)

- ✅ **Next.js 14 → 16.2.7** (Turbopack default build) + **React 18 → 19.2**.
- ✅ Async `cookies()`; `app/layout.tsx` async Server Component.
- ✅ `tsconfig` `target` es5 → es2022; `jsx: react-jsx`.
- ✅ **react-dnd → @dnd-kit** (centralized `onDragEnd`, `DragOverlay`, keyboard sensor) — verified by Playwright drag test.
- ✅ **Tailwind v3 → v4** (CSS-first `@theme`, Oxide engine).
- ✅ **react-day-picker 8 → 9** (single-calendar rewritten for v9).
- ✅ **ESLint + Prettier → Biome 2.4**.
- ✅ **Vitest** unit tests + **Playwright** e2e, wired into CI.
- ✅ Streaming `loading.tsx` + `error.tsx` boundaries.

## Next — perf

- [ ] Pre-parse event ISO strings to `Date` **once** at load (store on the event),
      instead of `parseISO` in render paths. Removes thousands of parses on large sets.
- [ ] Virtualize Year view and Agenda list for large datasets.
- [ ] `useCallback` for click handlers passed into memoized cells.
- [ ] Re-enable `next/image` optimization once real images ship (currently `unoptimized`).

## Next — quality

- [ ] `date-fns` v3 → v4 (timezone support) or evaluate the Temporal API.
- [ ] Component-level tests (dialogs, user filtering) alongside the helper unit tests.

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
