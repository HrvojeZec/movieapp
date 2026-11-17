import { cache } from "react";
import { QueryClient } from "@tanstack/react-query";

/**
 * One QueryClient per server request (React `cache`), never shared between users. Prefetching
 * doesn't retry: a failed query is simply not sent to the browser, which then fetches it itself
 * and shows its usual error state with "Try again".
 */
export const getServerQueryClient = cache(
  () => new QueryClient({ defaultOptions: { queries: { retry: false } } }),
);
