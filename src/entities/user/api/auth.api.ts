import type { AuthUser, Credentials, Registration } from "@/entities/user/types";
import { API_ROUTES } from "@/shared/api-routes";
import { HTTP_STATUS } from "@/shared/lib/http-status";
import { HttpError, fetchJson, postJson } from "@/shared/lib/http";

// Responses that mean "not logged in" rather than "something went wrong": no session, or a
// session for an account that no longer exists
const LOGGED_OUT_STATUSES: ReadonlySet<number> = new Set([
  HTTP_STATUS.UNAUTHORIZED,
  HTTP_STATUS.NOT_FOUND,
]);

/** The auth cookie is httpOnly, so only the server can tell who is logged in. */
export async function fetchCurrentUser(): Promise<AuthUser | null> {
  try {
    const { user } = await fetchJson<{ user: AuthUser }>(API_ROUTES.user.profile);
    return user;
  } catch (error) {
    if (error instanceof HttpError && LOGGED_OUT_STATUSES.has(error.status)) return null;
    throw error;
  }
}

export const login = (credentials: Credentials) =>
  postJson<{ user: AuthUser }>(API_ROUTES.auth.login, credentials);

export const register = (registration: Registration) =>
  postJson<{ user: AuthUser }>(API_ROUTES.auth.register, registration);

export const logout = () => postJson<unknown>(API_ROUTES.auth.logout);

export const requestPasswordReset = (email: string) =>
  postJson<{ message: string }>(API_ROUTES.auth.forgotPassword, { email });

export const resetPassword = (reset: { token: string; password: string }) =>
  postJson<{ message: string }>(API_ROUTES.auth.resetPassword, reset);
