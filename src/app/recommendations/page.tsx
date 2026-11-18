import type { Metadata } from "next";
import { RecommendationsView } from "@/features/recommendations/views/RecommendationsView";

export const metadata: Metadata = { title: "Recommended for You" };

export default function Page() {
  return <RecommendationsView />;
}
