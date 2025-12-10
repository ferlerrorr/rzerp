import { create } from "zustand";

export interface BudgetFormData {
  category: string;
  budgetedAmount: string;
  period: string; // e.g., "2024", "2024-Q1", "2024-01"
  description: string;
}

interface BudgetState {
  formData: BudgetFormData;
  errors: Partial<Record<keyof BudgetFormData, string>>;
  isOpen: boolean;
  setFormData: (data: BudgetFormData) => void;
  updateField: (field: keyof BudgetFormData, value: string) => void;
  setError: (field: keyof BudgetFormData, error: string | undefined) => void;
  setErrors: (errors: Partial<Record<keyof BudgetFormData, string>>) => void;
  clearErrors: () => void;
  clearError: (field: keyof BudgetFormData) => void;
  resetForm: () => void;
  setIsOpen: (open: boolean) => void;
  validateForm: () => boolean;
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
}));

