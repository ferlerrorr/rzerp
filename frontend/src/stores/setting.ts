import { create } from "zustand";
import {
  getSettings,
  getSetting as getSettingAPI,
  setSetting as setSettingAPI,
  updateSetting as updateSettingAPI,
  deleteSetting as deleteSettingAPI,
} from "@/lib/api";
import { ApiResponse } from "@/lib/types";

export interface SettingFromAPI {
  id: number;
  key: string;
  value: any;
  type: string;
  description: string | null;
}

interface SettingState {
  settings: SettingFromAPI[];
  loading: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
  getSetting: (key: string) => Promise<SettingFromAPI | null>;
  setSetting: (data: { key: string; value: any; type?: string; description?: string }) => Promise<SettingFromAPI | null>;
  updateSetting: (key: string, data: { value: any; type?: string; description?: string }) => Promise<SettingFromAPI | null>;
  deleteSetting: (key: string) => Promise<boolean>;
}

export const useSettingStore = create<SettingState>((set, get) => ({
  settings: [],
  loading: false,
  error: null,

  fetchSettings: async () => {
    try {
      set({ loading: true, error: null });
      const response = (await getSettings()) as ApiResponse<{
        settings: SettingFromAPI[];
      }>;

      if (response.success && response.data) {
        set({
          settings: response.data.settings,
          loading: false,
        });
      } else {
        set({
          error: response.message || "Failed to fetch settings",
          loading: false,
        });
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch settings";
      set({ error: errorMessage, loading: false });
    }
  },

  getSetting: async (key: string) => {
    try {
      set({ loading: true, error: null });
      const response = (await getSettingAPI(key)) as ApiResponse<SettingFromAPI>;

      if (response.success && response.data) {
        set({ loading: false });
        return response.data;
      } else {
        set({
          error: response.message || "Failed to fetch setting",
          loading: false,
        });
        return null;
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch setting";
      set({ error: errorMessage, loading: false });
      return null;
    }
  },

  setSetting: async (data) => {
    try {
      set({ loading: true, error: null });
      const response = (await setSettingAPI(data)) as ApiResponse<{
        setting: SettingFromAPI;
      }>;

      if (response.success && response.data) {
        set({ loading: false });
        await get().fetchSettings();
        return response.data.setting;
      } else {
        set({
          error: response.message || "Failed to save setting",
          loading: false,
        });
        return null;
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to save setting";
      set({ error: errorMessage, loading: false });
      return null;
    }
  },

  updateSetting: async (key: string, data) => {
    try {
      set({ loading: true, error: null });
      const response = (await updateSettingAPI(key, data)) as ApiResponse<{
        setting: SettingFromAPI;
      }>;

      if (response.success && response.data) {
        set({ loading: false });
        await get().fetchSettings();
        return response.data.setting;
      } else {
        set({
          error: response.message || "Failed to update setting",
          loading: false,
        });
        return null;
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to update setting";
      set({ error: errorMessage, loading: false });
      return null;
    }
  },

  deleteSetting: async (key: string) => {
    try {
      set({ loading: true, error: null });
      const response = (await deleteSettingAPI(key)) as ApiResponse<any>;

      if (response.success) {
        set({ loading: false });
        await get().fetchSettings();
        return true;
      } else {
        set({
          error: response.message || "Failed to delete setting",
          loading: false,
        });
        return false;
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete setting";
      set({ error: errorMessage, loading: false });
      return false;
    }
  },
}));

