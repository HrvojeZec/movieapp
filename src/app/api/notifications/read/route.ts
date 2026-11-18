import { NextResponse } from "next/server";
import { requireSession } from "@/features/auth/server/session";
import { markNotificationsRead } from "@/features/notifications/server/notifications";
import { markReadSchema } from "@/features/notifications/validations/notifications.schema";
import { parseJson } from "@/server/http/parse";
import { withRouteHandler } from "@/server/http/route-handler";

// POST /api/notifications/read: { ids } or { all: true }; answers with the remaining unread count
export const POST = withRouteHandler("Mark notifications read", async (request) => {
  const { userId } = requireSession(request);
  const selection = await parseJson(request, markReadSchema, "Invalid notifications");

  const unreadCount = await markNotificationsRead(userId, selection);
  return NextResponse.json({ unreadCount });
});
