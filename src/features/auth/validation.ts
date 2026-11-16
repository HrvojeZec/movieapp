import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Please enter a valid email address").min(1, "Email is required"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .max(128, "Password cannot exceed 128 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one lowercase letter, one uppercase letter, and one number",
    ),

  name: z
    .string()
    .min(2, "Name must be at least 2 characters long")
    .max(50, "Name cannot exceed 50 characters")
    .regex(/^[a-zA-ZšđčćžŠĐČĆŽ\s]+$/, "Name can only contain letters and spaces"),
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address").min(1, "Email is required"),

  password: z.string().min(1, "Password is required"),
});
