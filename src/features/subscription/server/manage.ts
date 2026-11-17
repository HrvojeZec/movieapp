import connectDB from "@/server/db/mongodb";
import User, { type IUser } from "@/server/models/User";
import { RouteError, notFound } from "@/server/http/route-error";
import { getAppUrl } from "@/server/app-url";
import { HTTP_STATUS } from "@/shared/lib/http-status";
import { ROUTES } from "@/shared/routes";
import { toAuthUser } from "@/features/auth/server/users";
import type { AuthUser } from "@/features/auth/types";
import { hasActiveSubscription } from "@/features/subscription/lib/plans";
import { getStripe } from "@/features/subscription/server/stripe";
import { syncSubscription } from "@/features/subscription/server/subscriptions";

const conflict = (message: string) => new RouteError(HTTP_STATUS.CONFLICT, message);

async function findUser(userId: string): Promise<IUser> {
  await connectDB();
  const user = await User.findById(userId);
  if (!user) throw notFound("User");
  return user;
}

/** The user and their live subscription ID; 409 when there is nothing to change. */
async function findSubscriber(userId: string): Promise<{ user: IUser; subscriptionId: string }> {
  const user = await findUser(userId);
  if (!user.subscriptionId || !hasActiveSubscription(user.subscriptionStatus)) {
    throw conflict("You don't have an active subscription");
  }
  return { user, subscriptionId: user.subscriptionId };
}

/** Re-reads the subscription so the response already shows the change. */
async function syncedUser(subscriptionId: string, fallback: IUser): Promise<AuthUser> {
  return toAuthUser((await syncSubscription(subscriptionId)) ?? fallback);
}

/** Cancels at the end of the paid period: the plan stays until then and nothing is refunded. */
export async function cancelSubscription(userId: string): Promise<AuthUser> {
  const { user, subscriptionId } = await findSubscriber(userId);
  if (user.cancelAt) throw conflict("Your subscription is already canceled");

  await getStripe().subscriptions.update(subscriptionId, { cancel_at_period_end: true });
  return syncedUser(subscriptionId, user);
}

/** Undoes a scheduled cancellation, whether it was made here or in the Customer Portal. */
export async function resumeSubscription(userId: string): Promise<AuthUser> {
  const { user, subscriptionId } = await findSubscriber(userId);
  if (!user.cancelAt) throw conflict("Your subscription isn't canceled");

  // Our cancel sets cancel_at_period_end, the Portal sets cancel_at, and Stripe rejects a request
  // that sends both, so clear the one this subscription has. An empty string unsets cancel_at.
  const stripe = getStripe();
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  await stripe.subscriptions.update(
    subscriptionId,
    subscription.cancel_at_period_end ? { cancel_at_period_end: false } : { cancel_at: "" },
  );
  return syncedUser(subscriptionId, user);
}

/** A Stripe Customer Portal session for the card, invoices and plan changes. */
export async function createPortalSession(userId: string): Promise<string> {
  const user = await findUser(userId);
  if (!user.stripeCustomerId) throw conflict("You don't have any billing details yet");

  const session = await getStripe().billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${getAppUrl()}${ROUTES.profile}`,
  });
  return session.url;
}
