import jwt from "jsonwebtoken";
import { requireEnv } from "@/server/env";
import { DAY_IN_SECONDS } from "@/shared/lib/time";

const JWT_ALGORITHM = "HS256";

const getJwtSecret = () => requireEnv("JWT_SECRET");

export interface AuthToken {
  userId: string;
  email: string;
  name: string;
}

export const TOKEN_TTL_SECONDS = 7 * DAY_IN_SECONDS;

export const generateToken = (user: AuthToken): string => {
  return jwt.sign(user, getJwtSecret(), { algorithm: JWT_ALGORITHM, expiresIn: TOKEN_TTL_SECONDS });
};

export const verifyToken = (token: string): AuthToken | null => {
  // Outside the try block: a missing secret is a server misconfiguration, not an invalid token.
  const secret = getJwtSecret();
  try {
    // Pinning the algorithm rejects tokens signed with anything else (e.g. "none").
    return jwt.verify(token, secret, { algorithms: [JWT_ALGORITHM] }) as AuthToken;
  } catch {
    return null;
  }
};
