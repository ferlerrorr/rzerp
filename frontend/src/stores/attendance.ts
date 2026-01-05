import { create } from "zustand";
import {
  getAttendances,
  timeIn as timeInAPI,
  timeOut as timeOutAPI,
} from "@/lib/api";
import { ApiResponse } from "@/lib/types";

export interface AttendanceFromAPI {
  id: number;
  code: string;
  employee_id: number;
  employee?: { id: number; name: string };
  date: string;
  time_in: string | null;
  time_out: string | null;
  break_start: string | null;
  break_end: string | null;
  total_hours: number;
  overtime_hours: number;
  late_minutes: number;
  status: "present" | "late" | "absent" | "on_leave";
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AttendancesData {
  attendances: AttendanceFromAPI[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

interface AttendanceState {
  attendances: AttendanceFromAPI[];
  loading: boolean;
  error: string | null;
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  filters: Record<string, any>;
  fetchAttendances: () => Promise<void>;
  recordTimeIn: (data: { employee_id: number; date?: string; time_in?: string }) => Promise<AttendanceFromAPI | null>;
  recordTimeOut: (id: number, data: { time_out: string; break_start?: string; break_end?: string }) => Promise<AttendanceFromAPI | null>;
  setFilters: (filters: Record<string, any>) => void;
  clearFilters: () => void;
}

export const useAttendanceStore = create<AttendanceState>((set, get) => ({
  attendances: [],
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

  fetchAttendances: async () => {
    try {
      set({ loading: true, error: null });
      const filters = get().filters;
      const response = (await getAttendances(filters)) as ApiResponse<AttendancesData>;

      if (response.success && response.data) {
        set({
          attendances: response.data.attendances,
          pagination: response.data.pagination,
          loading: false,
        });
      } else {
        set({
          error: response.message || "Failed to fetch attendances",
          loading: false,
        });
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch attendances";
      set({ error: errorMessage, loading: false });
    }
  },

  recordTimeIn: async (data) => {
    try {
      set({ loading: true, error: null });
      const response = (await timeInAPI(data)) as ApiResponse<{
        attendance: AttendanceFromAPI;
      }>;

      if (response.success && response.data) {
        set({ loading: false });
        await get().fetchAttendances();
        return response.data.attendance;
      } else {
        set({
          error: response.message || "Failed to record time in",
          loading: false,
        });
        return null;
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to record time in";
      set({ error: errorMessage, loading: false });
      return null;
    }
  },

  recordTimeOut: async (id: number, data) => {
    try {
      set({ loading: true, error: null });
      const response = (await timeOutAPI(id, data)) as ApiResponse<{
        attendance: AttendanceFromAPI;
      }>;

      if (response.success && response.data) {
        set({ loading: false });
        await get().fetchAttendances();
        return response.data.attendance;
      } else {
        set({
          error: response.message || "Failed to record time out",
          loading: false,
        });
        return null;
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to record time out";
      set({ error: errorMessage, loading: false });
      return null;
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

