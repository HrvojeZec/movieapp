import { describe, expect, it } from "vitest";
import { z } from "zod";
import { parseJson, parseWith } from "@/server/http/parse";
import { RouteError } from "@/server/http/route-error";

const schema = z.object({ email: z.string().email("Invalid email"), age: z.number().int() });

const jsonRequest = (body: string) =>
  new Request("http://localhost/api/test", { method: "POST", body });

describe("parseWith", () => {
  it("returns the parsed data", () => {
    expect(parseWith(schema, { email: "ana@example.com", age: 30 })).toEqual({
      email: "ana@example.com",
      age: 30,
    });
  });

  it("throws a 400 RouteError with one entry per invalid field", () => {
    const error = (() => {
      try {
        parseWith(schema, { email: "nope", age: 1.5 });
      } catch (e) {
        return e;
      }
    })();

    expect(error).toBeInstanceOf(RouteError);
    expect(error).toMatchObject({
      status: 400,
      message: "Validation failed",
      errors: [
        { field: "email", message: "Invalid email" },
        { field: "age", message: expect.any(String) },
      ],
    });
  });

  it("uses a custom message", () => {
    expect(() => parseWith(z.string(), 1, "Invalid movie ID")).toThrow("Invalid movie ID");
  });
});

describe("parseJson", () => {
  it("parses and validates a JSON body", async () => {
    const request = jsonRequest(JSON.stringify({ email: "ana@example.com", age: 30 }));
    await expect(parseJson(request, schema)).resolves.toMatchObject({ age: 30 });
  });

  it("treats a malformed body as a validation error, not a server error", async () => {
    await expect(parseJson(jsonRequest("{not json"), schema)).rejects.toMatchObject({
      status: 400,
    });
  });
});
