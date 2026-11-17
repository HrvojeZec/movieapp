import { NextResponse } from "next/server";
import { requireSession } from "@/features/auth/server/session";
import { setFavorite } from "@/features/favorites/server/favorites";
import {
  INVALID_MOVIE_ID,
  addFavoriteSchema,
} from "@/features/favorites/validations/favorites.schema";
import { parseJson } from "@/server/http/parse";
import { withRouteHandler } from "@/server/http/route-handler";

// POST /api/user/favorites { movieId } adds a movie; removal is DELETE /api/user/favorites/[movieId]
export const POST = withRouteHandler("Add favorite", async (request) => {
  const { userId } = requireSession(request);
  const { movieId } = await parseJson(request, addFavoriteSchema, INVALID_MOVIE_ID);

  return NextResponse.json({ favorites: await setFavorite(userId, movieId, true) });
});
