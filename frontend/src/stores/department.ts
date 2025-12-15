import { create } from "zustand";
import {
  getDepartments,
  getDepartment as getDepartmentAPI,
  createDepartment as createDepartmentAPI,
  updateDepartment as updateDepartmentAPI,
  deleteDepartment as deleteDepartmentAPI,
} from "@/lib/api";
import { ApiResponse } from "@/lib/types";

export interface DepartmentFormData {
  name: string;
  description: string;
}

// Department from API (snake_case)
export interface DepartmentFromAPI {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

// Departments data response
export interface DepartmentsData {
  departments: DepartmentFromAPI[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

interface DepartmentState {
  // Form state
  formData: DepartmentFormData;
  errors: Partial<Record<keyof DepartmentFormData, string>>;
  isOpen: boolean;

  // Data state
  departments: DepartmentFromAPI[];
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
    per_page?: number;
    page?: number;
  };

  // Form actions
  setFormData: (data: DepartmentFormData) => void;
  updateField: (field: keyof DepartmentFormData, value: string) => void;
  setError: (field: keyof DepartmentFormData, error: string | undefined) => void;
  setErrors: (errors: Partial<Record<keyof DepartmentFormData, string>>) => void;
  clearErrors: () => void;
  clearError: (field: keyof DepartmentFormData) => void;
  resetForm: () => void;
  setIsOpen: (open: boolean) => void;
  validateForm: () => boolean;

  // Data actions
  fetchDepartments: () => Promise<void>;
  getDepartment: (id: number) => Promise<DepartmentFromAPI | null>;
  createDepartment: (data: DepartmentFormData) => Promise<DepartmentFromAPI | null>;
  updateDepartment: (
    id: number,
    data: DepartmentFormData
  ) => Promise<DepartmentFromAPI | null>;
  deleteDepartment: (id: number) => Promise<boolean>;
  setFilters: (filters: Partial<DepartmentState["filters"]>) => void;
  clearFilters: () => void;
  loadDepartmentForEdit: (department: DepartmentFromAPI) => void;
}

const initialFormData: DepartmentFormData = {
  name: "",
  description: "",
};

export const useDepartmentStore = create<DepartmentState>((set, get) => ({
  formData: initialFormData,
  errors: {},
  isOpen: false,

  departments: [],
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
    const newErrors: Partial<Record<keyof DepartmentFormData, string>> = {};

    if (!formData.name.trim()) newErrors.name = "Department name is required";

    set({ errors: newErrors });
    return Object.keys(newErrors).length === 0;
  },

  // Data actions
  getDepartment: async (id: number) => {
    try {
      set({ loading: true, error: null });
      const response = (await getDepartmentAPI(id)) as ApiResponse<DepartmentFromAPI>;

      if (response.success && response.data) {
        set({ loading: false, error: null });
        return response.data;
      } else {
        set({
          loading: false,
          error: response.message || "Failed to load department",
        });
        return null;
      }
    } catch (err: any) {
      set({
        loading: false,
        error:
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load department",
      });
      return null;
    }
  },

  fetchDepartments: async () => {
    try {
      set({ loading: true, error: null });
      const { filters } = get();
      const params: Record<string, string | number> = {};

      // Set default per_page if not provided
      params.per_page = filters.per_page || 15;

      // Add page parameter if provided
      if (filters.page) params.page = filters.page;

      if (filters.search) params.search = filters.search;

      const response = await getDepartments(filters);

      if (response.success && response.data) {
        set({
          departments: response.data.departments,
          pagination: response.data.pagination,
          loading: false,
          error: null,
        });
      } else {
        set({
          loading: false,
          error: response.message || "Failed to load departments",
        });
      }
    } catch (err: any) {
      set({
        loading: false,
        error:
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load departments",
      });
    }
  },

  createDepartment: async (data: DepartmentFormData) => {
    try {
      set({ loading: true, error: null, errors: {} });
      const response = (await createDepartmentAPI(
        data
      )) as ApiResponse<DepartmentFromAPI>;

      if (response.success && response.data) {
        const newDepartment = response.data;
        // Add to departments list
        set((state) => ({
          departments: [newDepartment, ...state.departments],
          loading: false,
          error: null,
          errors: {},
        }));
        // Refresh to get updated pagination
        await get().fetchDepartments();
        return newDepartment;
      } else {
        // Handle validation errors from API
        if (response.errors) {
          const apiErrors: Partial<Record<keyof DepartmentFormData, string>> = {};

          Object.entries(response.errors).forEach(([key, messages]) => {
            if (Array.isArray(messages) && messages.length > 0) {
              apiErrors[key as keyof DepartmentFormData] = messages[0];
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
            error: response.message || "Failed to create department",
          });
        }
        return null;
      }
    } catch (err: any) {
      // Handle API validation errors
      if (err?.response?.data?.errors) {
        const apiErrors: Partial<Record<keyof DepartmentFormData, string>> = {};

        Object.entries(err.response.data.errors).forEach(([key, messages]) => {
          if (Array.isArray(messages) && messages.length > 0) {
            apiErrors[key as keyof DepartmentFormData] = messages[0];
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
            "Failed to create department",
        });
      }
      return null;
    }
  },

  updateDepartment: async (id: number, data: DepartmentFormData) => {
    try {
      set({ loading: true, error: null, errors: {} });
      const response = (await updateDepartmentAPI(
        id,
        data
      )) as ApiResponse<DepartmentFromAPI>;

      if (response.success && response.data) {
        const updatedDepartment = response.data;
        // Update in departments list
        set((state) => ({
          departments: state.departments.map((dept) =>
            dept.id === id ? updatedDepartment : dept
          ),
          loading: false,
          error: null,
          errors: {},
        }));
        return updatedDepartment;
      } else {
        // Handle validation errors from API
        if (response.errors) {
          const apiErrors: Partial<Record<keyof DepartmentFormData, string>> = {};

          Object.entries(response.errors).forEach(([key, messages]) => {
            if (Array.isArray(messages) && messages.length > 0) {
              apiErrors[key as keyof DepartmentFormData] = messages[0];
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
            error: response.message || "Failed to update department",
          });
        }
        return null;
      }
    } catch (err: any) {
      // Handle API validation errors
      if (err?.response?.data?.errors) {
        const apiErrors: Partial<Record<keyof DepartmentFormData, string>> = {};

        Object.entries(err.response.data.errors).forEach(([key, messages]) => {
          if (Array.isArray(messages) && messages.length > 0) {
            apiErrors[key as keyof DepartmentFormData] = messages[0];
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
            "Failed to update department",
        });
      }
      return null;
    }
  },

  deleteDepartment: async (id: number) => {
    try {
      set({ loading: true, error: null });
      const response = (await deleteDepartmentAPI(id)) as ApiResponse<void>;

      if (response.success) {
        // Remove from departments list
        set((state) => ({
          departments: state.departments.filter((dept) => dept.id !== id),
          loading: false,
          error: null,
        }));
        // Refresh to get updated pagination
        await get().fetchDepartments();
        return true;
      } else {
        set({
          loading: false,
          error: response.message || "Failed to delete department",
        });
        return false;
      }
    } catch (err: any) {
      set({
        loading: false,
        error:
          err?.response?.data?.message ||
          err?.message ||
          "Failed to delete department",
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

  // Load department data into form for editing
  loadDepartmentForEdit: (department: DepartmentFromAPI) => {
    const formData: DepartmentFormData = {
      name: department.name,
      description: department.description || "",
    };
    set({ formData, errors: {} });
  },
}));

