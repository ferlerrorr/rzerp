import { ReactNode, useEffect } from "react";
import { useAuthStore } from "../../stores/auth";
import { Navigate } from "@tanstack/react-router";

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, user, fetchUser, loading } = useAuthStore();

  useEffect(() => {
    if (!user && !loading) {
      fetchUser();
    }
  }, [user, loading, fetchUser]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/auth/login" />;
  }

  return <>{children}</>;
}

