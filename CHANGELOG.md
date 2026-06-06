# Changelog

All notable changes to SuperCalendar are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/); newest first.

## [Unreleased]

### Added
- **Cross-device persistence** — events now live in a shared **SQLite/libSQL store** (Drizzle) behind REST route handlers (`GET`/`POST /api/events`, `PATCH`/`DELETE /api/events/:id`). The server seeds demo data on first boot; every device hitting the deployment sees the same calendar. Point `DATABASE_URL` at Turso for cloud sync (see `.env.example`).
- **Delete events** — destructive action in the event details dialog (was missing; CRUD is now complete). Optimistic with rollback.
- **Event create/edit/drag are optimistic** — UI updates instantly, then persists to the store in the background (`use-add-event` / `use-update-event` / `use-delete-event`).
- **Internationalization** — display language switch in Calendar settings covering **50 languages**. Dates, month/weekday names, week-start and ordinals localize via date-fns `setDefaultOptions`; **RTL** languages (Arabic, Hebrew, Persian) flip `document.dir` automatically. UI strings translated for **English + German** (others fall back to English; structure in `src/calendar/i18n/`).
- **12h/24h time-format toggle** in Calendar settings — persisted to `localStorage`, applied across every view, the now-line, hour axis, badges and all time inputs (`hourCycle` follows the setting).
- **Keyboard shortcuts in the event details dialog** — `↑`/`↓` navigate prev/next event in place, `E` opens Edit. On-screen hint in the footer.

### Changed
- **Instant view switching** — day/week/month/year/agenda now swap from client state with no route round-trip, no loading skeleton, no animation. The URL stays in sync (shallow `replaceState`) and back/forward still work.
- **Event details dialog** — fast centered fade-in (150ms) instead of the slide-from-top-left entrance.
- Header subtitle → **"by SuperSynergy"**; removed the upstream author's X link (attribution remains in `LICENSE`/`NOTICE`).

### Fixed
- **Dialog text is selectable again** — pointer-down inside `DialogContent` no longer bubbles through the React portal to the dnd-kit drag listeners, so selecting text never arms a drag.

## [2.0.1] — 2026-06-05

### Fixed
- **Biome now lints + formats CSS** via `css.parser.tailwindDirectives` (Biome 2.4's native Tailwind v4 support), instead of excluding `globals.css`.
- **avatar-group** — replaced an unchecked `as ReactElement[]` cast with an `isValidElement` type guard (drops text nodes; safe `child.props` access under React 19).

### Added
- `scripts/screenshots.ts` + `preview:shots` script — reproducible Playwright capture of every view (light + dark) plus a 1280×640 GitHub social card.

### Changed
- README preview replaced with fresh SuperCalendar screenshots; removed the stale upstream images.

[2.0.1]: https://github.com/Supersynergy/supercalendar/releases/tag/v2.0.1

## [2.0.0] — 2026-06-05

Full end-to-end modernization. Latest framework stack, modern DnD, Tailwind v4, Biome, and an automated test suite. All gates green.

### Framework & language
- **Next.js 14 → 16.2.7** — Turbopack is the default build engine (production build ~3s).
- **React 18 → 19.2** (+ `@types/react`/`@types/react-dom` 19).
- **Async `cookies()`** — `getTheme()` is now `async`; `app/layout.tsx` is an async Server Component (required by Next 15+).
- `tsconfig` `target` es5 → **es2022**; `jsx: react-jsx` (automatic runtime).
- `next.config.mjs` — pinned `turbopack.root`.
- `overrides` to force a single React 19 across transitive deps.

### Drag & drop
- **react-dnd → @dnd-kit/core** (react-dnd is unmaintained on React 19). `DndContext` + `DragOverlay` + a single centralized `onDragEnd`; `useDraggable`/`useDroppable` with typed drop data. `PointerSensor` (5px activation so clicks still open the dialog) + `KeyboardSensor` for accessibility. Removed the custom drag layer.

### Styling
- **Tailwind v3 → v4** via the official codemod — CSS-first `@theme` in `globals.css`, `@tailwindcss/postcss`, `tailwind.config.ts` removed. Custom breakpoints (xs/sm 576, 2xl 1440), `text-xxs`, `container-8xl`, and accordion keyframes preserved; `tailwindcss-animate` wired via `@plugin`.
- **react-day-picker 8 → 9.14** — `single-calendar.tsx` rewritten for the v9 API.

### Tooling & tests
- **ESLint + Prettier → Biome 2.4** (single fast linter/formatter). Fixed real findings surfaced by Biome, incl. a latent missing-return in `ClientContainer`'s `filter()` callback.
- **Vitest** unit tests for calendar helpers + **Playwright** e2e (view rendering, navigation, @dnd-kit drag).

### UX
- App header rebranded to **SuperCalendar** (credit to lramos33 retained); GitHub link → fork.
- `loading.tsx` (streaming skeleton) and `error.tsx` (retry boundary) for the calendar route group.

### Verified
- `tsc --noEmit` 0 errors · `biome check` 0 errors · `vitest` 7/7 · `next build` 8/8 pages · Playwright **4/4** (incl. drag, no page errors).
- Visual check: all 5 views render correctly in dark mode after the Tailwind v4 migration.

[2.0.0]: https://github.com/Supersynergy/supercalendar/releases/tag/v2.0.0

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
