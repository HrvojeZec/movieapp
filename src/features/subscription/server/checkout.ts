import connectDB from "@/server/db/mongodb";
import User, { type IUser } from "@/server/models/User";
import { RouteError, notFound } from "@/server/http/route-error";
import { HTTP_STATUS } from "@/shared/lib/http-status";
import { findUserById } from "@/features/auth/server/users";
import type { AuthUser } from "@/features/auth/types";
import { getPriceIdForPlan, hasActiveSubscription } from "@/features/subscription/lib/plans";
import type { BillingInterval, PaidPlan } from "@/features/subscription/types";
import { getStripe } from "./stripe";
import {
  getSubscriptionIdFromSession,
  linkStripeCustomer,
  syncSubscription,
} from "./subscriptions";

const STRIPE_INTEGRATION_IDENTIFIER = "movieapp_subscription_qvhrtmke";

/**
 * Creating the customer up front lets webhooks map events to the user by customer ID,
 * instead of relying on the email entered in Checkout.
 */
async function getOrCreateStripeCustomer(user: IUser): Promise<string> {
  if (user.stripeCustomerId) return user.stripeCustomerId;

  const customer = await getStripe().customers.create({
    email: user.email,
    name: user.name,
    metadata: { userId: user._id.toString() },
  });
  user.stripeCustomerId = customer.id;
  await user.save();
  return customer.id;
}

/** Starts a hosted Checkout for the plan and returns the URL to redirect the user to. */
export async function createSubscriptionCheckout(
  userId: string,
  plan: PaidPlan,
  interval: BillingInterval,
  origin: string,
): Promise<string> {
  // The price is resolved on the server so clients can't choose an arbitrary price ID.
  const priceId = getPriceIdForPlan(plan, interval);
  if (!priceId) {
    throw new RouteError(HTTP_STATUS.SERVICE_UNAVAILABLE, "Payments are not configured");
  }

  await connectDB();
  const user = await User.findById(userId);
  if (!user) {
    throw notFound("User");
  }
  if (hasActiveSubscription(user.subscriptionStatus)) {
    throw new RouteError(HTTP_STATUS.CONFLICT, "You already have an active subscription");
  }

  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    customer: await getOrCreateStripeCustomer(user),
    client_reference_id: userId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/subscription/pricing`,
    integration_identifier: STRIPE_INTEGRATION_IDENTIFIER,
  });

  if (!session.url) {
    throw new Error(`Checkout session ${session.id} has no URL`);
  }
  return session.url;
}

/**
 * Called right after Checkout so the user sees the new plan immediately.
 * The webhook remains the source of truth; this only re-syncs the user's own subscription.
 */
export async function confirmCheckoutSession(
  userId: string,
  sessionId: string,
): Promise<AuthUser | null> {
  const session = await getStripe().checkout.sessions.retrieve(sessionId);

  // Without this check any logged-in user could submit someone else's paid session.
  // Respond with 404 so session IDs of other users can't be probed.
  if (session.client_reference_id !== userId) {
    throw notFound("Checkout session");
  }

  const subscriptionId = getSubscriptionIdFromSession(session);
  if (session.mode !== "subscription" || !subscriptionId) {
    throw new RouteError(HTTP_STATUS.BAD_REQUEST, "Not a subscription checkout");
  }

  if (session.payment_status === "unpaid") {
    throw new RouteError(HTTP_STATUS.CONFLICT, "Payment is still processing");
  }

  if (typeof session.customer === "string") {
    await linkStripeCustomer(userId, session.customer);
  }
  await syncSubscription(subscriptionId);

  return findUserById(userId);
}
