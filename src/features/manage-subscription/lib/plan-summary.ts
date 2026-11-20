import { FAVORITES_LIMIT, FEATURE_LABELS, PLAN_FEATURES } from "@/entities/subscription/constants";
import type { Feature, SubscriptionPlan } from "@/entities/subscription/types";

const inSentence = (feature: Feature) =>
  FEATURE_LABELS[feature].charAt(0).toLowerCase() + FEATURE_LABELS[feature].slice(1);

// "a, b and c"
const listOf = (items: string[]) =>
  items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;

/**
 * One sentence on what a plan includes, built from PLAN_FEATURES (what the server unlocks), so the
 * profile can't promise something missing or leave out something new.
 */
export function describePlan(plan: SubscriptionPlan): string {
  if (plan === "basic") {
    return `Browse, search and filter movies, watch trailers, track what you've watched and save up to ${FAVORITES_LIMIT} favorites.`;
  }
  if (plan === "premium") {
    const added = ["unlimited favorites", ...PLAN_FEATURES.premium.map(inSentence)];
    return `Everything in Basic, plus ${listOf(added)}.`;
  }
  const added = PLAN_FEATURES.pro.filter((feature) => !PLAN_FEATURES.premium.includes(feature));
  return `Everything in Premium, plus ${listOf(added.map(inSentence))}.`;
}
