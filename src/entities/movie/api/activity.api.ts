import { API_ROUTES } from "@/shared/api-routes";
import { postJson } from "@/shared/lib/http";

export const postMovieView = (movieId: string) =>
  postJson<void>(API_ROUTES.user.movieView, { movieId });
