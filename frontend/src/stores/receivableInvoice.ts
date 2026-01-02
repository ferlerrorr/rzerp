import { create } from "zustand";
import {
  getReceivableInvoices,
  getReceivableInvoice as getReceivableInvoiceAPI,
  createReceivableInvoice as createReceivableInvoiceAPI,
  updateReceivableInvoice as updateReceivableInvoiceAPI,
  deleteReceivableInvoice as deleteReceivableInvoiceAPI,
  recordPayment as recordPaymentAPI,
} from "@/lib/api";
import { ApiResponse } from "@/lib/types";
import { toast } from "sonner";

export interface ReceivableInvoiceFormData {
  invoiceNumber: string;
  customerId: string;
  description: string;
  invoiceDate: string;
  dueDate: string;
  amount: string;
  paymentTerms: string;
  customPaymentTerms: string;
}

// Receivable Invoice from API (snake_case)
export interface ReceivableInvoiceFromAPI {
  id: number;
  invoice_number: string;
  customer_id: number;
  customer: {
    id: number;
    company_name: string;
  };
  description: string;
  invoice_date: string;
  due_date: string;
  amount: string;
  balance: string;
  payment_terms: string | null;
  status: "Pending" | "Paid" | "Overdue" | "Partial";
  created_at: string;
  updated_at: string;
}

