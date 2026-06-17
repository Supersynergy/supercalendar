# Deploy SuperCalendar on Cloudflare (Workers, via OpenNext)

Runs the Next 16 app on Cloudflare's edge with `@opennextjs/cloudflare`. The build
is reproducible offline (self-hosted Inter font, no Google Fonts fetch) and the
calendar's source of truth is a **Turso/libSQL** database (see below).

## One-time: auth + database

1. **Log in to Cloudflare** (interactive OAuth — run it yourself):
   ```bash
   wrangler login
   ```
   (or set a scoped token: `export CLOUDFLARE_API_TOKEN=...` with Workers Scripts:Edit)

2. **Create a Turso database** (persistent edge SQLite):
   ```bash
   turso db create supercalendar
   turso db show supercalendar --url          # -> libsql://supercalendar-<org>.turso.io
   turso db tokens create supercalendar       # -> the auth token
   ```

3. **Wire the connection** — URL in `wrangler.jsonc` `vars`, token as a secret:
   ```bash
   # in wrangler.jsonc: "vars": { "DATABASE_URL": "libsql://supercalendar-<org>.turso.io" }
   wrangler secret put DATABASE_AUTH_TOKEN    # paste the token from step 2
   ```
   The app creates its tables + seeds demo data on first boot (`ensureDb()`).

## Deploy

```bash
bun run cf:deploy        # = opennextjs-cloudflare build && wrangler deploy
```

First deploy prints the URL: `https://supercalendar.<your-subdomain>.workers.dev`.
For a custom domain (`calendar.supersynergy.de`) add a route in the CF dashboard or
`wrangler.jsonc` `routes`.

## Local edge preview (no deploy)

```bash
bun run cf:preview       # build + wrangler dev on the workerd runtime
```

## Notes / edge caveats

- **URL is `*.workers.dev`, not `*.pages.dev`.** Modern CF deploys Next via OpenNext
  to **Workers** (Workers now serves static assets too). A `*.pages.dev` host is
  Cloudflare Pages — native only for a static export (e.g. an Astro shell), not for
  a server-rendered Next app. Map a custom domain for a clean URL.
- **Realtime sync on Workers**: the in-process SSE bus (`events-bus.ts`) cannot fire
  across isolated Worker invocations, so cross-device updates ride the **8s polling
  backstop** in `calendar-context.tsx`, not instant SSE. For instant push at the
  edge, move the events API to a **Durable Object** (SQLite storage + WebSocket
  hibernation — the merged PartyKit pattern).
- **Persistence**: without `DATABASE_URL` the app falls back to a bundled SQLite file
  that is **NOT durable on Workers** (ephemeral per-isolate). Always set Turso.
