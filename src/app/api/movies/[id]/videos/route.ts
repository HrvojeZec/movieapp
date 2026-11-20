import { NextRequest } from "next/server";
import { fetchMovieVideos } from "@/entities/movie/server/movies";
import {
  limitTmdbRequest,
  tmdbErrorResponse,
  tmdbJson,
} from "@/entities/movie/server/route-helpers";
import { movieIdSchema } from "@/entities/movie/validations/movies.schema";

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
