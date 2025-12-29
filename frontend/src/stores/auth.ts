import { create } from "zustand";
import { api } from "../lib/api";
import { ApiResponse, User } from "../lib/types";
import { deleteCookie } from "../lib/utils";
import { useRbacStore } from "./rbac";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  fetchUser: () => Promise<void>;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  loading: false,
  isLoading: false,
  error: null,

  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
  },

  clearError: () => {
    set({ error: null });
  },

  fetchUser: async () => {
    set({ loading: true, isLoading: true });
    try {
      const response = await api.get<ApiResponse<User>>("/api/user");
      if (response.data.success && response.data.data) {
        const user = response.data.data;
        set({
          user,
          isAuthenticated: true,
          loading: false,
          isLoading: false,
          error: null,
        });
        // Sync permissions and roles to RBAC store
        if (user.permissions) {
          useRbacStore.getState().setPermissions(user.permissions);
        }
        if (user.roles) {
          useRbacStore.getState().setRoles(user.roles);
        }
      } else {
        // Session validation failed - clear state and cookies
        set({
          user: null,
          isAuthenticated: false,
          loading: false,
          isLoading: false,
        });
        useRbacStore.getState().setPermissions([]);
        useRbacStore.getState().setRoles([]);
        // Remove session cookie if session doesn't exist in database
        deleteCookie("laravel-session", "/");
        deleteCookie("laravel-session", "/", ".socia-dev.com");
        deleteCookie("laravel-session", "/", "localhost");
      }
    } catch (error: any) {
      // Handle 401 (session not found in database) or other errors
      const isSessionNotFound =
        error?.response?.status === 401 &&
        (error?.response?.data?.message?.includes("Session not found") ||
          error?.response?.data?.message?.includes("Not authenticated"));

      // If unauthorized, call logout to ensure proper cleanup
      if (error?.response?.status === 401) {
        // Call logout to clear state, cookies, and notify backend
        // The logout function is idempotent, so it's safe to call even if already called
        await useAuthStore.getState().logout();
      } else {
        // For other errors, just clear local state
        set({
          user: null,
          isAuthenticated: false,
          loading: false,
          isLoading: false,
        });
        useRbacStore.getState().setPermissions([]);
        useRbacStore.getState().setRoles([]);
      }
    }
  },

  login: async (email: string, password: string, remember: boolean = false) => {
    set({ loading: true, isLoading: true, error: null });
    try {
      // Fetch CSRF cookie first
      await api.get("/csrf-cookie").catch(() => {
        // Try alternative endpoint
        return api.get("/sanctum/csrf-cookie");
      });

      const response = await api.post<ApiResponse<User>>("/api/auth/login", {
        email,
        password,
        remember,
      });

      if (response.data.success && response.data.data) {
        const user = response.data.data;
        set({
          user,
          isAuthenticated: true,
          loading: false,
          isLoading: false,
          error: null,
        });
        // Sync permissions and roles to RBAC store
        if (user.permissions) {
          useRbacStore.getState().setPermissions(user.permissions);
        }
        if (user.roles) {
          useRbacStore.getState().setRoles(user.roles);
        }
      } else {
        const errorMessage = response.data.message || "Login failed";
        set({
          user: null,
          isAuthenticated: false,
          loading: false,
          isLoading: false,
          error: errorMessage,
        });
        useRbacStore.getState().setPermissions([]);
        useRbacStore.getState().setRoles([]);
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || "Login failed";
      set({
        user: null,
        isAuthenticated: false,
        loading: false,
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      const response = await api.post("/api/auth/logout");

      // If logout is successful, remove the laravel-session cookie
      if (response.data?.success) {
        // Delete laravel-session cookie for both localhost and any configured domain
        deleteCookie("laravel-session", "/");
        // Also try with common domain patterns
        deleteCookie("laravel-session", "/", ".socia-dev.com");
        deleteCookie("laravel-session", "/", "localhost");
      }
    } catch {
      // Continue even if logout fails, but still try to remove cookie
      deleteCookie("laravel-session", "/");
      deleteCookie("laravel-session", "/", ".socia-dev.com");
      deleteCookie("laravel-session", "/", "localhost");
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        loading: false,
        isLoading: false,
        error: null,
      });
      useRbacStore.getState().setPermissions([]);
      useRbacStore.getState().setRoles([]);
    }
  },
}));
