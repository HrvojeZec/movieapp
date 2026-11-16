import { NextRequest } from "next/server";
import { tmdbFetch } from "@/lib/tmdb/server";
import { searchParamsToObject, tmdbErrorResponse, tmdbJson } from "@/lib/tmdb/route-helpers";
import { movieDiscoverQuerySchema } from "@/lib/validation/validation";

// GET /api/movies/discover?year=2024&genre=28&minRating=7&page=1
export async function GET(request: NextRequest) {
  try {
    const { year, genre, minRating, page } = movieDiscoverQuerySchema.parse(
      searchParamsToObject(request.url),
    );
    return tmdbJson(
      await tmdbFetch("/discover/movie", {
        page,
        sort_by: "popularity.desc",
        primary_release_year: year,
        with_genres: genre,
        "vote_average.gte": minRating,
      }),
    );
  } catch (error) {
    return tmdbErrorResponse(error, "Movie discover");
  }
}
