import type { RecommendationsResult } from "@/entities/recommendation/types";
import { API_ROUTES } from "@/shared/api-routes";
import { fetchJson } from "@/shared/lib/http";

export const getRecommendations = () =>
  fetchJson<RecommendationsResult>(API_ROUTES.recommendations);
