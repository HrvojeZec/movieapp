import jwt from "jsonwebtoken";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  TOKEN_TTL_SECONDS,
  generateToken,
  verifyToken,
  type AuthToken,
} from "@/features/auth/server/tokens";

const SECRET = "test-secret-with-enough-length-for-hs256";
const payload: AuthToken = {
  userId: "64b000000000000000000001",
  email: "ana@example.com",
  name: "Ana",
};

beforeEach(() => {
  vi.stubEnv("JWT_SECRET", SECRET);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("generateToken / verifyToken", () => {
  it("round-trips the user payload", () => {
    expect(verifyToken(generateToken(payload))).toMatchObject(payload);
  });

  it("signs with HS256 and expires after the configured TTL", () => {
    const decoded = jwt.decode(generateToken(payload), { complete: true });
    expect(decoded?.header.alg).toBe("HS256");
    const claims = decoded?.payload as jwt.JwtPayload;
    expect(claims.exp! - claims.iat!).toBe(TOKEN_TTL_SECONDS);
  });

  it("rejects a token signed with a different secret", () => {
    const forged = jwt.sign(payload, "another-secret", { algorithm: "HS256" });
    expect(verifyToken(forged)).toBeNull();
  });

  it("rejects a tampered token", () => {
    const [header, , signature] = generateToken(payload).split(".");
    const tamperedBody = Buffer.from(JSON.stringify({ ...payload, userId: "admin" })).toString(
      "base64url",
    );
    expect(verifyToken(`${header}.${tamperedBody}.${signature}`)).toBeNull();
  });

  it("rejects an unsigned token (alg: none)", () => {
    const unsigned = jwt.sign(payload, "", { algorithm: "none" });
    expect(verifyToken(unsigned)).toBeNull();
  });

  it("rejects a token signed with another algorithm, even with the right secret", () => {
    const hs512 = jwt.sign(payload, SECRET, { algorithm: "HS512" });
    expect(verifyToken(hs512)).toBeNull();
  });

  it("rejects an expired token", () => {
    vi.useFakeTimers();
    const token = generateToken(payload);
    vi.advanceTimersByTime((TOKEN_TTL_SECONDS + 1) * 1000);
    expect(verifyToken(token)).toBeNull();
  });

  it("rejects malformed input", () => {
    expect(verifyToken("not-a-jwt")).toBeNull();
  });

  it("fails loudly when JWT_SECRET is missing instead of treating every token as invalid", () => {
    vi.stubEnv("JWT_SECRET", undefined);
    expect(() => verifyToken("anything")).toThrow("JWT_SECRET");
    expect(() => generateToken(payload)).toThrow("JWT_SECRET");
  });
});
