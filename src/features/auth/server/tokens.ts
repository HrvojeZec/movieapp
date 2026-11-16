import jwt from "jsonwebtoken";

// Read at call time, not import time, so building the app doesn't require the secret.
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is required");
  }
  return secret;
}

export interface AuthToken {
  userId: string;
  email: string;
  name: string;
}

export const TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

export const generateToken = (user: AuthToken): string => {
  return jwt.sign(user, getJwtSecret(), { algorithm: "HS256", expiresIn: TOKEN_TTL_SECONDS });
};

export const verifyToken = (token: string): AuthToken | null => {
  // Outside the try block: a missing secret is a server misconfiguration, not an invalid token.
  const secret = getJwtSecret();
  try {
    // Pinning the algorithm rejects tokens signed with anything else (e.g. "none").
    return jwt.verify(token, secret, { algorithms: ["HS256"] }) as AuthToken;
  } catch {
    return null;
  }
};
