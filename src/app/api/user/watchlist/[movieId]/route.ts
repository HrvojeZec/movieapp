import { NextResponse } from "next/server";
import { requireSession } from "@/features/auth/server/session";
import { setWatchlist } from "@/features/watchlist/server/watchlist";
import {
  INVALID_MOVIE_ID,
  watchlistMovieIdSchema,
} from "@/features/watchlist/validations/watchlist.schema";
import { parseWith } from "@/server/http/parse";
import { withRouteHandler } from "@/server/http/route-handler";

// DELETE /api/user/watchlist/550: allowed on every plan
export const DELETE = withRouteHandler(
  "Remove from watchlist",
  async (request, { params }: { params: Promise<{ movieId: string }> }) => {
    const { userId } = requireSession(request);
    const movieId = parseWith(watchlistMovieIdSchema, (await params).movieId, INVALID_MOVIE_ID);

    return NextResponse.json({ watchlist: await setWatchlist(userId, movieId, false) });
  },
);
