import type { Locator, Page } from "@playwright/test";
import { expect, test } from "./fixtures";
import { clickAndSave, registerViaApi, seedSubscription, seedWatchlist } from "./helpers";

const PERIOD_END = new Date("2027-11-18T12:00:00Z");

test("a premium user saves a movie and finds it on the watchlist", async ({ page }) => {
  const user = await registerViaApi(page);
  await seedSubscription(user, {
    plan: "premium",
    interval: "month",
    currentPeriodEnd: PERIOD_END,
  });

  await page.goto("/movie/550");
  await clickAndSave(
    page,
    page.getByRole("button", { name: "Add to watchlist" }),
    "/api/user/watchlist",
  );
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

/** A real finger swipe to the left across an element (touch events, as a phone sends them). */
async function swipeLeft(page: Page, target: Locator, distance: number) {
  const box = (await target.boundingBox())!;
  const y = box.y + box.height / 2;
  const startX = box.x + box.width * 0.8;
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: startX, y }],
  });
  const STEPS = 10;
  for (let step = 1; step <= STEPS; step += 1) {
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: startX - (distance * step) / STEPS, y }],
    });
  }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
}

test.describe("on a touch screen", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test("swiping a movie off the watchlist can be undone", async ({ page }) => {
    const user = await registerViaApi(page);
    await seedSubscription(user, {
      plan: "premium",
      interval: "month",
      currentPeriodEnd: PERIOD_END,
    });
    await seedWatchlist(user, ["550", "680"]);
    await page.goto("/watchlist");

    const cards = page.locator("[data-swipe-item]");
    await expect(cards).toHaveCount(2);
    await swipeLeft(page, cards.first(), 160);

    await expect(cards).toHaveCount(1);
    await expect(page).toHaveURL("/watchlist");
    await page.getByRole("button", { name: "Undo" }).click();
    await expect(cards).toHaveCount(2);
    await expect
      .poll(async () => (await (await page.request.get("/api/user/profile")).json()).user.watchlist)
      .toHaveLength(2);
  });
});
