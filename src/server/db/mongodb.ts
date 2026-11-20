import mongoose from "mongoose";
import { requireEnv } from "@/server/env";
import { SECOND_MS } from "@/shared/lib/time";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

// Cached on globalThis so hot reloads in development and warm serverless invocations
// reuse one connection instead of opening a new pool on every request.
// Small pool for serverless; fail fast if the cluster is unreachable instead of hanging the request.
const CONNECTION_OPTIONS = {
  bufferCommands: false,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5 * SECOND_MS,
  socketTimeoutMS: 45 * SECOND_MS,
  family: 4,
} satisfies mongoose.ConnectOptions;

const cached: MongooseCache = (global.mongoose ??= { conn: null, promise: null });

async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(requireEnv("MONGODB_URI"), CONNECTION_OPTIONS);
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export default connectDB;
