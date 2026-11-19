import type { Metadata } from "next";
import { RecommendationsView } from "@/views/recommendations/RecommendationsView";

export const metadata: Metadata = { title: "Recommended for You" };

export default function Page() {
  return <RecommendationsView />;
}
