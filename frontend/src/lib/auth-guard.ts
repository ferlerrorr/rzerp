import { redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/auth";

export async function requireAuth() {
  const state = useAuthStore.getState();
  const { user, fetchUser, loading } = state;

  // If we don't have a user and we're not loading, try to fetch it
  if (!user && !loading) {
    await fetchUser();
  }

  // Wait for loading to complete if it's in progress
  let currentState = useAuthStore.getState();
  while (currentState.loading) {
    await new Promise((resolve) => setTimeout(resolve, 50));
    currentState = useAuthStore.getState();
  }

  // Check authentication after loading completes
  if (!currentState.isAuthenticated || !currentState.user) {
    throw redirect({
      to: "/auth/login",
    });
  }
}
