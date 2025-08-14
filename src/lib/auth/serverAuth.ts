import jwt from "jsonwebtoken";
import connectDB from "../db/mongodb";
import User, { IUser } from "@/models/Users";
import UserActivity from "@/models/Users";
import { AuthUser } from "@/types";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

export interface AuthToken {
  userId: string;
  email: string;
  name: string;
}

export const generateToken = (user: AuthToken): string => {
  return jwt.sign(user, JWT_SECRET, { expiresIn: "7d" });
};

export const verifyToken = (token: string): AuthToken | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthToken;
  } catch {
    return null;
  }
};

export const createUser = async (
  email: string,
  password: string,
  name: string
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
    watchlist: [],
  });

  await user.save();

  await UserActivity.create({
    userId: user._id,
    action: "view",
    metadata: { type: "registration" },
  });

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

export const updateUserFavorites = async (
  userId: string,
  favorites: string[]
): Promise<AuthUser | null> => {
  await connectDB();
  const user = await User.findByIdAndUpdate(
    userId,
    { favorites },
    { new: true }
  );

  if (!user) return null;

  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    favorites: user.favorites,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin,
  };
};

export const updateLastLogin = async (userId: string): Promise<void> => {
  await connectDB();
  await User.findByIdAndUpdate(userId, { lastLogin: new Date() });
};

export const updateUserStripeInfo = async (
  userId: string,
  stripeCustomerId: string,
  subscriptionStatus: string,
  subscriptionPlan: string
): Promise<AuthUser | null> => {
  await connectDB();
  const user = await User.findByIdAndUpdate(
    userId,
    {
      stripeCustomerId,
      subscriptionStatus,
      subscriptionPlan,
    },
    { new: true }
  );

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
export const logUserActivity = async (
  userId: string,
  action: "view" | "favorite" | "unfavorite" | "review" | "search",
  movieId?: string,
  searchQuery?: string,
  metadata?: Record<string, any>
): Promise<void> => {
  try {
    await connectDB();
    await UserActivity.create({
      userId,
      action,
      movieId,
      searchQuery,
      metadata,
    });
  } catch (error) {
    console.error("Failed to log user activity:", error);
  }
};
