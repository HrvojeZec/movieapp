import { useCallback } from "react";
import { useAuth } from "@/entities/user/hooks/useAuth";
import {
  getEffectivePlan,
  getFavoritesLimit,
  hasFeature,
} from "@/entities/subscription/lib/entitlements";
import type { Feature } from "@/entities/subscription/types";

/**
 * What the signed-in user's plan unlocks, for showing or locking UI. Only a hint: the API checks
 * the same rules on the server. Anonymous visitors count as basic.
 */
export function useEntitlements() {
  const { user, loading } = useAuth();
  const plan = getEffectivePlan(user ?? {});
  const can = useCallback((feature: Feature) => hasFeature(plan, feature), [plan]);

  return { plan, can, favoritesLimit: getFavoritesLimit(plan), loading };
}
