import mongoose, { type Connection } from "mongoose";

let connection: Promise<Connection> | null = null;

/**
 * One connection to the E2E database per test worker, shared by the helpers that seed or read
 * data. Opening one per call (or per poll) flooded the small Atlas cluster with handshakes, which
 * slowed the app's own queries during the run.
 */
export function getE2EDatabase(): Promise<Connection> {
  const uri = process.env.E2E_MONGODB_URI;
  if (!uri) throw new Error("E2E_MONGODB_URI is required to seed or read test data");

  connection ??= mongoose.createConnection(uri).asPromise();
  return connection;
}
