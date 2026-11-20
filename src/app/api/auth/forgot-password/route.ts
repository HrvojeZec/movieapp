import { NextResponse, after } from "next/server";
import { requestPasswordReset } from "@/features/auth/server/password-reset";
import { forgotPasswordSchema } from "@/features/auth/validations/auth.schema";
import { getClientIp } from "@/server/http/client-ip";
import { parseJson } from "@/server/http/parse";
import { withRouteHandler } from "@/server/http/route-handler";
import { enforceRateLimit } from "@/server/rate-limit/enforce";

// The same answer whether or not the address has an account, so it can't be used to look them up
const SENT_MESSAGE = "If an account exists for that email, a reset link is on its way.";

// POST /api/auth/forgot-password: emails a one-time reset link (valid for 1 hour)
export const POST = withRouteHandler("Forgot password", async (request) => {
  const { email } = await parseJson(request, forgotPasswordSchema);
  await enforceRateLimit("forgotPassword", `${getClientIp(request)}:${email}`);

  // After the response: an existing account (lookup, token, email) would otherwise answer slower
  // than an unknown address, and the timing alone would tell who has an account
  after(async () => {
    try {
      await requestPasswordReset(email);
    } catch (error) {
      console.error("Password reset request failed:", error);
    }
  });
  return NextResponse.json({ message: SENT_MESSAGE });
});
