import { NextResponse } from "next/server";
import { requireSession } from "@/entities/user/server/session";
import { reorderList } from "@/entities/movie-list/server/lists";
import { reorderListSchema } from "@/entities/movie-list/validations/lists.schema";
import { parseJson } from "@/server/http/parse";
import { withRouteHandler } from "@/server/http/route-handler";

// PATCH /api/lists/:id/order { movieIds }: Premium and Pro; the same movies in a new order
export const PATCH = withRouteHandler(
  "Reorder movie list",
  async (request, { params }: { params: Promise<{ id: string }> }) => {
    const { userId } = await requireSession(request);
    const { movieIds } = await parseJson(request, reorderListSchema);
    return NextResponse.json({ list: await reorderList(userId, (await params).id, movieIds) });
  },
);
