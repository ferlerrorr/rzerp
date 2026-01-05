import { create } from "zustand";
import {
  getPayrollPeriods,
  getPayrollRuns,
  getPayrollRunEntries,
  createPayrollPeriod as createPayrollPeriodAPI,
  createPayrollRun as createPayrollRunAPI,
  processPayrollRun as processPayrollRunAPI,
  approvePayrollRun as approvePayrollRunAPI,
} from "@/lib/api";
import { ApiResponse } from "@/lib/types";

export interface PayrollFormData {
  payrollMonth: string;
  employeeId: string;
  employeeName: string;
  basicSalary: string;
  allowances: string;
  overtimePay: string;
  sssContribution: string;
  philHealthContribution: string;
  pagIbigContribution: string;
  withholdingTax: string;
}

export interface PayrollPeriodFromAPI {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  type: "monthly" | "semi_monthly" | "weekly";
  status: "draft" | "active" | "closed";
}

export interface PayrollRunFromAPI {
  id: number;
  code: string;
  payroll_period_id: number;
  payroll_period?: PayrollPeriodFromAPI;
  status: "draft" | "processing" | "approved" | "cancelled";
  total_gross: number;
  total_deductions: number;
  total_net: number;
  employee_count: number;
  approved_by: number | null;
  approved_at: string | null;
  processed_at: string | null;
}

export interface PayrollEntryFromAPI {
  id: number;
  code: string;
  payroll_run_id: number;
  employee_id: number;
  employee?: { id: number; name: string };
  basic_salary: number;
  overtime_pay: number;
  holiday_pay: number;
  night_differential: number;
  allowances: number;
  bonus: number;
  thirteenth_month: number;
  other_earnings: number;
  gross_pay: number;
  sss_contribution: number;
  philhealth_contribution: number;
  pagibig_contribution: number;
  bir_tax: number;
  leave_deductions: number;
  loans: number;
  other_deductions: number;
  total_deductions: number;
  net_pay: number;
  is_approved: boolean;
}

interface PayrollState {
  formData: PayrollFormData;
  errors: Partial<Record<keyof PayrollFormData, string>>;
  isOpen: boolean;
  payrollPeriods: PayrollPeriodFromAPI[];
  payrollRuns: PayrollRunFromAPI[];
  payrollEntries: PayrollEntryFromAPI[];
  loading: boolean;
  error: string | null;
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  filters: Record<string, any>;
  setFormData: (data: PayrollFormData) => void;
  updateField: (field: keyof PayrollFormData, value: string) => void;
  setError: (field: keyof PayrollFormData, error: string | undefined) => void;
  setErrors: (errors: Partial<Record<keyof PayrollFormData, string>>) => void;
  clearErrors: () => void;
  clearError: (field: keyof PayrollFormData) => void;
  resetForm: () => void;
  setIsOpen: (open: boolean) => void;
  validateForm: () => boolean;
  calculateGrossPay: () => number;
  calculateTotalDeductions: () => number;
  calculateNetPay: () => number;
  fetchPayrollPeriods: () => Promise<void>;
  fetchPayrollRuns: () => Promise<void>;
  fetchPayrollEntries: (runId: number) => Promise<void>;
  createPayrollPeriod: (data: Record<string, any>) => Promise<PayrollPeriodFromAPI | null>;
  createPayrollRun: (data: Record<string, any>) => Promise<PayrollRunFromAPI | null>;
  processPayrollRun: (id: number) => Promise<boolean>;
  approvePayrollRun: (id: number) => Promise<boolean>;
  setFilters: (filters: Record<string, any>) => void;
  clearFilters: () => void;
}

const initialFormData: PayrollFormData = {
  payrollMonth: "",
  employeeId: "",
  employeeName: "",
  basicSalary: "",
  allowances: "",
  overtimePay: "",
  sssContribution: "",
  philHealthContribution: "",
  pagIbigContribution: "",
  withholdingTax: "",
};

