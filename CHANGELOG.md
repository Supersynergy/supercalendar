# Changelog

All notable changes to SuperCalendar are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/); newest first.

## [Unreleased] — stack modernization (branch: `chore/modernize-next16-react19`)

Build + SSR verified green; **client drag-and-drop interaction still needs manual browser QA** before merge to `main` (react-dnd@16 is unmaintained on React 19, mounts cleanly but isn't officially supported).

### Changed
- **Next.js 14 → 16.2.7** — Turbopack is now the default build engine (production build compiles in ~3.4s).
- **React 18 → 19.2** (+ `@types/react`/`@types/react-dom` 19, `eslint-config-next` 16).
- **react-day-picker 8 → 9.14** — rewrote `single-calendar.tsx` for the v9 API (`classNames` keys, `components.Chevron`); `initialFocus` → `autoFocus`.
- **Async `cookies()`** — `getTheme()` is now `async/await`; `app/layout.tsx` is an async Server Component (required by Next 15+).
- `tsconfig` `target` es5 → **es2022**; Next auto-set `jsx: react-jsx`.
- `next.config.mjs` — pinned `turbopack.root` to the project (multiple lockfiles on disk).
- `avatar-group.tsx` — narrowed `Children` props for React 19's stricter `unknown` child-prop typing.
- Added `overrides` to force a single React 19 across transitive deps.

### Verified
- `next build` (Turbopack) green: compiled 3.4s, TypeScript 2.6s, 8/8 static pages.
- Runtime smoke (prod server): `/` → 307, all 5 views → 200, calendar markup rendered, zero server errors.

## [1.0.0] — 2026-06-05

First SuperSynergy release, forked from [`big-calendar`](https://github.com/lramos33/big-calendar) @ `fbb8485`.

### Added
- Project rebranded to **SuperCalendar** under SuperSynergy.
- `NOTICE` file with attribution to Leonardo Ramos / big-calendar.
- `docs/ROADMAP.md` describing the modernization path (Next.js 16, React 19, Tailwind v4, tests, real data layer).
- `package.json` scripts: `typecheck`, `format`, `format:check`, `check`.
- GitHub Actions CI workflow (typecheck + lint + build on push/PR).

### Changed
- **Performance — memoized the calendar context value** (`calendar-context.tsx`). Previously the context value object was recreated on every provider render, forcing every consumer to re-render on any state change. Now wrapped in `useMemo` with a precise dependency list; `handleSelectDate` wrapped in `useCallback`.
- **Performance — single-pass, memoized event bucketing** (`client-container.tsx`). `singleDayEvents` / `multiDayEvents` were recomputed (and ISO-parsed twice per event) on every render. Now computed once in a single `useMemo` pass keyed on the filtered set.
- **Performance — `React.memo` on hot leaf cells**: `DayCell`, `EventBlock`, `MonthEventBadge`, `YearViewDayCell`. Cuts re-renders during date navigation and the per-minute live-time tick.
- README rewritten for SuperCalendar with prominent upstream credit.

### Notes
- Build verified green: `tsc --noEmit` (0 errors) + `next build` (9/9 static pages). Baseline First Load JS ≈ 258 kB per route.
- No dependency upgrades in this release — stack modernization is tracked in `docs/ROADMAP.md`.

[1.0.0]: https://github.com/Supersynergy/supercalendar/releases/tag/v1.0.0
