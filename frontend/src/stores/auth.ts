import { create } from "zustand";
import { api } from "../lib/api";
import { ApiResponse, User } from "../lib/types";
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
        set({ user, isAuthenticated: true, loading: false, isLoading: false, error: null });
        // Sync permissions and roles to RBAC store
        if (user.permissions) {
          useRbacStore.getState().setPermissions(user.permissions);
        }
        if (user.roles) {
          useRbacStore.getState().setRoles(user.roles);
        }
      } else {
        set({ user: null, isAuthenticated: false, loading: false, isLoading: false });
        useRbacStore.getState().setPermissions([]);
        useRbacStore.getState().setRoles([]);
      }
    } catch {
      set({ user: null, isAuthenticated: false, loading: false, isLoading: false });
      useRbacStore.getState().setPermissions([]);
      useRbacStore.getState().setRoles([]);
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
        set({ user, isAuthenticated: true, loading: false, isLoading: false, error: null });
        // Sync permissions and roles to RBAC store
        if (user.permissions) {
          useRbacStore.getState().setPermissions(user.permissions);
        }
        if (user.roles) {
          useRbacStore.getState().setRoles(user.roles);
        }
      } else {
        const errorMessage = response.data.message || "Login failed";
        set({ user: null, isAuthenticated: false, loading: false, isLoading: false, error: errorMessage });
        useRbacStore.getState().setPermissions([]);
        useRbacStore.getState().setRoles([]);
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "Login failed";
      set({ user: null, isAuthenticated: false, loading: false, isLoading: false, error: errorMessage });
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post("/api/auth/logout");
    } catch {
      // Continue even if logout fails
    } finally {
      set({ user: null, isAuthenticated: false, loading: false, isLoading: false, error: null });
      useRbacStore.getState().setPermissions([]);
      useRbacStore.getState().setRoles([]);
    }
  },
}));

