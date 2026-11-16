import { NextRequest } from "next/server";
import { tmdbFetch } from "@/lib/tmdb/server";
import { tmdbErrorResponse, tmdbJson } from "@/lib/tmdb/route-helpers";
import { movieIdSchema } from "@/lib/validation/validation";

// GET /api/movies/550 (details with cast)
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = movieIdSchema.parse((await params).id);
    return tmdbJson(await tmdbFetch(`/movie/${id}`, { append_to_response: "credits" }));
  } catch (error) {
    return tmdbErrorResponse(error, "Movie details");
  }
}
