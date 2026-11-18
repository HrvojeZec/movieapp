import { NextResponse, after } from "next/server";
import { notifyPasswordChanged, resetPassword } from "@/features/auth/server/password-reset";
import { resetPasswordSchema } from "@/features/auth/validations/auth.schema";
import { getClientIp } from "@/server/http/client-ip";
import { parseJson } from "@/server/http/parse";
import { withRouteHandler } from "@/server/http/route-handler";
import { enforceRateLimit } from "@/server/rate-limit/enforce";

// POST /api/auth/reset-password: sets a new password with the emailed token; 400 if the link is
// invalid, used or expired
export const POST = withRouteHandler("Reset password", async (request) => {
  await enforceRateLimit("resetPassword", getClientIp(request));
  const { token, password } = await parseJson(request, resetPasswordSchema);

  const userId = await resetPassword(token, password);
  // The confirmation email can follow; the new password works from this response on
  after(() => notifyPasswordChanged(userId));
  return NextResponse.json({ message: "Your password is changed. You can log in with it now." });
});
