import mongoose from "mongoose";
import { E2E_EMAIL_PATTERN } from "./helpers";

// Removes the users (and their activity) created by the tests from the E2E database.
export default async function globalTeardown() {
  const uri = process.env.E2E_MONGODB_URI;
  if (!uri) return;

  const connection = await mongoose.createConnection(uri).asPromise();
  try {
    const users = connection.collection("users");
    const testUsers = await users
      .find({ email: E2E_EMAIL_PATTERN }, { projection: { _id: 1 } })
      .toArray();
    const ids = testUsers.map((user) => user._id);

    if (ids.length > 0) {
      await connection.collection("useractivities").deleteMany({ userId: { $in: ids } });
      await users.deleteMany({ _id: { $in: ids } });
    }
    console.log(`E2E teardown: removed ${ids.length} test user(s)`);
  } finally {
    await connection.close();
  }
}
