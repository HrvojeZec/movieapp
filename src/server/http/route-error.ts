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
