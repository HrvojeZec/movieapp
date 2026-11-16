import { NextRequest, NextResponse } from "next/server";
import { updateUserFavorites, logUserActivity } from "@/lib/auth/serverAuth";
import { getSessionUser } from "@/lib/auth/session";

export async function PUT(request: NextRequest) {
  try {
    const decoded = getSessionUser(request);
    if (!decoded) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { favorites, movieId, action } = await request.json();

    if (!Array.isArray(favorites)) {
      return NextResponse.json({ message: "Favorites must be an array" }, { status: 400 });
    }

    const updatedUser = await updateUserFavorites(decoded.userId, favorites);
    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (movieId && action) {
      await logUserActivity(decoded.userId, action === "add" ? "favorite" : "unfavorite", movieId);
    }

    return NextResponse.json({
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update favorites error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
