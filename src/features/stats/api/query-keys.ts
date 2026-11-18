// Keyed by user, so another account on the same browser never sees these numbers
export const statsKeys = {
  all: ["stats"] as const,
  forUser: (userId: string) => [...statsKeys.all, userId] as const,
};
