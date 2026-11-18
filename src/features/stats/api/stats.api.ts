import type { UserStats } from "@/features/stats/types";
import { API_ROUTES } from "@/shared/api-routes";
import { fetchJson } from "@/shared/lib/http";

export const getUserStats = () => fetchJson<UserStats>(API_ROUTES.user.stats);
