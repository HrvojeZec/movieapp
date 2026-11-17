import { HTTP_STATUS } from "@/shared/lib/http-status";
import type { ValidationError } from "@/shared/types/api";

/**
 * An expected failure with a status and a message that is safe to show to the client.
 * Thrown from route handlers and server modules; `withRouteHandler` turns it into a response.
 */
export class RouteError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly errors?: ValidationError[],
  ) {
    super(message);
    this.name = "RouteError";
  }
}

/** e.g. notFound("User") → 404 "User not found" */
export const notFound = (resource: string) =>
  new RouteError(HTTP_STATUS.NOT_FOUND, `${resource} not found`);
