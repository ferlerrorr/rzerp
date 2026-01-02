import { create } from "zustand";
import {
  getInvoices,
  getInvoice as getInvoiceAPI,
  createInvoice as createInvoiceAPI,
  updateInvoice as updateInvoiceAPI,
  deleteInvoice as deleteInvoiceAPI,
  approveInvoice as approveInvoiceAPI,
  payInvoice as payInvoiceAPI,
} from "@/lib/api";
import { ApiResponse } from "@/lib/types";
import { toast } from "sonner";

export interface InvoiceFormData {
  invoiceNumber: string;
  vendorId: string;
  description: string;
  invoiceDate: string;
  dueDate: string;
  amount: string;
  category: string;
  customCategory: string;
}

// Invoice from API (snake_case)
export interface InvoiceFromAPI {
  id: number;
  invoice_number: string;
  vendor_id: number;
  vendor: {
    id: number;
    name: string;
  };
  description: string;
  invoice_date: string;
  due_date: string;
  amount: string;
  category: string;
  status: "Pending" | "Approved" | "Paid" | "Overdue";
  created_at: string;
  updated_at: string;
}

// Invoices data response
export interface InvoicesData {
  invoices: InvoiceFromAPI[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

interface InvoiceState {
  // Form state
  formData: InvoiceFormData;
  errors: Partial<Record<keyof InvoiceFormData, string>>;
  isOpen: boolean;

  // Data state
  invoices: InvoiceFromAPI[];
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
    status?: "Pending" | "Approved" | "Paid" | "Overdue";
    vendor_id?: number;
    per_page?: number;
    page?: number;
  };

  // Form actions
  setFormData: (data: InvoiceFormData) => void;
  updateField: (field: keyof InvoiceFormData, value: string) => void;
  setError: (field: keyof InvoiceFormData, error: string | undefined) => void;
  setErrors: (errors: Partial<Record<keyof InvoiceFormData, string>>) => void;
  clearErrors: () => void;
  clearError: (field: keyof InvoiceFormData) => void;
  resetForm: () => void;
  setIsOpen: (open: boolean) => void;
  validateForm: () => boolean;

  // Data actions
  fetchInvoices: () => Promise<void>;
  getInvoice: (id: number) => Promise<InvoiceFromAPI | null>;
  createInvoice: (data: InvoiceFormData) => Promise<InvoiceFromAPI | null>;
  updateInvoice: (
    id: number,
    data: InvoiceFormData
  ) => Promise<InvoiceFromAPI | null>;
  deleteInvoice: (id: number) => Promise<boolean>;
  approveInvoice: (id: number) => Promise<boolean>;
  payInvoice: (id: number) => Promise<boolean>;
  setFilters: (filters: Partial<InvoiceState["filters"]>) => void;
  clearFilters: () => void;
  loadInvoiceForEdit: (invoice: InvoiceFromAPI) => void;
}

const initialFormData: InvoiceFormData = {
  invoiceNumber: "",
  vendorId: "",
  description: "",
  invoiceDate: "",
  dueDate: "",
  amount: "",
  category: "",
  customCategory: "",
};

export const useInvoiceStore = create<InvoiceState>((set, get) => ({
  formData: initialFormData,
  errors: {},
  isOpen: false,

  invoices: [],
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
    const newErrors: Partial<Record<keyof InvoiceFormData, string>> = {};

    // Required fields validation
    if (!formData.invoiceNumber.trim()) newErrors.invoiceNumber = "Invoice Number is required";
    if (!formData.vendorId) newErrors.vendorId = "Vendor is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.invoiceDate.trim()) newErrors.invoiceDate = "Invoice Date is required";
    if (!formData.dueDate.trim()) newErrors.dueDate = "Due Date is required";
    if (!formData.amount.trim()) newErrors.amount = "Amount is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (formData.category === "Other" && !formData.customCategory.trim()) {
      newErrors.customCategory = "Custom category is required";
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
  fetchInvoices: async () => {
    try {
      set({ loading: true, error: null });
      const filters = get().filters;
      const response = (await getInvoices(filters)) as ApiResponse<InvoicesData>;

      if (response.success && response.data) {
        set({
          invoices: response.data.invoices,
          pagination: response.data.pagination,
          loading: false,
        });
      } else {
        set({
          error: response.message || "Failed to fetch invoices",
          loading: false,
        });
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch invoices";
      set({ error: errorMessage, loading: false });
      toast.error("Error", {
        description: errorMessage,
      });
    }
  },

  getInvoice: async (id: number) => {
    try {
      set({ loading: true, error: null });
      const response = (await getInvoiceAPI(id)) as ApiResponse<InvoiceFromAPI>;

      if (response.success && response.data) {
        set({ loading: false });
        return response.data;
      } else {
        set({
          error: response.message || "Failed to fetch invoice",
          loading: false,
        });
        return null;
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch invoice";
      set({ error: errorMessage, loading: false });
      toast.error("Error", {
        description: errorMessage,
      });
      return null;
    }
  },

  createInvoice: async (data: InvoiceFormData) => {
    try {
      set({ loading: true, error: null });

      // Transform camelCase to snake_case for API
      // Use custom value if "Other" is selected
      const category = (data.category === "Other" && data.customCategory) 
        ? data.customCategory 
        : data.category;

      const apiData = {
        invoice_number: data.invoiceNumber,
        vendor_id: parseInt(data.vendorId),
        description: data.description,
        invoice_date: data.invoiceDate,
        due_date: data.dueDate,
        amount: parseFloat(data.amount),
        category: category,
      };

      const response = (await createInvoiceAPI(apiData)) as ApiResponse<InvoiceFromAPI>;

      if (response.success && response.data) {
        set({ loading: false });
        toast.success("Invoice created successfully");
        // Refresh invoices list
        await get().fetchInvoices();
        return response.data;
      } else {
        const errorMessage = response.message || "Failed to create invoice";
        set({ error: errorMessage, loading: false });
        toast.error("Error", {
          description: errorMessage,
        });
        return null;
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to create invoice";
      set({ error: errorMessage, loading: false });
      toast.error("Error", {
        description: errorMessage,
      });
      return null;
    }
  },

  updateInvoice: async (id: number, data: InvoiceFormData) => {
    try {
      set({ loading: true, error: null });

      // Transform camelCase to snake_case for API
      // Use custom value if "Other" is selected
      const category = (data.category === "Other" && data.customCategory) 
        ? data.customCategory 
        : data.category;

      const apiData = {
        invoice_number: data.invoiceNumber,
        vendor_id: parseInt(data.vendorId),
        description: data.description,
        invoice_date: data.invoiceDate,
        due_date: data.dueDate,
        amount: parseFloat(data.amount),
        category: category,
      };

      const response = (await updateInvoiceAPI(id, apiData)) as ApiResponse<InvoiceFromAPI>;

      if (response.success && response.data) {
        set({ loading: false });
        toast.success("Invoice updated successfully");
        // Refresh invoices list
        await get().fetchInvoices();
        return response.data;
      } else {
        const errorMessage = response.message || "Failed to update invoice";
        set({ error: errorMessage, loading: false });
        toast.error("Error", {
          description: errorMessage,
        });
        return null;
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to update invoice";
      set({ error: errorMessage, loading: false });
      toast.error("Error", {
        description: errorMessage,
      });
      return null;
    }
  },

  deleteInvoice: async (id: number) => {
    try {
      set({ loading: true, error: null });
      const response = (await deleteInvoiceAPI(id)) as ApiResponse<unknown>;

      if (response.success) {
        set({ loading: false });
        toast.success("Invoice deleted successfully");
        // Refresh invoices list
        await get().fetchInvoices();
        return true;
      } else {
        const errorMessage = response.message || "Failed to delete invoice";
        set({ error: errorMessage, loading: false });
        toast.error("Error", {
          description: errorMessage,
        });
        return false;
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete invoice";
      set({ error: errorMessage, loading: false });
      toast.error("Error", {
        description: errorMessage,
      });
      return false;
    }
  },

  approveInvoice: async (id: number) => {
    try {
      set({ loading: true, error: null });
      const response = (await approveInvoiceAPI(id)) as ApiResponse<InvoiceFromAPI>;

      if (response.success) {
        set({ loading: false });
        toast.success("Invoice approved successfully");
        // Refresh invoices list
        await get().fetchInvoices();
        return true;
      } else {
        const errorMessage = response.message || "Failed to approve invoice";
        set({ error: errorMessage, loading: false });
        toast.error("Error", {
          description: errorMessage,
        });
        return false;
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to approve invoice";
      set({ error: errorMessage, loading: false });
      toast.error("Error", {
        description: errorMessage,
      });
      return false;
    }
  },

  payInvoice: async (id: number) => {
    try {
      set({ loading: true, error: null });
      const response = (await payInvoiceAPI(id)) as ApiResponse<InvoiceFromAPI>;

      if (response.success) {
        set({ loading: false });
        toast.success("Invoice marked as paid successfully");
        // Refresh invoices list
        await get().fetchInvoices();
        return true;
      } else {
        const errorMessage = response.message || "Failed to pay invoice";
        set({ error: errorMessage, loading: false });
        toast.error("Error", {
          description: errorMessage,
        });
        return false;
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to pay invoice";
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

  loadInvoiceForEdit: (invoice: InvoiceFromAPI) => {
    // Check if category is in predefined list, otherwise set to "Other"
    const categoryOptions = [
      "Office Supplies",
      "Professional Services",
      "Software & Technology",
      "Rent & Utilities",
      "Marketing & Advertising",
      "Travel & Entertainment",
      "Equipment",
      "Maintenance & Repairs",
      "Insurance",
      "Other",
    ];
    const isCategoryInList = categoryOptions.includes(invoice.category);
    const category = isCategoryInList ? invoice.category : "Other";
    const customCategory = isCategoryInList ? "" : invoice.category;

    set({
      formData: {
        invoiceNumber: invoice.invoice_number,
        vendorId: invoice.vendor_id.toString(),
        description: invoice.description,
        invoiceDate: invoice.invoice_date,
        dueDate: invoice.due_date,
        amount: invoice.amount,
        category: category,
        customCategory: customCategory,
      },
    });
  },
}));

