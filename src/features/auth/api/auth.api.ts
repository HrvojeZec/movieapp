import { HttpError, fetchJson } from "@/shared/lib/http";
import type { AuthUser } from "@/features/auth/types";

/** The auth cookie is httpOnly, so only the server can tell who is logged in. */
export async function fetchCurrentUser(): Promise<AuthUser | null> {
  try {
    const { user } = await fetchJson<{ user: AuthUser }>("/api/user/profile");
    return user;
  } catch (error) {
    // No session (401) or a session for a deleted account (404) both mean "logged out"
    if (error instanceof HttpError && (error.status === 401 || error.status === 404)) return null;
    throw error;
  }
}
