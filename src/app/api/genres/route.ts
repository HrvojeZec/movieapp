import { fetchGenres } from "@/features/movies/server/movies";
import { tmdbErrorResponse, tmdbJson } from "@/features/movies/server/route-helpers";

// GET /api/genres
export async function GET() {
  try {
    return tmdbJson({ genres: await fetchGenres() });
  } catch (error) {
    return tmdbErrorResponse(error, "Genres");
  }
}
