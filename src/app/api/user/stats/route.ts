import { NextResponse, type NextRequest } from "next/server";
import { requireSession } from "@/features/auth/server/session";
import { limitTmdbRequest } from "@/features/movies/server/route-helpers";
import { getUserStats } from "@/features/stats/server/stats";
import { requireFeature } from "@/features/subscription/server/entitlements";
import { withRouteHandler } from "@/server/http/route-handler";

const handle = withRouteHandler("User stats", async (request) => {
  const { userId } = requireSession(request);
  // Genres of favorites come from TMDB, so the request shares the TMDB limit
  await limitTmdbRequest(request);
  await requireFeature(userId, "stats");
  return NextResponse.json(await getUserStats(userId));
});

// GET /api/user/stats: Pro; one user's own numbers, so never cached (errors included)
export async function GET(request: NextRequest, context: unknown) {
  const response = await handle(request, context);
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
