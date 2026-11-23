import { NextResponse } from "next/server";
import { requireSession } from "@/entities/user/server/session";
import { setWatchlist } from "@/entities/watchlist/server/watchlist";
import {
  INVALID_MOVIE_ID,
  addToWatchlistSchema,
} from "@/entities/watchlist/validations/watchlist.schema";
import { parseJson } from "@/server/http/parse";
import { withRouteHandler } from "@/server/http/route-handler";

// POST /api/user/watchlist { movieId }: Premium and Pro only; removal is DELETE .../[movieId]
export const POST = withRouteHandler("Add to watchlist", async (request) => {
  const { userId } = await requireSession(request);
  const { movieId } = await parseJson(request, addToWatchlistSchema, INVALID_MOVIE_ID);

  return NextResponse.json({ watchlist: await setWatchlist(userId, movieId, true) });
});
