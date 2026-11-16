"use client";
import { createContext, useCallback, useContext, useState, useEffect, ReactNode } from "react";
import { notifications } from "@mantine/notifications";
import type { AuthUser, AuthContextType, AuthResult } from "@/types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function fetchCurrentUser(): Promise<AuthUser | null> {
  try {
    const response = await fetch("/api/user/profile");
    if (!response.ok) return null;
    const data: { user: AuthUser } = await response.json();
    return data.user;
  } catch (error) {
    console.error("Failed to fetch user data:", error);
    return null;
  }
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // The auth cookie is httpOnly, so the client can't inspect it; the server decides who is logged in.
  useEffect(() => {
    let cancelled = false;

    fetchCurrentUser().then((currentUser) => {
      if (!cancelled) {
        setUser(currentUser);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const refreshUser = useCallback(async () => {
    setUser(await fetchCurrentUser());
  }, []);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        notifications.show({
          title: "Welcome back!",
          message: "Successfully logged in",
          color: "green",
        });
        return { success: true };
      } else {
        const error = await response.json();
        notifications.show({
          title: "Login failed",
          message: error.message,
          color: "red",
        });
        return { success: false, error };
      }
    } catch {
      notifications.show({
        title: "Login failed",
        message: "An unexpected error occurred",
        color: "red",
      });
      return {
        success: false,
        error: { message: "An unexpected error occurred" },
      };
    }
  };

  const register = async (email: string, password: string, name: string): Promise<AuthResult> => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        notifications.show({
          title: "Welcome!",
          message: "Account created successfully",
          color: "green",
        });
        return { success: true };
      } else {
        const error = await response.json();
        notifications.show({
          title: "Registration failed",
          message: error.message,
          color: "red",
        });
        return { success: false, error };
      }
    } catch {
      notifications.show({
        title: "Registration failed",
        message: "An unexpected error occurred",
        color: "red",
      });
      return {
        success: false,
        error: { message: "An unexpected error occurred" },
      };
    }
  };

  const logout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error(`Logout failed with status ${response.status}`);
    } catch (error) {
      console.error("Logout error:", error);
      notifications.show({
        title: "Logout failed",
        message: "Please try again",
        color: "red",
      });
      return;
    }

    setUser(null);
    notifications.show({
      title: "Goodbye!",
      message: "Successfully logged out",
      color: "blue",
    });
  };

  const toggleFavorite = async (movieId: string) => {
    if (!user) return;

    const previousFavorites = user.favorites;
    const isFavorite = previousFavorites.includes(movieId);
    // Only the favorites change, so the rest of the user (e.g. subscription) stays intact.
    const setFavorites = (favorites: string[]) =>
      setUser((prev) => (prev ? { ...prev, favorites } : prev));

    // Optimistic update; rolled back below if the request fails.
    setFavorites(
      isFavorite
        ? previousFavorites.filter((id) => id !== movieId)
        : [...previousFavorites, movieId],
    );

    try {
      const response = isFavorite
        ? await fetch(`/api/user/favorites/${movieId}`, { method: "DELETE" })
        : await fetch("/api/user/favorites", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ movieId }),
          });

      if (!response.ok) {
        throw new Error(`Favorites request failed with status ${response.status}`);
      }

      const data: { favorites: string[] } = await response.json();
      setFavorites(data.favorites);
    } catch (error) {
      console.error("Failed to update favorites:", error);
      setFavorites(previousFavorites);
      notifications.show({
        title: "Could not update favorites",
        message: "Please try again",
        color: "red",
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        loading,
        toggleFavorite,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
