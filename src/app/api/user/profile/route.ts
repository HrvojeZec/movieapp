import { NextResponse } from "next/server";
import { findUserById } from "@/features/auth/server/users";
import { requireSession } from "@/features/auth/server/session";
import { RouteError } from "@/server/http/route-error";
import { withRouteHandler } from "@/server/http/route-handler";

export const GET = withRouteHandler("Get profile", async (request) => {
  const { userId } = requireSession(request);

  const user = await findUserById(userId);
  if (!user) {
    throw new RouteError(404, "User not found");
  }

  return NextResponse.json({ user });
});
