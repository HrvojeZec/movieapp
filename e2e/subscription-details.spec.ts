import { expect, test } from "./fixtures";
import { registerViaApi, seedSubscription } from "./helpers";

// Noon UTC, so the date is the same calendar day in every time zone the tests run in
const NEXT_YEAR = new Date("2027-11-17T12:00:00Z");
const NEXT_MONTH = new Date("2026-12-17T12:00:00Z");

test("a renewing yearly plan shows its price and renewal date", async ({ page }) => {
  const user = await registerViaApi(page);
  await seedSubscription(user, { plan: "premium", interval: "year", currentPeriodEnd: NEXT_YEAR });

  await page.goto("/profile");

  const panel = page.getByRole("region", { name: "Subscription" });
  await expect(panel).toContainText("Premium plan");
  await expect(panel).toContainText("Yearly");
  await expect(panel).toContainText("$99.90 per year");
  await expect(panel).toContainText("Renews on November 17, 2027");
  // The plan's summary lists what it unlocks today, nothing "coming soon"
  await expect(panel).toContainText("watchlist, custom lists and advanced filters");
  await expect(panel).not.toContainText(/coming soon/i);
});

test("a canceled plan shows when it ends", async ({ page }) => {
  const user = await registerViaApi(page);
  await seedSubscription(user, {
    plan: "pro",
    interval: "month",
    currentPeriodEnd: NEXT_MONTH,
    cancelAt: NEXT_MONTH,
  });

  await page.goto("/profile");

  const panel = page.getByRole("region", { name: "Subscription" });
  await expect(panel).toContainText("$19.99 per month");
  await expect(panel).toContainText("Ends on December 17, 2026");
  await expect(panel).not.toContainText("Renews on");
});

test("past_due shows a payment warning", async ({ page }) => {
  const user = await registerViaApi(page);
  await seedSubscription(user, {
    plan: "premium",
    status: "past_due",
    interval: "month",
    currentPeriodEnd: NEXT_MONTH,
  });

  await page.goto("/profile");

  const panel = page.getByRole("region", { name: "Subscription" });
  await expect(panel.getByRole("alert")).toContainText("Your last payment failed");
});

test("a trial shows when it ends and what it costs afterwards", async ({ page }) => {
  const user = await registerViaApi(page);
  await seedSubscription(user, {
    plan: "premium",
    status: "trialing",
    interval: "month",
    currentPeriodEnd: NEXT_MONTH,
    trialEnd: NEXT_MONTH,
  });

  await page.goto("/profile");

  const panel = page.getByRole("region", { name: "Subscription" });
  await expect(panel).toContainText("Trial ends on December 17, 2026");
  await expect(panel).toContainText("$9.99 per month");
});
