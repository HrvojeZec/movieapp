import { NextResponse } from "next/server";
import { requireSession } from "@/features/auth/server/session";
import { addMovieToList } from "@/features/lists/server/lists";
import { INVALID_MOVIE_ID, addListMovieSchema } from "@/features/lists/validations/lists.schema";
import { parseJson } from "@/server/http/parse";
import { withRouteHandler } from "@/server/http/route-handler";

// POST /api/lists/:id/movies { movieId }: Premium and Pro; removal is DELETE .../movies/:movieId
export const POST = withRouteHandler(
  "Add movie to list",
  async (request, { params }: { params: Promise<{ id: string }> }) => {
    const { userId } = requireSession(request);
    const { movieId } = await parseJson(request, addListMovieSchema, INVALID_MOVIE_ID);
    return NextResponse.json({ list: await addMovieToList(userId, (await params).id, movieId) });
  },
);
