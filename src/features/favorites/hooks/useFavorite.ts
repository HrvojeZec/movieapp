import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useToggleFavorite } from "@/features/favorites/hooks/useToggleFavorite";
import { ROUTES } from "@/shared/routes";

/** Favorite state of one movie; logged-out users are sent to login instead. */
export function useFavorite(movieId: number | string) {
  const id = String(movieId);
  const { user, loading } = useAuth();
  const toggleFavorite = useToggleFavorite();
  const router = useRouter();

  const toggle = () => {
    if (!user) {
      router.push(ROUTES.login);
      return;
    }
    toggleFavorite(id);
  };

  return {
    isFavorite: user?.favorites.includes(id) ?? false,
    isLoggedIn: Boolean(user),
    // Until the session loads a click can't tell "toggle" from "go to login"
    disabled: loading,
    toggle,
  };
}
