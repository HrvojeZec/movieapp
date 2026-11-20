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

test("the header keeps the toggle and the logo in place, above the sidebar", async ({ page }) => {
  await page.setViewportSize(WIDE_SCREEN);
  await page.goto("/");
  const header = page.getByRole("banner");
  const logo = header.getByRole("link", { name: "MovieHub" });
  const toggle = header.getByRole("button", { name: "Collapse sidebar" });
  const wide = { logo: (await logo.boundingBox())!, toggle: (await toggle.boundingBox())! };

  expect(
    Math.abs(wide.logo.y + wide.logo.height / 2 - (wide.toggle.y + wide.toggle.height / 2)),
  ).toBeLessThan(8);
  expect(wide.toggle.x + wide.toggle.width).toBeLessThanOrEqual(wide.logo.x);
  // The sidebar starts under the header instead of running past it
  const headerBox = (await header.boundingBox())!;
  expect((await sidebar(page).boundingBox())!.y).toBeGreaterThanOrEqual(
    headerBox.y + headerBox.height - 1,
  );

  await toggle.click();
  await expect.poll(() => sidebarWidth(page)).toBe(RAIL);
  // Collapsed, nothing moves and nothing hides: the logo keeps its name next to the toggle
  const expand = header.getByRole("button", { name: "Expand sidebar" });
  await expect(header.getByText("MovieHub")).toBeVisible();
  expect(await logo.boundingBox()).toEqual(wide.logo);
  expect(await expand.boundingBox()).toEqual(wide.toggle);

  await expand.click();
  await expect.poll(() => sidebarMode(page)).toBe("expanded");
});

test("clicking outside closes the tablet sidebar, the toggle closes it too", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 900 });
  await page.goto("/");
  await page.getByRole("button", { name: "Expand sidebar" }).click();
  await page.getByRole("button", { name: "Collapse sidebar" }).click();
  await expect(page.getByRole("button", { name: "Expand sidebar" })).toHaveAttribute(
    "aria-expanded",
    "false",
  );

  await page.getByRole("button", { name: "Expand sidebar" }).click();
  await page.mouse.click(700, 500);
  await expect(page.getByRole("button", { name: "Expand sidebar" })).toHaveAttribute(
    "aria-expanded",
    "false",
  );
});
