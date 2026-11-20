import { QueryClient } from "@tanstack/react-query";
import { HttpError } from "./http";
import { isClientError } from "./http-status";
import { MINUTE_MS } from "./time";

const MAX_RETRIES = 2;
// Movie data changes slowly (the API caches TMDB responses for an hour as well)
const QUERY_STALE_TIME_MS = 5 * MINUTE_MS;

/** Retry network and server errors, but not client errors (404, 401, 400) that won't change on retry. */
export function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof HttpError && isClientError(error.status)) return false;
  return failureCount < MAX_RETRIES;
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: QUERY_STALE_TIME_MS,
        retry: shouldRetry,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}
