import { NextResponse } from "next/server";
import { requireSession } from "@/features/auth/server/session";
import { reorderList } from "@/features/lists/server/lists";
import { reorderListSchema } from "@/features/lists/validations/lists.schema";
import { parseJson } from "@/server/http/parse";
import { withRouteHandler } from "@/server/http/route-handler";

// PATCH /api/lists/:id/order { movieIds }: Premium and Pro; the same movies in a new order
export const PATCH = withRouteHandler(
  "Reorder movie list",
  async (request, { params }: { params: Promise<{ id: string }> }) => {
    const { userId } = requireSession(request);
    const { movieIds } = await parseJson(request, reorderListSchema);
    return NextResponse.json({ list: await reorderList(userId, (await params).id, movieIds) });
  },
);
