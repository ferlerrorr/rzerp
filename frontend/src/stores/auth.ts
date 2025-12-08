import { create } from "zustand";
import { api } from "../lib/api";
import { ApiResponse, User } from "../lib/types";
import { useRbacStore } from "./rbac";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  setUser: (user: User | null) => void;
  fetchUser: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  loading: false,

  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
  },

  fetchUser: async () => {
    set({ loading: true });
    try {
      const response = await api.get<ApiResponse<User>>("/api/user");
      if (response.data.success && response.data.data) {
        const user = response.data.data;
        set({ user, isAuthenticated: true, loading: false });
        // Sync permissions and roles to RBAC store
        if (user.permissions) {
          useRbacStore.getState().setPermissions(user.permissions);
        }
        if (user.roles) {
          useRbacStore.getState().setRoles(user.roles);
        }
      } else {
        set({ user: null, isAuthenticated: false, loading: false });
        useRbacStore.getState().setPermissions([]);
        useRbacStore.getState().setRoles([]);
      }
    } catch {
      set({ user: null, isAuthenticated: false, loading: false });
      useRbacStore.getState().setPermissions([]);
      useRbacStore.getState().setRoles([]);
    }
  },

  login: async (email: string, password: string) => {
    set({ loading: true });
    try {
      // Fetch CSRF cookie first
      await api.get("/csrf-cookie").catch(() => {
        // Try alternative endpoint
        return api.get("/sanctum/csrf-cookie");
      });

      const response = await api.post<ApiResponse<User>>("/api/auth/login", {
        email,
        password,
      });

      if (response.data.success && response.data.data) {
        const user = response.data.data;
        set({ user, isAuthenticated: true, loading: false });
        // Sync permissions and roles to RBAC store
        if (user.permissions) {
          useRbacStore.getState().setPermissions(user.permissions);
        }
        if (user.roles) {
          useRbacStore.getState().setRoles(user.roles);
        }
      } else {
        set({ user: null, isAuthenticated: false, loading: false });
        useRbacStore.getState().setPermissions([]);
        useRbacStore.getState().setRoles([]);
        throw new Error(response.data.message || "Login failed");
      }
    } catch (error) {
      set({ user: null, isAuthenticated: false, loading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post("/api/auth/logout");
    } catch {
      // Continue even if logout fails
    } finally {
      set({ user: null, isAuthenticated: false, loading: false });
      useRbacStore.getState().setPermissions([]);
      useRbacStore.getState().setRoles([]);
    }
  },
}));

