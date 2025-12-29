import { create } from "zustand";
import {
  getAccounts,
  getAccount as getAccountAPI,
  createAccount as createAccountAPI,
  updateAccount as updateAccountAPI,
  deleteAccount as deleteAccountAPI,
} from "@/lib/api";
import { ApiResponse } from "@/lib/types";

export type AccountType = "Asset" | "Liability" | "Equity" | "Revenue" | "Expense";

export interface AccountFormData {
  accountType: AccountType;
  code: string;
  accountName: string;
  debit: string;
  credit: string;
}

// Account from API (snake_case)
export interface AccountFromAPI {
  id: number;
  account_type: AccountType;
  code: string;
  account_name: string;
  debit: string;
  credit: string;
  created_at: string;
  updated_at: string;
}

// Accounts data response
export interface AccountsData {
  accounts: AccountFromAPI[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

interface AccountState {
  // Form state
  formData: AccountFormData;
  errors: Partial<Record<keyof AccountFormData, string>>;
  isOpen: boolean;

  // Data state
  accounts: AccountFromAPI[];
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
    account_type?: AccountType;
    per_page?: number;
    page?: number;
  };

  // Form actions
  setFormData: (data: AccountFormData) => void;
  updateField: (field: keyof AccountFormData, value: string) => void;
  setError: (field: keyof AccountFormData, error: string | undefined) => void;
  setErrors: (errors: Partial<Record<keyof AccountFormData, string>>) => void;
  clearErrors: () => void;
  clearError: (field: keyof AccountFormData) => void;
  resetForm: () => void;
  setIsOpen: (open: boolean) => void;
  validateForm: () => boolean;

  // Data actions
  fetchAccounts: () => Promise<void>;
  getAccount: (id: number) => Promise<AccountFromAPI | null>;
  createAccount: (data: AccountFormData) => Promise<AccountFromAPI | null>;
  updateAccount: (
    id: number,
    data: AccountFormData
  ) => Promise<AccountFromAPI | null>;
  deleteAccount: (id: number) => Promise<boolean>;
  setFilters: (filters: Partial<AccountState["filters"]>) => void;
  clearFilters: () => void;
  loadAccountForEdit: (account: AccountFromAPI) => void;
}

const initialFormData: AccountFormData = {
  accountType: "Asset",
  code: "",
  accountName: "",
  debit: "0",
  credit: "0",
};

export const useAccountStore = create<AccountState>((set, get) => ({
  formData: initialFormData,
  errors: {},
  isOpen: false,

  accounts: [],
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
    const newErrors: Partial<Record<keyof AccountFormData, string>> = {};

    // Required fields validation
    if (!formData.accountType) newErrors.accountType = "Account Type is required";
    if (!formData.code.trim()) newErrors.code = "Account Code is required";
    if (!formData.accountName.trim()) newErrors.accountName = "Account Name is required";

    // Validate code format (should be numeric)
    if (formData.code.trim() && !/^\d+$/.test(formData.code.trim())) {
      newErrors.code = "Account Code must be numeric";
    }

    // Validate debit and credit are numeric
    if (formData.debit && isNaN(parseFloat(formData.debit))) {
      newErrors.debit = "Debit must be a valid number";
    }
    if (formData.credit && isNaN(parseFloat(formData.credit))) {
      newErrors.credit = "Credit must be a valid number";
    }

    set({ errors: newErrors });
    return Object.keys(newErrors).length === 0;
  },

  // Data actions
  getAccount: async (id: number) => {
    try {
      set({ loading: true, error: null });
      const response = (await getAccountAPI(id)) as ApiResponse<AccountFromAPI>;

      if (response.success && response.data) {
        set({ loading: false, error: null });
        return response.data;
      } else {
        set({
          loading: false,
          error: response.message || "Failed to load account",
        });
        return null;
      }
    } catch (err: any) {
      set({
        loading: false,
        error:
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load account",
      });
      return null;
    }
  },

  fetchAccounts: async () => {
    try {
      set({ loading: true, error: null });
      const { filters } = get();
      const params: Record<string, string | number> = {};

      // Set default per_page if not provided
      params.per_page = filters.per_page || 15;

      // Add page parameter if provided
      if (filters.page) params.page = filters.page;

      if (filters.search) params.search = filters.search;
      if (filters.account_type) params.account_type = filters.account_type;

      const response = await getAccounts(filters);

      if (response.success && response.data) {
        set({
          accounts: response.data.accounts,
          pagination: response.data.pagination,
          loading: false,
          error: null,
        });
      } else {
        set({
          loading: false,
          error: response.message || "Failed to load accounts",
        });
      }
    } catch (err: any) {
      set({
        loading: false,
        error:
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load accounts",
      });
    }
  },

  createAccount: async (data: AccountFormData) => {
    try {
      set({ loading: true, error: null, errors: {} });
      
      // Transform form data to API format (camelCase to snake_case)
      const apiData = {
        account_type: data.accountType,
        code: data.code.trim(),
        account_name: data.accountName.trim(),
        debit: data.debit ? parseFloat(data.debit) : 0,
        credit: data.credit ? parseFloat(data.credit) : 0,
      };

      const response = (await createAccountAPI(
        apiData
      )) as ApiResponse<AccountFromAPI>;

      if (response.success && response.data) {
        const newAccount = response.data;
        // Add to accounts list
        set((state) => ({
          accounts: [newAccount, ...state.accounts],
          loading: false,
          error: null,
          errors: {},
        }));
        // Refresh to get updated pagination
        await get().fetchAccounts();
        return newAccount;
      } else {
        // Handle validation errors from API
        if (response.errors) {
          const apiErrors: Partial<Record<keyof AccountFormData, string>> = {};

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
              apiErrors[camelKey as keyof AccountFormData] = messages[0];
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
            error: response.message || "Failed to create account",
          });
        }
        return null;
      }
    } catch (err: any) {
      // Handle API validation errors
      if (err?.response?.data?.errors) {
        const apiErrors: Partial<Record<keyof AccountFormData, string>> = {};

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
            apiErrors[camelKey as keyof AccountFormData] = messages[0];
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
            "Failed to create account",
        });
      }
      return null;
    }
  },

  updateAccount: async (id: number, data: AccountFormData) => {
    try {
      set({ loading: true, error: null, errors: {} });
      
      // Transform form data to API format (camelCase to snake_case)
      const apiData = {
        account_type: data.accountType,
        code: data.code.trim(),
        account_name: data.accountName.trim(),
        debit: data.debit ? parseFloat(data.debit) : 0,
        credit: data.credit ? parseFloat(data.credit) : 0,
      };

      const response = (await updateAccountAPI(
        id,
        apiData
      )) as ApiResponse<AccountFromAPI>;

      if (response.success && response.data) {
        const updatedAccount = response.data;
        // Update in accounts list
        set((state) => ({
          accounts: state.accounts.map((acc) =>
            acc.id === id ? updatedAccount : acc
          ),
          loading: false,
          error: null,
          errors: {},
        }));
        return updatedAccount;
      } else {
        // Handle validation errors from API
        if (response.errors) {
          const apiErrors: Partial<Record<keyof AccountFormData, string>> = {};

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
              apiErrors[camelKey as keyof AccountFormData] = messages[0];
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
            error: response.message || "Failed to update account",
          });
        }
        return null;
      }
    } catch (err: any) {
      // Handle API validation errors
      if (err?.response?.data?.errors) {
        const apiErrors: Partial<Record<keyof AccountFormData, string>> = {};

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
            apiErrors[camelKey as keyof AccountFormData] = messages[0];
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
            "Failed to update account",
        });
      }
      return null;
    }
  },

  deleteAccount: async (id: number) => {
    try {
      set({ loading: true, error: null });
      const response = (await deleteAccountAPI(id)) as ApiResponse<void>;

      if (response.success) {
        // Remove from accounts list
        set((state) => ({
          accounts: state.accounts.filter((acc) => acc.id !== id),
          loading: false,
          error: null,
        }));
        // Refresh to get updated pagination
        await get().fetchAccounts();
        return true;
      } else {
        set({
          loading: false,
          error: response.message || "Failed to delete account",
        });
        return false;
      }
    } catch (err: any) {
      set({
        loading: false,
        error:
          err?.response?.data?.message ||
          err?.message ||
          "Failed to delete account",
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

  // Load account data into form for editing
  loadAccountForEdit: (account: AccountFromAPI) => {
    const formData: AccountFormData = {
      accountType: account.account_type,
      code: account.code,
      accountName: account.account_name,
      debit: account.debit,
      credit: account.credit,
    };
    set({ formData, errors: {} });
  },
}));
