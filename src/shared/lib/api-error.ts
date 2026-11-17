import { HttpError } from "@/shared/lib/http";
import type { ApiError } from "@/shared/types/api";

const UNEXPECTED_ERROR: ApiError = { message: "An unexpected error occurred" };

/** Narrows any thrown error to the `{ message, errors }` shape our API routes return. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof HttpError) {
    const body = error.body as Partial<ApiError> | undefined;
    return {
      message: error.message,
      errors: Array.isArray(body?.errors) ? body.errors : undefined,
    };
  }
  return UNEXPECTED_ERROR;
}
