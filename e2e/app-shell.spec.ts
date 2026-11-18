import { expect, test } from "./fixtures";
import { registerViaApi } from "./helpers";

test.describe("on a phone", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("navigation and login live in a drawer", async ({ page }) => {
    await page.goto("/");

    // The header keeps to one line: no login buttons next to the logo
    await expect(page.getByRole("button", { name: "Login" })).toBeHidden();

    await page.getByRole("button", { name: "Open navigation" }).click();
    const drawer = page.getByRole("dialog");
    await expect(drawer.getByRole("button", { name: "Login" })).toBeVisible();

    await drawer.getByRole("link", { name: "Most Watched" }).click();
    await expect(page).toHaveURL("/most-watched");
    await expect(drawer).toBeHidden();
  });
});

test("the footer credits TMDB as its terms require", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByText("This product uses the TMDB API but is not endorsed or certified by TMDB."),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "TMDB", exact: true })).toHaveAttribute(
    "href",
    "https://www.themoviedb.org",
  );
});

test("an unknown page shows a 404 page with a way back", async ({ page }) => {
  const response = await page.goto("/this-page-does-not-exist");

  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
  await page.getByRole("link", { name: "Go home" }).click();
  await expect(page).toHaveURL("/");
});

test("an unknown movie shows a movie-specific 404 page", async ({ page }) => {
  await page.goto("/movie/999999999");
  await expect(page.getByRole("heading", { name: "Movie not found" })).toBeVisible();
});

test("a slow navigation shows a progress bar until the page arrives", async ({ page }) => {
  await page.goto("/");
  const card = page.locator('main a[href^="/movie/"]').first();
  await expect(card).toBeVisible();

  // Hold back the movie page's server render, as a cold serverless function would
  let release = () => {};
  const held = new Promise<void>((resolve) => (release = resolve));
  await page.route(/\/movie\/\d+/, async (route) => {
    if (route.request().resourceType() === "fetch") await held;
    await route.continue();
  });

  const progress = page.getByRole("progressbar", { name: "Loading page" });
  await card.click();
  await expect(progress).toBeVisible();

  release();
  await expect(page).toHaveURL(/\/movie\/\d+$/);
  await expect(progress).toBeHidden();
});

test("the logged-in header fits on a phone", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await registerViaApi(page);

  await page.goto("/");

  // The account lives in the navigation menu on phones; the header keeps the menu and the bell
  const menu = page.getByRole("button", { name: "Open navigation" });
  const bell = page.getByRole("button", { name: /Notifications/ });
  await expect(menu).toBeInViewport({ ratio: 1 });
  await expect(bell).toBeInViewport({ ratio: 1 });
  const [menuBox, bellBox] = [await menu.boundingBox(), await bell.boundingBox()];
  expect(
    Math.abs(menuBox!.y + menuBox!.height / 2 - (bellBox!.y + bellBox!.height / 2)),
  ).toBeLessThan(2);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBe(0);
});

test("on a phone the menu has the account and logs out", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await registerViaApi(page);
  await page.goto("/");

  await page.getByRole("button", { name: "Open navigation" }).click();
  const drawer = page.getByRole("dialog");
  await expect(drawer.getByRole("link", { name: "Watchlist" })).toBeVisible();
  await drawer.getByRole("button", { name: "Logout" }).click();
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(page.getByRole("dialog").getByRole("button", { name: "Login" })).toBeVisible();
});
