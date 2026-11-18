import type { Metadata } from "next";
import { ListView } from "@/features/lists/views/ListView";

// Lists are private, so the server has no session-free way to name the page
export const metadata: Metadata = { title: "Movie List" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  return <ListView listId={(await params).id} />;
}
