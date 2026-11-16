import { tmdbFetch } from "@/lib/tmdb/server";
import { tmdbErrorResponse, tmdbJson } from "@/lib/tmdb/route-helpers";

// GET /api/genres
export async function GET() {
  try {
    return tmdbJson(await tmdbFetch("/genre/movie/list"));
  } catch (error) {
    return tmdbErrorResponse(error, "Genres");
  }
}
