import { expect, test } from "@playwright/test";

const VIEWS = [
  { path: "/day-view", nav: "View by day" },
  { path: "/week-view", nav: "View by week" },
  { path: "/month-view", nav: "View by month" },
  { path: "/year-view", nav: "View by year" },
  { path: "/agenda-view", nav: "View by agenda" },
] as const;

test("redirects root to the month view", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/month-view/);
});

test("renders every calendar view", async ({ page }) => {
  for (const view of VIEWS) {
    await page.goto(view.path);
    await expect(page).toHaveURL(new RegExp(view.path));
    await expect(page.getByText("Calendar settings")).toBeVisible();
    await page.screenshot({ path: `test-results/screenshots${view.path}.png`, fullPage: true });
  }
});

test("navigates between views via the header buttons", async ({ page }) => {
  await page.goto("/month-view");

  await page.getByRole("link", { name: "View by week" }).click();
  await expect(page).toHaveURL(/week-view/);

  await page.getByRole("link", { name: "View by year" }).click();
  await expect(page).toHaveURL(/year-view/);
});

test("dragging an event keeps the calendar functional (@dnd-kit)", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", err => pageErrors.push(String(err)));

  await page.goto("/week-view");

  // Event blocks in week/day view render their time as "h:mm a".
  const event = page
    .getByRole("button")
    .filter({ hasText: /\d{1,2}:\d{2}\s*[AP]M/ })
    .first();
  await expect(event).toBeVisible();

  const box = await event.boundingBox();
  if (!box) throw new Error("Could not measure an event block to drag.");

  // dnd-kit's PointerSensor needs movement past the activation distance.
  await page.mouse.move(box.x + box.width / 2, box.y + 6);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2, box.y + 130, { steps: 12 });
  await page.mouse.up();

  await page.waitForTimeout(400);

  // The calendar still renders events and no runtime error was thrown.
  await expect(
    page
      .getByRole("button")
      .filter({ hasText: /\d{1,2}:\d{2}\s*[AP]M/ })
      .first()
  ).toBeVisible();
  expect(pageErrors).toEqual([]);
});
