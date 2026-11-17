import mongoose from "mongoose";
import type { NextRequest } from "next/server";
import { HTTP_STATUS } from "@/shared/lib/http-status";
import { jsonError } from "./responses";
import { RouteError } from "./route-error";

type Handler<TContext> = (request: NextRequest, context: TContext) => Promise<Response>;

/**
 * Wraps a route handler so it can throw instead of building error responses: `RouteError`s become
 * their status and message, anything unexpected is logged and hidden behind a generic 500.
 */
export function withRouteHandler<TContext>(name: string, handler: Handler<TContext>) {
  return async (request: NextRequest, context: TContext): Promise<Response> => {
    try {
      return await handler(request, context);
    } catch (error) {
      return toErrorResponse(error, name);
    }
  };
}

function toErrorResponse(error: unknown, name: string): Response {
  if (error instanceof RouteError) {
    return jsonError(error.status, error.message, error.errors);
  }

  // The zod schemas should catch invalid data first; this is the last line of defense.
  if (error instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(error.errors).map((err) => ({
      field: err.path,
      message: err.message,
    }));
    return jsonError(HTTP_STATUS.BAD_REQUEST, "Database validation failed", errors);
  }

  console.error(`${name} error:`, error);
  return jsonError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Internal server error");
}