// Receivable Invoices data response
export interface ReceivableInvoicesData {
  receivable_invoices: ReceivableInvoiceFromAPI[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

interface ReceivableInvoiceState {
  // Form state
  formData: ReceivableInvoiceFormData;
  errors: Partial<Record<keyof ReceivableInvoiceFormData, string>>;
  isOpen: boolean;

  // Data state
  receivableInvoices: ReceivableInvoiceFromAPI[];
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
    status?: "Pending" | "Paid" | "Overdue" | "Partial";
    customer_id?: number;
    per_page?: number;
    page?: number;
  };

  // Form actions
  setFormData: (data: ReceivableInvoiceFormData) => void;
  updateField: (field: keyof ReceivableInvoiceFormData, value: string) => void;
  setError: (field: keyof ReceivableInvoiceFormData, error: string | undefined) => void;
  setErrors: (errors: Partial<Record<keyof ReceivableInvoiceFormData, string>>) => void;
  clearErrors: () => void;
  clearError: (field: keyof ReceivableInvoiceFormData) => void;
  resetForm: () => void;
  setIsOpen: (open: boolean) => void;
  validateForm: () => boolean;

  // Data actions
  fetchReceivableInvoices: () => Promise<void>;
  getReceivableInvoice: (id: number) => Promise<ReceivableInvoiceFromAPI | null>;
  createReceivableInvoice: (data: ReceivableInvoiceFormData) => Promise<ReceivableInvoiceFromAPI | null>;
  updateReceivableInvoice: (
    id: number,
    data: ReceivableInvoiceFormData
  ) => Promise<ReceivableInvoiceFromAPI | null>;
  deleteReceivableInvoice: (id: number) => Promise<boolean>;
  recordPayment: (invoiceId: number, amount: number, paymentDate?: string) => Promise<boolean>;
  setFilters: (filters: Partial<ReceivableInvoiceState["filters"]>) => void;
  clearFilters: () => void;
  loadReceivableInvoiceForEdit: (invoice: ReceivableInvoiceFromAPI) => void;
}

const initialFormData: ReceivableInvoiceFormData = {
  invoiceNumber: "",
  customerId: "",
  description: "",
  invoiceDate: "",
  dueDate: "",
  amount: "",
  paymentTerms: "",
  customPaymentTerms: "",
};

export const useReceivableInvoiceStore = create<ReceivableInvoiceState>((set, get) => ({
  formData: initialFormData,
  errors: {},
  isOpen: false,

  receivableInvoices: [],
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
    const newErrors: Partial<Record<keyof ReceivableInvoiceFormData, string>> = {};

    // Required fields validation
    if (!formData.invoiceNumber.trim()) newErrors.invoiceNumber = "Invoice Number is required";
    if (!formData.customerId) newErrors.customerId = "Customer is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.invoiceDate.trim()) newErrors.invoiceDate = "Invoice Date is required";
    if (!formData.dueDate.trim()) newErrors.dueDate = "Due Date is required";
    if (!formData.amount.trim()) newErrors.amount = "Amount is required";
    if (!formData.paymentTerms) newErrors.paymentTerms = "Payment Terms is required";
    if (formData.paymentTerms === "Custom" && !formData.customPaymentTerms.trim()) {
      newErrors.customPaymentTerms = "Custom payment terms is required";
    }

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

  // Data actions
  fetchReceivableInvoices: async () => {
    try {
      set({ loading: true, error: null });
      const filters = get().filters;
      const response = (await getReceivableInvoices(filters)) as ApiResponse<ReceivableInvoicesData>;

      if (response.success && response.data) {
        set({
          receivableInvoices: response.data.receivable_invoices,
          pagination: response.data.pagination,
          loading: false,
        });
      } else {
        set({
          error: response.message || "Failed to fetch receivable invoices",
          loading: false,
        });
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch receivable invoices";
      set({ error: errorMessage, loading: false });
      toast.error("Error", {
        description: errorMessage,
      });
    }
  },

  getReceivableInvoice: async (id: number) => {
    try {
      set({ loading: true, error: null });
      const response = (await getReceivableInvoiceAPI(id)) as ApiResponse<ReceivableInvoiceFromAPI>;

      if (response.success && response.data) {
        set({ loading: false });
        return response.data;
      } else {
        set({
          error: response.message || "Failed to fetch receivable invoice",
          loading: false,
        });
        return null;
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch receivable invoice";
      set({ error: errorMessage, loading: false });
      toast.error("Error", {
        description: errorMessage,
      });
      return null;
    }
  },

  createReceivableInvoice: async (data: ReceivableInvoiceFormData) => {
    try {
      set({ loading: true, error: null });

      // Transform camelCase to snake_case for API
      // Use custom value if "Custom" is selected
      const paymentTerms = (data.paymentTerms === "Custom" && data.customPaymentTerms) 
        ? data.customPaymentTerms 
        : data.paymentTerms;

      const apiData = {
        invoice_number: data.invoiceNumber,
        customer_id: parseInt(data.customerId),
        description: data.description,
        invoice_date: data.invoiceDate,
        due_date: data.dueDate,
        amount: parseFloat(data.amount),
        payment_terms: paymentTerms || null,
      };

      const response = (await createReceivableInvoiceAPI(apiData)) as ApiResponse<ReceivableInvoiceFromAPI>;

      if (response.success && response.data) {
        set({ loading: false });
        toast.success("Receivable invoice created successfully");
        // Refresh invoices list
        await get().fetchReceivableInvoices();
        return response.data;
      } else {
        const errorMessage = response.message || "Failed to create receivable invoice";
        set({ error: errorMessage, loading: false });
        toast.error("Error", {
          description: errorMessage,
        });
        return null;
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to create receivable invoice";
      set({ error: errorMessage, loading: false });
      toast.error("Error", {
        description: errorMessage,
      });
      return null;
    }
  },

  updateReceivableInvoice: async (id: number, data: ReceivableInvoiceFormData) => {
    try {
      set({ loading: true, error: null });

      // Transform camelCase to snake_case for API
      const paymentTerms = (data.paymentTerms === "Custom" && data.customPaymentTerms) 
        ? data.customPaymentTerms 
        : data.paymentTerms;

      const apiData = {
        invoice_number: data.invoiceNumber,
        customer_id: parseInt(data.customerId),
        description: data.description,
        invoice_date: data.invoiceDate,
        due_date: data.dueDate,
        amount: parseFloat(data.amount),
        payment_terms: paymentTerms || null,
      };

      const response = (await updateReceivableInvoiceAPI(id, apiData)) as ApiResponse<ReceivableInvoiceFromAPI>;

      if (response.success && response.data) {
        set({ loading: false });
        toast.success("Receivable invoice updated successfully");
        // Refresh invoices list
        await get().fetchReceivableInvoices();
        return response.data;
      } else {
        const errorMessage = response.message || "Failed to update receivable invoice";
        set({ error: errorMessage, loading: false });
        toast.error("Error", {
          description: errorMessage,
        });
        return null;
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to update receivable invoice";
      set({ error: errorMessage, loading: false });
      toast.error("Error", {
        description: errorMessage,
      });
      return null;
    }
  },

  deleteReceivableInvoice: async (id: number) => {
    try {
      set({ loading: true, error: null });
      const response = (await deleteReceivableInvoiceAPI(id)) as ApiResponse<unknown>;

      if (response.success) {
        set({ loading: false });
        toast.success("Receivable invoice deleted successfully");
        // Refresh invoices list
        await get().fetchReceivableInvoices();
        return true;
      } else {
        const errorMessage = response.message || "Failed to delete receivable invoice";
        set({ error: errorMessage, loading: false });
        toast.error("Error", {
          description: errorMessage,
        });
        return false;
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete receivable invoice";
      set({ error: errorMessage, loading: false });
      toast.error("Error", {
        description: errorMessage,
      });
      return false;
    }
  },

  recordPayment: async (invoiceId: number, amount: number, paymentDate?: string) => {
    try {
      set({ loading: true, error: null });
      const response = (await recordPaymentAPI({
        receivable_invoice_id: invoiceId,
        amount: amount,
        payment_date: paymentDate || new Date().toISOString().split('T')[0],
      })) as ApiResponse<unknown>;

      if (response.success) {
        set({ loading: false });
        toast.success("Payment recorded successfully");
        // Refresh invoices list
        await get().fetchReceivableInvoices();
        return true;
      } else {
        const errorMessage = response.message || "Failed to record payment";
        set({ error: errorMessage, loading: false });
        toast.error("Error", {
          description: errorMessage,
        });
        return false;
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to record payment";
      set({ error: errorMessage, loading: false });
      toast.error("Error", {
        description: errorMessage,
      });
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

  loadReceivableInvoiceForEdit: (invoice: ReceivableInvoiceFromAPI) => {
    // Check if payment_terms is in predefined list
    const paymentTermsOptions = [
      "Net 15",
      "Net 30",
      "Net 45",
      "Net 60",
      "Due on Receipt",
      "2/10 Net 30",
      "1/15 Net 30",
      "Custom",
    ];
    const isPaymentTermsInList = paymentTermsOptions.includes(invoice.payment_terms || "");
    const paymentTerms = isPaymentTermsInList ? (invoice.payment_terms || "") : "Custom";
    const customPaymentTerms = isPaymentTermsInList ? "" : (invoice.payment_terms || "");

    set({
      formData: {
        invoiceNumber: invoice.invoice_number,
        customerId: invoice.customer_id.toString(),
        description: invoice.description,
        invoiceDate: invoice.invoice_date,
        dueDate: invoice.due_date,
        amount: invoice.amount,
        paymentTerms: paymentTerms,
        customPaymentTerms: customPaymentTerms,
      },
    });
  },
}));
