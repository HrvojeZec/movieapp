import type { Metadata } from "next";
import { Suspense } from "react";
import { SubscriptionSuccessView } from "@/features/subscription/views/SubscriptionSuccessView";

export const metadata: Metadata = { title: "Subscription confirmed" };

export default function Page() {
  // The view reads search params on the client, which requires a Suspense boundary.
  return (
    <Suspense>
      <SubscriptionSuccessView />
    </Suspense>
  );
}
