import { expect, test } from "./fixtures";
import { registerViaApi } from "./helpers";

test("the pricing page only marks existing features as available", async ({ page }) => {
  await page.goto("/subscription/pricing");
  await expect(page.getByText("Coming soon").first()).toBeVisible();
  await expect(page.getByText("4242 4242 4242 4242")).toBeVisible();
});

test("anonymous users are sent to login before checkout", async ({ page }) => {
  await page.goto("/subscription/pricing");
  await page.getByRole("button", { name: "Subscribe to Premium" }).click();
  await expect(page).toHaveURL("/auth/login");
});

// Paying on Stripe's hosted page is deliberately not automated (bot protection makes it flaky);
// the post-payment logic is covered by unit tests and the webhook.
test("a logged-in user is redirected to Stripe Checkout", async ({ page }) => {
  test.skip(
    !process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PREMIUM_PRICE_ID,
    "Stripe test keys are not configured",
  );

  await registerViaApi(page);
  await page.goto("/subscription/pricing");
  await page.getByRole("button", { name: "Subscribe to Premium" }).click();

  await page.waitForURL(/^https:\/\/checkout\.stripe\.com\//, { timeout: 30_000 });
});
