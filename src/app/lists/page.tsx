import type { Metadata } from "next";
import { ListsView } from "@/features/lists/views/ListsView";

export const metadata: Metadata = { title: "My Lists" };

export default function Page() {
  return <ListsView />;
}
