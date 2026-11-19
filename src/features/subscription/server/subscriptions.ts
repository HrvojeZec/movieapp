import type Stripe from "stripe";
import { isValidObjectId } from "mongoose";
import connectDB from "@/server/db/mongodb";
import User, { type IUser } from "@/server/models/User";
import { getStripe } from "./stripe";
import { getPlanForPriceId } from "@/features/subscription/lib/plans";
import {
  pickCurrentSubscription,
  toSubscriptionFields,
} from "@/features/subscription/lib/subscription-state";

function getId(value: string | { id: string } | null): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

/**
 * Links a Stripe customer to a user that doesn't have one yet (e.g. accounts created before
 * customers were created at checkout). Never overwrites an existing, different customer.
 */
export async function linkStripeCustomer(userId: string, customerId: string): Promise<void> {
  if (!isValidObjectId(userId)) return;
  await connectDB();
  await User.updateOne(
    { _id: userId, $or: [{ stripeCustomerId: null }, { stripeCustomerId: { $exists: false } }] },
    { stripeCustomerId: customerId },
  );
}

// A customer has one subscription at a time, plus the ended ones; the newest come first
const CUSTOMER_SUBSCRIPTIONS_LIMIT = 20;

/**
 * Re-reads the customer's subscriptions from Stripe and stores the current one's status, plan,
 * billing interval and dates on the owning user.
 * Always fetching the latest state makes this safe for webhook events that arrive out of order,
 * late or more than once: an event of an old subscription can't replace a newer one.
 */
export async function syncSubscription(subscriptionId: string): Promise<IUser | null> {
  const stripe = getStripe();
  const subscription: Stripe.Subscription = await stripe.subscriptions.retrieve(subscriptionId);

  const customerId = getId(subscription.customer);
  if (!customerId) return null;

  const { data } = await stripe.subscriptions.list({
    customer: customerId,
    status: "all",
    limit: CUSTOMER_SUBSCRIPTIONS_LIMIT,
  });
  // A brand-new subscription can be missing from the list for a moment
  const candidates = data.some((item) => item.id === subscription.id)
    ? data
    : [subscription, ...data];
  const current = pickCurrentSubscription(candidates) ?? subscription;

  await connectDB();
  return User.findOneAndUpdate(
    { stripeCustomerId: customerId },
    toSubscriptionFields(current, getPlanForPriceId),
    { returnDocument: "after" },
  );
}

export function getSubscriptionIdFromSession(session: Stripe.Checkout.Session): string | null {
  return getId(session.subscription);
}

export function getSubscriptionIdFromInvoice(invoice: Stripe.Invoice): string | null {
  return getId(invoice.parent?.subscription_details?.subscription ?? null);
}
