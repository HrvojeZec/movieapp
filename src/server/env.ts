/**
 * Reads a required environment variable at call time, not import time, so `next build` and tests
 * that never touch the feature don't need the secret.
 */
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} environment variable is required`);
  }
  return value;
}
