import { expect, test } from "./fixtures";
import { registerViaApi, seedSubscription, seedWatchlist } from "./helpers";

const PERIOD_END = new Date("2027-11-18T12:00:00Z");

test("a premium user saves a movie and finds it on the watchlist", async ({ page }) => {
  const user = await registerViaApi(page);
  await seedSubscription(user, {
    plan: "premium",
    interval: "month",
    currentPeriodEnd: PERIOD_END,
  });

  await page.goto("/movie/550");
  await page.getByRole("button", { name: "Add to watchlist" }).click();
  await expect(page.getByRole("button", { name: "On your watchlist" })).toBeVisible();

  await page.goto("/watchlist");
  await expect(page.getByRole("heading", { name: "My Watchlist (1)" })).toBeVisible();
  await expect(page.getByText("Fight Club").first()).toBeVisible();

  // Removing from the card's bookmark empties the list
  await page.getByRole("button", { name: "Remove from watchlist" }).click();
  await expect(page.getByText("Nothing on your watchlist yet")).toBeVisible();
});

test("a free user sees the watchlist locked", async ({ page }) => {
  await registerViaApi(page);

  await page.goto("/watchlist");
  await expect(page.getByText("Available on the Premium plan")).toBeVisible();
  await expect(page.getByRole("link", { name: "See Premium" })).toHaveAttribute(
    "href",
    "/subscription/pricing",
  );

  // The movie page shows the button locked, and cards don't offer it at all
  await page.goto("/movie/550");
  await expect(page.getByRole("button", { name: "Watchlist", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Add to watchlist" })).toHaveCount(0);
});

test("the server refuses free users but lets a downgraded user trim the list", async ({ page }) => {
  const user = await registerViaApi(page);
  await seedWatchlist(user, ["550", "551"]);

  const added = await page.request.post("/api/user/watchlist", { data: { movieId: "552" } });
  expect(added.status()).toBe(403);

  const removed = await page.request.delete("/api/user/watchlist/550");
  expect(removed.status()).toBe(200);
  expect((await removed.json()).watchlist).toEqual(["551"]);
});

test("logged out visitors are sent to log in", async ({ page }) => {
  const response = await page.request.post("/api/user/watchlist", { data: { movieId: "550" } });
  expect(response.status()).toBe(401);

  await page.goto("/watchlist");
  await expect(page).toHaveURL(/\/auth\/login/);
});
