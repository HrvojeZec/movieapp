import { describe, expect, it } from "vitest";
import { API_ROUTES } from "@/shared/api-routes";

// The paths must match the route handler folders in src/app/api
describe("API_ROUTES", () => {
  it.each([
    [API_ROUTES.auth.login, "/api/auth/login"],
    [API_ROUTES.auth.register, "/api/auth/register"],
    [API_ROUTES.auth.logout, "/api/auth/logout"],
    [API_ROUTES.user.profile, "/api/user/profile"],
    [API_ROUTES.user.favorites, "/api/user/favorites"],
    [API_ROUTES.user.favorite("550"), "/api/user/favorites/550"],
    [API_ROUTES.movies.list, "/api/movies"],
    [API_ROUTES.movies.search, "/api/movies/search"],
    [API_ROUTES.movies.discover, "/api/movies/discover"],
    [API_ROUTES.movies.details(550), "/api/movies/550"],
    [API_ROUTES.movies.videos(550), "/api/movies/550/videos"],
    [API_ROUTES.genres, "/api/genres"],
    [API_ROUTES.stripe.createCheckoutSession, "/api/stripe/create-checkout-session"],
    [API_ROUTES.stripe.checkoutSuccess, "/api/stripe/checkout-success"],
  ])("%s", (actual, expected) => {
    expect(actual).toBe(expected);
  });
});
