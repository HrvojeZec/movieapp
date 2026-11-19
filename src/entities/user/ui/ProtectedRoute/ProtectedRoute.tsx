"use client";
import { useAuth } from "@/entities/user/hooks/useAuth";
import { useAppRouter } from "@/shared/hooks/useAppRouter";
import { useEffect } from "react";
import { Loader, Center } from "@mantine/core";
import { ROUTES } from "@/shared/routes";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const router = useAppRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push(ROUTES.login);
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <Center h="100vh">
        <Loader size="lg" />
      </Center>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
};
