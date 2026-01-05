import { create } from "zustand";
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification as deleteNotificationAPI,
} from "@/lib/api";
import { ApiResponse } from "@/lib/types";

export interface NotificationFromAPI {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationsData {
  notifications: NotificationFromAPI[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

interface NotificationState {
  notifications: NotificationFromAPI[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  filters: Record<string, any>;
  fetchNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: number) => Promise<boolean>;
  markAllAsRead: () => Promise<boolean>;
  deleteNotification: (id: number) => Promise<boolean>;
  setFilters: (filters: Record<string, any>) => void;
  clearFilters: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  pagination: {
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  },
  filters: {
    per_page: 15,
  },

  fetchNotifications: async () => {
    try {
      set({ loading: true, error: null });
      const filters = get().filters;
      const response = (await getNotifications(filters)) as ApiResponse<NotificationsData>;

      if (response.success && response.data) {
        set({
          notifications: response.data.notifications,
          pagination: response.data.pagination,
          loading: false,
        });
      } else {
        set({
          error: response.message || "Failed to fetch notifications",
          loading: false,
        });
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch notifications";
      set({ error: errorMessage, loading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const response = (await getUnreadNotificationCount()) as ApiResponse<{
        count: number;
      }>;

      if (response.success && response.data) {
        set({
          unreadCount: response.data.count,
        });
      }
    } catch (error: any) {
      // Silently fail for unread count
    }
  },

  markAsRead: async (id: number) => {
    try {
      set({ loading: true, error: null });
      const response = (await markNotificationAsRead(id)) as ApiResponse<any>;

      if (response.success) {
        set({ loading: false });
        await get().fetchNotifications();
        await get().fetchUnreadCount();
        return true;
      } else {
        set({
          error: response.message || "Failed to mark notification as read",
          loading: false,
        });
        return false;
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to mark notification as read";
      set({ error: errorMessage, loading: false });
      return false;
    }
  },

  markAllAsRead: async () => {
    try {
      set({ loading: true, error: null });
      const response = (await markAllNotificationsAsRead()) as ApiResponse<any>;

      if (response.success) {
        set({ loading: false });
        await get().fetchNotifications();
        await get().fetchUnreadCount();
        return true;
      } else {
        set({
          error: response.message || "Failed to mark all notifications as read",
          loading: false,
        });
        return false;
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to mark all notifications as read";
      set({ error: errorMessage, loading: false });
      return false;
    }
  },

  deleteNotification: async (id: number) => {
    try {
      set({ loading: true, error: null });
      const response = (await deleteNotificationAPI(id)) as ApiResponse<any>;

      if (response.success) {
        set({ loading: false });
        await get().fetchNotifications();
        await get().fetchUnreadCount();
        return true;
      } else {
        set({
          error: response.message || "Failed to delete notification",
          loading: false,
        });
        return false;
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete notification";
      set({ error: errorMessage, loading: false });
      return false;
    }
  },

  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));
  },

  clearFilters: () => {
    set({
      filters: {
        per_page: 15,
      },
    });
  },
}));

