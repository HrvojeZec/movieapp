import { NextRequest } from "next/server";
import { fetchSearchResults } from "@/features/movies/server/movies";
import {
  searchParamsToObject,
  limitTmdbRequest,
  tmdbErrorResponse,
  tmdbJson,
} from "@/features/movies/server/route-helpers";
import { movieSearchQuerySchema } from "@/features/movies/validations/movies.schema";

// GET /api/movies/search?query=batman&page=1
export async function GET(request: NextRequest) {
  try {
    await limitTmdbRequest(request);
    const { query, page } = movieSearchQuerySchema.parse(searchParamsToObject(request.url));
    return tmdbJson(await fetchSearchResults(query, page));
  } catch (error) {
    return tmdbErrorResponse(error, "Movie search");
  }
}
