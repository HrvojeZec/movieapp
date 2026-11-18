import Stripe from "stripe";
import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";
import { registerViaApi, seedSubscription, type TestUser } from "./helpers";

const PERIOD_END = new Date("2026-12-17T12:00:00Z");

/** The user as the API returns it, with the subscription summary changed. */
async function profileWith(page: Page, cancelAt: string | null) {
  const { user } = await (await page.request.get("/api/user/profile")).json();
  return { user: { ...user, subscription: { ...user.subscription, cancelAt } } };
}

test.describe("with a seeded subscription", () => {
  // Stripe isn't called here: the cancel and resume endpoints are answered by the test, so these
  // check what the profile shows and asks; the real Stripe round trip is the last test
  test("cancel asks for confirmation and shows when the plan ends", async ({ page }) => {
    const user = await registerViaApi(page);
    await seedSubscription(user, {
      plan: "premium",
      interval: "month",
      currentPeriodEnd: PERIOD_END,
    });
    const canceled = await profileWith(page, PERIOD_END.toISOString());
    await page.route("**/api/subscription/cancel", (route) => route.fulfill({ json: canceled }));

    await page.goto("/profile");
    const panel = page.getByRole("region", { name: "Subscription" });
    await panel.getByRole("button", { name: "Cancel subscription" }).click();

    const dialog = page.getByRole("dialog", { name: "Cancel Premium?" });
    await expect(dialog).toContainText("You keep Premium until December 17, 2026");
    await expect(dialog).toContainText("Watchlist");
    await expect(dialog).toContainText("Unlimited favorites");
    await dialog.getByRole("button", { name: "Cancel subscription" }).click();

    await expect(dialog).toBeHidden();
    await expect(panel).toContainText("Ends on December 17, 2026");
    await expect(panel.getByRole("button", { name: "Resume subscription" })).toBeVisible();
    await expect(panel.getByRole("button", { name: "Cancel subscription" })).toHaveCount(0);
  });

  test("keeping the plan closes the dialog without canceling", async ({ page }) => {
    const user = await registerViaApi(page);
    await seedSubscription(user, { plan: "pro", interval: "year", currentPeriodEnd: PERIOD_END });
    let canceled = false;
    await page.route("**/api/subscription/cancel", (route) => {
      canceled = true;
      return route.abort();
    });

    await page.goto("/profile");
    await page.getByRole("button", { name: "Cancel subscription" }).click();
    await page.getByRole("button", { name: "Keep Pro" }).click();

    await expect(page.getByRole("dialog")).toBeHidden();
    expect(canceled).toBe(false);
  });

  test("a canceled plan can be resumed", async ({ page }) => {
    const user = await registerViaApi(page);
    await seedSubscription(user, {
      plan: "premium",
      interval: "month",
      currentPeriodEnd: PERIOD_END,
      cancelAt: PERIOD_END,
    });
    const resumed = await profileWith(page, null);
    await page.route("**/api/subscription/resume", (route) => route.fulfill({ json: resumed }));

    await page.goto("/profile");
    const panel = page.getByRole("region", { name: "Subscription" });
    await panel.getByRole("button", { name: "Resume subscription" }).click();

    await expect(panel).toContainText("Renews on December 17, 2026");
    await expect(panel.getByRole("button", { name: "Cancel subscription" })).toBeVisible();
  });

  test("a subscriber switches plans in the billing portal", async ({ page }) => {
    const user = await registerViaApi(page);
    await seedSubscription(user, {
      plan: "premium",
      interval: "month",
      currentPeriodEnd: PERIOD_END,
    });

    await page.goto("/subscription/pricing");

    await expect(page.getByRole("button", { name: "Current Plan" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Switch to Pro" })).toBeEnabled();
  });
});

// A real test-mode subscription, created through the Stripe API with Stripe's test card
async function subscribeForReal(user: TestUser, stripe: Stripe, priceId: string) {
  const customer = await stripe.customers.create({
    email: user.email,
    payment_method: "pm_card_visa",
    invoice_settings: { default_payment_method: "pm_card_visa" },
  });
  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: priceId }],
  });
  await seedSubscription(user, {
    plan: "premium",
    interval: "month",
    currentPeriodEnd: new Date(subscription.items.data[0].current_period_end * 1000),
    stripeCustomerId: customer.id,
    subscriptionId: subscription.id,
  });
  return customer.id;
}

test("a subscriber can cancel and resume through Stripe", async ({ page }) => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env.STRIPE_PREMIUM_PRICE_ID;
  test.skip(!secretKey || !priceId, "Stripe test keys are not configured");
  test.setTimeout(90_000);

  const stripe = new Stripe(secretKey!);
  const user = await registerViaApi(page);
  const customerId = await subscribeForReal(user, stripe, priceId!);

  try {
    await page.goto("/profile");
    const panel = page.getByRole("region", { name: "Subscription" });

    await panel.getByRole("button", { name: "Cancel subscription" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Cancel subscription" }).click();
    await expect(panel).toContainText("Ends on");

    await panel.getByRole("button", { name: "Resume subscription" }).click();
    await expect(panel).toContainText("Renews on");
  } finally {
    // Deleting the customer also cancels the subscription, so test mode stays tidy
    await stripe.customers.del(customerId);
  }
});
