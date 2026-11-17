import { describe, expect, it } from "vitest";
import {
  addFavoriteSchema,
  favoriteMovieIdSchema,
} from "@/features/favorites/validations/favorites.schema";

describe("favoriteMovieIdSchema", () => {
  it.each(["1", "550", "1234567890"])("accepts %s", (id) => {
    expect(favoriteMovieIdSchema.safeParse(id).success).toBe(true);
  });

  it.each(["", "0", "0550", "-1", "1.5", "abc", "12345678901", "550; drop"])("rejects %j", (id) => {
    expect(favoriteMovieIdSchema.safeParse(id).success).toBe(false);
  });
});

describe("addFavoriteSchema", () => {
  it("requires a valid movieId in the body", () => {
    expect(addFavoriteSchema.safeParse({ movieId: "550" }).success).toBe(true);
    expect(addFavoriteSchema.safeParse({ movieId: 550 }).success).toBe(false);
    expect(addFavoriteSchema.safeParse({}).success).toBe(false);
  });
});
