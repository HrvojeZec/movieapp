import { NextResponse, type NextRequest } from "next/server";
import { requireSession } from "@/entities/user/server/session";
import { fetchDiscover } from "@/entities/movie/server/movies";
import {
  limitTmdbRequest,
  searchParamsToObject,
  tmdbErrorResponse,
} from "@/entities/movie/server/route-helpers";
import { advancedDiscoverQuerySchema } from "@/entities/movie/validations/movies.schema";
import { requireFeature } from "@/entities/subscription/server/entitlements";

// Unlike the basic discover route, the answer depends on who asks: a shared cache could hand a
// Premium response to anyone, so nothing here may be cached
const NO_STORE = "private, no-store";

// GET /api/movies/discover/advanced?yearFrom=1990&genres=18,53&sortBy=vote_average.desc&page=1
export async function GET(request: NextRequest) {
  let response: NextResponse;
  try {
    const { userId } = await requireSession(request);
    await limitTmdbRequest(request);
    const filters = advancedDiscoverQuerySchema.parse(searchParamsToObject(request.url));
    await requireFeature(userId, "advancedFilters");
    response = NextResponse.json(await fetchDiscover(filters));
  } catch (error) {
    response = tmdbErrorResponse(error, "Advanced movie discover");
  }
  response.headers.set("Cache-Control", NO_STORE);
  return response;
}
