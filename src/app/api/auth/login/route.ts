import { findUserByEmail, recordLogin } from "@/features/auth/server/users";
import { startSession } from "@/features/auth/server/session";
import { loginSchema } from "@/features/auth/validations/auth.schema";
import { getClientIp } from "@/server/http/client-ip";
import { parseJson } from "@/server/http/parse";
import { RouteError } from "@/server/http/route-error";
import { HTTP_STATUS } from "@/shared/lib/http-status";
import { withRouteHandler } from "@/server/http/route-handler";
import { enforceRateLimit } from "@/server/rate-limit/enforce";

export const POST = withRouteHandler("Login", async (request) => {
  const { email, password } = await parseJson(request, loginSchema);
  await enforceRateLimit("login", `${getClientIp(request)}:${email}`);

  const user = await findUserByEmail(email);
  // The same answer for an unknown email and a wrong password, so accounts can't be enumerated
  if (!user || !(await user.comparePassword(password))) {
    throw new RouteError(HTTP_STATUS.UNAUTHORIZED, "Invalid credentials");
  }

  // Same shape as /api/user/profile, so subscription details are available right after login
  return startSession(await recordLogin(user));
});
