# Deploy SuperCalendar on Coolify

Uses the repo `Dockerfile` (Next 16 standalone). More reliable than Nixpacks for Next
behind Cloudflare (avoids the known "app unreachable after idle" Nixpacks issue).

## Steps
1. Coolify → **+ New Resource** → Private/Public Repository → pick `Supersynergy/supercalendar`.
2. **Build Pack: Dockerfile** (not Nixpacks). Dockerfile path: `Dockerfile`. Port: `3000`.
3. **Domain**: `https://calendar.supersynergy.de` (wildcard DNS already points to the box).
4. **Health check path**: `/month-view` (root 307-redirects there).
5. Deploy. Every `git push` to the default branch redeploys; PRs get preview envs.

## Notes
- No env vars or DB needed — it's a self-contained UI app.
- Image builds for arm64 (Hetzner CAX) and amd64 alike.
- Local test before online: `docker build -t supercalendar . && docker run -p 3000:3000 supercalendar`
  → open http://localhost:3000
