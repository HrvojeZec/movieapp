import type { NextRequest, NextResponse } from "next/server";
import { TOKEN_TTL_SECONDS, verifyToken, type AuthToken } from "./tokens";

export const AUTH_COOKIE_NAME = "token";

// httpOnly keeps the JWT out of reach of client-side scripts (XSS); sameSite=lax stops the
// browser from sending it on cross-site POST/PUT requests (CSRF).
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
} as const;

export function setAuthCookie(response: NextResponse, token: string): void {
  response.cookies.set(AUTH_COOKIE_NAME, token, { ...cookieOptions, maxAge: TOKEN_TTL_SECONDS });
}

export function clearAuthCookie(response: NextResponse): void {
  response.cookies.set(AUTH_COOKIE_NAME, "", { ...cookieOptions, maxAge: 0 });
}

/** Returns the verified token payload of the current request, or null if not logged in. */
export function getSessionUser(request: NextRequest): AuthToken | null {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  return token ? verifyToken(token) : null;
}
