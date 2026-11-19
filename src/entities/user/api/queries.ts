import { queryOptions } from "@tanstack/react-query";
import { fetchCurrentUser } from "@/entities/user/api/auth.api";
import { authKeys } from "@/entities/user/api/query-keys";

export const currentUserQuery = queryOptions({
  queryKey: authKeys.me,
  queryFn: fetchCurrentUser,
});
