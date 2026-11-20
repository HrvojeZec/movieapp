import { NextResponse } from "next/server";
import { requireSession } from "@/entities/user/server/session";
import { unmarkWatched } from "@/entities/watched/server/watched";
import {
  INVALID_MOVIE_ID,
  watchedMovieIdSchema,
} from "@/entities/watched/validations/watched.schema";
import { parseWith } from "@/server/http/parse";
import { withRouteHandler } from "@/server/http/route-handler";
import { HTTP_STATUS } from "@/shared/lib/http-status";

// DELETE /api/user/watched/550
export const DELETE = withRouteHandler(
  "Unmark as watched",
  async (request, { params }: { params: Promise<{ movieId: string }> }) => {
    const { userId } = requireSession(request);
    const movieId = parseWith(watchedMovieIdSchema, (await params).movieId, INVALID_MOVIE_ID);

    await unmarkWatched(userId, movieId);
    return new NextResponse(null, { status: HTTP_STATUS.NO_CONTENT });
  },
);
