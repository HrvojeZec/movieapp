import type { Metadata } from "next";
import { WatchlistView } from "@/views/watchlist/WatchlistView";

export const metadata: Metadata = { title: "My Watchlist" };

export default function Page() {
  return <WatchlistView />;
}