export const usePayrollStore = create<PayrollState>((set, get) => ({
  formData: initialFormData,
  errors: {},
  isOpen: false,
  payrollPeriods: [],
  payrollRuns: [],
  payrollEntries: [],
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
    const newErrors: Partial<Record<keyof PayrollFormData, string>> = {};

    // Required fields validation
    if (!formData.payrollMonth) newErrors.payrollMonth = "Payroll Month is required";
    if (!formData.employeeId) newErrors.employeeId = "Employee is required";
    if (!formData.basicSalary.trim()) newErrors.basicSalary = "Basic Salary is required";

    set({ errors: newErrors });
    return Object.keys(newErrors).length === 0;
  },

  calculateGrossPay: () => {
    const { formData } = get();
    const basic = parseFloat(formData.basicSalary.replace(/[₱,]/g, "")) || 0;
    const allowances = parseFloat(formData.allowances.replace(/[₱,]/g, "")) || 0;
    const overtime = parseFloat(formData.overtimePay.replace(/[₱,]/g, "")) || 0;
    return basic + allowances + overtime;
  },

  calculateTotalDeductions: () => {
    const { formData } = get();
    const sss = parseFloat(formData.sssContribution.replace(/[₱,-]/g, "")) || 0;
    const philHealth = parseFloat(formData.philHealthContribution.replace(/[₱,-]/g, "")) || 0;
    const pagIbig = parseFloat(formData.pagIbigContribution.replace(/[₱,-]/g, "")) || 0;
    const tax = parseFloat(formData.withholdingTax.replace(/[₱,-]/g, "")) || 0;
    return sss + philHealth + pagIbig + tax;
  },

  calculateNetPay: () => {
    const grossPay = get().calculateGrossPay();
    const totalDeductions = get().calculateTotalDeductions();
    return grossPay - totalDeductions;
  },

  fetchPayrollPeriods: async () => {
    try {
      set({ loading: true, error: null });
      const filters = get().filters;
      const response = (await getPayrollPeriods(filters)) as ApiResponse<{
        payroll_periods: PayrollPeriodFromAPI[];
        pagination: any;
      }>;

      if (response.success && response.data) {
        set({
          payrollPeriods: response.data.payroll_periods,
          pagination: response.data.pagination,
          loading: false,
        });
      } else {
        set({
          error: response.message || "Failed to fetch payroll periods",
          loading: false,
        });
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch payroll periods";
      set({ error: errorMessage, loading: false });
    }
  },

  fetchPayrollRuns: async () => {
    try {
      set({ loading: true, error: null });
      const filters = get().filters;
      const response = (await getPayrollRuns(filters)) as ApiResponse<{
        payroll_runs: PayrollRunFromAPI[];
        pagination: any;
      }>;

      if (response.success && response.data) {
        set({
          payrollRuns: response.data.payroll_runs,
          pagination: response.data.pagination,
          loading: false,
        });
      } else {
        set({
          error: response.message || "Failed to fetch payroll runs",
          loading: false,
        });
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch payroll runs";
      set({ error: errorMessage, loading: false });
    }
  },

  fetchPayrollEntries: async (runId: number) => {
    try {
      set({ loading: true, error: null });
      const response = (await getPayrollRunEntries(runId)) as ApiResponse<{
        payroll_entries: PayrollEntryFromAPI[];
      }>;

      if (response.success && response.data) {
        set({
          payrollEntries: response.data.payroll_entries,
          loading: false,
        });
      } else {
        set({
          error: response.message || "Failed to fetch payroll entries",
          loading: false,
        });
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch payroll entries";
      set({ error: errorMessage, loading: false });
    }
  },

  createPayrollPeriod: async (data: Record<string, any>) => {
    try {
      set({ loading: true, error: null });
      const response = (await createPayrollPeriodAPI(data)) as ApiResponse<{
        payroll_period: PayrollPeriodFromAPI;
      }>;

      if (response.success && response.data) {
        set({ loading: false });
        await get().fetchPayrollPeriods();
        return response.data.payroll_period;
      } else {
        set({
          error: response.message || "Failed to create payroll period",
          loading: false,
        });
        return null;
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to create payroll period";
      set({ error: errorMessage, loading: false });
      return null;
    }
  },

  createPayrollRun: async (data: Record<string, any>) => {
    try {
      set({ loading: true, error: null });
      const response = (await createPayrollRunAPI(data)) as ApiResponse<{
        payroll_run: PayrollRunFromAPI;
      }>;

      if (response.success && response.data) {
        set({ loading: false });
        await get().fetchPayrollRuns();
        return response.data.payroll_run;
      } else {
        set({
          error: response.message || "Failed to create payroll run",
          loading: false,
        });
        return null;
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to create payroll run";
      set({ error: errorMessage, loading: false });
      return null;
    }
  },

  processPayrollRun: async (id: number) => {
    try {
      set({ loading: true, error: null });
      const response = (await processPayrollRunAPI(id)) as ApiResponse<any>;

      if (response.success) {
        set({ loading: false });
        await get().fetchPayrollRuns();
        return true;
      } else {
        set({
          error: response.message || "Failed to process payroll run",
          loading: false,
        });
        return false;
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to process payroll run";
      set({ error: errorMessage, loading: false });
      return false;
    }
  },

  approvePayrollRun: async (id: number) => {
    try {
      set({ loading: true, error: null });
      const response = (await approvePayrollRunAPI(id)) as ApiResponse<any>;

      if (response.success) {
        set({ loading: false });
        await get().fetchPayrollRuns();
        return true;
      } else {
        set({
          error: response.message || "Failed to approve payroll run",
          loading: false,
        });
        return false;
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to approve payroll run";
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

