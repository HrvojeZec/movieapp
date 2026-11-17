import { queryOptions } from "@tanstack/react-query";
import { fetchCurrentUser } from "@/features/auth/api/auth.api";

export const authKeys = {
  me: ["auth", "me"] as const,
};

export const currentUserQuery = queryOptions({
  queryKey: authKeys.me,
  queryFn: fetchCurrentUser,
});
