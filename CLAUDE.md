# SuperCalendar — project CLAUDE.md

Feature-rich Next.js calendar component. SuperSynergy fork of [`lramos33/big-calendar`](https://github.com/lramos33/big-calendar), tuned for performance. Canonical calendar/event-UI gold standard — reference for any calendar/scheduling work; don't re-research from scratch.

- Repo: https://github.com/Supersynergy/supercalendar · current: **v2.0.1** (released 2026-06-05)
- Local: `~/BASE/projects/supercalendar` (mirror in `~/.claude/skills/universalui/ui-library/calendars/supercalendar`)

## Stack
Next.js 16 · React 19 · Radix UI · date-fns · react-hook-form + zod · @dnd-kit (drag&drop) · Tailwind v4 · Biome · Vitest · Playwright. Package manager: **bun** (`bun.lock`).

## Layout
- `src/` — calendar component, 5 views (month/week/day/year/agenda), DnD.
- `tests/` — Vitest unit + Playwright e2e (`test-results/`).
- `docs/` — ROADMAP + notes · `scripts/` — screenshot/preview helpers.

## Commands (bun)
```bash
bun run dev          # next dev
bun run check        # tsc --noEmit && biome check .   ← gate
bun run test         # vitest run
bun run test:e2e     # playwright
bun run build        # next build
```

## Conventions
- Biome only (no ESLint/Prettier). `bun run check` is the pre-commit gate.
- Keep it a clean fork: preserve `NOTICE` + credit to lramos33. Upstream-trackable.
- `CHANGELOG.md` newest-first; cut a tag per release.

## Lean-code notes (apply `/leancode` before adding deps)
Code = liability. Audited 2026-06-05 — 0-import deps are KILL candidates (verify with `bun run build && bun run test`). Tailwind/PostCSS deps are config-based: never trust depcheck blindly, apply the usage/ownership/correctness raster.

Inherits global rules `~/.claude/CLAUDE.md` + workspace `~/BASE/projects/CLAUDE.md`.
