import { expect, test } from "./fixtures";
import { registerViaApi, seedFavorites, seedSubscription } from "./helpers";

const LIMIT = 20;
const ids = (count: number, from = 1) => Array.from({ length: count }, (_, i) => String(from + i));
const PERIOD_END = new Date("2027-11-18T12:00:00Z");

test("concurrent adds never exceed the free plan's limit", async ({ page }) => {
  await registerViaApi(page);

  const responses = await Promise.all(
    ids(LIMIT + 1).map((movieId) =>
      page.request.post("/api/user/favorites", { data: { movieId } }),
    ),
  );

  const statuses = responses.map((response) => response.status());
  expect(statuses.filter((status) => status === 200)).toHaveLength(LIMIT);
  expect(statuses.filter((status) => status === 403)).toHaveLength(1);
  const { user } = await (await page.request.get("/api/user/profile")).json();
  expect(user.favorites).toHaveLength(LIMIT);
});

test("a user over the limit after a downgrade keeps their favorites and can remove them", async ({
  page,
}) => {
  const user = await registerViaApi(page);
  await seedFavorites(user, ids(25));

  const removed = await page.request.delete("/api/user/favorites/5");
  expect(removed.status()).toBe(200);
  expect((await removed.json()).favorites).toHaveLength(24);

  const added = await page.request.post("/api/user/favorites", { data: { movieId: "550" } });
  expect(added.status()).toBe(403);
  expect((await added.json()).message).toContain("The free plan allows up to 20 favorites");

  await page.goto("/favorites");
  await expect(page.getByText("24 / 20 on the free plan")).toBeVisible();
  await expect(page.getByRole("link", { name: "Get unlimited" })).toHaveAttribute(
    "href",
    "/subscription/pricing",
  );
});

test("premium has no limit", async ({ page }) => {
  const user = await registerViaApi(page);
  await seedSubscription(user, {
    plan: "premium",
    interval: "month",
    currentPeriodEnd: PERIOD_END,
  });
  await seedFavorites(user, ids(LIMIT));

  const added = await page.request.post("/api/user/favorites", { data: { movieId: "550" } });

  expect(added.status()).toBe(200);
  expect((await added.json()).favorites).toHaveLength(LIMIT + 1);
  await page.goto("/favorites");
  await expect(page.getByText("on the free plan")).toHaveCount(0);
});

test("the heart explains the limit instead of failing silently", async ({ page }) => {
  const user = await registerViaApi(page);
  await seedFavorites(user, ids(LIMIT));

  await page.goto("/movie/550");
  await page.getByRole("button", { name: "Add to favorites" }).click();

  await expect(page.getByText("Favorites limit reached")).toBeVisible();
  await expect(page.getByText("Upgrade to Premium for unlimited favorites.")).toBeVisible();
  // The optimistic change is undone
  await expect(page.getByRole("button", { name: "Add to favorites" })).toBeVisible();
});
