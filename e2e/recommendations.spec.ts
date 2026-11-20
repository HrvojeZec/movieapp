import { expect, test } from "./fixtures";
import { registerViaApi, seedFavorites, seedSubscription } from "./helpers";

const ROUTE = "/api/recommendations";
const PERIOD_END = new Date("2027-11-18T12:00:00Z");
const plan = (name: "premium" | "pro") => ({
  plan: name,
  interval: "month" as const,
  currentPeriodEnd: PERIOD_END,
});

test("a pro user gets recommendations from their favorites", async ({ page }) => {
  const user = await registerViaApi(page);
  await seedSubscription(user, plan("pro"));
  await seedFavorites(user, ["550"]);

  const response = await page.request.get(ROUTE);
  expect(response.status()).toBe(200);
  expect(response.headers()["cache-control"]).toContain("no-store");
  const { coldStart, results } = await response.json();
  expect(coldStart).toBe(false);
  expect(results.length).toBeGreaterThan(0);
  expect(results.map((movie: { id: number }) => movie.id)).not.toContain(550);
  for (const movie of results) expect(movie.reason).toMatch(/^(Because you|Highly rated)/);

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Recommended for you" })).toBeVisible();
  await page.getByRole("link", { name: "See all" }).click();
  await expect(page).toHaveURL("/recommendations");
  await expect(page.getByText("Because you liked Fight Club").first()).toBeVisible();
});

test("no signals means cold start", async ({ page }) => {
  const user = await registerViaApi(page);
  await seedSubscription(user, plan("pro"));

  const { coldStart, results } = await (await page.request.get(ROUTE)).json();
  expect(coldStart).toBe(true);
  expect(results[0].reason).toBe("Popular right now");

  await page.goto("/recommendations");
  await expect(
    page.getByText("Add favorites or mark movies as watched to get recommendations"),
  ).toBeVisible();
});

test("recommendations are locked below Pro", async ({ page }) => {
  const anonymous = await page.request.get(ROUTE);
  expect(anonymous.status()).toBe(401);
  expect(anonymous.headers()["cache-control"]).toContain("no-store");

  const user = await registerViaApi(page);
  await seedSubscription(user, plan("premium"));
  const premium = await page.request.get(ROUTE);
  expect(premium.status()).toBe(403);
  expect(premium.headers()["cache-control"]).toContain("no-store");

  await page.goto("/");
  await expect(page.getByText("Pro picks movies for you")).toBeVisible();
  await page.goto("/recommendations");
  await expect(page.getByText("Available on the Pro plan")).toBeVisible();
});
