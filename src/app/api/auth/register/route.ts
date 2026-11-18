import { after } from "next/server";
import { createUser } from "@/features/auth/server/users";
import { startSession } from "@/features/auth/server/session";
import { getWelcomeNotification } from "@/features/notifications/lib/account-events";
import { notifyUser } from "@/features/notifications/server/notify";
import { registerSchema } from "@/features/auth/validations/auth.schema";
import { getClientIp } from "@/server/http/client-ip";
import { parseJson } from "@/server/http/parse";
import { withRouteHandler } from "@/server/http/route-handler";
import { enforceRateLimit } from "@/server/rate-limit/enforce";

export const POST = withRouteHandler("Registration", async (request) => {
  await enforceRateLimit("register", getClientIp(request));
  const { email, password, name } = await parseJson(request, registerSchema);
  const user = await createUser(email, password, name);

  // After the response: the new user shouldn't wait for the welcome email to be sent
  after(async () => {
    try {
      await notifyUser(user.id, getWelcomeNotification(), { email: true });
    } catch (error) {
      console.error("Welcome notification failed:", error);
    }
  });

  return startSession(user);
});
