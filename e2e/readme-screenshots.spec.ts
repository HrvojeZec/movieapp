import { expect, test } from "./fixtures";
import {
  createTestUser,
  registerViaApi,
  seedFavorites,
  seedList,
  seedSubscription,
  seedWatchlist,
} from "./helpers";

const OUT = "docs/screenshots";
const DESKTOP = { width: 1440, height: 900 };
const PHONE = { width: 390, height: 844 };
const FAVORITES = ["550", "680", "155", "13", "278", "27205"];
const WATCHED = ["238", "157336", "603", "122", "550", "680", "155", "424", "129", "769"];

// Run on demand to refresh the README images: README_SHOTS=1 npx playwright test readme-screenshots
test.skip(!process.env.README_SHOTS, "README screenshots are taken on demand");
test.setTimeout(180_000);

test("README screenshots", async ({ page }) => {
  const user = await registerViaApi(page, { ...createTestUser(), name: "Alex Morgan" });
  await seedSubscription(user, {
    plan: "pro",
    interval: "month",
    currentPeriodEnd: new Date("2027-12-01T12:00:00Z"),
  });
  await seedFavorites(user, FAVORITES);
  await seedWatchlist(user, ["496243", "157336", "872585"]);
  await seedList(user, { name: "Weekend classics", movieIds: ["238", "240", "424", "389"] });
  await seedList(user, { name: "Mind benders", movieIds: ["27205", "603", "1124", "77"] });
  for (const movieId of WATCHED) {
    await page.request.post("/api/user/watched", { data: { movieId } });
    await page.request.post("/api/user/activity/view", { data: { movieId } });
  }

  await page.setViewportSize(DESKTOP);
  const shot = async (name: string) => {
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${OUT}/${name}.png` });
  };

  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
  await shot("home");

  await page.goto("/movie/155");
  await expect(page.getByRole("heading", { name: "The Dark Knight" }).first()).toBeVisible();
  await shot("movie");

  await page.goto("/stats");
  await expect(page.locator("[data-widget]").first()).toBeVisible();
  await shot("stats");

  await page.goto("/lists");
  await expect(page.getByText("Weekend classics")).toBeVisible();
  await shot("lists");

  await page.goto("/subscription/pricing");
  await expect(page.getByText("Premium").first()).toBeVisible();
  await shot("pricing");

  await page.setViewportSize(PHONE);
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
  await shot("phone-home");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(page.getByRole("dialog", { name: "MovieHub" })).toBeVisible();
  await shot("phone-menu");
});
