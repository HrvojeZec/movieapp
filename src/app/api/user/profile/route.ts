import { NextRequest, NextResponse } from "next/server";
import { findUserById } from "@/features/auth/server/users";
import { getSessionUser } from "@/features/auth/server/session";

export async function GET(request: NextRequest) {
  try {
    const decoded = getSessionUser(request);
    if (!decoded) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await findUserById(decoded.userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
