import { createUser } from "@/features/auth/server/users";
import { startSession } from "@/features/auth/server/session";
import { registerSchema } from "@/features/auth/validations/auth.schema";
import { getClientIp } from "@/server/http/client-ip";
import { parseJson } from "@/server/http/parse";
import { withRouteHandler } from "@/server/http/route-handler";
import { enforceRateLimit } from "@/server/rate-limit/enforce";

export const POST = withRouteHandler("Registration", async (request) => {
  await enforceRateLimit("register", getClientIp(request));
  const { email, password, name } = await parseJson(request, registerSchema);
  return startSession(await createUser(email, password, name));
});
