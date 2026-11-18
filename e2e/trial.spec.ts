import { getE2EDatabase } from "./db";
import { expect, test } from "./fixtures";
import { registerViaApi } from "./helpers";

const TRIAL_BADGE = "14-day free trial";

test("the pricing page offers a trial only to new subscribers", async ({ page }) => {
  // Visitors and new accounts see it on both paid plans
  await page.goto("/subscription/pricing");
  await expect(page.getByText(TRIAL_BADGE)).toHaveCount(2);

  const user = await registerViaApi(page);
  await page.reload();
  await expect(page.getByText(TRIAL_BADGE)).toHaveCount(2);
  const { user: fresh } = await (await page.request.get("/api/user/profile")).json();
  expect(fresh.trialAvailable).toBe(true);

  // A returning subscriber already had their first subscription
  const db = await getE2EDatabase();
  await db
    .collection("users")
    .updateOne(
      { email: user.email },
      { $set: { subscriptionId: "sub_e2e_old", subscriptionStatus: "canceled" } },
    );
  await page.reload();
  await expect(page.getByRole("button", { name: "Subscribe to Premium" })).toBeVisible();
  await expect(page.getByText(TRIAL_BADGE)).toHaveCount(0);
  const { user: returning } = await (await page.request.get("/api/user/profile")).json();
  expect(returning.trialAvailable).toBe(false);
});
