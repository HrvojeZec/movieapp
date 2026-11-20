import type { Metadata } from "next";
import { Suspense } from "react";
import { MostWatchedView } from "@/views/most-watched/MostWatchedView";

export const metadata: Metadata = { title: "Most Watched" };

export default function Page() {
  // The view reads search params on the client, which requires a Suspense boundary.
  return (
    <Suspense>
      <MostWatchedView />
    </Suspense>
  );
}
