import { NextRequest } from "next/server";
import { tmdbFetch } from "@/lib/tmdb/server";
import { searchParamsToObject, tmdbErrorResponse, tmdbJson } from "@/lib/tmdb/route-helpers";
import { movieListQuerySchema } from "@/lib/validation/validation";

// GET /api/movies?list=popular|top_rated|now_playing|upcoming&page=1
export async function GET(request: NextRequest) {
  try {
    const { list, page } = movieListQuerySchema.parse(searchParamsToObject(request.url));
    return tmdbJson(await tmdbFetch(`/movie/${list}`, { page }));
  } catch (error) {
    return tmdbErrorResponse(error, "Movie list");
  }
}
