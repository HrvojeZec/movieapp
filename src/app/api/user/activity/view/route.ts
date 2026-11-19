import { NextResponse } from "next/server";
import { getSessionUser } from "@/entities/user/server/session";
import { recordMovieView } from "@/entities/movie/server/movie-views";
import { limitTmdbRequest } from "@/entities/movie/server/route-helpers";
import { INVALID_MOVIE_ID, movieViewSchema } from "@/entities/movie/validations/movies.schema";
import { parseJson } from "@/server/http/parse";
import { withRouteHandler } from "@/server/http/route-handler";
import { HTTP_STATUS } from "@/shared/lib/http-status";

const noContent = () => new NextResponse(null, { status: HTTP_STATUS.NO_CONTENT });

// POST /api/user/activity/view { movieId }: the movie page reports a visit. Anonymous visits
// aren't recorded but still answer 204, so the page needn't know whether anyone is logged in.
export const POST = withRouteHandler("Record movie view", async (request) => {
  const session = getSessionUser(request);
  if (!session) return noContent();

  const { movieId } = await parseJson(request, movieViewSchema, INVALID_MOVIE_ID);
  // Recording may look the movie up on TMDB, so it shares the TMDB request limit
  await limitTmdbRequest(request);
  await recordMovieView(session.userId, movieId);
  return noContent();
});
