import { NextRequest, NextResponse } from "next/server";
import {
  verifyToken,
  updateUserFavorites,
  logUserActivity,
} from "@/lib/auth/serverAuth";

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const { favorites, movieId, action } = await request.json();

    if (!Array.isArray(favorites)) {
      return NextResponse.json(
        { message: "Favorites must be an array" },
        { status: 400 }
      );
    }

    const updatedUser = await updateUserFavorites(decoded.userId, favorites);
    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (movieId && action) {
      await logUserActivity(
        decoded.userId,
        action === "add" ? "favorite" : "unfavorite",
        movieId
      );
    }

    return NextResponse.json({
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update favorites error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
