import { NextResponse } from "next/server";
import { requireSession } from "@/entities/user/server/session";
import { removeMovieFromList } from "@/entities/movie-list/server/lists";
import {
  INVALID_MOVIE_ID,
  listMovieIdSchema,
} from "@/entities/movie-list/validations/lists.schema";
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
