import connectDB from "@/server/db/mongodb";
import User, { IUser } from "@/server/models/User";
import { logUserActivity } from "@/server/activity";
import type { AuthUser } from "@/types";

export const createUser = async (
  email: string,
  password: string,
  name: string,
): Promise<AuthUser> => {
  await connectDB();

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new Error("User already exists");
  }

  const user = new User({
    email: email.toLowerCase(),
    password,
    name,
    favorites: [],
  });

  await user.save();

  // Activity logging must never fail the registration itself.
  await logUserActivity(user._id.toString(), "register");

  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    favorites: user.favorites,
    createdAt: user.createdAt,
  };
};

export const findUserByEmail = async (email: string): Promise<IUser | null> => {
  await connectDB();
  return User.findOne({ email: email.toLowerCase(), isActive: true });
};

export const findUserById = async (id: string): Promise<AuthUser | null> => {
  await connectDB();
  const user = await User.findById(id);
  if (!user) return null;

  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    favorites: user.favorites,
    stripeCustomerId: user.stripeCustomerId,
    subscriptionStatus: user.subscriptionStatus,
    subscriptionPlan: user.subscriptionPlan,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin,
  };
};

export const updateLastLogin = async (userId: string): Promise<void> => {
  await connectDB();
  await User.findByIdAndUpdate(userId, { lastLogin: new Date() });
};
