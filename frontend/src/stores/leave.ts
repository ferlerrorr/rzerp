import { create } from "zustand";

export interface LeaveRequestFormData {
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
}

interface LeaveRequestState {
  formData: LeaveRequestFormData;
  errors: Partial<Record<keyof LeaveRequestFormData, string>>;
  isOpen: boolean;
  setFormData: (data: LeaveRequestFormData) => void;
  updateField: (field: keyof LeaveRequestFormData, value: string) => void;
  setError: (field: keyof LeaveRequestFormData, error: string | undefined) => void;
  setErrors: (errors: Partial<Record<keyof LeaveRequestFormData, string>>) => void;
  clearErrors: () => void;
  clearError: (field: keyof LeaveRequestFormData) => void;
  resetForm: () => void;
  setIsOpen: (open: boolean) => void;
  validateForm: () => boolean;
}

const initialFormData: LeaveRequestFormData = {
  employeeName: "",
  leaveType: "",
  startDate: "",
  endDate: "",
  reason: "",
};

export const useLeaveRequestStore = create<LeaveRequestState>((set, get) => ({
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
    const newErrors: Partial<Record<keyof LeaveRequestFormData, string>> = {};

    // Required fields validation
    if (!formData.employeeName.trim())
      newErrors.employeeName = "Employee Name is required";
    if (!formData.leaveType) newErrors.leaveType = "Leave Type is required";
    if (!formData.startDate) newErrors.startDate = "Start Date is required";
    if (!formData.endDate) newErrors.endDate = "End Date is required";
    if (!formData.reason.trim()) newErrors.reason = "Reason is required";

    // Date validation
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end < start) {
        newErrors.endDate = "End Date must be after Start Date";
      }
    }

    set({ errors: newErrors });
    return Object.keys(newErrors).length === 0;
  },
}));

