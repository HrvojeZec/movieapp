import type Stripe from "stripe";
import { isValidObjectId } from "mongoose";
import connectDB from "@/server/db/mongodb";
import User, { type IUser } from "@/server/models/User";
import { getStripe } from "./stripe";
import { getPlanForSubscription } from "@/features/subscription/lib/plans";

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

/**
 * Re-reads the subscription from Stripe and stores its status and plan on the owning user.
 * Always fetching the latest state makes this safe for webhook events that arrive out of order
 * or are delivered more than once.
 */
export async function syncSubscription(subscriptionId: string): Promise<IUser | null> {
  const subscription: Stripe.Subscription =
    await getStripe().subscriptions.retrieve(subscriptionId);

  const customerId = getId(subscription.customer);
  if (!customerId) return null;

  const priceId = subscription.items.data[0]?.price.id;
  const plan = getPlanForSubscription(subscription.status, priceId);

  await connectDB();
  return User.findOneAndUpdate(
    { stripeCustomerId: customerId },
    { subscriptionStatus: subscription.status, subscriptionPlan: plan },
    { new: true },
  );
}

export function getSubscriptionIdFromSession(session: Stripe.Checkout.Session): string | null {
  return getId(session.subscription);
}

export function getSubscriptionIdFromInvoice(invoice: Stripe.Invoice): string | null {
  return getId(invoice.parent?.subscription_details?.subscription ?? null);
}
