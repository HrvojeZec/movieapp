import { describe, expect, it } from "vitest";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/features/auth/validations/auth.schema";

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

describe("email normalization", () => {
  it.each([registerSchema, loginSchema])("trims and lowercases the email", (schema) => {
    const parsed = schema.parse({ ...validUser, email: "  Ana@Example.COM " });
    expect(parsed.email).toBe("ana@example.com");
  });
});

describe("forgotPasswordSchema", () => {
  it("normalizes the email like login does", () => {
    expect(forgotPasswordSchema.parse({ email: " Ana@Example.com " })).toEqual({
      email: "ana@example.com",
    });
  });

  it("rejects a missing email", () => {
    expect(forgotPasswordSchema.safeParse({ email: "" }).success).toBe(false);
  });
});

describe("resetPasswordSchema", () => {
  const token = "a1".repeat(32);

  it("accepts a reset token and a strong password", () => {
    expect(resetPasswordSchema.safeParse({ token, password: "NewPass123" }).success).toBe(true);
  });

  it("uses the same password rules as registration", () => {
    expect(resetPasswordSchema.safeParse({ token, password: "weak" }).success).toBe(false);
    expect(resetPasswordSchema.safeParse({ token, password: "alllowercase1" }).success).toBe(false);
  });

  it.each(["", "abc", "z".repeat(64)])("rejects a malformed token (%j)", (bad) => {
    expect(resetPasswordSchema.safeParse({ token: bad, password: "NewPass123" }).success).toBe(
      false,
    );
  });
});
