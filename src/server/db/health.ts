import connectDB from "./mongodb";

/** True when MongoDB answers a ping. Never throws: the health check reports, it doesn't crash. */
export async function pingDatabase(): Promise<boolean> {
  try {
    const { connection } = await connectDB();
    if (!connection.db) return false;
    await connection.db.admin().ping();
    return true;
  } catch (error) {
    console.error("Health check: database unreachable:", error);
    return false;
  }
}
