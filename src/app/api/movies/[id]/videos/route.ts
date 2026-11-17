import { NextRequest } from "next/server";
import { fetchMovieVideos } from "@/features/movies/server/movies";
import {
  limitTmdbRequest,
  tmdbErrorResponse,
  tmdbJson,
} from "@/features/movies/server/route-helpers";
import { movieIdSchema } from "@/features/movies/validations/movies.schema";

// GET /api/movies/550/videos
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await limitTmdbRequest(request);
    const id = movieIdSchema.parse((await params).id);
    return tmdbJson({ results: await fetchMovieVideos(id) });
  } catch (error) {
    return tmdbErrorResponse(error, "Movie videos");
  }
}
