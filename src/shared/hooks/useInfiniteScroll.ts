import { useEffect } from "react";
import { useIntersection } from "@mantine/hooks";

interface InfiniteScrollOptions {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => unknown;
  /** How far before the end of the list the next page starts loading. */
  rootMargin?: string;
}

/** Returns a ref for a sentinel element at the end of a list; reaching it loads the next page. */
export function useInfiniteScroll({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  rootMargin,
}: InfiniteScrollOptions) {
  const { ref, entry } = useIntersection<HTMLDivElement>({ rootMargin });

  useEffect(() => {
    if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [entry?.isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return ref;
}
