import { createUser } from "@/features/auth/server/users";
import { startSession } from "@/features/auth/server/session";
import { registerSchema } from "@/features/auth/validations/auth.schema";
import { parseJson } from "@/server/http/parse";
import { withRouteHandler } from "@/server/http/route-handler";

export const POST = withRouteHandler("Registration", async (request) => {
  const { email, password, name } = await parseJson(request, registerSchema);
  return startSession(await createUser(email, password, name));
});
