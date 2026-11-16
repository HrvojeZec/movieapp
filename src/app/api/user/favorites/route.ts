import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { addFavorite, logUserActivity } from "@/lib/auth/serverAuth";
import { getSessionUser } from "@/lib/auth/session";
import { favoriteMovieIdSchema } from "@/lib/validation/validation";

const addFavoriteSchema = z.object({ movieId: favoriteMovieIdSchema });

// POST /api/user/favorites { movieId } adds a movie; removal is DELETE /api/user/favorites/[movieId]
export async function POST(request: NextRequest) {
  const session = getSessionUser(request);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const parsed = addFavoriteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid movie ID" }, { status: 400 });
  }

  try {
    const favorites = await addFavorite(session.userId, parsed.data.movieId);
    if (!favorites) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    await logUserActivity(session.userId, "favorite", parsed.data.movieId);
    return NextResponse.json({ favorites });
  } catch (error) {
    console.error("Add favorite error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
