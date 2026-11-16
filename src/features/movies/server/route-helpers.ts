import { NextResponse } from "next/server";
import { z } from "zod";
import { TMDB_REVALIDATE_SECONDS, TmdbError } from "./tmdb";

// Lets the CDN (e.g. Vercel) serve repeated requests without hitting the function or TMDB.
const CACHE_HEADERS = {
  "Cache-Control": `public, s-maxage=${TMDB_REVALIDATE_SECONDS}, stale-while-revalidate=86400`,
};

export function tmdbJson(data: unknown): NextResponse {
  return NextResponse.json(data, { headers: CACHE_HEADERS });
}

export function tmdbErrorResponse(error: unknown, context: string): NextResponse {
  if (error instanceof z.ZodError) {
    return NextResponse.json({ message: "Invalid parameters" }, { status: 400 });
  }
  if (error instanceof TmdbError && error.status === 404) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }
  console.error(`${context} error:`, error);
  return NextResponse.json({ message: "Movie service unavailable" }, { status: 502 });
}

export function searchParamsToObject(url: string): Record<string, string> {
  return Object.fromEntries(new URL(url).searchParams);
}
