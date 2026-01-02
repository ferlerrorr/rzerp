import { create } from "zustand";
import {
  getVendors,
  getVendor as getVendorAPI,
  createVendor as createVendorAPI,
  updateVendor as updateVendorAPI,
  deleteVendor as deleteVendorAPI,
} from "@/lib/api";
import { ApiResponse } from "@/lib/types";
import { toast } from "sonner";

export interface VendorFormData {
  companyName: string;
  contactPerson: string;
  category: string;
  customCategory: string;
  email: string;
  phone: string;
  address: string;
  tin: string;
  paymentTerms: string;
  customPaymentTerms: string;
  status: "Active" | "Inactive";
}

// Vendor from API (snake_case)
export interface VendorFromAPI {
  id: number;
  company_name: string;
  contact_person: string | null;
  category: string;
  email: string;
  phone: string;
  address: string;
  tin: string | null;
  payment_terms: string | null;
  status: "Active" | "Inactive";
  total_purchases: string;
  outstanding: string;
  created_at: string;
  updated_at: string;
}

// Vendors data response
export interface VendorsData {
  vendors: VendorFromAPI[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

interface VendorState {
  // Form state
  formData: VendorFormData;
  errors: Partial<Record<keyof VendorFormData, string>>;
  isOpen: boolean;

  // Data state
  vendors: VendorFromAPI[];
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
    status?: "Active" | "Inactive";
    category?: string;
    per_page?: number;
    page?: number;
  };

  // Form actions
  setFormData: (data: VendorFormData) => void;
  updateField: (field: keyof VendorFormData, value: string) => void;
  setError: (field: keyof VendorFormData, error: string | undefined) => void;
  setErrors: (errors: Partial<Record<keyof VendorFormData, string>>) => void;
  clearErrors: () => void;
  clearError: (field: keyof VendorFormData) => void;
  resetForm: () => void;
  setIsOpen: (open: boolean) => void;
  validateForm: () => boolean;

  // Data actions
  fetchVendors: () => Promise<void>;
  getVendor: (id: number) => Promise<VendorFromAPI | null>;
  createVendor: (data: VendorFormData) => Promise<VendorFromAPI | null>;
  updateVendor: (
    id: number,
    data: VendorFormData
  ) => Promise<VendorFromAPI | null>;
  deleteVendor: (id: number) => Promise<boolean>;
  setFilters: (filters: Partial<VendorState["filters"]>) => void;
  clearFilters: () => void;
  loadVendorForEdit: (vendor: VendorFromAPI) => void;
}

const initialFormData: VendorFormData = {
  companyName: "",
  contactPerson: "",
  category: "",
  customCategory: "",
  email: "",
  phone: "",
  address: "",
  tin: "",
  paymentTerms: "",
  customPaymentTerms: "",
  status: "Active",
};

export const useVendorStore = create<VendorState>((set, get) => ({
  formData: initialFormData,
  errors: {},
  isOpen: false,

  vendors: [],
  loading: false,
  error: null,
  pagination: {
    current_page: 1,
    last_page: 1,
    per_page: 100,
    total: 0,
  },
  filters: {
    per_page: 100,
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
    const newErrors: Partial<Record<keyof VendorFormData, string>> = {};

    // Required fields validation
    if (!formData.companyName.trim()) newErrors.companyName = "Company Name is required";
    if (!formData.contactPerson.trim()) newErrors.contactPerson = "Contact Person is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (formData.category === "Other" && !formData.customCategory.trim()) {
      newErrors.customCategory = "Custom category is required";
    }
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.paymentTerms) newErrors.paymentTerms = "Payment Terms is required";
    if (formData.paymentTerms === "Custom" && !formData.customPaymentTerms.trim()) {
      newErrors.customPaymentTerms = "Custom payment terms is required";
    }
    if (!formData.status) newErrors.status = "Status is required";

    // Email validation
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Invalid email format";
    }

    set({ errors: newErrors });
    return Object.keys(newErrors).length === 0;
  },

