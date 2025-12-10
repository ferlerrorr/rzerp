import { create } from "zustand";

export interface ReceivableInvoiceFormData {
  invoiceNumber: string;
  customer: string;
  description: string;
  invoiceDate: string;
  dueDate: string;
  amount: string;
  paymentTerms: string;
}

interface ReceivableInvoiceState {
  formData: ReceivableInvoiceFormData;
  errors: Partial<Record<keyof ReceivableInvoiceFormData, string>>;
  isOpen: boolean;
  setFormData: (data: ReceivableInvoiceFormData) => void;
  updateField: (field: keyof ReceivableInvoiceFormData, value: string) => void;
  setError: (field: keyof ReceivableInvoiceFormData, error: string | undefined) => void;
  setErrors: (errors: Partial<Record<keyof ReceivableInvoiceFormData, string>>) => void;
  clearErrors: () => void;
  clearError: (field: keyof ReceivableInvoiceFormData) => void;
  resetForm: () => void;
  setIsOpen: (open: boolean) => void;
  validateForm: () => boolean;
}

const initialFormData: ReceivableInvoiceFormData = {
  invoiceNumber: "",
  customer: "",
  description: "",
  invoiceDate: "",
  dueDate: "",
  amount: "",
  paymentTerms: "",
};

export const useReceivableInvoiceStore = create<ReceivableInvoiceState>((set, get) => ({
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
    const newErrors: Partial<Record<keyof ReceivableInvoiceFormData, string>> = {};

    // Required fields validation
    if (!formData.invoiceNumber.trim()) newErrors.invoiceNumber = "Invoice Number is required";
    if (!formData.customer.trim()) newErrors.customer = "Customer is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.invoiceDate.trim()) newErrors.invoiceDate = "Invoice Date is required";
    if (!formData.dueDate.trim()) newErrors.dueDate = "Due Date is required";
    if (!formData.amount.trim()) newErrors.amount = "Amount is required";
    if (!formData.paymentTerms) newErrors.paymentTerms = "Payment Terms is required";

    // Validate amount is numeric and positive
    if (formData.amount.trim()) {
      const amountNum = parseFloat(formData.amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        newErrors.amount = "Amount must be a positive number";
      }
    }

    // Validate due date is after invoice date
    if (formData.invoiceDate && formData.dueDate) {
      const invoiceDate = new Date(formData.invoiceDate);
      const dueDate = new Date(formData.dueDate);
      if (dueDate < invoiceDate) {
        newErrors.dueDate = "Due Date must be after Invoice Date";
      }
    }

    set({ errors: newErrors });
    return Object.keys(newErrors).length === 0;
  },
}));

