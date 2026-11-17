import { NextResponse } from "next/server";
import { pingDatabase } from "@/server/db/health";
import { HTTP_STATUS } from "@/shared/lib/http-status";

// Checked on every request; never prerendered at build time, when there's no database
export const dynamic = "force-dynamic";

// GET /api/health: for uptime monitors and the Docker HEALTHCHECK. Says whether the app and its
// database work, without error details.
export async function GET() {
  const database = await pingDatabase();
  const status = database ? "ok" : "error";
  return NextResponse.json(
    { status, checks: { database: status } },
    {
      status: database ? HTTP_STATUS.OK : HTTP_STATUS.SERVICE_UNAVAILABLE,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
