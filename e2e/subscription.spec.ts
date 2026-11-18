import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";
import { registerViaApi } from "./helpers";

test("the pricing page lists what each plan unlocks, all of it available", async ({ page }) => {
  await page.goto("/subscription/pricing");
  for (const feature of ["Watchlist", "Custom lists", "Advanced filters", "Viewing statistics"]) {
    await expect(page.getByText(feature, { exact: true })).toBeVisible();
  }
  await expect(page.getByText(/coming soon/i)).toHaveCount(0);
  await expect(page.getByText("4242 4242 4242 4242")).toBeVisible();
});

test("the pricing page switches between monthly and yearly prices", async ({ page }) => {
  await page.goto("/subscription/pricing");
  await expect(page.getByText("$9.99", { exact: true })).toBeVisible();
  await expect(page.getByText("/month").first()).toBeVisible();

  await page.getByText("Yearly", { exact: true }).click();

  await expect(page.getByText("$99.90", { exact: true })).toBeVisible();
  await expect(page.getByText("$199.90", { exact: true })).toBeVisible();
  await expect(page.getByText("/year").first()).toBeVisible();
  await expect(page.getByText("$9.99", { exact: true })).toHaveCount(0);
});

test("anonymous users are sent to login before checkout", async ({ page }) => {
  await page.goto("/subscription/pricing");
  await page.getByRole("button", { name: "Subscribe to Premium" }).click();
  await expect(page).toHaveURL("/auth/login");
});

// Paying on Stripe's hosted page is deliberately not automated (bot protection makes it flaky);
// the post-payment logic is covered by unit tests and the webhook.
for (const interval of ["Monthly", "Yearly"] as const) {
  test(`a logged-in user is redirected to Stripe Checkout (${interval})`, async ({ page }) => {
    const priceId =
      interval === "Monthly"
        ? process.env.STRIPE_PREMIUM_PRICE_ID
        : process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID;
    test.skip(!process.env.STRIPE_SECRET_KEY || !priceId, "Stripe test keys are not configured");

    await registerViaApi(page);
    await page.goto("/subscription/pricing");
    await page.getByText(interval, { exact: true }).click();
    await page.getByRole("button", { name: "Subscribe to Premium" }).click();

    await page.waitForURL(/^https:\/\/checkout\.stripe\.com\//, { timeout: 30_000 });
  });
}

test("no plan is marked as current until the session has loaded", async ({ page }) => {
  await registerViaApi(page);

  // Hold the session response so the page renders while it still doesn't know the plan
  let releaseSession = () => {};
  const sessionHeld = new Promise<void>((resolve) => (releaseSession = resolve));
  await page.route("**/api/user/profile", async (route) => {
    await sessionHeld;
    await route.continue();
  });

  await page.goto("/subscription/pricing");
  await expect(page.getByRole("button", { name: "Subscribe to Premium" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Current Plan" })).toHaveCount(0);

  releaseSession();
  await expect(page.getByRole("button", { name: "Current Plan" })).toHaveCount(1);
});

// Stripe's hosted payment isn't automated, so the confirmation call is answered here
async function confirmCheckoutAs(page: Page, response: { status: number; body: unknown }) {
  await page.route("**/api/stripe/checkout-success", (route) =>
    route.fulfill({ status: response.status, json: response.body }),
  );
}

test("the success page shows the new plan as an admission ticket", async ({ page }) => {
  const user = await registerViaApi(page);
  await confirmCheckoutAs(page, {
    status: 200,
    body: {
      success: true,
      user: { email: user.email, subscriptionStatus: "active", subscriptionPlan: "premium" },
    },
  });

  await page.goto("/subscription/success?session_id=cs_test_123");

  await expect(page.getByRole("heading", { name: "You're on Premium" })).toBeVisible();
  const ticket = page.getByRole("region", { name: "Premium subscription" });
  await expect(ticket).toContainText("$9.99");
  await expect(ticket).toContainText("Watchlist");
  await expect(page.getByRole("link", { name: "Browse movies" })).toHaveAttribute("href", "/");
  await expect(page.getByRole("link", { name: "View profile" })).toHaveAttribute(
    "href",
    "/profile",
  );
});

test("the success page explains a failed confirmation", async ({ page }) => {
  await registerViaApi(page);
  await confirmCheckoutAs(page, {
    status: 409,
    body: { message: "Payment is still processing" },
  });

  await page.goto("/subscription/success?session_id=cs_test_123");

  await expect(page.getByText("Payment is still processing")).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to pricing" })).toBeVisible();
});
