import { NextResponse } from "next/server";
import { refreshStaleWatchedGenres } from "@/entities/watched/server/refresh-genres";
import { purgeActivityGenres } from "@/server/activity";
import { isCronRequest } from "@/server/http/cron-auth";
import { RouteError } from "@/server/http/route-error";
import { withRouteHandler } from "@/server/http/route-handler";
import { HTTP_STATUS } from "@/shared/lib/http-status";

// Runs on every call, never at build time
export const dynamic = "force-dynamic";

// GET /api/cron/refresh-tmdb-data: called once a day by Vercel Cron (vercel.json). Keeps stored
// TMDB data within the 6 months its API terms allow; safe to repeat.
export const GET = withRouteHandler("Refresh TMDB data", async (request) => {
  if (!isCronRequest(request)) {
    throw new RouteError(HTTP_STATUS.UNAUTHORIZED, "Unauthorized");
  }
  const watchedGenres = await refreshStaleWatchedGenres(new Date());
  const activityGenresCleared = await purgeActivityGenres();
  return NextResponse.json(
    { watchedGenres, activityGenresCleared },
    { headers: { "Cache-Control": "private, no-store" } },
  );
});
