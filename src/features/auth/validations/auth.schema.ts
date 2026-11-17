import { z } from "zod";
import {
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "@/features/auth/constants";

// Normalized here so every lookup and insert uses the same form of the address
const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Email is required")
  .email("Please enter a valid email address");

export const registerSchema = z.object({
  email: emailSchema,

  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`)
    .max(PASSWORD_MAX_LENGTH, `Password cannot exceed ${PASSWORD_MAX_LENGTH} characters`)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one lowercase letter, one uppercase letter, and one number",
    ),

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
