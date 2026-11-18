import { expect, test } from "./fixtures";
import { registerViaApi, seedSubscription } from "./helpers";

const ROUTE = "/api/user/dashboard";
const PERIOD_END = new Date("2027-11-18T12:00:00Z");
const plan = (name: "premium" | "pro") => ({
  plan: name,
  interval: "month" as const,
  currentPeriodEnd: PERIOD_END,
});

test("a pro user gets the default dashboard and can save their own", async ({ page }) => {
  const user = await registerViaApi(page);
  await seedSubscription(user, plan("pro"));

  const initial = await page.request.get(ROUTE);
  expect(initial.status()).toBe(200);
  expect(initial.headers()["cache-control"]).toContain("no-store");
  expect((await initial.json()).layout).toHaveLength(11);

  const layout = [
    { type: "genreBars", x: 0, y: 0, w: 12, h: 6 },
    { type: "tileWatched", x: 0, y: 6, w: 4, h: 3 },
  ];
  const saved = await page.request.put(ROUTE, { data: { layout } });
  expect(saved.status()).toBe(200);
  expect(saved.headers()["cache-control"]).toContain("no-store");
  expect((await saved.json()).layout).toEqual(layout);

  const reloaded = await page.request.get(ROUTE);
  expect((await reloaded.json()).layout).toEqual(layout);
});

test("the server packs a saved dashboard", async ({ page }) => {
  const user = await registerViaApi(page);
  await seedSubscription(user, plan("pro"));

  const saved = await page.request.put(ROUTE, {
    data: { layout: [{ type: "tileLists", x: 11, y: 40, w: 3, h: 2 }] },
  });
  expect((await saved.json()).layout).toEqual([{ type: "tileLists", x: 9, y: 0, w: 3, h: 2 }]);
});

test("a malformed dashboard is rejected", async ({ page }) => {
  const user = await registerViaApi(page);
  await seedSubscription(user, plan("pro"));

  const unknown = await page.request.put(ROUTE, {
    data: { layout: [{ type: "nope", x: 0, y: 0, w: 3, h: 2 }] },
  });
  expect(unknown.status()).toBe(400);
  expect(unknown.headers()["cache-control"]).toContain("no-store");

  const negative = await page.request.put(ROUTE, {
    data: { layout: [{ type: "tileWatched", x: -1, y: 0, w: 3, h: 2 }] },
  });
  expect(negative.status()).toBe(400);
});

test("the dashboard is only for pro", async ({ page }) => {
  const anonymous = await page.request.get(ROUTE);
  expect(anonymous.status()).toBe(401);
  expect(anonymous.headers()["cache-control"]).toContain("no-store");

  const user = await registerViaApi(page);
  await seedSubscription(user, plan("premium"));
  const premium = await page.request.get(ROUTE);
  expect(premium.status()).toBe(403);
  expect(premium.headers()["cache-control"]).toContain("no-store");
  const premiumSave = await page.request.put(ROUTE, { data: { layout: [] } });
  expect(premiumSave.status()).toBe(403);
});