  // Data actions
  fetchVendors: async () => {
    try {
      set({ loading: true, error: null });
      const filters = get().filters;
      const response = (await getVendors(filters)) as ApiResponse<VendorsData>;

      if (response.success && response.data) {
        set({
          vendors: response.data.vendors,
          pagination: response.data.pagination,
          loading: false,
        });
      } else {
        set({
          error: response.message || "Failed to fetch vendors",
          loading: false,
        });
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch vendors";
      set({ error: errorMessage, loading: false });
      toast.error("Error", {
        description: errorMessage,
      });
    }
  },

  getVendor: async (id: number) => {
    try {
      set({ loading: true, error: null });
      const response = (await getVendorAPI(id)) as ApiResponse<VendorFromAPI>;

      if (response.success && response.data) {
        set({ loading: false });
        return response.data;
      } else {
        set({
          error: response.message || "Failed to fetch vendor",
          loading: false,
        });
        return null;
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch vendor";
      set({ error: errorMessage, loading: false });
      toast.error("Error", {
        description: errorMessage,
      });
      return null;
    }
  },

  createVendor: async (data: VendorFormData) => {
    try {
      set({ loading: true, error: null });

      // Transform camelCase to snake_case for API
      // Use custom value if "Other" or "Custom" is selected
      const category = (data.category === "Other" && data.customCategory) 
        ? data.customCategory 
        : data.category;
      const paymentTerms = (data.paymentTerms === "Custom" && data.customPaymentTerms) 
        ? data.customPaymentTerms 
        : data.paymentTerms;

      const apiData = {
        company_name: data.companyName,
        contact_person: data.contactPerson || null,
        category: category,
        email: data.email,
        phone: data.phone,
        address: data.address,
        tin: data.tin || null,
        payment_terms: paymentTerms || null,
        status: data.status,
      };

      const response = (await createVendorAPI(apiData)) as ApiResponse<VendorFromAPI>;

      if (response.success && response.data) {
        set({ loading: false });
        toast.success("Vendor created successfully");
        // Refresh vendors list
        await get().fetchVendors();
        return response.data;
      } else {
        const errorMessage = response.message || "Failed to create vendor";
        set({ error: errorMessage, loading: false });
        toast.error("Error", {
          description: errorMessage,
        });
        return null;
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to create vendor";
      set({ error: errorMessage, loading: false });
      toast.error("Error", {
        description: errorMessage,
      });
      return null;
    }
  },

  updateVendor: async (id: number, data: VendorFormData) => {
    try {
      set({ loading: true, error: null });

      // Transform camelCase to snake_case for API
      // Use custom value if "Other" or "Custom" is selected
      const category = (data.category === "Other" && data.customCategory) 
        ? data.customCategory 
        : data.category;
      const paymentTerms = (data.paymentTerms === "Custom" && data.customPaymentTerms) 
        ? data.customPaymentTerms 
        : data.paymentTerms;

      const apiData = {
        company_name: data.companyName,
        contact_person: data.contactPerson || null,
        category: category,
        email: data.email,
        phone: data.phone,
        address: data.address,
        tin: data.tin || null,
        payment_terms: paymentTerms || null,
        status: data.status,
      };

      const response = (await updateVendorAPI(id, apiData)) as ApiResponse<VendorFromAPI>;

      if (response.success && response.data) {
        set({ loading: false });
        toast.success("Vendor updated successfully");
        // Refresh vendors list
        await get().fetchVendors();
        return response.data;
      } else {
        const errorMessage = response.message || "Failed to update vendor";
        set({ error: errorMessage, loading: false });
        toast.error("Error", {
          description: errorMessage,
        });
        return null;
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to update vendor";
      set({ error: errorMessage, loading: false });
      toast.error("Error", {
        description: errorMessage,
      });
      return null;
    }
  },

  deleteVendor: async (id: number) => {
    try {
      set({ loading: true, error: null });
      const response = (await deleteVendorAPI(id)) as ApiResponse<unknown>;

      if (response.success) {
        set({ loading: false });
        toast.success("Vendor deleted successfully");
        // Refresh vendors list
        await get().fetchVendors();
        return true;
      } else {
        const errorMessage = response.message || "Failed to delete vendor";
        set({ error: errorMessage, loading: false });
        toast.error("Error", {
          description: errorMessage,
        });
        return false;
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete vendor";
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
        per_page: 100,
      },
    });
  },

  loadVendorForEdit: (vendor: VendorFromAPI) => {
    // Check if category is in predefined list, otherwise set to "Other"
    const categoryOptions = [
      "Electronics",
      "Office Supplies",
      "Manufacturing",
      "General Merchandise",
      "Food & Beverages",
      "Construction",
      "Automotive",
      "Healthcare",
      "Textiles",
      "Other",
    ];
    const isCategoryInList = categoryOptions.includes(vendor.category);
    const category = isCategoryInList ? vendor.category : "Other";
    const customCategory = isCategoryInList ? "" : vendor.category;

    // Check if payment terms is in predefined list, otherwise set to "Custom"
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
    const isPaymentTermsInList = paymentTermsOptions.includes(vendor.payment_terms || "");
    const paymentTerms = isPaymentTermsInList ? (vendor.payment_terms || "") : "Custom";
    const customPaymentTerms = isPaymentTermsInList ? "" : (vendor.payment_terms || "");

    set({
      formData: {
        companyName: vendor.company_name,
        contactPerson: vendor.contact_person || "",
        category: category,
        customCategory: customCategory,
        email: vendor.email,
        phone: vendor.phone,
        address: vendor.address,
        tin: vendor.tin || "",
        paymentTerms: paymentTerms,
        customPaymentTerms: customPaymentTerms,
        status: vendor.status,
      },
    });
  },
}));
