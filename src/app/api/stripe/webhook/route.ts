import { NextRequest, NextResponse } from "next/server";
import { jsonError } from "@/server/http/responses";
import { HTTP_STATUS } from "@/shared/lib/http-status";
import type Stripe from "stripe";
import { getStripe } from "@/features/subscription/server/stripe";
import {
  getSubscriptionIdFromInvoice,
  getSubscriptionIdFromSession,
  linkStripeCustomer,
  syncSubscription,
} from "@/features/subscription/server/subscriptions";
import { getSubscriptionNotification } from "@/features/notifications/lib/subscription-events";
import { notifyUser } from "@/features/notifications/server/notify";

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return jsonError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Webhook not configured");
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return jsonError(HTTP_STATUS.BAD_REQUEST, "Missing Stripe signature");
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(await request.text(), signature, webhookSecret);
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return jsonError(HTTP_STATUS.BAD_REQUEST, "Invalid signature");
  }

  try {
    await handleEvent(event);
    return NextResponse.json({ received: true });
  } catch (error) {
    // A 5xx makes Stripe retry the delivery; handlers are idempotent, so retries are safe.
    console.error(`Webhook handler failed for ${event.type} (${event.id}):`, error);
    return jsonError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Webhook handler failed");
  }
}

async function handleEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object;
      const subscriptionId = getSubscriptionIdFromSession(session);
      // With delayed payment methods the session completes before the payment succeeds.
      if (
        session.mode !== "subscription" ||
        !subscriptionId ||
        session.payment_status === "unpaid"
      ) {
        return;
      }
      if (session.client_reference_id && typeof session.customer === "string") {
        await linkStripeCustomer(session.client_reference_id, session.customer);
      }
      await syncAndNotify(subscriptionId, event);
      return;
    }

    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
    case "customer.subscription.trial_will_end":
      await syncAndNotify(event.data.object.id, event);
      return;

    case "invoice.paid":
    case "invoice.payment_failed": {
      const subscriptionId = getSubscriptionIdFromInvoice(event.data.object);
      if (subscriptionId) {
        await syncAndNotify(subscriptionId, event);
      }
      return;
    }

    default:
      return;
  }
}

/** Stores the latest subscription state, then tells the owner what changed, if anything. */
async function syncAndNotify(subscriptionId: string, event: Stripe.Event): Promise<void> {
  const user = await syncSubscription(subscriptionId);
  if (!user) {
    // Retrying won't help if no user owns this customer, so acknowledge the event.
    console.warn(`No user found for subscription ${subscriptionId} (${event.type}, ${event.id})`);
    return;
  }

  const notification = getSubscriptionNotification(event);
  if (!notification) return;
  try {
    await notifyUser(user._id.toString(), notification);
  } catch (error) {
    // The subscription is already synced; a missing notification isn't worth a Stripe retry
    console.error(`Notification failed for ${event.type} (${event.id}):`, error);
  }
}
