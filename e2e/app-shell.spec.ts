import { expect, test } from "./fixtures";

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
  await expect(page.getByRole("link", { name: "TMDB" })).toHaveAttribute(
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
