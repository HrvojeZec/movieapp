import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "./validation";

const validUser = { email: "ana@example.com", password: "Secret123", name: "Ana Horvat" };

describe("registerSchema", () => {
  it("accepts a valid user", () => {
    expect(registerSchema.safeParse(validUser).success).toBe(true);
  });

  it.each(["ana@firma.info", "ana@studio.studio", "ana.horvat@sub.example.co.uk"])(
    "accepts email %s (longer TLDs used to be rejected by the model)",
    (email) => {
      expect(registerSchema.safeParse({ ...validUser, email }).success).toBe(true);
    },
  );

  it.each(["", "ana", "ana@", "@example.com"])("rejects email %j", (email) => {
    expect(registerSchema.safeParse({ ...validUser, email }).success).toBe(false);
  });

  it.each([
    ["too short", "Ab1"],
    ["no uppercase", "secret123"],
    ["no lowercase", "SECRET123"],
    ["no digit", "SecretPass"],
    ["too long", "Aa1" + "x".repeat(126)],
  ])("rejects a password that is %s", (_, password) => {
    expect(registerSchema.safeParse({ ...validUser, password }).success).toBe(false);
  });

  it("accepts Croatian letters in the name", () => {
    expect(registerSchema.safeParse({ ...validUser, name: "Šime Đurić Čačić" }).success).toBe(true);
  });

  it.each(["A", "Ana123", "Ana<script>", "x".repeat(51)])("rejects name %j", (name) => {
    expect(registerSchema.safeParse({ ...validUser, name }).success).toBe(false);
  });

  it("reports which field is invalid", () => {
    const result = registerSchema.safeParse({ ...validUser, email: "bad" });
    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.path.join("."))).toEqual(["email"]);
  });
});

describe("loginSchema", () => {
  it("accepts any non-empty password (strength is only checked at registration)", () => {
    expect(loginSchema.safeParse({ email: "ana@example.com", password: "x" }).success).toBe(true);
  });

  it("rejects a missing password", () => {
    expect(loginSchema.safeParse({ email: "ana@example.com", password: "" }).success).toBe(false);
  });
});
