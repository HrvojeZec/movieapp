import { NextResponse } from "next/server";
import { z } from "zod";
import { getClientIp } from "@/server/http/client-ip";
import { jsonError } from "@/server/http/responses";
import { RouteError } from "@/server/http/route-error";
import { routeErrorResponse } from "@/server/http/route-handler";
import { enforceRateLimit } from "@/server/rate-limit/enforce";
import { HTTP_STATUS } from "@/shared/lib/http-status";
import { DAY_IN_SECONDS } from "@/shared/lib/time";
import { TMDB_REVALIDATE_SECONDS, TmdbError } from "./tmdb";

// After the cache expires, a stale copy may still be served for a day while it refreshes
const STALE_WHILE_REVALIDATE_SECONDS = DAY_IN_SECONDS;

// Lets the CDN (e.g. Vercel) serve repeated requests without hitting the function or TMDB.
const CACHE_HEADERS = {
  "Cache-Control": `public, s-maxage=${TMDB_REVALIDATE_SECONDS}, stale-while-revalidate=${STALE_WHILE_REVALIDATE_SECONDS}`,
};

export function tmdbJson(data: unknown): NextResponse {
  return NextResponse.json(data, { headers: CACHE_HEADERS });
}

/** Counts the request against the per-IP limit that protects the shared TMDB quota. */
export function limitTmdbRequest(request: Request): Promise<void> {
  return enforceRateLimit("tmdb", getClientIp(request));
}

export function tmdbErrorResponse(error: unknown, context: string): NextResponse {
  if (error instanceof RouteError) {
    return routeErrorResponse(error);
  }
  if (error instanceof z.ZodError) {
    return jsonError(HTTP_STATUS.BAD_REQUEST, "Invalid parameters");
  }
  if (error instanceof TmdbError && error.status === HTTP_STATUS.NOT_FOUND) {
    return jsonError(HTTP_STATUS.NOT_FOUND, "Not found");
  }
  console.error(`${context} error:`, error);
  return jsonError(HTTP_STATUS.BAD_GATEWAY, "Movie service unavailable");
}

export function searchParamsToObject(url: string): Record<string, string> {
  return Object.fromEntries(new URL(url).searchParams);
}
