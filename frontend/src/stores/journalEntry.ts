import { create } from "zustand";
import {
  getJournalEntries,
  getJournalEntry as getJournalEntryAPI,
  createJournalEntry as createJournalEntryAPI,
  updateJournalEntry as updateJournalEntryAPI,
  deleteJournalEntry as deleteJournalEntryAPI,
  postJournalEntry as postJournalEntryAPI,
} from "@/lib/api";
import { ApiResponse } from "@/lib/types";

export interface JournalEntryFormData {
  date: string;
  referenceNumber: string;
  description: string;
  debitAccountId: string;
  creditAccountId: string;
  amount: string;
}

// Journal Entry from API (snake_case)
export interface JournalEntryFromAPI {
  id: number;
  date: string;
  reference_number: string;
  description: string;
  debit_account_id: number;
  credit_account_id: number;
  debit_account: {
    id: number;
    code: string;
    account_name: string;
  };
  credit_account: {
    id: number;
    code: string;
    account_name: string;
  };
  amount: string;
  status: "Draft" | "Posted";
  created_at: string;
  updated_at: string;
}

// Journal Entries data response
export interface JournalEntriesData {
  journal_entries: JournalEntryFromAPI[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

interface JournalEntryState {
  // Form state
  formData: JournalEntryFormData;
  errors: Partial<Record<keyof JournalEntryFormData, string>>;
  isOpen: boolean;

  // Data state
  journalEntries: JournalEntryFromAPI[];
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
    status?: "Draft" | "Posted";
    date_from?: string;
    date_to?: string;
    per_page?: number;
    page?: number;
  };

  // Form actions
  setFormData: (data: JournalEntryFormData) => void;
  updateField: (field: keyof JournalEntryFormData, value: string) => void;
  setError: (field: keyof JournalEntryFormData, error: string | undefined) => void;
  setErrors: (errors: Partial<Record<keyof JournalEntryFormData, string>>) => void;
  clearErrors: () => void;
  clearError: (field: keyof JournalEntryFormData) => void;
  resetForm: () => void;
  setIsOpen: (open: boolean) => void;
  validateForm: () => boolean;

  // Data actions
  fetchJournalEntries: () => Promise<void>;
  getJournalEntry: (id: number) => Promise<JournalEntryFromAPI | null>;
  createJournalEntry: (data: JournalEntryFormData) => Promise<JournalEntryFromAPI | null>;
  updateJournalEntry: (
    id: number,
    data: JournalEntryFormData
  ) => Promise<JournalEntryFromAPI | null>;
  deleteJournalEntry: (id: number) => Promise<boolean>;
  postJournalEntry: (id: number) => Promise<boolean>;
  setFilters: (filters: Partial<JournalEntryState["filters"]>) => void;
  clearFilters: () => void;
  loadJournalEntryForEdit: (journalEntry: JournalEntryFromAPI) => void;
}

const initialFormData: JournalEntryFormData = {
  date: "",
  referenceNumber: "",
  description: "",
  debitAccountId: "",
  creditAccountId: "",
  amount: "",
};

export const useJournalEntryStore = create<JournalEntryState>((set, get) => ({
  formData: initialFormData,
  errors: {},
  isOpen: false,

  journalEntries: [],
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
    const newErrors: Partial<Record<keyof JournalEntryFormData, string>> = {};

    // Required fields validation
    if (!formData.date.trim()) newErrors.date = "Date is required";
    if (!formData.referenceNumber.trim()) newErrors.referenceNumber = "Reference Number is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.debitAccountId) newErrors.debitAccountId = "Debit Account is required";
    if (!formData.creditAccountId) newErrors.creditAccountId = "Credit Account is required";
    if (!formData.amount.trim()) newErrors.amount = "Amount is required";

    // Validate amount is numeric and positive
    if (formData.amount.trim()) {
      const amountNum = parseFloat(formData.amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        newErrors.amount = "Amount must be a positive number";
      }
    }

    // Validate debit and credit accounts are different
    if (formData.debitAccountId && formData.creditAccountId && formData.debitAccountId === formData.creditAccountId) {
      newErrors.debitAccountId = "Debit and Credit accounts must be different";
      newErrors.creditAccountId = "Debit and Credit accounts must be different";
    }

    set({ errors: newErrors });
    return Object.keys(newErrors).length === 0;
  },

  // Data actions
  getJournalEntry: async (id: number) => {
    try {
      set({ loading: true, error: null });
      const response = (await getJournalEntryAPI(id)) as ApiResponse<JournalEntryFromAPI>;

      if (response.success && response.data) {
        set({ loading: false, error: null });
        return response.data;
      } else {
        set({
          loading: false,
          error: response.message || "Failed to load journal entry",
        });
        return null;
      }
    } catch (err: any) {
      set({
        loading: false,
        error:
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load journal entry",
      });
      return null;
    }
  },

  fetchJournalEntries: async () => {
    try {
      set({ loading: true, error: null });
      const { filters } = get();
      const params: Record<string, string | number> = {};

      // Set default per_page if not provided
      params.per_page = filters.per_page || 15;

      // Add page parameter if provided
      if (filters.page) params.page = filters.page;

      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.date_from) params.date_from = filters.date_from;
      if (filters.date_to) params.date_to = filters.date_to;

      const response = await getJournalEntries(filters);

      if (response.success && response.data) {
        set({
          journalEntries: response.data.journal_entries,
          pagination: response.data.pagination,
          loading: false,
          error: null,
        });
      } else {
        set({
          loading: false,
          error: response.message || "Failed to load journal entries",
        });
      }
    } catch (err: any) {
      set({
        loading: false,
        error:
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load journal entries",
      });
    }
  },

  createJournalEntry: async (data: JournalEntryFormData) => {
    try {
      set({ loading: true, error: null, errors: {} });
      
      // Transform form data to API format (camelCase to snake_case)
      const apiData = {
        date: data.date,
        reference_number: data.referenceNumber.trim(),
        description: data.description.trim(),
        debit_account_id: parseInt(data.debitAccountId),
        credit_account_id: parseInt(data.creditAccountId),
        amount: parseFloat(data.amount),
        status: "Draft",
      };

      const response = (await createJournalEntryAPI(
        apiData
      )) as ApiResponse<JournalEntryFromAPI>;

      if (response.success && response.data) {
        const newJournalEntry = response.data;
        // Add to journal entries list
        set((state) => ({
          journalEntries: [newJournalEntry, ...state.journalEntries],
          loading: false,
          error: null,
          errors: {},
        }));
        // Refresh to get updated pagination
        await get().fetchJournalEntries();
        return newJournalEntry;
      } else {
        // Handle validation errors from API
        if (response.errors) {
          const apiErrors: Partial<Record<keyof JournalEntryFormData, string>> = {};

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
              apiErrors[camelKey as keyof JournalEntryFormData] = messages[0];
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
            error: response.message || "Failed to create journal entry",
          });
        }
        return null;
      }
    } catch (err: any) {
      // Handle API validation errors
      if (err?.response?.data?.errors) {
        const apiErrors: Partial<Record<keyof JournalEntryFormData, string>> = {};

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
            apiErrors[camelKey as keyof JournalEntryFormData] = messages[0];
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
            "Failed to create journal entry",
        });
      }
      return null;
    }
  },

  updateJournalEntry: async (id: number, data: JournalEntryFormData) => {
    try {
      set({ loading: true, error: null, errors: {} });
      
      // Transform form data to API format (camelCase to snake_case)
      const apiData = {
        date: data.date,
        reference_number: data.referenceNumber.trim(),
        description: data.description.trim(),
        debit_account_id: parseInt(data.debitAccountId),
        credit_account_id: parseInt(data.creditAccountId),
        amount: parseFloat(data.amount),
      };

      const response = (await updateJournalEntryAPI(
        id,
        apiData
      )) as ApiResponse<JournalEntryFromAPI>;

      if (response.success && response.data) {
        const updatedJournalEntry = response.data;
        // Update in journal entries list
        set((state) => ({
          journalEntries: state.journalEntries.map((entry) =>
            entry.id === id ? updatedJournalEntry : entry
          ),
          loading: false,
          error: null,
          errors: {},
        }));
        return updatedJournalEntry;
      } else {
        // Handle validation errors from API
        if (response.errors) {
          const apiErrors: Partial<Record<keyof JournalEntryFormData, string>> = {};

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
              apiErrors[camelKey as keyof JournalEntryFormData] = messages[0];
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
            error: response.message || "Failed to update journal entry",
          });
        }
        return null;
      }
    } catch (err: any) {
      // Handle API validation errors
      if (err?.response?.data?.errors) {
        const apiErrors: Partial<Record<keyof JournalEntryFormData, string>> = {};

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
            apiErrors[camelKey as keyof JournalEntryFormData] = messages[0];
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
            "Failed to update journal entry",
        });
      }
      return null;
    }
  },

  deleteJournalEntry: async (id: number) => {
    try {
      set({ loading: true, error: null });
      const response = (await deleteJournalEntryAPI(id)) as ApiResponse<void>;

      if (response.success) {
        // Remove from journal entries list
        set((state) => ({
          journalEntries: state.journalEntries.filter((entry) => entry.id !== id),
          loading: false,
          error: null,
        }));
        // Refresh to get updated pagination
        await get().fetchJournalEntries();
        return true;
      } else {
        set({
          loading: false,
          error: response.message || "Failed to delete journal entry",
        });
        return false;
      }
    } catch (err: any) {
      set({
        loading: false,
        error:
          err?.response?.data?.message ||
          err?.message ||
          "Failed to delete journal entry",
      });
      return false;
    }
  },

  postJournalEntry: async (id: number) => {
    try {
      set({ loading: true, error: null });
      const response = (await postJournalEntryAPI(id)) as ApiResponse<JournalEntryFromAPI>;

      if (response.success && response.data) {
        const postedJournalEntry = response.data;
        // Update in journal entries list
        set((state) => ({
          journalEntries: state.journalEntries.map((entry) =>
            entry.id === id ? postedJournalEntry : entry
          ),
          loading: false,
          error: null,
        }));
        return true;
      } else {
        set({
          loading: false,
          error: response.message || "Failed to post journal entry",
        });
        return false;
      }
    } catch (err: any) {
      set({
        loading: false,
        error:
          err?.response?.data?.message ||
          err?.message ||
          "Failed to post journal entry",
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

  // Load journal entry data into form for editing
  loadJournalEntryForEdit: (journalEntry: JournalEntryFromAPI) => {
    const formData: JournalEntryFormData = {
      date: journalEntry.date,
      referenceNumber: journalEntry.reference_number,
      description: journalEntry.description,
      debitAccountId: journalEntry.debit_account_id.toString(),
      creditAccountId: journalEntry.credit_account_id.toString(),
      amount: journalEntry.amount,
    };
    set({ formData, errors: {} });
  },
}));
