import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";

// These tests need the animations the rest of the suite turns off
test.use({ reducedMotion: "no-preference" });

/** Records the shared-element names present each time the browser starts a view transition. */
async function recordViewTransitions(page: Page) {
  await page.addInitScript(() => {
    const log: string[][] = [];
    (window as unknown as { __viewTransitions: string[][] }).__viewTransitions = log;
    const start = document.startViewTransition?.bind(document);
    if (!start) return;
    document.startViewTransition = ((update: never) => {
      log.push(
        [...document.querySelectorAll("*")]
          .map((element) => getComputedStyle(element).viewTransitionName)
          .filter((name) => name && name !== "none" && name !== "root"),
      );
      return start(update);
    }) as typeof document.startViewTransition;
  });
}

const transitions = (page: Page) =>
  page.evaluate(() => (window as unknown as { __viewTransitions: string[][] }).__viewTransitions);

test("opening a movie from a row works with transitions on", async ({ page }) => {
  await recordViewTransitions(page);
  await page.goto("/most-watched");
  const card = page.locator('main a[href^="/movie/"]').first();
  await expect(card).toBeVisible();
  const movieId = (await card.getAttribute("href"))!.split("/").pop();

  await card.click();

  await expect(page).toHaveURL(`/movie/${movieId}`);
  await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
  // The clicked card's poster is the one that flies to the movie page
  await expect.poll(() => transitions(page)).toContainEqual([`movie-poster-${movieId}`]);
});

test("navigating from a row logs no view transition errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" && /transition/i.test(message.text())) {
      errors.push(message.text());
    }
  });

  // Opening a movie puts it in "Recently viewed", so the home page then shows it in two rows
  await page.goto("/");
  const first = page.locator('main a[href^="/movie/"]').first();
  await expect(first).toBeVisible();
  const href = (await first.getAttribute("href"))!;
  await page.goto(href);
  await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
  await page.goto("/");
  const copies = page.locator(`main a[href="${href}"]`);
  await expect.poll(() => copies.count()).toBeGreaterThan(1);

  await copies.last().click();

  await expect(page).toHaveURL(href);
  await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
  expect(errors).toEqual([]);
});
