import { NextResponse } from "next/server";
import { requireSession } from "@/entities/user/server/session";
import { listWatched, markWatched } from "@/entities/watched/server/watched";
import {
  INVALID_MOVIE_ID,
  markWatchedSchema,
  watchedPageSchema,
} from "@/entities/watched/validations/watched.schema";
import { parseJson, parseWith } from "@/server/http/parse";
import { withRouteHandler } from "@/server/http/route-handler";
import { HTTP_STATUS } from "@/shared/lib/http-status";

// GET /api/user/watched?page=2: the history, newest first
export const GET = withRouteHandler("List watched movies", async (request) => {
  const { userId } = requireSession(request);
  const page = parseWith(watchedPageSchema, request.nextUrl.searchParams.get("page") ?? undefined);

  return NextResponse.json(await listWatched(userId, page), {
    headers: { "Cache-Control": "private, no-store" },
  });
});

// POST /api/user/watched { movieId }: every plan; removal is DELETE .../[movieId]
export const POST = withRouteHandler("Mark as watched", async (request) => {
  const { userId } = requireSession(request);
  const { movieId } = await parseJson(request, markWatchedSchema, INVALID_MOVIE_ID);

  await markWatched(userId, movieId);
  return new NextResponse(null, { status: HTTP_STATUS.NO_CONTENT });
});
