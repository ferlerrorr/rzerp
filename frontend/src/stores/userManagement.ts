import { create } from "zustand";

export interface UserFormData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role_ids: number[];
}

interface UserManagementState {
  formData: UserFormData;
  errors: Partial<Record<keyof UserFormData, string>>;
  isOpen: boolean;
  setFormData: (data: UserFormData) => void;
  updateField: (field: keyof Omit<UserFormData, "role_ids">, value: string) => void;
  updateRoleIds: (roleIds: number[]) => void;
  setError: (field: keyof UserFormData, error: string | undefined) => void;
  setErrors: (errors: Partial<Record<keyof UserFormData, string>>) => void;
  clearErrors: () => void;
  clearError: (field: keyof UserFormData) => void;
  resetForm: () => void;
  setIsOpen: (open: boolean) => void;
  validateForm: () => boolean;
}

const initialFormData: UserFormData = {
  name: "",
  email: "",
  password: "",
  password_confirmation: "",
  role_ids: [],
};

export const useUserManagementStore = create<UserManagementState>((set, get) => ({
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

  updateRoleIds: (roleIds) => {
    set((state) => ({
      formData: { ...state.formData, role_ids: roleIds },
    }));
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
    const newErrors: Partial<Record<keyof UserFormData, string>> = {};

    // Required fields validation
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.password.trim()) newErrors.password = "Password is required";
    if (!formData.password_confirmation.trim()) {
      newErrors.password_confirmation = "Password confirmation is required";
    }

    // Validate email format
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = "Invalid email format";
      }
    }

    // Validate password match
    if (
      formData.password.trim() &&
      formData.password_confirmation.trim() &&
      formData.password !== formData.password_confirmation
    ) {
      newErrors.password_confirmation = "Passwords do not match";
    }

    // Validate password length
    if (formData.password.trim() && formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    set({ errors: newErrors });
    return Object.keys(newErrors).length === 0;
  },
}));

