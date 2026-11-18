// Keyed by user, so another account on the same browser never sees cached lists
export const listKeys = {
  all: ["lists"] as const,
  summaries: (userId: string, movieId?: string) =>
    [...listKeys.all, userId, "summaries", movieId ?? "all"] as const,
  detail: (userId: string, listId: string) => [...listKeys.all, userId, "detail", listId] as const,
};
