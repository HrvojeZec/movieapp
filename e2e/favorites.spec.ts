import { expect, test } from "./fixtures";
import { registerViaApi } from "./helpers";

test("a logged-in user can add and remove a favorite", async ({ page }) => {
  await registerViaApi(page);

  await page.goto("/movie/550");
  await expect(page.getByRole("heading", { name: "Fight Club" })).toBeVisible();

  await page.getByRole("button", { name: "Add to favorites" }).click();
  await expect(page.getByRole("button", { name: "Remove from favorites" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );

  // Persisted on the server, not just in client state
  await page.reload();
  await expect(page.getByRole("button", { name: "Remove from favorites" })).toBeVisible();

  await page.goto("/favorites");
  await expect(page.getByText("Fight Club").first()).toBeVisible();

  await page.goto("/movie/550");
  await page.getByRole("button", { name: "Remove from favorites" }).click();
  await expect(page.getByRole("button", { name: "Add to favorites" })).toBeVisible();

  await page.goto("/favorites");
  await expect(page.getByText("You haven't added any movies to your favorites yet.")).toBeVisible();
});

test("anonymous users are sent to login when they try to favorite", async ({ page }) => {
  await page.goto("/search?q=fight club");
  const poster = page.getByRole("img", { name: "Fight Club", exact: true }).first();
  await expect(poster).toBeVisible();

  // The heart fades in on hover, like for a real user
  await poster.hover();
  await page.getByRole("button", { name: "Add to favorites" }).first().click();

  await expect(page).toHaveURL("/auth/login");
});
