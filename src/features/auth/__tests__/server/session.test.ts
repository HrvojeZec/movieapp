import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AUTH_COOKIE_NAME, requireSession, startSession } from "@/features/auth/server/session";
import { generateToken, verifyToken } from "@/features/auth/server/tokens";
import type { AuthUser } from "@/features/auth/types";
import { RouteError } from "@/server/http/route-error";

const user: AuthUser = {
  id: "user-1",
  email: "ana@example.com",
  name: "Ana",
  favorites: [],
  createdAt: new Date("2026-01-01"),
};

const requestWithCookie = (token?: string) =>
  new NextRequest("http://localhost/api/test", {
    headers: token ? { cookie: `${AUTH_COOKIE_NAME}=${token}` } : {},
  });

beforeEach(() => {
  vi.stubEnv("JWT_SECRET", "test-secret");
});

describe("requireSession", () => {
  it("returns the session of a logged-in request", () => {
    const token = generateToken({ userId: user.id, email: user.email, name: user.name });
    expect(requireSession(requestWithCookie(token))).toMatchObject({ userId: "user-1" });
  });

  it.each([
    ["without a cookie", undefined],
    ["with an invalid token", "not-a-jwt"],
  ])("throws a 401 %s", (_, token) => {
    expect(() => requireSession(requestWithCookie(token))).toThrow(RouteError);
    expect(() => requireSession(requestWithCookie(token))).toThrow("Unauthorized");
  });
});

describe("startSession", () => {
  it("responds with the user and sets an httpOnly session cookie for that user", async () => {
    const response = startSession(user);

    await expect(response.json()).resolves.toMatchObject({ user: { id: "user-1" } });
    const cookie = response.cookies.get(AUTH_COOKIE_NAME);
    expect(cookie?.httpOnly).toBe(true);
    expect(verifyToken(cookie!.value)).toMatchObject({ userId: "user-1", email: user.email });
  });
});
