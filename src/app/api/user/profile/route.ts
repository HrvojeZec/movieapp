import { NextResponse } from "next/server";
import { findUserById } from "@/entities/user/server/users";
import { requireSession } from "@/entities/user/server/session";
import { notFound } from "@/server/http/route-error";
import { withRouteHandler } from "@/server/http/route-handler";

export const GET = withRouteHandler("Get profile", async (request) => {
  const { userId } = requireSession(request);

  const user = await findUserById(userId);
  if (!user) {
    throw notFound("User");
  }

  return NextResponse.json({ user });
});
