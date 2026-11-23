import { NextResponse } from "next/server";
import { requireSession } from "@/entities/user/server/session";
import { markNotificationsRead } from "@/entities/notification/server/notifications";
import { markReadSchema } from "@/entities/notification/validations/notifications.schema";
import { parseJson } from "@/server/http/parse";
import { withRouteHandler } from "@/server/http/route-handler";

// POST /api/notifications/read: { ids } or { all: true }; answers with the remaining unread count
export const POST = withRouteHandler("Mark notifications read", async (request) => {
  const { userId } = await requireSession(request);
  const selection = await parseJson(request, markReadSchema, "Invalid notifications");

  const unreadCount = await markNotificationsRead(userId, selection);
  return NextResponse.json({ unreadCount });
});
