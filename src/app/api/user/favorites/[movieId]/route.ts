import { NextResponse } from "next/server";
import { requireSession } from "@/features/auth/server/session";
import { setFavorite } from "@/features/favorites/server/favorites";
import {
  INVALID_MOVIE_ID,
  favoriteMovieIdSchema,
} from "@/features/favorites/validations/favorites.schema";
import { parseWith } from "@/server/http/parse";
import { withRouteHandler } from "@/server/http/route-handler";

// DELETE /api/user/favorites/550
export const DELETE = withRouteHandler(
  "Remove favorite",
  async (request, { params }: { params: Promise<{ movieId: string }> }) => {
    const { userId } = requireSession(request);
    const movieId = parseWith(favoriteMovieIdSchema, (await params).movieId, INVALID_MOVIE_ID);

    return NextResponse.json({ favorites: await setFavorite(userId, movieId, false) });
  },
);
