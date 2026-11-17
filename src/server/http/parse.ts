import type { z } from "zod";
import { RouteError } from "./route-error";

export const VALIDATION_FAILED = "Validation failed";

/** Validates any input (route params, query values) and throws a 400 with field errors. */
export function parseWith<T extends z.ZodType>(
  schema: T,
  data: unknown,
  message = VALIDATION_FAILED,
): z.infer<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    throw new RouteError(400, message, errors);
  }
  return result.data;
}

/** Reads and validates a JSON body; a malformed body is a 400, not a server error. */
export async function parseJson<T extends z.ZodType>(
  request: Request,
  schema: T,
  message = VALIDATION_FAILED,
): Promise<z.infer<T>> {
  const body: unknown = await request.json().catch(() => null);
  return parseWith(schema, body, message);
}
