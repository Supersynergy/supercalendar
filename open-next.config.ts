import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Minimal OpenNext config: run the Next 16 app on Cloudflare Workers.
// Incremental cache / tag cache can be wired to R2 + Durable Objects later;
// the calendar's source of truth is the libSQL/Turso store, not Next's cache.
export default defineCloudflareConfig({});
