import { QueryClient } from "@tanstack/react-query";
import { HttpError } from "./http";

const MAX_RETRIES = 2;

/** Retry network and server errors, but not client errors (404, 401, 400) that won't change on retry. */
export function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof HttpError && error.status >= 400 && error.status < 500) return false;
  return failureCount < MAX_RETRIES;
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Movie data changes slowly (the API caches TMDB responses for an hour as well)
        staleTime: 5 * 60 * 1000,
        retry: shouldRetry,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}
