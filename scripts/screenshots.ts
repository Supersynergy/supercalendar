/**
 * Capture marketing/README screenshots of every calendar view in light + dark.
 *
 * One command (auto-starts a production server if one isn't already running):
 *   bun run build && bun run preview:shots
 *
 * Or point at an existing server:
 *   BASE_URL=http://127.0.0.1:3000 bun scripts/screenshots.ts
 *
 * Output: docs/preview/<view>-<theme>.png + docs/preview/social-card.png
 */
import { type ChildProcess, spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { chromium } from "@playwright/test";

const PORT = Number(process.env.PORT ?? 3210);
const BASE = process.env.BASE_URL ?? `http://127.0.0.1:${PORT}`;
const OUT = "docs/preview";
const THEME_COOKIE = "big-calendar-theme";

const views = ["month-view", "week-view", "day-view", "year-view", "agenda-view"] as const;
const themes = ["dark", "light"] as const;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function isUp(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/month-view`);
    return res.ok;
  } catch {
    return false;
  }
}

async function waitUp(timeoutMs = 60_000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await isUp()) return true;
    await sleep(500);
  }
  return false;
}

async function capture() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();

  for (const theme of themes) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
    await context.addCookies([{ name: THEME_COOKIE, value: theme, url: BASE }]);
    const page = await context.newPage();

    for (const view of views) {
      await page.goto(`${BASE}/${view}`, { waitUntil: "networkidle" });
      await page.getByText("Calendar settings").waitFor();
      await page.waitForTimeout(300);
      await page.screenshot({ path: `${OUT}/${view}-${theme}.png` });
      console.log(`✓ ${view}-${theme}.png`);
    }

    await context.close();
  }

  // Social preview card (GitHub repo "Social preview" is 1280×640).
  const card = await browser.newContext({ viewport: { width: 1280, height: 640 }, deviceScaleFactor: 2 });
  await card.addCookies([{ name: THEME_COOKIE, value: "dark", url: BASE }]);
  const cardPage = await card.newPage();
  await cardPage.goto(`${BASE}/month-view`, { waitUntil: "networkidle" });
  await cardPage.getByText("Calendar settings").waitFor();
  await cardPage.waitForTimeout(300);
  await cardPage.screenshot({ path: `${OUT}/social-card.png` });
  console.log("✓ social-card.png");
  await card.close();

  await browser.close();
  console.log(`\nPreviews written to ${OUT}/`);
}

async function main() {
  let server: ChildProcess | undefined;

  if (!(await isUp())) {
    console.log(`Starting production server on :${PORT} …`);
    server = spawn("bun", ["run", "start", "--", "-p", String(PORT), "-H", "127.0.0.1"], { stdio: "ignore" });
    if (!(await waitUp())) {
      server.kill();
      throw new Error("Server did not start in time. Run `bun run build` first.");
    }
  }

  try {
    await capture();
  } finally {
    server?.kill();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
