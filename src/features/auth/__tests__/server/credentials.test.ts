import bcrypt from "bcryptjs";
import { beforeEach, describe, expect, it, vi } from "vitest";

const findOne = vi.fn();

vi.mock("@/server/db/mongodb", () => ({ default: vi.fn() }));
vi.mock("@/server/models/User", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/server/models/User")>();
  return { ...actual, default: { findOne: (...args: unknown[]) => findOne(...args) } };
});

const { BCRYPT_SALT_ROUNDS } = await import("@/server/models/User");
const { DUMMY_PASSWORD_HASH, verifyCredentials } = await import("@/features/auth/server/users");

describe("verifyCredentials", () => {
  beforeEach(() => {
    findOne.mockReset();
  });

  it("returns the user for the right password", async () => {
    const user = { comparePassword: vi.fn().mockResolvedValue(true) };
    findOne.mockResolvedValue(user);

    await expect(verifyCredentials("ana@example.com", "secret1")).resolves.toBe(user);
    expect(findOne).toHaveBeenCalledWith({ email: "ana@example.com", isActive: true });
  });

  it("returns null for a wrong password", async () => {
    findOne.mockResolvedValue({ comparePassword: vi.fn().mockResolvedValue(false) });

    await expect(verifyCredentials("ana@example.com", "wrong")).resolves.toBeNull();
  });

  it("an unknown email still checks a password, so it answers as slowly as a wrong one", async () => {
    findOne.mockResolvedValue(null);
    const compare = vi.spyOn(bcrypt, "compare");

    await expect(verifyCredentials("nobody@example.com", "secret1")).resolves.toBeNull();
    expect(compare).toHaveBeenCalledWith("secret1", DUMMY_PASSWORD_HASH);
    compare.mockRestore();
  });

  it("the stand-in hash costs as much as the stored ones", () => {
    expect(DUMMY_PASSWORD_HASH.split("$")[2]).toBe(String(BCRYPT_SALT_ROUNDS));
  });
});
