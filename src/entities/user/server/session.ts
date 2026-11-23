import { NextResponse, type NextRequest } from "next/server";
import connectDB from "@/server/db/mongodb";
import User from "@/server/models/User";
import { RouteError } from "@/server/http/route-error";
import { HTTP_STATUS } from "@/shared/lib/http-status";
import type { AuthUser } from "@/entities/user/types";
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

/**
 * A signed token alone stays valid for days, so it is also checked against the account: one
 * that was deleted or deactivated, or whose password changed since (a stolen cookie, say), no
 * longer counts as logged in.
 */
async function isSessionCurrent(session: AuthToken): Promise<boolean> {
  await connectDB();
  const account = await User.findById(session.userId, { isActive: 1, sessionVersion: 1 }).lean();
  return (
    account != null &&
    account.isActive !== false &&
    (account.sessionVersion ?? 0) === (session.sessionVersion ?? 0)
  );
}

/** Returns the verified session of the current request, or null if not logged in. */
export async function getSessionUser(request: NextRequest): Promise<AuthToken | null> {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = token ? verifyToken(token) : null;
  return session && (await isSessionCurrent(session)) ? session : null;
}

/** The verified session of a request that needs a login; responds with 401 otherwise. */
export async function requireSession(request: NextRequest): Promise<AuthToken> {
  const session = await getSessionUser(request);
  if (!session) {
    throw new RouteError(HTTP_STATUS.UNAUTHORIZED, "Unauthorized");
  }
  return session;
}

/**
 * Responds with the user and sets the session cookie (after login or registration). A new
 * account starts at session version 0.
 */
export function startSession(user: AuthUser, sessionVersion = 0): NextResponse {
  const token = generateToken({
    userId: user.id,
    email: user.email,
    name: user.name,
    sessionVersion,
  });
  const response = NextResponse.json({ user });
  setAuthCookie(response, token);
  return response;
}
