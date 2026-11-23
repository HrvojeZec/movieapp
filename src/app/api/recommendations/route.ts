import { NextResponse, type NextRequest } from "next/server";
import { requireSession } from "@/entities/user/server/session";
import { limitTmdbRequest, tmdbErrorResponse } from "@/entities/movie/server/route-helpers";
import { getRecommendations } from "@/entities/recommendation/server/recommend";
import { requireFeature } from "@/entities/subscription/server/entitlements";

// Personal, so never cached anywhere but the user's own browser (TanStack Query)
const NO_STORE = "private, no-store";

// GET /api/recommendations: Pro; picks from the user's favorites, watched movies and watchlist
export async function GET(request: NextRequest) {
  let response: NextResponse;
  try {
    const { userId } = await requireSession(request);
    await limitTmdbRequest(request);
    await requireFeature(userId, "recommendations");
    response = NextResponse.json(await getRecommendations(userId));
  } catch (error) {
    response = tmdbErrorResponse(error, "Recommendations");
  }
  response.headers.set("Cache-Control", NO_STORE);
  return response;
}
