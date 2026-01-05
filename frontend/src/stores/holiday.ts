import { create } from "zustand";
import {
  getHolidays,
  getHoliday as getHolidayAPI,
  createHoliday as createHolidayAPI,
  updateHoliday as updateHolidayAPI,
  deleteHoliday as deleteHolidayAPI,
} from "@/lib/api";
import { ApiResponse } from "@/lib/types";

export interface HolidayFromAPI {
  id: number;
  date: string;
  name: string;
  description: string | null;
  type: "regular" | "special_non_working";
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HolidaysData {
  holidays: HolidayFromAPI[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

interface HolidayState {
  holidays: HolidayFromAPI[];
  loading: boolean;
  error: string | null;
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  filters: Record<string, any>;
  fetchHolidays: () => Promise<void>;
  getHoliday: (id: number) => Promise<HolidayFromAPI | null>;
  createHoliday: (data: Record<string, any>) => Promise<HolidayFromAPI | null>;
  updateHoliday: (id: number, data: Record<string, any>) => Promise<HolidayFromAPI | null>;
  deleteHoliday: (id: number) => Promise<boolean>;
  setFilters: (filters: Record<string, any>) => void;
  clearFilters: () => void;
}

export const useHolidayStore = create<HolidayState>((set, get) => ({
  holidays: [],
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

  fetchHolidays: async () => {
    try {
      set({ loading: true, error: null });
      const filters = get().filters;
      const response = (await getHolidays(filters)) as ApiResponse<HolidaysData>;

      if (response.success && response.data) {
        set({
          holidays: response.data.holidays,
          pagination: response.data.pagination,
          loading: false,
        });
      } else {
        set({
          error: response.message || "Failed to fetch holidays",
          loading: false,
        });
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch holidays";
      set({ error: errorMessage, loading: false });
    }
  },

  getHoliday: async (id: number) => {
    try {
      set({ loading: true, error: null });
      const response = (await getHolidayAPI(id)) as ApiResponse<HolidayFromAPI>;

      if (response.success && response.data) {
        set({ loading: false });
        return response.data;
      } else {
        set({
          error: response.message || "Failed to fetch holiday",
          loading: false,
        });
        return null;
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch holiday";
      set({ error: errorMessage, loading: false });
      return null;
    }
  },

  createHoliday: async (data: Record<string, any>) => {
    try {
      set({ loading: true, error: null });
      const response = (await createHolidayAPI(data)) as ApiResponse<HolidayFromAPI>;

      if (response.success && response.data) {
        set({ loading: false });
        await get().fetchHolidays();
        return response.data;
      } else {
        set({
          error: response.message || "Failed to create holiday",
          loading: false,
        });
        return null;
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to create holiday";
      set({ error: errorMessage, loading: false });
      return null;
    }
  },

  updateHoliday: async (id: number, data: Record<string, any>) => {
    try {
      set({ loading: true, error: null });
      const response = (await updateHolidayAPI(id, data)) as ApiResponse<HolidayFromAPI>;

      if (response.success && response.data) {
        set({ loading: false });
        await get().fetchHolidays();
        return response.data;
      } else {
        set({
          error: response.message || "Failed to update holiday",
          loading: false,
        });
        return null;
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to update holiday";
      set({ error: errorMessage, loading: false });
      return null;
    }
  },

  deleteHoliday: async (id: number) => {
    try {
      set({ loading: true, error: null });
      const response = (await deleteHolidayAPI(id)) as ApiResponse<any>;

      if (response.success) {
        set({ loading: false });
        await get().fetchHolidays();
        return true;
      } else {
        set({
          error: response.message || "Failed to delete holiday",
          loading: false,
        });
        return false;
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete holiday";
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

