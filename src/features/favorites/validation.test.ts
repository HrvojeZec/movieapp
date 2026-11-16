import { describe, expect, it } from "vitest";
import { favoriteMovieIdSchema } from "./validation";

describe("favoriteMovieIdSchema", () => {
  it.each(["1", "550", "1234567890"])("accepts %s", (id) => {
    expect(favoriteMovieIdSchema.safeParse(id).success).toBe(true);
  });

  it.each(["", "0", "0550", "-1", "1.5", "abc", "12345678901", "550; drop"])("rejects %j", (id) => {
    expect(favoriteMovieIdSchema.safeParse(id).success).toBe(false);
  });
});
