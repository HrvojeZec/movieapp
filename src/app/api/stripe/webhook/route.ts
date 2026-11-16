import { NextRequest, NextResponse } from "next/server";
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
    return NextResponse.json({ message: "Webhook not configured" }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ message: "Missing Stripe signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(await request.text(), signature, webhookSecret);
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json({ message: "Invalid signature" }, { status: 400 });
  }

  try {
    await handleEvent(event);
    return NextResponse.json({ received: true });
  } catch (error) {
    // A 5xx makes Stripe retry the delivery; handlers are idempotent, so retries are safe.
    console.error(`Webhook handler failed for ${event.type} (${event.id}):`, error);
    return NextResponse.json({ message: "Webhook handler failed" }, { status: 500 });
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
