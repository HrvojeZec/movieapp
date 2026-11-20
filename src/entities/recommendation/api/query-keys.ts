// Keyed by user, so another account on the same browser never sees someone else's picks
export const recommendationKeys = {
  all: ["recommendations"] as const,
  forUser: (userId: string) => [...recommendationKeys.all, userId] as const,
};
