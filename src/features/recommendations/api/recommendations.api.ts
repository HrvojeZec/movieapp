import type { RecommendationsResult } from "@/features/recommendations/types";
import { API_ROUTES } from "@/shared/api-routes";
import { fetchJson } from "@/shared/lib/http";

export const getRecommendations = () =>
  fetchJson<RecommendationsResult>(API_ROUTES.recommendations);
