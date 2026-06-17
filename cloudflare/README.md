# supercalendar-cf

Event calendar for **Cloudflare Pages** — Astro shell + React island, **Turso/libSQL** store.
The CF-native sibling of [supercalendar](https://github.com/Supersynergy/supercalendar)
(the Next.js gold standard). Deploys to `*.pages.dev` with **no CLI login** (git connect).

## Why this exists
- `.pages.dev` native (Astro is Cloudflare-owned since Jan 2026).
- 0KB-JS-first: only the calendar hydrates (`client:load`) — paste the island into any
  Astro HTML starter page.
- Persistent events at the edge via Turso; same event shape as supercalendar.

## Dev
```bash
bun install
bun run dev            # http://localhost:4321  (file store, no Turso needed)
```

## Deploy to Cloudflare Pages — two ways

**A) Git connect (no CLI login)** — recommended:
1. Push this repo to GitHub.
2. Cloudflare dashboard → Pages → Connect to Git → pick the repo.
3. Framework preset **Astro**, build `bun run build`, output `dist`.
4. Settings → Environment variables: `DATABASE_URL` + `DATABASE_AUTH_TOKEN` (Turso).
5. Save & Deploy → live at `https://supercalendar-cf.pages.dev`.

**B) CLI** (needs `wrangler login`):
```bash
bun run cf:deploy      # astro build && wrangler pages deploy dist
```

## Turso
```bash
turso db create supercalendar
turso db show supercalendar --url        # -> DATABASE_URL
turso db tokens create supercalendar     # -> DATABASE_AUTH_TOKEN
```
Tables auto-create on first request (`src/lib/events.ts`).

## Endpoints
- `GET /api/events` · `POST /api/events` · `DELETE /api/events/:id`
