import { HOUR_MS } from "@/shared/lib/time";

// Shared by the zod schemas and the User model, so both always enforce the same limits
export const PASSWORD_MIN_LENGTH = 6;
// bcrypt only reads the first 72 bytes; anything after them would be silently ignored
export const PASSWORD_MAX_LENGTH = 72;
export const PASSWORD_MAX_BYTES = 72;
export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 50;

// A password reset link works once and only for this long
export const PASSWORD_RESET_TTL_MS = HOUR_MS;
// Random bytes in a reset token (sent as 64 hex characters); only its SHA-256 hash is stored
export const PASSWORD_RESET_TOKEN_BYTES = 32;
