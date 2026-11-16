import type { Metadata } from "next";
import { PricingView } from "@/features/subscription/views/PricingView";

export const metadata: Metadata = { title: "Pricing" };

export default function Page() {
  return <PricingView />;
}
