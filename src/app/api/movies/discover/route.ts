import { NextRequest } from "next/server";
import { fetchDiscover } from "@/features/movies/server/movies";
import {
  searchParamsToObject,
  tmdbErrorResponse,
  tmdbJson,
} from "@/features/movies/server/route-helpers";
import { movieDiscoverQuerySchema } from "@/features/movies/validations/movies.schema";

// GET /api/movies/discover?year=2024&genre=28&minRating=7&page=1
export async function GET(request: NextRequest) {
  try {
    const filters = movieDiscoverQuerySchema.parse(searchParamsToObject(request.url));
    return tmdbJson(await fetchDiscover(filters));
  } catch (error) {
    return tmdbErrorResponse(error, "Movie discover");
  }
}
