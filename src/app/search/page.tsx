import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchView } from "@/views/search/SearchView";

export const metadata: Metadata = { title: "Search" };

export default function Page() {
  // The view reads search params on the client, which requires a Suspense boundary.
  return (
    <Suspense>
      <SearchView />
    </Suspense>
  );
}
