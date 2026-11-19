import { describe, expect, it } from "vitest";
import { reorderListSchema } from "@/entities/movie-list/validations/lists.schema";

describe("reorderListSchema", () => {
  it("accepts every movie once", () => {
    expect(reorderListSchema.safeParse({ movieIds: ["680", "550"] }).success).toBe(true);
  });

  it("rejects an order that names a movie twice", () => {
    expect(reorderListSchema.safeParse({ movieIds: ["550", "550"] }).success).toBe(false);
  });

  it("rejects an empty order and IDs that can't be movies", () => {
    expect(reorderListSchema.safeParse({ movieIds: [] }).success).toBe(false);
    expect(reorderListSchema.safeParse({ movieIds: ["abc"] }).success).toBe(false);
  });
});
