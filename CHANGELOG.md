# Changelog

All notable changes to SuperCalendar are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/); newest first.

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
