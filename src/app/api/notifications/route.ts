import { NextResponse } from "next/server";
import { requireSession } from "@/features/auth/server/session";
import { listNotifications } from "@/features/notifications/server/notifications";
import { withRouteHandler } from "@/server/http/route-handler";

// GET /api/notifications: the latest notifications for the bell, plus the unread count
export const GET = withRouteHandler("List notifications", async (request) => {
  const { userId } = requireSession(request);
  return NextResponse.json(await listNotifications(userId), {
    headers: { "Cache-Control": "private, no-store" },
  });
});
