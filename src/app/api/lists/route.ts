import { NextResponse } from "next/server";
import { requireSession } from "@/features/auth/server/session";
import { createList, listLists } from "@/features/lists/server/lists";
import {
  INVALID_MOVIE_ID,
  createListSchema,
  listMovieIdSchema,
} from "@/features/lists/validations/lists.schema";
import { parseJson, parseWith } from "@/server/http/parse";
import { withRouteHandler } from "@/server/http/route-handler";
import { HTTP_STATUS } from "@/shared/lib/http-status";

const PRIVATE = { "Cache-Control": "private, no-store" };

// GET /api/lists?movieId=550: the user's lists; with a movie, each says whether it holds it
export const GET = withRouteHandler("List movie lists", async (request) => {
  const { userId } = requireSession(request);
  const movieIdParam = request.nextUrl.searchParams.get("movieId");
  const movieId =
    movieIdParam === null
      ? undefined
      : parseWith(listMovieIdSchema, movieIdParam, INVALID_MOVIE_ID);

  return NextResponse.json({ lists: await listLists(userId, movieId) }, { headers: PRIVATE });
});

// POST /api/lists { name, movieId? }: Premium and Pro
export const POST = withRouteHandler("Create movie list", async (request) => {
  const { userId } = requireSession(request);
  const { name, movieId } = await parseJson(request, createListSchema);

  return NextResponse.json(
    { list: await createList(userId, name, movieId) },
    { status: HTTP_STATUS.CREATED },
  );
});
