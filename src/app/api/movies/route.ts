import { NextRequest } from "next/server";
import { tmdbFetch } from "@/features/movies/server/tmdb";
import {
  searchParamsToObject,
  tmdbErrorResponse,
  tmdbJson,
} from "@/features/movies/server/route-helpers";
import { movieListQuerySchema } from "@/features/movies/validations/movies.schema";

// GET /api/movies?list=popular|top_rated|now_playing|upcoming&page=1
export async function GET(request: NextRequest) {
  try {
    const { list, page } = movieListQuerySchema.parse(searchParamsToObject(request.url));
    return tmdbJson(await tmdbFetch(`/movie/${list}`, { page }));
  } catch (error) {
    return tmdbErrorResponse(error, "Movie list");
  }
}
