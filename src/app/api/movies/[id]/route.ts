import { NextRequest } from "next/server";
import { fetchMovieDetails } from "@/features/movies/server/movies";
import { tmdbErrorResponse, tmdbJson } from "@/features/movies/server/route-helpers";
import { movieIdSchema } from "@/features/movies/validations/movies.schema";

// GET /api/movies/550 (details with cast)
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = movieIdSchema.parse((await params).id);
    return tmdbJson(await fetchMovieDetails(id));
  } catch (error) {
    return tmdbErrorResponse(error, "Movie details");
  }
}
