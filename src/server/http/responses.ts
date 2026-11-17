import { NextResponse } from "next/server";
import type { ApiError, ValidationError } from "@/shared/types/api";

/** Every error response has the `ApiError` shape the client's `toApiError` expects. */
export function jsonError(status: number, message: string, errors?: ValidationError[]) {
  const body: ApiError = errors ? { message, errors } : { message };
  return NextResponse.json(body, { status });
}
