import { describe, expect, it } from "vitest";
import { toAuthUser } from "@/features/auth/server/users";
import User from "@/server/models/User";

describe("toAuthUser", () => {
  it("maps a user document to the public shape without the password hash", () => {
    const doc = new User({
      email: "ana@example.com",
      password: "$2b$12$hash",
      name: "Ana",
      favorites: ["550"],
      stripeCustomerId: "cus_123",
    });

    const user = toAuthUser(doc);

    expect(user).toMatchObject({
      id: doc._id.toString(),
      email: "ana@example.com",
      name: "Ana",
      favorites: ["550"],
      stripeCustomerId: "cus_123",
      subscriptionStatus: "free",
      subscriptionPlan: "basic",
    });
    expect(user).not.toHaveProperty("password");
  });
});
