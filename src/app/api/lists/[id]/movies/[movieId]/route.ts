import { NextResponse } from "next/server";
import { requireSession } from "@/features/auth/server/session";
import { removeMovieFromList } from "@/features/lists/server/lists";
import { INVALID_MOVIE_ID, listMovieIdSchema } from "@/features/lists/validations/lists.schema";
import { parseWith } from "@/server/http/parse";
import { withRouteHandler } from "@/server/http/route-handler";

// DELETE /api/lists/:id/movies/550: on every plan
export const DELETE = withRouteHandler(
  "Remove movie from list",
  async (request, { params }: { params: Promise<{ id: string; movieId: string }> }) => {
    const { userId } = requireSession(request);
    const { id, movieId } = await params;
    const validMovieId = parseWith(listMovieIdSchema, movieId, INVALID_MOVIE_ID);
    return NextResponse.json({ list: await removeMovieFromList(userId, id, validMovieId) });
  },
);
