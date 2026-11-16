import { tmdbFetch } from "@/features/movies/server/tmdb";
import { tmdbErrorResponse, tmdbJson } from "@/features/movies/server/route-helpers";

// GET /api/genres
export async function GET() {
  try {
    return tmdbJson(await tmdbFetch("/genre/movie/list"));
  } catch (error) {
    return tmdbErrorResponse(error, "Genres");
  }
}
