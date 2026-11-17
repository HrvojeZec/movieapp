import { NextResponse, type NextRequest } from "next/server";
import { RouteError } from "@/server/http/route-error";
import { HTTP_STATUS } from "@/shared/lib/http-status";
import type { AuthUser } from "@/features/auth/types";
import { TOKEN_TTL_SECONDS, generateToken, verifyToken, type AuthToken } from "./tokens";

export const AUTH_COOKIE_NAME = "token";

// httpOnly keeps the JWT out of reach of client-side scripts (XSS); sameSite=lax stops the
// browser from sending it on cross-site POST/PUT requests (CSRF).
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
} as const;

function setAuthCookie(response: NextResponse, token: string): void {
  response.cookies.set(AUTH_COOKIE_NAME, token, { ...cookieOptions, maxAge: TOKEN_TTL_SECONDS });
}

export function clearAuthCookie(response: NextResponse): void {
  response.cookies.set(AUTH_COOKIE_NAME, "", { ...cookieOptions, maxAge: 0 });
}

/** Returns the verified token payload of the current request, or null if not logged in. */
function getSessionUser(request: NextRequest): AuthToken | null {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  return token ? verifyToken(token) : null;
}

/** The verified session of a request that needs a login; responds with 401 otherwise. */
export function requireSession(request: NextRequest): AuthToken {
  const session = getSessionUser(request);
  if (!session) {
    throw new RouteError(HTTP_STATUS.UNAUTHORIZED, "Unauthorized");
  }
  return session;
}

/** Responds with the user and sets the session cookie (after login or registration). */
export function startSession(user: AuthUser): NextResponse {
  const token = generateToken({ userId: user.id, email: user.email, name: user.name });
  const response = NextResponse.json({ user });
  setAuthCookie(response, token);
  return response;
}
