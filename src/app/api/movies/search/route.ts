import { NextRequest } from "next/server";
import { tmdbFetch } from "@/lib/tmdb/server";
import { searchParamsToObject, tmdbErrorResponse, tmdbJson } from "@/lib/tmdb/route-helpers";
import { movieSearchQuerySchema } from "@/lib/validation/validation";

// GET /api/movies/search?query=batman&page=1
export async function GET(request: NextRequest) {
  try {
    const { query, page } = movieSearchQuerySchema.parse(searchParamsToObject(request.url));
    return tmdbJson(await tmdbFetch("/search/movie", { query, page, include_adult: false }));
  } catch (error) {
    return tmdbErrorResponse(error, "Movie search");
  }
}
