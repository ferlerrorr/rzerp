import { create } from "zustand";
import {
  getLeaveRequests,
  getLeaveTypes,
  getLeaveBalances,
  createLeaveRequest as createLeaveRequestAPI,
  approveLeaveRequest as approveLeaveRequestAPI,
  rejectLeaveRequest as rejectLeaveRequestAPI,
} from "@/lib/api";
import { ApiResponse } from "@/lib/types";

export interface LeaveRequestFormData {
  employee_id: number;
  leave_type_id: number;
  start_date: string;
  end_date: string;
  reason?: string;
}

export interface LeaveRequestFromAPI {
  id: number;
  code: string;
  employee_id: number;
  employee?: { id: number; name: string };
  leave_type_id: number;
  leave_type?: { id: number; name: string };
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string | null;
  status: "pending" | "approved" | "rejected" | "cancelled";
  approved_by: number | null;
  approved_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeaveTypeFromAPI {
  id: number;
  name: string;
  description: string | null;
  max_days_per_year: number;
  is_paid: boolean;
  allows_carry_over: boolean;
  max_carry_over_days: number | null;
  is_active: boolean;
}

export interface LeaveBalanceFromAPI {
  id: number;
  employee_id: number;
  leave_type_id: number;
  leave_type?: { id: number; name: string };
  year: number;
  total_days: number;
  used_days: number;
  pending_days: number;
  carried_over_days: number;
  available_days: number;
}

interface LeaveRequestState {
  formData: LeaveRequestFormData;
  errors: Partial<Record<keyof LeaveRequestFormData, string>>;
  isOpen: boolean;
  leaveRequests: LeaveRequestFromAPI[];
  leaveTypes: LeaveTypeFromAPI[];
  leaveBalances: LeaveBalanceFromAPI[];
  loading: boolean;
  error: string | null;
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  filters: Record<string, any>;
  setFormData: (data: LeaveRequestFormData) => void;
  updateField: (field: keyof LeaveRequestFormData, value: string | number) => void;
  setError: (field: keyof LeaveRequestFormData, error: string | undefined) => void;
  setErrors: (errors: Partial<Record<keyof LeaveRequestFormData, string>>) => void;
  clearErrors: () => void;
  clearError: (field: keyof LeaveRequestFormData) => void;
  resetForm: () => void;
  setIsOpen: (open: boolean) => void;
  validateForm: () => boolean;
  fetchLeaveRequests: () => Promise<void>;
  fetchLeaveTypes: () => Promise<void>;
  fetchLeaveBalances: (employeeId: number, year?: number) => Promise<void>;
  createLeaveRequest: (data: LeaveRequestFormData) => Promise<LeaveRequestFromAPI | null>;
  approveLeaveRequest: (id: number) => Promise<boolean>;
  rejectLeaveRequest: (id: number, reason: string) => Promise<boolean>;
  setFilters: (filters: Record<string, any>) => void;
  clearFilters: () => void;
}

const initialFormData: LeaveRequestFormData = {
  employee_id: 0,
  leave_type_id: 0,
  start_date: "",
  end_date: "",
  reason: "",
};

export const useLeaveRequestStore = create<LeaveRequestState>((set, get) => ({
  formData: initialFormData,
  errors: {},
  isOpen: false,
  leaveRequests: [],
  leaveTypes: [],
  leaveBalances: [],
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
    const newErrors: Partial<Record<keyof LeaveRequestFormData, string>> = {};

    // Required fields validation
    if (!formData.employee_id) newErrors.employee_id = "Employee is required";
    if (!formData.leave_type_id) newErrors.leave_type_id = "Leave Type is required";
    if (!formData.start_date) newErrors.start_date = "Start Date is required";
    if (!formData.end_date) newErrors.end_date = "End Date is required";

    // Date validation
    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      if (end < start) {
        newErrors.end_date = "End Date must be after Start Date";
      }
    }

    set({ errors: newErrors });
    return Object.keys(newErrors).length === 0;
  },

  fetchLeaveRequests: async () => {
    try {
      set({ loading: true, error: null });
      const filters = get().filters;
      const response = (await getLeaveRequests(filters)) as ApiResponse<{
        leave_requests: LeaveRequestFromAPI[];
        pagination: any;
      }>;

      if (response.success && response.data) {
        set({
          leaveRequests: response.data.leave_requests,
          pagination: response.data.pagination,
          loading: false,
        });
      } else {
        set({
          error: response.message || "Failed to fetch leave requests",
          loading: false,
        });
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch leave requests";
      set({ error: errorMessage, loading: false });
    }
  },

  fetchLeaveTypes: async () => {
    try {
      set({ loading: true, error: null });
      const response = (await getLeaveTypes({ is_active: true })) as ApiResponse<{
        leave_types: LeaveTypeFromAPI[];
      }>;

      if (response.success && response.data) {
        set({
          leaveTypes: response.data.leave_types,
          loading: false,
        });
      } else {
        set({
          error: response.message || "Failed to fetch leave types",
          loading: false,
        });
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch leave types";
      set({ error: errorMessage, loading: false });
    }
  },

  fetchLeaveBalances: async (employeeId: number, year?: number) => {
    try {
      set({ loading: true, error: null });
      const response = (await getLeaveBalances({
        employee_id: employeeId,
        year: year || new Date().getFullYear(),
      })) as ApiResponse<{
        leave_balances: LeaveBalanceFromAPI[];
      }>;

      if (response.success && response.data) {
        set({
          leaveBalances: response.data.leave_balances,
          loading: false,
        });
      } else {
        set({
          error: response.message || "Failed to fetch leave balances",
          loading: false,
        });
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch leave balances";
      set({ error: errorMessage, loading: false });
    }
  },

  createLeaveRequest: async (data: LeaveRequestFormData) => {
    try {
      set({ loading: true, error: null });
      const response = (await createLeaveRequestAPI(data)) as ApiResponse<{
        leave_request: LeaveRequestFromAPI;
      }>;

      if (response.success && response.data) {
        set({ loading: false });
        await get().fetchLeaveRequests();
        return response.data.leave_request;
      } else {
        set({
          error: response.message || "Failed to create leave request",
          loading: false,
        });
        return null;
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to create leave request";
      set({ error: errorMessage, loading: false });
      return null;
    }
  },

  approveLeaveRequest: async (id: number) => {
    try {
      set({ loading: true, error: null });
      const response = (await approveLeaveRequestAPI(id)) as ApiResponse<any>;

      if (response.success) {
        set({ loading: false });
        await get().fetchLeaveRequests();
        return true;
      } else {
        set({
          error: response.message || "Failed to approve leave request",
          loading: false,
        });
        return false;
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to approve leave request";
      set({ error: errorMessage, loading: false });
      return false;
    }
  },

  rejectLeaveRequest: async (id: number, reason: string) => {
    try {
      set({ loading: true, error: null });
      const response = (await rejectLeaveRequestAPI(id, reason)) as ApiResponse<any>;

      if (response.success) {
        set({ loading: false });
        await get().fetchLeaveRequests();
        return true;
      } else {
        set({
          error: response.message || "Failed to reject leave request",
          loading: false,
        });
        return false;
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to reject leave request";
      set({ error: errorMessage, loading: false });
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
}));

