import { NextResponse } from "next/server";
import { requireSession } from "@/entities/user/server/session";
import { listWatchedIds } from "@/entities/watched/server/watched";
import { withRouteHandler } from "@/server/http/route-handler";

// GET /api/user/watched/ids: every watched movie ID, so cards can show which ones were seen
export const GET = withRouteHandler("List watched movie IDs", async (request) => {
  const { userId } = await requireSession(request);
  return NextResponse.json(
    { ids: await listWatchedIds(userId) },
    { headers: { "Cache-Control": "private, no-store" } },
  );
});
