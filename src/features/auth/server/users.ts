import connectDB from "@/server/db/mongodb";
import User, { type IUser } from "@/server/models/User";
import { logUserActivity } from "@/server/activity";
import { RouteError } from "@/server/http/route-error";
import { HTTP_STATUS } from "@/shared/lib/http-status";
import type { AuthUser } from "@/features/auth/types";
import { isPaidPlan } from "@/features/subscription/lib/plans";

// Emails reach these functions already normalized (trimmed, lowercase) by the zod schemas.

function toSubscriptionDetails(user: IUser): AuthUser["subscription"] {
  if (!isPaidPlan(user.subscriptionPlan) || !user.currentPeriodEnd) return undefined;
  return {
    interval: user.subscriptionInterval ?? "month",
    currentPeriodEnd: user.currentPeriodEnd.toISOString(),
    cancelAt: user.cancelAt?.toISOString() ?? null,
    trialEnd: user.trialEnd?.toISOString() ?? null,
  };
}

/** The public shape of a user: never includes the password hash. */
export function toAuthUser(user: IUser): AuthUser {
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    favorites: user.favorites,
    // Accounts created before the watchlist existed have no field yet
    watchlist: user.watchlist ?? [],
    stripeCustomerId: user.stripeCustomerId,
    subscriptionStatus: user.subscriptionStatus,
    subscriptionPlan: user.subscriptionPlan,
    subscription: toSubscriptionDetails(user),
    createdAt: user.createdAt,
    lastLogin: user.lastLogin,
  };
}

export const createUser = async (
  email: string,
  password: string,
  name: string,
): Promise<AuthUser> => {
  await connectDB();

  if (await User.exists({ email })) {
    throw new RouteError(HTTP_STATUS.CONFLICT, "User already exists");
  }

  const user = await User.create({ email, password, name, favorites: [] });

  // Activity logging must never fail the registration itself.
  await logUserActivity(user._id.toString(), "register");

  return toAuthUser(user);
};

export const findUserByEmail = async (email: string): Promise<IUser | null> => {
  await connectDB();
  return User.findOne({ email, isActive: true });
};

export const findUserById = async (id: string): Promise<AuthUser | null> => {
  await connectDB();
  const user = await User.findById(id);
  return user ? toAuthUser(user) : null;
};

/** Stores the login time and returns the user as the login response shows it. */
export const recordLogin = async (user: IUser): Promise<AuthUser> => {
  await connectDB();
  user.lastLogin = new Date();
  // updateOne instead of save(): only this field changes, so the rest of the document isn't revalidated
  await User.updateOne({ _id: user._id }, { lastLogin: user.lastLogin });
  return toAuthUser(user);
};
