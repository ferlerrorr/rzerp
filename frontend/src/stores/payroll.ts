import { create } from "zustand";

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

interface PayrollState {
  formData: PayrollFormData;
  errors: Partial<Record<keyof PayrollFormData, string>>;
  isOpen: boolean;
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
}));

