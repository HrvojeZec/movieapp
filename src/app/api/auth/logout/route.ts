import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/entities/user/server/session";

export async function POST() {
  const response = NextResponse.json({ success: true });
  clearAuthCookie(response);
  return response;
}
