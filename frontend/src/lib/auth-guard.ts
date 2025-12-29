import { useAuthStore } from "@/stores/auth";
import { useRbacStore } from "@/stores/rbac";
import { redirect } from "@tanstack/react-router";

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

export async function requirePermission(permission: string) {
  // First ensure user is authenticated
  await requireAuth();

  // Wait a bit for permissions to be loaded (they're set when user is fetched)
  let rbacState = useRbacStore.getState();
  let attempts = 0;
  const maxAttempts = 20; // 1 second max wait

  // Wait for permissions to be available
  while (rbacState.permissions.length === 0 && attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, 50));
    rbacState = useRbacStore.getState();
    attempts++;
  }

  // Check if user has the required permission
  if (!rbacState.hasPermission(permission)) {
    // Try to get the previous page from referrer
    const referrer = document.referrer;
    let redirectTo = "/dashboard"; // Default fallback

    if (referrer) {
      try {
        const referrerUrl = new URL(referrer);
        const referrerPath = referrerUrl.pathname;

        // Only use referrer if:
        // 1. It's from the same origin
        // 2. It's not the same page we're trying to access
        // 3. It's not an auth page
        if (
          referrerUrl.origin === window.location.origin &&
          referrerPath !== window.location.pathname &&
          !referrerPath.startsWith("/auth")
        ) {
          redirectTo = referrerPath;
        }
      } catch (e) {
        // If parsing fails, use default
      }
    }

    throw redirect({
      to: redirectTo,
      replace: true,
    });
  }
}

export async function redirectIfAuthenticated() {
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

  // If user is authenticated, redirect to dashboard
  if (currentState.isAuthenticated && currentState.user) {
    throw redirect({
      to: "/dashboard",
      replace: true,
    });
  }
}
