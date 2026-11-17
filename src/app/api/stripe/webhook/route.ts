import { NextRequest, NextResponse } from "next/server";
import { jsonError } from "@/server/http/responses";
import type Stripe from "stripe";
import { getStripe } from "@/features/subscription/server/stripe";
import {
  getSubscriptionIdFromInvoice,
  getSubscriptionIdFromSession,
  linkStripeCustomer,
  syncSubscription,
} from "@/features/subscription/server/subscriptions";

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return jsonError(500, "Webhook not configured");
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return jsonError(400, "Missing Stripe signature");
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(await request.text(), signature, webhookSecret);
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return jsonError(400, "Invalid signature");
  }

  try {
    await handleEvent(event);
    return NextResponse.json({ received: true });
  } catch (error) {
    // A 5xx makes Stripe retry the delivery; handlers are idempotent, so retries are safe.
    console.error(`Webhook handler failed for ${event.type} (${event.id}):`, error);
    return jsonError(500, "Webhook handler failed");
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
      await syncOrWarn(subscriptionId, event);
      return;
    }

    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await syncOrWarn(event.data.object.id, event);
      return;

    case "invoice.paid":
    case "invoice.payment_failed": {
      const subscriptionId = getSubscriptionIdFromInvoice(event.data.object);
      if (subscriptionId) {
        await syncOrWarn(subscriptionId, event);
      }
      return;
    }

    default:
      return;
  }
}

async function syncOrWarn(subscriptionId: string, event: Stripe.Event): Promise<void> {
  const user = await syncSubscription(subscriptionId);
  if (!user) {
    // Retrying won't help if no user owns this customer, so acknowledge the event.
    console.warn(`No user found for subscription ${subscriptionId} (${event.type}, ${event.id})`);
  }
}
