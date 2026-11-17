import { expect, type Page } from "@playwright/test";
import mongoose from "mongoose";

// Every test user matches this pattern, so global teardown can delete exactly these users.
export const E2E_EMAIL_PATTERN = /^e2e-[a-z0-9-]+@example\.com$/;

export interface TestUser {
  name: string;
  email: string;
  password: string;
}

export function createTestUser(): TestUser {
  const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  return { name: "Test User", email: `e2e-${id}@example.com`, password: "E2eTest123" };
}

/** Registers through the API; the auth cookie lands in the page's browser context. */
export async function registerViaApi(page: Page, user = createTestUser()): Promise<TestUser> {
  const response = await page.request.post("/api/auth/register", { data: user });
  expect(response.ok(), await response.text()).toBeTruthy();
  return user;
}

export interface SeededSubscription {
  plan: "premium" | "pro";
  status?: "active" | "trialing" | "past_due";
  interval: "month" | "year";
  currentPeriodEnd: Date;
  cancelAt?: Date | null;
  trialEnd?: Date | null;
  /** Real Stripe IDs, when the test created the subscription in Stripe test mode. */
  stripeCustomerId?: string;
  subscriptionId?: string;
}

/**
 * Writes a subscription straight into the E2E database, as a Stripe webhook would have stored it:
 * paying on Stripe's hosted page isn't automated.
 */
export async function seedSubscription(user: TestUser, subscription: SeededSubscription) {
  const uri = process.env.E2E_MONGODB_URI;
  if (!uri) throw new Error("E2E_MONGODB_URI is required to seed a subscription");

  const connection = await mongoose.createConnection(uri).asPromise();
  try {
    await connection.collection("users").updateOne(
      { email: user.email },
      {
        $set: {
          subscriptionStatus: subscription.status ?? "active",
          subscriptionPlan: subscription.plan,
          subscriptionId: subscription.subscriptionId ?? "sub_e2e",
          ...(subscription.stripeCustomerId && {
            stripeCustomerId: subscription.stripeCustomerId,
          }),
          subscriptionInterval: subscription.interval,
          currentPeriodEnd: subscription.currentPeriodEnd,
          cancelAt: subscription.cancelAt ?? null,
          trialEnd: subscription.trialEnd ?? null,
        },
      },
    );
  } finally {
    await connection.close();
  }
}
