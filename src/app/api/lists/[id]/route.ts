import { NextResponse } from "next/server";
import { requireSession } from "@/features/auth/server/session";
import { deleteList, getList, renameList } from "@/features/lists/server/lists";
import { renameListSchema } from "@/features/lists/validations/lists.schema";
import { parseJson } from "@/server/http/parse";
import { withRouteHandler } from "@/server/http/route-handler";
import { HTTP_STATUS } from "@/shared/lib/http-status";

type Context = { params: Promise<{ id: string }> };

// GET /api/lists/:id: one of the user's lists with its movies, on every plan
export const GET = withRouteHandler("Get movie list", async (request, { params }: Context) => {
  const { userId } = requireSession(request);
  return NextResponse.json(
    { list: await getList(userId, (await params).id) },
    { headers: { "Cache-Control": "private, no-store" } },
  );
});

// PATCH /api/lists/:id { name }: Premium and Pro
export const PATCH = withRouteHandler("Rename movie list", async (request, { params }: Context) => {
  const { userId } = requireSession(request);
  const { name } = await parseJson(request, renameListSchema);
  return NextResponse.json({ list: await renameList(userId, (await params).id, name) });
});

// DELETE /api/lists/:id: on every plan
export const DELETE = withRouteHandler(
  "Delete movie list",
  async (request, { params }: Context) => {
    const { userId } = requireSession(request);
    await deleteList(userId, (await params).id);
    return new NextResponse(null, { status: HTTP_STATUS.NO_CONTENT });
  },
);
