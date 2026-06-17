# Changelog

Format follows [Keep a Changelog](https://keepachangelog.com/); newest first.

## [Unreleased]

### Added
- Initial Astro + Cloudflare Pages event calendar. Astro shell (prerendered) + React
  month-view island (`client:load`), Turso/libSQL store via raw `@libsql/client`.
- API routes: `GET`/`POST /api/events`, `DELETE /api/events/:id` (CF Pages Functions).
- Edge-safe sync: 8s polling backstop (pauses while tab hidden) — works on Workers.
- Optimistic add/delete with rollback. Tailwind v4 styling, dark mode, 7 event colors,
  German month labels, today highlight, Monday week-start.
- Deploy guide for git-connect (no CLI login) and CLI paths; `.env.example` for Turso.
