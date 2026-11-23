import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthUser } from "@/entities/user/types";
import { RouteError } from "@/server/http/route-error";

const findAccount = vi.fn();

vi.mock("@/server/db/mongodb", () => ({ default: vi.fn() }));
vi.mock("@/server/models/User", () => ({
  default: {
    findById: (id: unknown, projection: unknown) => ({ lean: () => findAccount(id, projection) }),
  },
}));

const { AUTH_COOKIE_NAME, getSessionUser, requireSession, startSession } =
  await import("@/entities/user/server/session");
const { generateToken, verifyToken } = await import("@/entities/user/server/tokens");

const user: AuthUser = {
  id: "user-1",
  email: "ana@example.com",
  name: "Ana",
  favorites: [],
  watchlist: [],
  trialAvailable: true,
  createdAt: new Date("2026-01-01"),
};
const claims = { userId: user.id, email: user.email, name: user.name };

const requestWithCookie = (token?: string) =>
  new NextRequest("http://localhost/api/test", {
    headers: token ? { cookie: `${AUTH_COOKIE_NAME}=${token}` } : {},
  });

beforeEach(() => {
  vi.stubEnv("JWT_SECRET", "test-secret");
  findAccount.mockReset();
  findAccount.mockResolvedValue({ isActive: true, sessionVersion: 0 });
});

describe("requireSession", () => {
  it("returns the session of a logged-in request", async () => {
    const token = generateToken({ ...claims, sessionVersion: 0 });
    await expect(requireSession(requestWithCookie(token))).resolves.toMatchObject({
      userId: "user-1",
    });
  });

  it.each([
    ["without a cookie", undefined],
    ["with an invalid token", "not-a-jwt"],
  ])("throws a 401 %s, without asking the database", async (_, token) => {
    await expect(requireSession(requestWithCookie(token))).rejects.toThrow(RouteError);
    await expect(requireSession(requestWithCookie(token))).rejects.toThrow("Unauthorized");
    expect(findAccount).not.toHaveBeenCalled();
  });

  it("rejects a session from before the password changed", async () => {
    findAccount.mockResolvedValue({ isActive: true, sessionVersion: 1 });
    const token = generateToken({ ...claims, sessionVersion: 0 });

    await expect(requireSession(requestWithCookie(token))).rejects.toThrow("Unauthorized");
  });

  it("accepts a session issued after the password changed", async () => {
    findAccount.mockResolvedValue({ isActive: true, sessionVersion: 2 });
    const token = generateToken({ ...claims, sessionVersion: 2 });

    await expect(requireSession(requestWithCookie(token))).resolves.toMatchObject({
      userId: "user-1",
    });
  });

  it("keeps sessions issued before versions existed, until the password changes", async () => {
    // A token signed by the previous release has no version, like an account that never changed
    // its password
    const token = jwt.sign(claims, "test-secret", { algorithm: "HS256" });
    findAccount.mockResolvedValue({ isActive: true });
    await expect(requireSession(requestWithCookie(token))).resolves.toMatchObject(claims);

    findAccount.mockResolvedValue({ isActive: true, sessionVersion: 1 });
    await expect(requireSession(requestWithCookie(token))).rejects.toThrow("Unauthorized");
  });

  it.each([
    ["a deleted account", null],
    ["a deactivated account", { isActive: false, sessionVersion: 0 }],
  ])("rejects the session of %s", async (_, account) => {
    findAccount.mockResolvedValue(account);
    const token = generateToken({ ...claims, sessionVersion: 0 });

    await expect(requireSession(requestWithCookie(token))).rejects.toThrow("Unauthorized");
  });

  it("only loads the fields it checks", async () => {
    await requireSession(requestWithCookie(generateToken({ ...claims, sessionVersion: 0 })));
    expect(findAccount).toHaveBeenCalledWith("user-1", { isActive: 1, sessionVersion: 1 });
  });
});

describe("getSessionUser", () => {
  it("is null instead of throwing for a session that has ended", async () => {
    findAccount.mockResolvedValue({ isActive: true, sessionVersion: 1 });
    const token = generateToken({ ...claims, sessionVersion: 0 });

    await expect(getSessionUser(requestWithCookie(token))).resolves.toBeNull();
    await expect(getSessionUser(requestWithCookie())).resolves.toBeNull();
  });
});

describe("startSession", () => {
  it("responds with the user and sets an httpOnly session cookie for that user", async () => {
    const response = startSession(user, 3);

    await expect(response.json()).resolves.toMatchObject({ user: { id: "user-1" } });
    const cookie = response.cookies.get(AUTH_COOKIE_NAME);
    expect(cookie?.httpOnly).toBe(true);
    expect(verifyToken(cookie!.value)).toMatchObject({
      userId: "user-1",
      email: user.email,
      sessionVersion: 3,
    });
  });
});
