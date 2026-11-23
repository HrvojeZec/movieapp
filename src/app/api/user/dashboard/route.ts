import { NextResponse, type NextRequest } from "next/server";
import { requireSession } from "@/entities/user/server/session";
import { getDashboardLayout, saveDashboardLayout } from "@/entities/stats/server/dashboard";
import { dashboardLayoutSchema } from "@/entities/stats/validations/dashboard.schema";
import { requireFeature } from "@/entities/subscription/server/entitlements";
import { parseJson } from "@/server/http/parse";
import { withRouteHandler } from "@/server/http/route-handler";

const read = withRouteHandler("Get dashboard layout", async (request) => {
  const { userId } = await requireSession(request);
  await requireFeature(userId, "stats");
  return NextResponse.json({ layout: await getDashboardLayout(userId) });
});

const save = withRouteHandler("Save dashboard layout", async (request) => {
  const { userId } = await requireSession(request);
  await requireFeature(userId, "stats");
  const { layout } = await parseJson(request, dashboardLayoutSchema);
  return NextResponse.json({ layout: await saveDashboardLayout(userId, layout) });
});

// One user's own board, so never cached (errors included)
const privateResponse = async (response: Promise<Response>) => {
  const result = await response;
  result.headers.set("Cache-Control", "private, no-store");
  return result;
};

// GET /api/user/dashboard: Pro; the saved stats board, or the default one
export async function GET(request: NextRequest, context: unknown) {
  return privateResponse(read(request, context));
}

// PUT /api/user/dashboard { layout }: Pro; returns the board as stored
export async function PUT(request: NextRequest, context: unknown) {
  return privateResponse(save(request, context));
}
