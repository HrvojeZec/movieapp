import { z } from "zod";
import { PAID_PLANS } from "@/features/subscription/plans";

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

export const checkoutSessionSchema = z.object({
  plan: z.enum(PAID_PLANS),
});

export const checkoutSuccessSchema = z.object({
  sessionId: z.string().startsWith("cs_", "Invalid checkout session ID"),
});

// TMDB movie IDs are positive integers; favorites store them as strings.
export const favoriteMovieIdSchema = z.string().regex(/^[1-9]\d{0,9}$/, "Invalid movie ID");

// TMDB only serves pages 1-500
const pageSchema = z.coerce.number().int().min(1).max(500).default(1);

export const MOVIE_LISTS = ["popular", "top_rated", "now_playing", "upcoming"] as const;

export const movieListQuerySchema = z.object({
  list: z.enum(MOVIE_LISTS),
  page: pageSchema,
});

export const movieSearchQuerySchema = z.object({
  query: z.string().trim().min(1).max(100),
  page: pageSchema,
});

export const movieDiscoverQuerySchema = z.object({
  year: z.coerce.number().int().min(1870).max(2100).optional(),
  genre: z.coerce.number().int().positive().optional(),
  minRating: z.coerce.number().min(0).max(10).optional(),
  page: pageSchema,
});

export const movieIdSchema = z.coerce.number().int().positive();
