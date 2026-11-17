import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError } from "@/server/http/responses";
import { TMDB_REVALIDATE_SECONDS, TmdbError } from "./tmdb";

// After the cache expires, a stale copy may still be served for a day while it refreshes
const STALE_WHILE_REVALIDATE_SECONDS = 24 * 60 * 60;

// Lets the CDN (e.g. Vercel) serve repeated requests without hitting the function or TMDB.
const CACHE_HEADERS = {
  "Cache-Control": `public, s-maxage=${TMDB_REVALIDATE_SECONDS}, stale-while-revalidate=${STALE_WHILE_REVALIDATE_SECONDS}`,
};

export function tmdbJson(data: unknown): NextResponse {
  return NextResponse.json(data, { headers: CACHE_HEADERS });
}

export function tmdbErrorResponse(error: unknown, context: string): NextResponse {
  if (error instanceof z.ZodError) {
    return jsonError(400, "Invalid parameters");
  }
  if (error instanceof TmdbError && error.status === 404) {
    return jsonError(404, "Not found");
  }
  console.error(`${context} error:`, error);
  return jsonError(502, "Movie service unavailable");
}

export function searchParamsToObject(url: string): Record<string, string> {
  return Object.fromEntries(new URL(url).searchParams);
}
