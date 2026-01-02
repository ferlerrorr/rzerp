import { create } from "zustand";
import { getCustomers, getCustomer as getCustomerAPI } from "@/lib/api";
import { ApiResponse } from "@/lib/types";

// Customer from API
export interface CustomerFromAPI {
  id: number;
  company_name: string;
  contact_person: string | null;
  email: string;
  phone: string;
  address: string;
  tin: string | null;
  payment_terms: string | null;
  status: "Active" | "Inactive";
  total_receivables: string;
  outstanding: string;
  created_at: string;
  updated_at: string;
}

// Customers data response
export interface CustomersData {
  customers: CustomerFromAPI[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

interface CustomerState {
  customers: CustomerFromAPI[];
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
    per_page?: number;
    page?: number;
  };

  fetchCustomers: () => Promise<void>;
  getCustomer: (id: number) => Promise<CustomerFromAPI | null>;
  setFilters: (filters: Partial<CustomerState["filters"]>) => void;
  clearFilters: () => void;
}

export const useCustomerStore = create<CustomerState>((set, get) => ({
  customers: [],
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

  fetchCustomers: async () => {
    try {
      set({ loading: true, error: null });
      const filters = get().filters;
      const response = (await getCustomers(filters)) as ApiResponse<CustomersData>;

      if (response.success && response.data) {
        set({
          customers: response.data.customers,
          pagination: response.data.pagination,
          loading: false,
        });
      } else {
        set({
          error: response.message || "Failed to fetch customers",
          loading: false,
        });
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch customers";
      set({ error: errorMessage, loading: false });
    }
  },

  getCustomer: async (id: number) => {
    try {
      set({ loading: true, error: null });
      const response = (await getCustomerAPI(id)) as ApiResponse<CustomerFromAPI>;

      if (response.success && response.data) {
        set({ loading: false });
        return response.data;
      } else {
        set({
          error: response.message || "Failed to fetch customer",
          loading: false,
        });
        return null;
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch customer";
      set({ error: errorMessage, loading: false });
      return null;
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
}));

