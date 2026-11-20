import { NextRequest } from "next/server";
import { fetchDiscover } from "@/entities/movie/server/movies";
import {
  searchParamsToObject,
  limitTmdbRequest,
  tmdbErrorResponse,
  tmdbJson,
} from "@/entities/movie/server/route-helpers";
import { movieDiscoverQuerySchema } from "@/entities/movie/validations/movies.schema";

// GET /api/movies/discover?year=2024&genre=28&minRating=7&page=1
export async function GET(request: NextRequest) {
  try {
    await limitTmdbRequest(request);
    const filters = movieDiscoverQuerySchema.parse(searchParamsToObject(request.url));
    return tmdbJson(await fetchDiscover(filters));
  } catch (error) {
    return tmdbErrorResponse(error, "Movie discover");
  }
}
