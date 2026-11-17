import { fetchGenres } from "@/features/movies/server/movies";
import {
  limitTmdbRequest,
  tmdbErrorResponse,
  tmdbJson,
} from "@/features/movies/server/route-helpers";

// GET /api/genres
export async function GET(request: Request) {
  try {
    await limitTmdbRequest(request);
    return tmdbJson({ genres: await fetchGenres() });
  } catch (error) {
    return tmdbErrorResponse(error, "Genres");
  }
}
