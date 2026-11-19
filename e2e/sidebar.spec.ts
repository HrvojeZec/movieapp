import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";
import { registerViaApi } from "./helpers";

const WIDE_SCREEN = { width: 1600, height: 900 };
const RAIL = 72;
const WIDE = 260;

const sidebar = (page: Page) => page.getByRole("navigation", { name: "Main" });
const sidebarMode = (page: Page) => page.evaluate(() => document.documentElement.dataset.sidebar);
const sidebarWidth = async (page: Page) => Math.round((await sidebar(page).boundingBox())!.width);

test("the sidebar shows the library and marks locked features", async ({ page }) => {
  await registerViaApi(page);
  await page.goto("/");

  const nav = sidebar(page);
  for (const name of ["Favorites", "Watchlist", "Watched", "Lists", "Recommendations", "Stats"]) {
    await expect(nav.getByRole("link", { name, exact: true })).toBeVisible();
  }
  await expect(nav.getByRole("link", { name: "Watchlist" })).toHaveAccessibleDescription(
    "Needs the Premium plan",
  );
  await expect(nav.getByRole("link", { name: "Stats" })).toHaveAccessibleDescription(
    "Needs the Pro plan",
  );
  await expect(nav.getByRole("link", { name: "Watched", exact: true })).toHaveAccessibleDescription(
    "",
  );
});

test("collapsing is remembered without a flash", async ({ page }) => {
  await page.setViewportSize(WIDE_SCREEN);
  await page.goto("/");
  expect(await sidebarMode(page)).toBe("expanded");
  await expect.poll(() => sidebarWidth(page)).toBe(WIDE);

  await page.getByRole("button", { name: "Collapse sidebar" }).click();
  expect(await sidebarMode(page)).toBe("collapsed");
  await expect.poll(() => sidebarWidth(page)).toBe(RAIL);

  // The inline script applies the choice while the page is still being parsed
  await page.reload({ waitUntil: "commit" });
  await sidebar(page).waitFor({ state: "attached" });
  expect(await sidebarMode(page)).toBe("collapsed");
  expect(await sidebarWidth(page)).toBe(RAIL);
});

test("the active page is marked", async ({ page }) => {
  await page.goto("/most-watched");
  const nav = sidebar(page);
  await expect(nav.getByRole("link", { name: "Most Watched" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(nav.getByRole("link", { name: "Home" })).not.toHaveAttribute("aria-current");
});

test("logged-out visitors get a sign-in card", async ({ page }) => {
  await page.setViewportSize(WIDE_SCREEN);
  await page.goto("/");

  const nav = sidebar(page);
  await expect(nav.getByText("Sign in to save movies")).toBeVisible();
  await expect(nav.getByRole("button", { name: "Sign Up" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Favorites" })).toHaveCount(0);

  await nav.getByRole("button", { name: "Login" }).click();
  await expect(page).toHaveURL("/auth/login");
});

test("Ctrl+B toggles the sidebar", async ({ page }) => {
  await page.setViewportSize(WIDE_SCREEN);
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Collapse sidebar" })).toBeVisible();

  await page.keyboard.press("Control+B");
  await expect.poll(() => sidebarMode(page)).toBe("collapsed");
  await page.keyboard.press("Control+B");
  await expect.poll(() => sidebarMode(page)).toBe("expanded");
});

test("on a tablet the sidebar expands over the content", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 900 });
  await page.goto("/");
  const main = page.locator("main");
  const before = await main.boundingBox();

  await page.getByRole("button", { name: "Expand sidebar" }).click();
  const collapse = page.getByRole("button", { name: "Collapse sidebar" });
  await expect(collapse).toHaveAttribute("aria-expanded", "true");
  // The page doesn't move: the panel lies on top of it
  expect(await main.boundingBox()).toEqual(before);

  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Expand sidebar" })).toHaveAttribute(
    "aria-expanded",
    "false",
  );
});

test("the skip link jumps to the content", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await expect(skip).toBeFocused();

  await page.keyboard.press("Enter");
  await expect(page.locator("main#main")).toBeFocused();
});

test("the collapse button sits next to the logo", async ({ page }) => {
  await page.setViewportSize(WIDE_SCREEN);
  await page.goto("/");
  const nav = sidebar(page);
  const logo = (await nav.getByRole("link", { name: "MovieHub" }).boundingBox())!;
  const toggle = (await nav.getByRole("button", { name: "Collapse sidebar" }).boundingBox())!;

  expect(Math.abs(logo.y + logo.height / 2 - (toggle.y + toggle.height / 2))).toBeLessThan(8);
  expect(toggle.x).toBeGreaterThan(logo.x);
  // An icon is enough; the old labelled button at the bottom is gone
  await expect(nav.getByText("Collapse", { exact: true })).toHaveCount(0);
});

test("a collapsed sidebar expands from the logo", async ({ page }) => {
  await page.setViewportSize(WIDE_SCREEN);
  await page.goto("/");
  await page.getByRole("button", { name: "Collapse sidebar" }).click();
  await expect.poll(() => sidebarMode(page)).toBe("collapsed");

  const expand = page.getByRole("button", { name: "Expand sidebar" });
  const opacity = () => expand.evaluate((element) => getComputedStyle(element).opacity);
  await page.mouse.move(800, 400);
  await expect.poll(opacity).toBe("0");
  // Hovering the logo turns it into the expand button (which lies over it, so move the mouse)
  const logo = (await sidebar(page).getByRole("link", { name: "MovieHub" }).boundingBox())!;
  await page.mouse.move(logo.x + 20, logo.y + logo.height / 2);
  await expect.poll(opacity).toBe("1");

  await expand.click();
  await expect.poll(() => sidebarMode(page)).toBe("expanded");
});
