import type { Metadata } from "next";
import { FavoritesView } from "@/views/favorites/FavoritesView";

export const metadata: Metadata = { title: "My Favorites" };

export default function Page() {
  return <FavoritesView />;
}
