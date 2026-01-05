import { create } from "zustand";
import {
  getEmploymentTypes,
  getEmploymentType as getEmploymentTypeAPI,
  createEmploymentType as createEmploymentTypeAPI,
  updateEmploymentType as updateEmploymentTypeAPI,
  deleteEmploymentType as deleteEmploymentTypeAPI,
} from "@/lib/api";
import { ApiResponse } from "@/lib/types";

export interface EmploymentTypeFromAPI {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmploymentTypesData {
  employment_types: EmploymentTypeFromAPI[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

interface EmploymentTypeState {
  employmentTypes: EmploymentTypeFromAPI[];
  loading: boolean;
  error: string | null;
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  filters: Record<string, any>;
  fetchEmploymentTypes: () => Promise<void>;
  getEmploymentType: (id: number) => Promise<EmploymentTypeFromAPI | null>;
  createEmploymentType: (data: Record<string, any>) => Promise<EmploymentTypeFromAPI | null>;
  updateEmploymentType: (id: number, data: Record<string, any>) => Promise<EmploymentTypeFromAPI | null>;
  deleteEmploymentType: (id: number) => Promise<boolean>;
  setFilters: (filters: Record<string, any>) => void;
  clearFilters: () => void;
}

export const useEmploymentTypeStore = create<EmploymentTypeState>((set, get) => ({
  employmentTypes: [],
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

  fetchEmploymentTypes: async () => {
    try {
      set({ loading: true, error: null });
      const filters = get().filters;
      const response = (await getEmploymentTypes(filters)) as ApiResponse<EmploymentTypesData>;

      if (response.success && response.data) {
        set({
          employmentTypes: response.data.employment_types,
          pagination: response.data.pagination,
          loading: false,
        });
      } else {
        set({
          error: response.message || "Failed to fetch employment types",
          loading: false,
        });
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch employment types";
      set({ error: errorMessage, loading: false });
    }
  },

  getEmploymentType: async (id: number) => {
    try {
      set({ loading: true, error: null });
      const response = (await getEmploymentTypeAPI(id)) as ApiResponse<EmploymentTypeFromAPI>;

      if (response.success && response.data) {
        set({ loading: false });
        return response.data;
      } else {
        set({
          error: response.message || "Failed to fetch employment type",
          loading: false,
        });
        return null;
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch employment type";
      set({ error: errorMessage, loading: false });
      return null;
    }
  },

  createEmploymentType: async (data: Record<string, any>) => {
    try {
      set({ loading: true, error: null });
      const response = (await createEmploymentTypeAPI(data)) as ApiResponse<EmploymentTypeFromAPI>;

      if (response.success && response.data) {
        set({ loading: false });
        await get().fetchEmploymentTypes();
        return response.data;
      } else {
        set({
          error: response.message || "Failed to create employment type",
          loading: false,
        });
        return null;
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to create employment type";
      set({ error: errorMessage, loading: false });
      return null;
    }
  },

  updateEmploymentType: async (id: number, data: Record<string, any>) => {
    try {
      set({ loading: true, error: null });
      const response = (await updateEmploymentTypeAPI(id, data)) as ApiResponse<EmploymentTypeFromAPI>;

      if (response.success && response.data) {
        set({ loading: false });
        await get().fetchEmploymentTypes();
        return response.data;
      } else {
        set({
          error: response.message || "Failed to update employment type",
          loading: false,
        });
        return null;
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to update employment type";
      set({ error: errorMessage, loading: false });
      return null;
    }
  },

  deleteEmploymentType: async (id: number) => {
    try {
      set({ loading: true, error: null });
      const response = (await deleteEmploymentTypeAPI(id)) as ApiResponse<any>;

      if (response.success) {
        set({ loading: false });
        await get().fetchEmploymentTypes();
        return true;
      } else {
        set({
          error: response.message || "Failed to delete employment type",
          loading: false,
        });
        return false;
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete employment type";
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

