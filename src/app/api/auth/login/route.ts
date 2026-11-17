import { findUserByEmail, recordLogin } from "@/features/auth/server/users";
import { startSession } from "@/features/auth/server/session";
import { loginSchema } from "@/features/auth/validations/auth.schema";
import { parseJson } from "@/server/http/parse";
import { RouteError } from "@/server/http/route-error";
import { withRouteHandler } from "@/server/http/route-handler";

export const POST = withRouteHandler("Login", async (request) => {
  const { email, password } = await parseJson(request, loginSchema);

  const user = await findUserByEmail(email);
  // The same answer for an unknown email and a wrong password, so accounts can't be enumerated
  if (!user || !(await user.comparePassword(password))) {
    throw new RouteError(401, "Invalid credentials");
  }

  // Same shape as /api/user/profile, so subscription details are available right after login
  return startSession(await recordLogin(user));
});
