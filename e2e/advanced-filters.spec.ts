import { expect, test } from "./fixtures";
import { registerViaApi, seedSubscription } from "./helpers";

const ADVANCED_ROUTE = "/api/movies/discover/advanced";
const PERIOD_END = new Date("2027-11-18T12:00:00Z");
const premium = {
  plan: "premium" as const,
  interval: "month" as const,
  currentPeriodEnd: PERIOD_END,
};

test("advanced filters are locked for free users", async ({ page }) => {
  await registerViaApi(page);
  const advancedRequests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes(ADVANCED_ROUTE)) advancedRequests.push(request.url());
  });

  // A shared link with advanced filters still shows results, from the basic filters only
  await page.goto("/most-watched?sort=title.asc&runtimeMin=150");
  await expect(page.getByText("Available on the Premium plan")).toBeVisible();
  await expect(page.getByRole("link", { name: "See Premium" })).toHaveAttribute(
    "href",
    "/subscription/pricing",
  );
  await expect(page.locator("a[href^='/movie/']").first()).toBeVisible();
  expect(advancedRequests).toHaveLength(0);
});

test("the advanced discover API is private and needs premium", async ({ page }) => {
  const anonymous = await page.request.get(`${ADVANCED_ROUTE}?sortBy=title.asc`);
  expect(anonymous.status()).toBe(401);
  expect(anonymous.headers()["cache-control"]).toContain("no-store");

  const user = await registerViaApi(page);
  const free = await page.request.get(`${ADVANCED_ROUTE}?sortBy=title.asc`);
  expect(free.status()).toBe(403);
  expect(free.headers()["cache-control"]).toContain("no-store");

  await seedSubscription(user, premium);
  const allowed = await page.request.get(`${ADVANCED_ROUTE}?sortBy=title.asc&genres=18,53`);
  expect(allowed.status()).toBe(200);
  expect(allowed.headers()["cache-control"]).toContain("no-store");
  expect((await allowed.json()).results.length).toBeGreaterThan(0);

  const backwards = await page.request.get(`${ADVANCED_ROUTE}?yearFrom=2000&yearTo=1990`);
  expect(backwards.status()).toBe(400);

  // The basic route stays public and cached
  const basic = await page.request.get("/api/movies/discover?genre=18");
  expect(basic.headers()["cache-control"]).toContain("s-maxage");
});

test("a premium user filters by runtime and sort", async ({ page }) => {
  const user = await registerViaApi(page);
  await seedSubscription(user, premium);

  await page.goto("/most-watched");
  await page.getByRole("button", { name: "Advanced filters" }).click();

  await page.getByRole("combobox", { name: "Sort by" }).click();
  await page.getByRole("option", { name: "Top rated" }).click();
  await expect(page).toHaveURL(/sort=vote_average\.desc/);

  const filtered = page.waitForResponse(
    (response) =>
      response.url().includes(ADVANCED_ROUTE) &&
      response.url().includes("sortBy=vote_average.desc") &&
      response.url().includes("runtimeMin=150"),
  );
  await page.getByRole("combobox", { name: "Min runtime" }).click();
  await page.getByRole("option", { name: "At least 150 min" }).click();
  expect((await filtered).status()).toBe(200);
  await expect(page.locator("a[href^='/movie/']").first()).toBeVisible();

  // A reload keeps the filters and opens the panel to show them
  await page.reload();
  await expect(page.getByRole("combobox", { name: "Min runtime" })).toHaveValue("At least 150 min");

  await page.getByRole("button", { name: "Clear filters" }).first().click();
  await expect(page).toHaveURL("/most-watched");
});
