import { NextRequest, NextResponse } from "next/server";
import { removeFavorite } from "@/features/favorites/server/favorites";
import { logUserActivity } from "@/server/activity";
import { getSessionUser } from "@/features/auth/server/session";
import { favoriteMovieIdSchema } from "@/features/favorites/validation";

// DELETE /api/user/favorites/550
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ movieId: string }> },
) {
  const session = getSessionUser(request);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const parsed = favoriteMovieIdSchema.safeParse((await params).movieId);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid movie ID" }, { status: 400 });
  }

  try {
    const favorites = await removeFavorite(session.userId, parsed.data);
    if (!favorites) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    await logUserActivity(session.userId, "unfavorite", parsed.data);
    return NextResponse.json({ favorites });
  } catch (error) {
    console.error("Remove favorite error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
