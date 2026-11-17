import { NextRequest } from "next/server";
import { fetchMovieList } from "@/features/movies/server/movies";
import {
  searchParamsToObject,
  limitTmdbRequest,
  tmdbErrorResponse,
  tmdbJson,
} from "@/features/movies/server/route-helpers";
import { movieListQuerySchema } from "@/features/movies/validations/movies.schema";

// GET /api/movies?list=popular|top_rated|now_playing|upcoming&page=1
export async function GET(request: NextRequest) {
  try {
    await limitTmdbRequest(request);
    const { list, page } = movieListQuerySchema.parse(searchParamsToObject(request.url));
    return tmdbJson(await fetchMovieList(list, page));
  } catch (error) {
    return tmdbErrorResponse(error, "Movie list");
  }
}
