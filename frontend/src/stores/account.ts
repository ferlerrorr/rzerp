import { create } from "zustand";

export type AccountType = "Asset" | "Liability" | "Equity" | "Revenue" | "Expense";

export interface AccountFormData {
  accountType: AccountType;
  code: string;
  accountName: string;
  debit: string;
  credit: string;
}

interface AccountState {
  formData: AccountFormData;
  errors: Partial<Record<keyof AccountFormData, string>>;
  isOpen: boolean;
  setFormData: (data: AccountFormData) => void;
  updateField: (field: keyof AccountFormData, value: string) => void;
  setError: (field: keyof AccountFormData, error: string | undefined) => void;
  setErrors: (errors: Partial<Record<keyof AccountFormData, string>>) => void;
  clearErrors: () => void;
  clearError: (field: keyof AccountFormData) => void;
  resetForm: () => void;
  setIsOpen: (open: boolean) => void;
  validateForm: () => boolean;
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
}));

