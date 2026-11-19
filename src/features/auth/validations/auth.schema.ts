import { z } from "zod";
import {
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PASSWORD_RESET_TOKEN_BYTES,
} from "@/entities/user/constants";

// Normalized here so every lookup and insert uses the same form of the address
const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Email is required")
  .email("Please enter a valid email address");

// The rules for a new password, at sign-up and when resetting it
const newPasswordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`)
  .max(PASSWORD_MAX_LENGTH, `Password cannot exceed ${PASSWORD_MAX_LENGTH} characters`)
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Password must contain at least one lowercase letter, one uppercase letter, and one number",
  );

const INVALID_RESET_LINK = "This reset link is invalid or has expired";

export const registerSchema = z.object({
  email: emailSchema,

  password: newPasswordSchema,

  name: z
    .string()
    .min(NAME_MIN_LENGTH, `Name must be at least ${NAME_MIN_LENGTH} characters long`)
    .max(NAME_MAX_LENGTH, `Name cannot exceed ${NAME_MAX_LENGTH} characters`)
    .regex(/^[a-zA-ZšđčćžŠĐČĆŽ\s]+$/, "Name can only contain letters and spaces"),
});

export const loginSchema = z.object({
  email: emailSchema,

  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({ email: emailSchema });

export const resetPasswordSchema = z.object({
  // The emailed token: PASSWORD_RESET_TOKEN_BYTES random bytes as hex
  token: z
    .string()
    .length(PASSWORD_RESET_TOKEN_BYTES * 2, INVALID_RESET_LINK)
    .regex(/^[a-f\d]+$/, INVALID_RESET_LINK),
  password: newPasswordSchema,
});
