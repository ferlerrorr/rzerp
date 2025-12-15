import { create } from "zustand";
import {
  getPositions,
  getPosition as getPositionAPI,
  createPosition as createPositionAPI,
  updatePosition as updatePositionAPI,
  deletePosition as deletePositionAPI,
} from "@/lib/api";
import { ApiResponse } from "@/lib/types";

export interface PositionFormData {
  name: string;
  description: string;
  departmentId: string;
}

// Position from API (snake_case)
export interface PositionFromAPI {
  id: number;
  name: string;
  description: string | null;
  department_id: number | null;
  department: {
    id: number;
    name: string;
  } | null;
  created_at: string;
  updated_at: string;
}

// Positions data response
export interface PositionsData {
  positions: PositionFromAPI[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

interface PositionState {
  // Form state
  formData: PositionFormData;
  errors: Partial<Record<keyof PositionFormData, string>>;
  isOpen: boolean;

  // Data state
  positions: PositionFromAPI[];
  loading: boolean;
  error: string | null;
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  filters: {
    search?: string;
    department_id?: number;
    per_page?: number;
    page?: number;
  };

  // Form actions
  setFormData: (data: PositionFormData) => void;
  updateField: (field: keyof PositionFormData, value: string) => void;
  setError: (field: keyof PositionFormData, error: string | undefined) => void;
  setErrors: (errors: Partial<Record<keyof PositionFormData, string>>) => void;
  clearErrors: () => void;
  clearError: (field: keyof PositionFormData) => void;
  resetForm: () => void;
  setIsOpen: (open: boolean) => void;
  validateForm: () => boolean;

  // Data actions
  fetchPositions: () => Promise<void>;
  getPosition: (id: number) => Promise<PositionFromAPI | null>;
  createPosition: (data: PositionFormData) => Promise<PositionFromAPI | null>;
  updatePosition: (
    id: number,
    data: PositionFormData
  ) => Promise<PositionFromAPI | null>;
  deletePosition: (id: number) => Promise<boolean>;
  setFilters: (filters: Partial<PositionState["filters"]>) => void;
  clearFilters: () => void;
  loadPositionForEdit: (position: PositionFromAPI) => void;
}

const initialFormData: PositionFormData = {
  name: "",
  description: "",
  departmentId: "",
};

export const usePositionStore = create<PositionState>((set, get) => ({
  formData: initialFormData,
  errors: {},
  isOpen: false,

  positions: [],
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

  // Form actions
  setFormData: (data) => set({ formData: data }),

  updateField: (field, value) => {
    set((state) => ({
      formData: { ...state.formData, [field]: value },
    }));
    // Clear error when user starts typing
    const currentErrors = get().errors;
    if (currentErrors[field]) {
      set({
        errors: { ...currentErrors, [field]: undefined },
      });
    }
  },

  setError: (field, error) => {
    set((state) => ({
      errors: { ...state.errors, [field]: error },
    }));
  },

  setErrors: (errors) => set({ errors }),

  clearErrors: () => set({ errors: {} }),

  clearError: (field) => {
    set((state) => {
      const newErrors = { ...state.errors };
      delete newErrors[field];
      return { errors: newErrors };
    });
  },

  resetForm: () => {
    set({
      formData: initialFormData,
      errors: {},
    });
  },

  setIsOpen: (open) => {
    set({ isOpen: open });
    // Reset form when dialog closes
    if (!open) {
      set({
        formData: initialFormData,
        errors: {},
      });
    }
  },

  validateForm: () => {
    const { formData } = get();
    const newErrors: Partial<Record<keyof PositionFormData, string>> = {};

    if (!formData.name.trim()) newErrors.name = "Position name is required";

    set({ errors: newErrors });
    return Object.keys(newErrors).length === 0;
  },

  // Data actions
  getPosition: async (id: number) => {
    try {
      set({ loading: true, error: null });
      const response = (await getPositionAPI(
        id
      )) as ApiResponse<PositionFromAPI>;

      if (response.success && response.data) {
        set({ loading: false, error: null });
        return response.data;
      } else {
        set({
          loading: false,
          error: response.message || "Failed to load position",
        });
        return null;
      }
    } catch (err: any) {
      set({
        loading: false,
        error:
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load position",
      });
      return null;
    }
  },

  fetchPositions: async () => {
    try {
      set({ loading: true, error: null });
      const { filters } = get();
      const params: Record<string, string | number> = {};

      // Set default per_page if not provided
      params.per_page = filters.per_page || 15;

      // Add page parameter if provided
      if (filters.page) params.page = filters.page;

      if (filters.search) params.search = filters.search;
      if (filters.department_id) params.department_id = filters.department_id;

      const response = await getPositions(filters);

      if (response.success && response.data) {
        set({
          positions: response.data.positions,
          pagination: response.data.pagination,
          loading: false,
          error: null,
        });
      } else {
        set({
          loading: false,
          error: response.message || "Failed to load positions",
        });
      }
    } catch (err: any) {
      set({
        loading: false,
        error:
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load positions",
      });
    }
  },

  createPosition: async (data: PositionFormData) => {
    try {
      set({ loading: true, error: null, errors: {} });

      // Convert camelCase to snake_case for API
      const apiData: Record<string, any> = {
        name: data.name,
        description: data.description || null,
      };

      if (data.departmentId) {
        apiData.department_id = parseInt(data.departmentId);
      }

      const response = (await createPositionAPI(
        apiData
      )) as ApiResponse<PositionFromAPI>;

      if (response.success && response.data) {
        const newPosition = response.data;
        // Add to positions list
        set((state) => ({
          positions: [newPosition, ...state.positions],
          loading: false,
          error: null,
          errors: {},
        }));
        // Refresh to get updated pagination
        await get().fetchPositions();
        return newPosition;
      } else {
        // Handle validation errors from API
        if (response.errors) {
          const apiErrors: Partial<Record<keyof PositionFormData, string>> = {};

          Object.entries(response.errors).forEach(([key, messages]) => {
            if (Array.isArray(messages) && messages.length > 0) {
              // Convert snake_case to camelCase
              const camelKey = key === "department_id" ? "departmentId" : key;
              apiErrors[camelKey as keyof PositionFormData] = messages[0];
            }
          });

          set({
            loading: false,
            errors: apiErrors,
            error: response.message || "Please fix the validation errors",
          });
        } else {
          set({
            loading: false,
            error: response.message || "Failed to create position",
          });
        }
        return null;
      }
    } catch (err: any) {
      // Handle API validation errors
      if (err?.response?.data?.errors) {
        const apiErrors: Partial<Record<keyof PositionFormData, string>> = {};

        Object.entries(err.response.data.errors).forEach(([key, messages]) => {
          if (Array.isArray(messages) && messages.length > 0) {
            // Convert snake_case to camelCase
            const camelKey = key === "department_id" ? "departmentId" : key;
            apiErrors[camelKey as keyof PositionFormData] = messages[0];
          }
        });

        set({
          loading: false,
          errors: apiErrors,
          error:
            err?.response?.data?.message || "Please fix the validation errors",
        });
      } else {
        set({
          loading: false,
          error:
            err?.response?.data?.message ||
            err?.message ||
            "Failed to create position",
        });
      }
      return null;
    }
  },

  updatePosition: async (id: number, data: PositionFormData) => {
    try {
      set({ loading: true, error: null, errors: {} });

      // Convert camelCase to snake_case for API
      const apiData: Record<string, any> = {
        name: data.name,
        description: data.description || null,
      };

      if (data.departmentId) {
        apiData.department_id = parseInt(data.departmentId);
      } else {
        apiData.department_id = null;
      }

      const response = (await updatePositionAPI(
        id,
        apiData
      )) as ApiResponse<PositionFromAPI>;

      if (response.success && response.data) {
        const updatedPosition = response.data;
        // Update in positions list
        set((state) => ({
          positions: state.positions.map((pos) =>
            pos.id === id ? updatedPosition : pos
          ),
          loading: false,
          error: null,
          errors: {},
        }));
        return updatedPosition;
      } else {
        // Handle validation errors from API
        if (response.errors) {
          const apiErrors: Partial<Record<keyof PositionFormData, string>> = {};

          Object.entries(response.errors).forEach(([key, messages]) => {
            if (Array.isArray(messages) && messages.length > 0) {
              // Convert snake_case to camelCase
              const camelKey = key === "department_id" ? "departmentId" : key;
              apiErrors[camelKey as keyof PositionFormData] = messages[0];
            }
          });

          set({
            loading: false,
            errors: apiErrors,
            error: response.message || "Please fix the validation errors",
          });
        } else {
          set({
            loading: false,
            error: response.message || "Failed to update position",
          });
        }
        return null;
      }
    } catch (err: any) {
      // Handle API validation errors
      if (err?.response?.data?.errors) {
        const apiErrors: Partial<Record<keyof PositionFormData, string>> = {};

        Object.entries(err.response.data.errors).forEach(([key, messages]) => {
          if (Array.isArray(messages) && messages.length > 0) {
            // Convert snake_case to camelCase
            const camelKey = key === "department_id" ? "departmentId" : key;
            apiErrors[camelKey as keyof PositionFormData] = messages[0];
          }
        });

        set({
          loading: false,
          errors: apiErrors,
          error:
            err?.response?.data?.message || "Please fix the validation errors",
        });
      } else {
        set({
          loading: false,
          error:
            err?.response?.data?.message ||
            err?.message ||
            "Failed to update position",
        });
      }
      return null;
    }
  },

  deletePosition: async (id: number) => {
    try {
      set({ loading: true, error: null });
      const response = (await deletePositionAPI(id)) as ApiResponse<void>;

      if (response.success) {
        // Remove from positions list
        set((state) => ({
          positions: state.positions.filter((pos) => pos.id !== id),
          loading: false,
          error: null,
        }));
        // Refresh to get updated pagination
        await get().fetchPositions();
        return true;
      } else {
        set({
          loading: false,
          error: response.message || "Failed to delete position",
        });
        return false;
      }
    } catch (err: any) {
      set({
        loading: false,
        error:
          err?.response?.data?.message ||
          err?.message ||
          "Failed to delete position",
      });
      return false;
    }
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },

  clearFilters: () => {
    set({ filters: { per_page: 15 } }); // Keep default per_page
  },

  // Load position data into form for editing
  loadPositionForEdit: (position: PositionFromAPI) => {
    const formData: PositionFormData = {
      name: position.name,
      description: position.description || "",
      departmentId: position.department_id?.toString() || "",
    };
    set({ formData, errors: {} });
  },
}));
