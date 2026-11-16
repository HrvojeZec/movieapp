// Server-side TMDB client. Only import this from route handlers or other server code:
// TMDB_API_KEY is intentionally not NEXT_PUBLIC_, so it never reaches the browser.

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

// TMDB data changes slowly; caching for an hour keeps us well within TMDB rate limits.
export const TMDB_REVALIDATE_SECONDS = 60 * 60;

export class TmdbError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "TmdbError";
  }
}

type QueryParams = Record<string, string | number | boolean | undefined>;

export async function tmdbFetch<T>(path: string, params: QueryParams = {}): Promise<T> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    throw new Error("TMDB_API_KEY is not set in environment variables");
  }

  const url = new URL(`${TMDB_BASE_URL}${path}`);
  url.searchParams.set("api_key", apiKey);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  const response = await fetch(url, { next: { revalidate: TMDB_REVALIDATE_SECONDS } });
  if (!response.ok) {
    throw new TmdbError(`TMDB request to ${path} failed`, response.status);
  }
  return response.json() as Promise<T>;
}
