import { create } from "zustand";

export interface JournalEntryFormData {
  date: string;
  referenceNumber: string;
  description: string;
  debitAccountId: string;
  creditAccountId: string;
  amount: string;
}

interface JournalEntryState {
  formData: JournalEntryFormData;
  errors: Partial<Record<keyof JournalEntryFormData, string>>;
  isOpen: boolean;
  setFormData: (data: JournalEntryFormData) => void;
  updateField: (field: keyof JournalEntryFormData, value: string) => void;
  setError: (field: keyof JournalEntryFormData, error: string | undefined) => void;
  setErrors: (errors: Partial<Record<keyof JournalEntryFormData, string>>) => void;
  clearErrors: () => void;
  clearError: (field: keyof JournalEntryFormData) => void;
  resetForm: () => void;
  setIsOpen: (open: boolean) => void;
  validateForm: () => boolean;
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
}));

