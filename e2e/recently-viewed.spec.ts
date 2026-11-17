import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";

const FIGHT_CLUB_ID = 550;

const visitFightClub = async (page: Page) => {
  await page.goto(`/movie/${FIGHT_CLUB_ID}`);
  await expect(page.getByRole("heading", { name: "Fight Club" })).toBeVisible();
};

// Keyboard shortcuts only work once React has hydrated the page
const gotoInteractive = async (page: Page, path: string) => {
  await page.goto(path);
  await page.waitForLoadState("networkidle");
};

test("a viewed movie appears under Recently viewed and stays after a reload", async ({ page }) => {
  await gotoInteractive(page, "/");
  // A new browser has no history
  await expect(page.getByRole("heading", { name: "Recently viewed" })).toHaveCount(0);

  await visitFightClub(page);
  await gotoInteractive(page, "/");
  const row = page.getByRole("heading", { name: "Recently viewed" });
  await expect(row).toBeVisible();
  await expect(page.locator(`a[href="/movie/${FIGHT_CLUB_ID}"]`).first()).toBeVisible();

  await page.reload();
  await expect(row).toBeVisible();
});

test("Ctrl+K opens a search palette that works with the keyboard", async ({ page }) => {
  await gotoInteractive(page, "/most-watched");

  await page.keyboard.press("Control+K");
  const palette = page.getByRole("dialog", { name: "Search movies" });
  await expect(palette).toBeVisible();

  const input = palette.getByRole("combobox", { name: "Search movies" });
  await expect(input).toBeFocused();
  await input.fill("fight club");
  await expect(palette.getByRole("option").first()).toBeVisible();

  await input.press("ArrowDown");
  await input.press("Enter");
  await expect(page).toHaveURL(/\/movie\/\d+$/);
  await expect(palette).toBeHidden();
});

test("the palette lists recently viewed movies before anything is typed", async ({ page }) => {
  await visitFightClub(page);
  await page.waitForLoadState("networkidle");

  await page.keyboard.press("Control+K");
  const recent = page.getByRole("listbox", { name: "Recently viewed" });
  await expect(recent.getByRole("option", { name: /Fight Club/ })).toBeVisible();
});

test.describe("on a phone", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test("the search icon opens the palette", async ({ page }) => {
    await gotoInteractive(page, "/");
    await page.getByRole("button", { name: "Search", exact: true }).click();
    await expect(page.getByRole("dialog", { name: "Search movies" })).toBeVisible();
  });
});
