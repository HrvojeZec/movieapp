import { expect, type Page } from "@playwright/test";
import { getE2EDatabase } from "./db";

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
  const connection = await getE2EDatabase();
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
}

export interface SeededNotification {
  title: string;
  body: string;
  link?: string;
}

/** Stores unread notifications for the user, as the webhook would, newest last. */
export async function seedNotifications(user: TestUser, notifications: SeededNotification[]) {
  const connection = await getE2EDatabase();
  const owner = await connection.collection("users").findOne({ email: user.email });
  if (!owner) throw new Error(`Test user ${user.email} not found`);
  const start = Date.now();
  await connection.collection("notifications").insertMany(
    notifications.map((notification, index) => ({
      userId: owner._id,
      type: "payment_failed",
      ...notification,
      dedupeKey: `e2e:${index}`,
      readAt: null,
      createdAt: new Date(start + index),
    })),
  );
}

/** Replaces the user's favorites in the E2E database (movie IDs as strings, as the app stores them). */
export async function seedFavorites(user: TestUser, movieIds: string[]) {
  const connection = await getE2EDatabase();
  await connection
    .collection("users")
    .updateOne({ email: user.email }, { $set: { favorites: movieIds } });
}
