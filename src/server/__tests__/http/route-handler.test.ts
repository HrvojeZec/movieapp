import mongoose from "mongoose";
import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";
import { RouteError } from "@/server/http/route-error";
import { withRouteHandler } from "@/server/http/route-handler";

const request = new NextRequest("http://localhost/api/test");

const respond = (error: unknown) =>
  withRouteHandler("Test", async () => {
    throw error;
  })(request, undefined);

describe("withRouteHandler", () => {
  it("passes successful responses through", async () => {
    const handler = withRouteHandler("Test", async () => Response.json({ ok: true }));
    const response = await handler(request, undefined);
    await expect(response.json()).resolves.toEqual({ ok: true });
  });

  it("passes the route context to the handler", async () => {
    const handler = withRouteHandler("Test", async (_request, context: { id: string }) =>
      Response.json(context),
    );
    const response = await handler(request, { id: "550" });
    await expect(response.json()).resolves.toEqual({ id: "550" });
  });

  it("turns a RouteError into its status, message and field errors", async () => {
    const errors = [{ field: "email", message: "Invalid email" }];
    const response = await respond(new RouteError(400, "Validation failed", errors));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ message: "Validation failed", errors });
  });

  it("omits the errors field when there are none", async () => {
    const response = await respond(new RouteError(401, "Unauthorized"));
    await expect(response.json()).resolves.toEqual({ message: "Unauthorized" });
  });

  it("maps Mongoose validation errors to a 400 with field errors", async () => {
    const error = new mongoose.Error.ValidationError();
    error.addError(
      "name",
      new mongoose.Error.ValidatorError({ path: "name", message: "Too long" }),
    );

    const response = await respond(error);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      message: "Database validation failed",
      errors: [{ field: "name", message: "Too long" }],
    });
  });

  it("logs unexpected errors and hides their details", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    const response = await respond(new Error("connection string with a password"));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ message: "Internal server error" });
    expect(consoleError).toHaveBeenCalledWith("Test error:", expect.any(Error));
  });
});
