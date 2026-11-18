import { expect, test } from "./fixtures";
import { registerViaApi, seedFavorites, seedSubscription, seedWatchlist } from "./helpers";

const ROUTE = "/api/user/stats";
const PERIOD_END = new Date("2027-11-18T12:00:00Z");
const plan = (name: "premium" | "pro") => ({
  plan: name,
  interval: "month" as const,
  currentPeriodEnd: PERIOD_END,
});

test("a pro user sees their stats", async ({ page }) => {
  const user = await registerViaApi(page);
  await seedSubscription(user, plan("pro"));
  await seedFavorites(user, ["550"]);
  await seedWatchlist(user, ["13"]);
  await page.request.post("/api/user/watched", { data: { movieId: "680" } });

  const response = await page.request.get(ROUTE);
  expect(response.status()).toBe(200);
  expect(response.headers()["cache-control"]).toContain("no-store");
  const stats = await response.json();
  expect(stats.totals).toEqual({ watched: 1, favorites: 1, watchlist: 1, lists: 0 });
  expect(stats.activityByMonth).toHaveLength(12);
  expect(stats.activityByMonth.at(-1).watched).toBe(1);
  // Genres of the watched movie (Pulp Fiction: crime) and of the favorite (Fight Club: drama)
  const genreNames = stats.topGenres.map((genre: { name: string }) => genre.name);
  expect(genreNames).toEqual(expect.arrayContaining(["Crime", "Drama"]));

  await page.goto("/stats");
  await expect(page.getByRole("heading", { name: "Your Stats" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Favorite genres" })).toBeVisible();
  await expect(page.getByRole("rowheader", { name: "Drama" })).toBeAttached();
  await expect(page.getByRole("heading", { name: "Movies watched" })).toBeVisible();
});

test("stats are locked below pro", async ({ page }) => {
  const anonymous = await page.request.get(ROUTE);
  expect(anonymous.status()).toBe(401);
  expect(anonymous.headers()["cache-control"]).toContain("no-store");

  const user = await registerViaApi(page);
  await seedSubscription(user, plan("premium"));
  const premium = await page.request.get(ROUTE);
  expect(premium.status()).toBe(403);
  expect(premium.headers()["cache-control"]).toContain("no-store");

  await page.goto("/stats");
  await expect(page.getByText("Available on the Pro plan")).toBeVisible();
});

test("stats include daily activity, the streak and recently watched", async ({ page }) => {
  const user = await registerViaApi(page);
  await seedSubscription(user, plan("pro"));
  await page.request.post("/api/user/watched", { data: { movieId: "680" } });

  const stats = await (await page.request.get(ROUTE)).json();
  const today = new Date().toISOString().slice(0, 10);
  expect(stats.activityByDay).toEqual([{ date: today, watched: 1, views: 0 }]);
  expect(stats.streak).toEqual({ current: 1, longest: 1 });
  expect(stats.recentWatched).toEqual(["680"]);
});
