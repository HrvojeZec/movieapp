"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { notifications } from "@mantine/notifications";
import Cookies from "js-cookie";
import type { AuthUser, AuthContextType } from "@/types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

  useEffect(() => {
    let mounted = true;

    const token = Cookies.get("token");
    if (token) {
      fetchUserData(mounted);
    } else {
      if (mounted) {
        setLoading(false);
      }
    }

    return () => {
      mounted = false;
    };
  }, []);

  const fetchUserData = async (mounted = true) => {
    try {
      const response = await fetch("/api/user/profile");
      if (response.ok) {
        const userData = await response.json();
        if (mounted) {
          setUser(userData.user);
        }
      } else {
        Cookies.remove("token");
        if (mounted) {
          setUser(null);
        }
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      Cookies.remove("token");
      if (mounted) {
        setUser(null);
      }
    } finally {
      if (mounted) {
        setLoading(false);
      }
    }
  };

  const refreshUser = async () => {
    if (user) {
      await fetchUserData();
    }
  };

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: any }> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        Cookies.set("token", data.token, { expires: 7 });
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
    } catch (error) {
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

  const register = async (
    email: string,
    password: string,
    name: string
  ): Promise<{ success: boolean; error?: any }> => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      if (response.ok) {
        const data = await response.json();
        Cookies.set("token", data.token, { expires: 7 });
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
    } catch (error) {
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

  const logout = () => {
    Cookies.remove("token");
    setUser(null);
    notifications.show({
      title: "Goodbye!",
      message: "Successfully logged out",
      color: "blue",
    });
  };

  const updateFavorites = async (
    favorites: string[],
    movieId?: string,
    action?: "add" | "remove"
  ) => {
    if (!user) return;

    setUser((prev) => (prev ? { ...prev, favorites } : null));

    try {
      const response = await fetch("/api/user/favorites", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ favorites, movieId, action }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        if (user) {
          setUser((prev) =>
            prev ? { ...prev, favorites: user.favorites } : null
          );
        }
      }
    } catch (error) {
      console.error("Failed to update favorites:", error);
      if (user) {
        setUser((prev) =>
          prev ? { ...prev, favorites: user.favorites } : null
        );
      }
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
        updateFavorites,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
