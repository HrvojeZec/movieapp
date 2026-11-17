import { queryOptions } from "@tanstack/react-query";
import { fetchCurrentUser } from "@/features/auth/api/auth.api";
import { authKeys } from "@/features/auth/api/query-keys";

export const currentUserQuery = queryOptions({
  queryKey: authKeys.me,
  queryFn: fetchCurrentUser,
});
