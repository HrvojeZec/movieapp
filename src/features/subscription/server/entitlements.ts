import connectDB from "@/server/db/mongodb";
import User, { type IUser } from "@/server/models/User";
import { RouteError, notFound } from "@/server/http/route-error";
import { HTTP_STATUS } from "@/shared/lib/http-status";
import {
  featureRequirementMessage,
  getEffectivePlan,
  hasFeature,
} from "@/features/subscription/lib/entitlements";
import type { Feature } from "@/features/subscription/types";

/**
 * Loads the user and checks that their current plan includes the feature: 403 with the plan it
 * needs otherwise. Hiding a button in the UI is not protection; every premium route calls this.
 */
export async function requireFeature(userId: string, feature: Feature): Promise<IUser> {
  await connectDB();
  const user = await User.findById(userId);
  if (!user) throw notFound("User");

  if (!hasFeature(getEffectivePlan(user), feature)) {
    throw new RouteError(HTTP_STATUS.FORBIDDEN, featureRequirementMessage(feature));
  }
  return user;
}
