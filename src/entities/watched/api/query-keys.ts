// Keyed by user, so another account on the same browser never sees a cached history
export const watchedKeys = {
  all: ["watched"] as const,
  ids: (userId: string) => [...watchedKeys.all, "ids", userId] as const,
  history: (userId: string) => [...watchedKeys.all, "history", userId] as const,
  // Mutation key: lets a toggle check whether other toggles are still in flight
  toggle: ["watched", "toggle"] as const,
};
