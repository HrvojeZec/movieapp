import jwt from "jsonwebtoken";
import connectDB from "../db/mongodb";
import User, { IUser } from "@/models/Users";
import UserActivity, { type ActivityAction } from "@/models/UserActivity";
import { AuthUser } from "@/types";

// Read at call time, not import time, so building the app doesn't require the secret.
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is required");
  }
  return secret;
}

export interface AuthToken {
  userId: string;
  email: string;
  name: string;
}

export const TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

export const generateToken = (user: AuthToken): string => {
  return jwt.sign(user, getJwtSecret(), { algorithm: "HS256", expiresIn: TOKEN_TTL_SECONDS });
};

export const verifyToken = (token: string): AuthToken | null => {
  // Outside the try block: a missing secret is a server misconfiguration, not an invalid token.
  const secret = getJwtSecret();
  try {
    // Pinning the algorithm rejects tokens signed with anything else (e.g. "none").
    return jwt.verify(token, secret, { algorithms: ["HS256"] }) as AuthToken;
  } catch {
    return null;
  }
};

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

// Atomic $addToSet/$pull instead of overwriting the whole array, so concurrent changes
// (e.g. two tabs) can't drop each other's favorites. Returns null if the user doesn't exist.
export const addFavorite = async (userId: string, movieId: string): Promise<string[] | null> => {
  await connectDB();
  const user = await User.findByIdAndUpdate(
    userId,
    { $addToSet: { favorites: movieId } },
    { new: true, projection: { favorites: 1 } },
  );
  return user ? user.favorites : null;
};

export const removeFavorite = async (userId: string, movieId: string): Promise<string[] | null> => {
  await connectDB();
  const user = await User.findByIdAndUpdate(
    userId,
    { $pull: { favorites: movieId } },
    { new: true, projection: { favorites: 1 } },
  );
  return user ? user.favorites : null;
};

export const updateLastLogin = async (userId: string): Promise<void> => {
  await connectDB();
  await User.findByIdAndUpdate(userId, { lastLogin: new Date() });
};

export const logUserActivity = async (
  userId: string,
  action: ActivityAction,
  movieId?: string,
  searchQuery?: string,
  metadata?: Record<string, unknown>,
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
