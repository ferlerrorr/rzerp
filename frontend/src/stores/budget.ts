import { create } from "zustand";
import {
  getBudgets,
  getBudget as getBudgetAPI,
  createBudget as createBudgetAPI,
  updateBudget as updateBudgetAPI,
  deleteBudget as deleteBudgetAPI,
} from "@/lib/api";
import { ApiResponse } from "@/lib/types";

export interface BudgetFormData {
  category: string;
  budgetedAmount: string;
  period: string; // e.g., "2024", "2024-Q1", "2024-01"
  description: string;
}

// Budget from API (snake_case)
export interface BudgetFromAPI {
  id: number;
  category: string;
  budgeted_amount: string;
  actual_spending: string;
  period: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

// Budgets data response
export interface BudgetsData {
  budgets: BudgetFromAPI[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

interface BudgetState {
  // Form state
  formData: BudgetFormData;
  errors: Partial<Record<keyof BudgetFormData, string>>;
  isOpen: boolean;

  // Data state
  budgets: BudgetFromAPI[];
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
    period?: string;
    category?: string;
    per_page?: number;
    page?: number;
  };

  // Form actions
  setFormData: (data: BudgetFormData) => void;
  updateField: (field: keyof BudgetFormData, value: string) => void;
  setError: (field: keyof BudgetFormData, error: string | undefined) => void;
  setErrors: (errors: Partial<Record<keyof BudgetFormData, string>>) => void;
  clearErrors: () => void;
  clearError: (field: keyof BudgetFormData) => void;
  resetForm: () => void;
  setIsOpen: (open: boolean) => void;
  validateForm: () => boolean;

  // Data actions
  fetchBudgets: () => Promise<void>;
  getBudget: (id: number) => Promise<BudgetFromAPI | null>;
  createBudget: (data: BudgetFormData) => Promise<BudgetFromAPI | null>;
  updateBudget: (
    id: number,
    data: BudgetFormData
  ) => Promise<BudgetFromAPI | null>;
  deleteBudget: (id: number) => Promise<boolean>;
  setFilters: (filters: Partial<BudgetState["filters"]>) => void;
  clearFilters: () => void;
  loadBudgetForEdit: (budget: BudgetFromAPI) => void;
}

const initialFormData: BudgetFormData = {
  category: "",
  budgetedAmount: "",
  period: "",
  description: "",
};

export const useBudgetStore = create<BudgetState>((set, get) => ({
  formData: initialFormData,
  errors: {},
  isOpen: false,

  budgets: [],
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
    const newErrors: Partial<Record<keyof BudgetFormData, string>> = {};

    // Required fields validation
    if (!formData.category.trim()) newErrors.category = "Category is required";
    if (!formData.budgetedAmount.trim()) newErrors.budgetedAmount = "Budgeted Amount is required";
    if (!formData.period.trim()) newErrors.period = "Period is required";

    // Validate budgeted amount is numeric and positive
    if (formData.budgetedAmount.trim()) {
      const amountNum = parseFloat(formData.budgetedAmount);
      if (isNaN(amountNum) || amountNum <= 0) {
        newErrors.budgetedAmount = "Budgeted Amount must be a positive number";
      }
    }

    set({ errors: newErrors });
    return Object.keys(newErrors).length === 0;
  },

  // Data actions
  getBudget: async (id: number) => {
    try {
      set({ loading: true, error: null });
      const response = (await getBudgetAPI(id)) as ApiResponse<BudgetFromAPI>;

      if (response.success && response.data) {
        set({ loading: false, error: null });
        return response.data;
      } else {
        set({
          loading: false,
          error: response.message || "Failed to load budget",
        });
        return null;
      }
    } catch (err: any) {
      set({
        loading: false,
        error:
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load budget",
      });
      return null;
    }
  },

  fetchBudgets: async () => {
    try {
      set({ loading: true, error: null });
      const { filters } = get();
      const params: Record<string, string | number> = {};

      // Set default per_page if not provided
      params.per_page = filters.per_page || 15;

      // Add page parameter if provided
      if (filters.page) params.page = filters.page;

      if (filters.search) params.search = filters.search;
      if (filters.period) params.period = filters.period;
      if (filters.category) params.category = filters.category;

      const response = await getBudgets(filters);

      if (response.success && response.data) {
        set({
          budgets: response.data.budgets,
          pagination: response.data.pagination,
          loading: false,
          error: null,
        });
      } else {
        set({
          loading: false,
          error: response.message || "Failed to load budgets",
        });
      }
    } catch (err: any) {
      set({
        loading: false,
        error:
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load budgets",
      });
    }
  },

  createBudget: async (data: BudgetFormData) => {
    try {
      set({ loading: true, error: null, errors: {} });
      
      // Transform form data to API format (camelCase to snake_case)
      const apiData = {
        category: data.category.trim(),
        budgeted_amount: parseFloat(data.budgetedAmount),
        actual_spending: 0, // New budgets start with 0 actual spending
        period: data.period.trim(),
        description: data.description.trim() || null,
      };

      const response = (await createBudgetAPI(
        apiData
      )) as ApiResponse<BudgetFromAPI>;

      if (response.success && response.data) {
        const newBudget = response.data;
        // Add to budgets list
        set((state) => ({
          budgets: [newBudget, ...state.budgets],
          loading: false,
          error: null,
          errors: {},
        }));
        // Refresh to get updated pagination
        await get().fetchBudgets();
        return newBudget;
      } else {
        // Handle validation errors from API
        if (response.errors) {
          const apiErrors: Partial<Record<keyof BudgetFormData, string>> = {};

          Object.entries(response.errors).forEach(([key, messages]) => {
            if (Array.isArray(messages) && messages.length > 0) {
              // Map snake_case to camelCase
              const camelKey = key
                .split('_')
                .map((word, index) => 
                  index === 0 
                    ? word 
                    : word.charAt(0).toUpperCase() + word.slice(1)
                )
                .join('');
              apiErrors[camelKey as keyof BudgetFormData] = messages[0];
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
            error: response.message || "Failed to create budget",
          });
        }
        return null;
      }
    } catch (err: any) {
      // Handle API validation errors
      if (err?.response?.data?.errors) {
        const apiErrors: Partial<Record<keyof BudgetFormData, string>> = {};

        Object.entries(err.response.data.errors).forEach(([key, messages]) => {
          if (Array.isArray(messages) && messages.length > 0) {
            // Map snake_case to camelCase
            const camelKey = key
              .split('_')
              .map((word, index) => 
                index === 0 
                  ? word 
                  : word.charAt(0).toUpperCase() + word.slice(1)
              )
              .join('');
            apiErrors[camelKey as keyof BudgetFormData] = messages[0];
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
            "Failed to create budget",
        });
      }
      return null;
    }
  },

  updateBudget: async (id: number, data: BudgetFormData) => {
    try {
      set({ loading: true, error: null, errors: {} });
      
      // Transform form data to API format (camelCase to snake_case)
      const apiData = {
        category: data.category.trim(),
        budgeted_amount: parseFloat(data.budgetedAmount),
        period: data.period.trim(),
        description: data.description.trim() || null,
      };

      const response = (await updateBudgetAPI(
        id,
        apiData
      )) as ApiResponse<BudgetFromAPI>;

      if (response.success && response.data) {
        const updatedBudget = response.data;
        // Update in budgets list
        set((state) => ({
          budgets: state.budgets.map((budget) =>
            budget.id === id ? updatedBudget : budget
          ),
          loading: false,
          error: null,
          errors: {},
        }));
        return updatedBudget;
      } else {
        // Handle validation errors from API
        if (response.errors) {
          const apiErrors: Partial<Record<keyof BudgetFormData, string>> = {};

          Object.entries(response.errors).forEach(([key, messages]) => {
            if (Array.isArray(messages) && messages.length > 0) {
              // Map snake_case to camelCase
              const camelKey = key
                .split('_')
                .map((word, index) => 
                  index === 0 
                    ? word 
                    : word.charAt(0).toUpperCase() + word.slice(1)
                )
                .join('');
              apiErrors[camelKey as keyof BudgetFormData] = messages[0];
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
            error: response.message || "Failed to update budget",
          });
        }
        return null;
      }
    } catch (err: any) {
      // Handle API validation errors
      if (err?.response?.data?.errors) {
        const apiErrors: Partial<Record<keyof BudgetFormData, string>> = {};

        Object.entries(err.response.data.errors).forEach(([key, messages]) => {
          if (Array.isArray(messages) && messages.length > 0) {
            // Map snake_case to camelCase
            const camelKey = key
              .split('_')
              .map((word, index) => 
                index === 0 
                  ? word 
                  : word.charAt(0).toUpperCase() + word.slice(1)
              )
              .join('');
            apiErrors[camelKey as keyof BudgetFormData] = messages[0];
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
            "Failed to update budget",
        });
      }
      return null;
    }
  },

  deleteBudget: async (id: number) => {
    try {
      set({ loading: true, error: null });
      const response = (await deleteBudgetAPI(id)) as ApiResponse<void>;

      if (response.success) {
        // Remove from budgets list
        set((state) => ({
          budgets: state.budgets.filter((budget) => budget.id !== id),
          loading: false,
          error: null,
        }));
        // Refresh to get updated pagination
        await get().fetchBudgets();
        return true;
      } else {
        set({
          loading: false,
          error: response.message || "Failed to delete budget",
        });
        return false;
      }
    } catch (err: any) {
      set({
        loading: false,
        error:
          err?.response?.data?.message ||
          err?.message ||
          "Failed to delete budget",
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

  // Load budget data into form for editing
  loadBudgetForEdit: (budget: BudgetFromAPI) => {
    const formData: BudgetFormData = {
      category: budget.category,
      budgetedAmount: budget.budgeted_amount,
      period: budget.period,
      description: budget.description || "",
    };
    set({ formData, errors: {} });
  },
}));
