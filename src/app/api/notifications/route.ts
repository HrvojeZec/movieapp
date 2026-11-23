import { NextResponse } from "next/server";
import { requireSession } from "@/entities/user/server/session";
import { listNotifications } from "@/entities/notification/server/notifications";
import { withRouteHandler } from "@/server/http/route-handler";

// GET /api/notifications: the latest notifications for the bell, plus the unread count
export const GET = withRouteHandler("List notifications", async (request) => {
  const { userId } = await requireSession(request);
  return NextResponse.json(await listNotifications(userId), {
    headers: { "Cache-Control": "private, no-store" },
  });
});
